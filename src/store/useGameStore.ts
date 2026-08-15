import { create } from 'zustand';

import { achievements, journeys, quests } from '@/data/seed';
import { advanceJourney, calculateLevel, getDateKey, getQuestClaimKey, reconcileSourceTotal, resetDailyGoalIfNeeded, updateActivityStreak } from '@/domain/gameLogic';
import type { InventoryItem, Language, PersistedGameState, RewardMoment, StepRecord, UserProfile, UserProgress } from '@/domain/models';
import { loadGameState, saveGameState } from '@/services/database';
import { getStepProvider } from '@/services/steps/providerRegistry';
import { isQuestClaimed, questProgress } from './selectors';

type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'error';

interface GameState extends PersistedGameState {
  bootstrapStatus: BootstrapStatus;
  errorMessage?: string;
  isSyncing: boolean;
  lastStepDelta: number;
  rewardMoment?: RewardMoment;
  bootstrap: () => Promise<void>;
  retryBootstrap: () => Promise<void>;
  setLanguage: (language: Language) => void;
  setAvatar: (avatarId: string) => void;
  finishOnboarding: () => void;
  chooseJourney: (journeyId: string) => void;
  syncSteps: () => Promise<void>;
  claimQuest: (questId: string) => void;
  dismissReward: () => void;
  clearError: () => void;
}

const initialProfile: UserProfile = {
  id: 'local-traveler', language: 'sq', avatarId: 'arin', level: 1, xp: 0, coins: 40, createdAt: new Date().toISOString(),
};

const initialProgress: UserProgress = {
  currentJourneyId: 'gjeravica', journeySteps: { gjeravica: 0 }, unlockedJourneyIds: ['gjeravica'],
  completedJourneyIds: [], claimedCheckpointIds: [], checkpointClaimDates: {}, earnedAchievementIds: [], totalSteps: 0, totalDistanceKm: 0, streak: 0,
};

const initialPersisted: PersistedGameState = {
  version: 2,
  onboardingComplete: false,
  profile: initialProfile,
  progress: initialProgress,
  dailyGoal: { targetSteps: 8_000, todaySteps: 0, dateKey: getDateKey() },
  stepRecords: [],
  inventory: [],
  claimedQuestKeys: [],
};

function persistedSnapshot(state: GameState): PersistedGameState {
  return {
    version: 2,
    onboardingComplete: state.onboardingComplete,
    profile: state.profile,
    progress: state.progress,
    dailyGoal: state.dailyGoal,
    stepRecords: state.stepRecords,
    inventory: state.inventory,
    claimedQuestKeys: state.claimedQuestKeys,
  };
}

function migrateGameState(saved: PersistedGameState | null): PersistedGameState {
  if (!saved) return initialPersisted;
  const legacy = saved as PersistedGameState & {
    inventory?: InventoryItem[];
    claimedQuestKeys?: string[];
    progress: UserProgress & { checkpointClaimDates?: Record<string, string> };
  };
  return {
    ...initialPersisted,
    ...legacy,
    version: 2,
    profile: { ...initialProfile, ...legacy.profile },
    progress: {
      ...initialProgress,
      ...legacy.progress,
      checkpointClaimDates: legacy.progress.checkpointClaimDates ?? {},
    },
    inventory: legacy.inventory ?? [],
    claimedQuestKeys: legacy.claimedQuestKeys ?? [],
  };
}

function replaceRecord(records: StepRecord[], next: StepRecord): StepRecord[] {
  return [...records.filter((item) => !(item.dateKey === next.dateKey && item.source === next.source)), next].slice(-45);
}

function earnAchievements(progress: UserProgress): string[] {
  const earned = new Set(progress.earnedAchievementIds);
  achievements.forEach((achievement) => {
    const value = achievement.metric === 'totalSteps' ? progress.totalSteps
      : achievement.metric === 'completedRoutes' ? progress.completedJourneyIds.length
        : achievement.metric === 'distanceKm' ? progress.totalDistanceKm
          : achievement.metric === 'streak' ? progress.streak
            : progress.completedJourneyIds.filter((id) => journeys.find((journey) => journey.id === id)?.regionId === achievement.regionId).length;
    if (value >= achievement.target) earned.add(achievement.id);
  });
  return [...earned];
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialPersisted,
  bootstrapStatus: 'idle',
  isSyncing: false,
  lastStepDelta: 0,
  rewardMoment: undefined,

  bootstrap: async () => {
    if (get().bootstrapStatus === 'loading') return;
    set({ bootstrapStatus: 'loading', errorMessage: undefined });
    try {
      const saved = await loadGameState();
      const state = migrateGameState(saved);
      set({ ...state, dailyGoal: resetDailyGoalIfNeeded(state.dailyGoal), bootstrapStatus: 'ready' });
    } catch {
      set({ bootstrapStatus: 'error', errorMessage: 'errors.database' });
    }
  },
  retryBootstrap: async () => {
    set({ bootstrapStatus: 'idle' });
    await get().bootstrap();
  },
  setLanguage: (language) => set((state) => ({ profile: { ...state.profile, language } })),
  setAvatar: (avatarId) => set((state) => ({ profile: { ...state.profile, avatarId } })),
  finishOnboarding: () => set({ onboardingComplete: true }),
  chooseJourney: (journeyId) => {
    if (!get().progress.unlockedJourneyIds.includes(journeyId)) return;
    set((state) => ({ progress: { ...state.progress, currentJourneyId: journeyId } }));
  },
  syncSteps: async () => {
    if (get().isSyncing) return;
    set({ isSyncing: true, errorMessage: undefined, lastStepDelta: 0, rewardMoment: undefined });
    try {
      const state = get();
      const todayGoal = resetDailyGoalIfNeeded(state.dailyGoal);
      const existingMock = state.stepRecords.find((record) => record.dateKey === todayGoal.dateKey && record.source === 'mock');
      const snapshot = await getStepProvider(existingMock?.sourceTotal ?? 0).getTodaySteps();
      const { delta, record } = reconcileSourceTotal(state.stepRecords, snapshot.total, snapshot.source);
      const advanced = advanceJourney(state.progress, journeys, delta);
      const nextProgress = delta > 0 ? updateActivityStreak(advanced) : advanced;
      const currentJourney = journeys.find((journey) => journey.id === nextProgress.currentJourneyId);
      const currentSteps = nextProgress.journeySteps[nextProgress.currentJourneyId] ?? 0;
      const newlyReached = currentJourney?.checkpoints.filter((checkpoint) => checkpoint.atSteps <= currentSteps && !state.progress.claimedCheckpointIds.includes(checkpoint.id)) ?? [];
      const claimed = [...new Set([...nextProgress.claimedCheckpointIds, ...newlyReached.map((checkpoint) => checkpoint.id)])];
      const checkpointClaimDates = { ...nextProgress.checkpointClaimDates };
      newlyReached.forEach((checkpoint) => { checkpointClaimDates[checkpoint.id] = todayGoal.dateKey; });
      const completedNow = currentJourney ? !state.progress.completedJourneyIds.includes(currentJourney.id) && nextProgress.completedJourneyIds.includes(currentJourney.id) : false;
      const checkpointCoins = newlyReached.reduce((sum, checkpoint) => sum + (checkpoint.reward.kind === 'coins' ? checkpoint.reward.amount ?? 0 : 0), 0);
      const routeXp = completedNow ? currentJourney?.rewards.find((reward) => reward.kind === 'xp')?.amount ?? 0 : 0;
      const routeCoins = completedNow ? currentJourney?.rewards.find((reward) => reward.kind === 'coins')?.amount ?? 0 : 0;
      const walkXp = delta > 0 ? Math.max(1, Math.floor(delta / 20)) : 0;
      const xpGain = walkXp + routeXp;
      const xp = state.profile.xp + xpGain;
      const withAchievements = { ...nextProgress, claimedCheckpointIds: claimed, checkpointClaimDates };
      const previousAchievements = new Set(state.progress.earnedAchievementIds);
      withAchievements.earnedAchievementIds = earnAchievements(withAchievements);
      const newAchievement = achievements.find((achievement) => withAchievements.earnedAchievementIds.includes(achievement.id) && !previousAchievements.has(achievement.id));
      const inventory = [...state.inventory];
      newlyReached.filter((checkpoint) => checkpoint.reward.kind === 'story').forEach((checkpoint) => {
        if (!inventory.some((item) => item.id === checkpoint.reward.itemId)) {
          inventory.push({ id: checkpoint.reward.itemId ?? checkpoint.id, nameKey: 'collectibles.legendFragment', quantity: 1, acquiredAt: new Date().toISOString() });
        }
      });
      const featuredCheckpoint = newlyReached.at(-1);
      const rewardMoment: RewardMoment | undefined = delta <= 0 ? undefined : completedNow && currentJourney ? {
        id: `route-${currentJourney.id}-${Date.now()}`, kind: 'route', titleKey: 'rewards.routeComplete', storyKey: currentJourney.storyKey,
        xp: xpGain, coins: Math.floor(delta / 120) + checkpointCoins + routeCoins,
      } : featuredCheckpoint ? {
        id: `checkpoint-${featuredCheckpoint.id}-${Date.now()}`, kind: 'checkpoint', titleKey: 'rewards.checkpointReached', storyKey: featuredCheckpoint.storyKey,
        xp: walkXp, coins: Math.floor(delta / 120) + checkpointCoins,
        collectibleNameKey: featuredCheckpoint.reward.kind === 'story' ? 'collectibles.legendFragment' : undefined,
      } : newAchievement ? {
        id: `achievement-${newAchievement.id}-${Date.now()}`, kind: 'achievement', titleKey: newAchievement.titleKey,
        storyKey: newAchievement.descriptionKey, xp: walkXp, coins: Math.floor(delta / 120),
      } : {
        id: `walk-${Date.now()}`, kind: 'walk', titleKey: 'rewards.walkComplete', storyKey: 'rewards.walkCompleteBody',
        xp: walkXp, coins: Math.floor(delta / 120),
      };
      set({
        progress: withAchievements,
        profile: { ...state.profile, xp, level: calculateLevel(xp), coins: state.profile.coins + Math.floor(delta / 120) + checkpointCoins + routeCoins },
        dailyGoal: { ...todayGoal, todaySteps: todayGoal.todaySteps + delta },
        stepRecords: replaceRecord(state.stepRecords, record),
        inventory,
        lastStepDelta: delta,
        rewardMoment,
        isSyncing: false,
      });
    } catch {
      set({ isSyncing: false, errorMessage: 'errors.sync' });
    }
  },
  claimQuest: (questId) => {
    const state = get();
    const quest = quests.find((item) => item.id === questId);
    if (!quest || isQuestClaimed(quest, state) || questProgress(quest, state) < quest.target) return;
    const claimKey = getQuestClaimKey(quest.id, quest.cadence);
    const xpGain = quest.reward.kind === 'xp' ? quest.reward.amount ?? 0 : 0;
    const coinGain = quest.reward.kind === 'coins' ? quest.reward.amount ?? 0 : 0;
    const xp = state.profile.xp + xpGain;
    set({
      claimedQuestKeys: [...state.claimedQuestKeys, claimKey],
      profile: { ...state.profile, xp, level: calculateLevel(xp), coins: state.profile.coins + coinGain },
      rewardMoment: { id: `quest-${claimKey}`, kind: 'quest', titleKey: quest.titleKey, storyKey: 'rewards.questClaimed', xp: xpGain, coins: coinGain },
    });
  },
  dismissReward: () => set({ rewardMoment: undefined }),
  clearError: () => set({ errorMessage: undefined }),
}));

let saveTimer: ReturnType<typeof setTimeout> | undefined;
useGameStore.subscribe((state) => {
  if (state.bootstrapStatus !== 'ready') return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void saveGameState(persistedSnapshot(useGameStore.getState()));
  }, 250);
});

export const selectCurrentJourney = (state: GameState) => journeys.find((journey) => journey.id === state.progress.currentJourneyId) ?? journeys[0]!;
