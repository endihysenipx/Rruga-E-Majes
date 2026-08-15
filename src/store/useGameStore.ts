import { create } from 'zustand';

import { achievements, journeys } from '@/data/seed';
import { advanceJourney, calculateLevel, getDateKey, reconcileSourceTotal, resetDailyGoalIfNeeded } from '@/domain/gameLogic';
import type { Language, PersistedGameState, StepRecord, UserProfile, UserProgress } from '@/domain/models';
import { loadGameState, saveGameState } from '@/services/database';
import { getStepProvider } from '@/services/steps/providerRegistry';

type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'error';

interface GameState extends PersistedGameState {
  bootstrapStatus: BootstrapStatus;
  errorMessage?: string;
  isSyncing: boolean;
  lastStepDelta: number;
  bootstrap: () => Promise<void>;
  retryBootstrap: () => Promise<void>;
  setLanguage: (language: Language) => void;
  setAvatar: (avatarId: string) => void;
  finishOnboarding: () => void;
  chooseJourney: (journeyId: string) => void;
  syncSteps: () => Promise<void>;
  clearError: () => void;
}

const initialProfile: UserProfile = {
  id: 'local-traveler', language: 'sq', avatarId: 'arin', level: 1, xp: 0, coins: 40, createdAt: new Date().toISOString(),
};

const initialProgress: UserProgress = {
  currentJourneyId: 'gjeravica', journeySteps: { gjeravica: 0 }, unlockedJourneyIds: ['gjeravica'],
  completedJourneyIds: [], claimedCheckpointIds: [], earnedAchievementIds: [], totalSteps: 0, totalDistanceKm: 0, streak: 0,
};

const initialPersisted: PersistedGameState = {
  version: 1,
  onboardingComplete: false,
  profile: initialProfile,
  progress: initialProgress,
  dailyGoal: { targetSteps: 8_000, todaySteps: 0, dateKey: getDateKey() },
  stepRecords: [],
};

function persistedSnapshot(state: GameState): PersistedGameState {
  return {
    version: 1,
    onboardingComplete: state.onboardingComplete,
    profile: state.profile,
    progress: state.progress,
    dailyGoal: state.dailyGoal,
    stepRecords: state.stepRecords,
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

  bootstrap: async () => {
    if (get().bootstrapStatus === 'loading') return;
    set({ bootstrapStatus: 'loading', errorMessage: undefined });
    try {
      const saved = await loadGameState();
      const state = saved ?? initialPersisted;
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
    set({ isSyncing: true, errorMessage: undefined, lastStepDelta: 0 });
    try {
      const state = get();
      const todayGoal = resetDailyGoalIfNeeded(state.dailyGoal);
      const existingMock = state.stepRecords.find((record) => record.dateKey === todayGoal.dateKey && record.source === 'mock');
      const snapshot = await getStepProvider(existingMock?.sourceTotal ?? 0).getTodaySteps();
      const { delta, record } = reconcileSourceTotal(state.stepRecords, snapshot.total, snapshot.source);
      const nextProgress = advanceJourney(state.progress, journeys, delta);
      const currentJourney = journeys.find((journey) => journey.id === nextProgress.currentJourneyId);
      const currentSteps = nextProgress.journeySteps[nextProgress.currentJourneyId] ?? 0;
      const newlyClaimed = currentJourney?.checkpoints.filter((checkpoint) => checkpoint.atSteps <= currentSteps).map((checkpoint) => checkpoint.id) ?? [];
      const claimed = [...new Set([...nextProgress.claimedCheckpointIds, ...newlyClaimed])];
      const xpGain = delta > 0 ? Math.max(1, Math.floor(delta / 20)) : 0;
      const xp = state.profile.xp + xpGain;
      const withAchievements = { ...nextProgress, claimedCheckpointIds: claimed };
      withAchievements.earnedAchievementIds = earnAchievements(withAchievements);
      set({
        progress: withAchievements,
        profile: { ...state.profile, xp, level: calculateLevel(xp), coins: state.profile.coins + Math.floor(delta / 120) },
        dailyGoal: { ...todayGoal, todaySteps: todayGoal.todaySteps + delta },
        stepRecords: replaceRecord(state.stepRecords, record),
        lastStepDelta: delta,
        isSyncing: false,
      });
    } catch {
      set({ isSyncing: false, errorMessage: 'errors.sync' });
    }
  },
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
