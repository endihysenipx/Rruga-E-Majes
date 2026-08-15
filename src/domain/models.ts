export type Language = 'sq' | 'en';
export type RegionId = 'kosovo' | 'albania' | 'balkans';
export type Difficulty = 'easy' | 'moderate' | 'challenging';
export type QuestCadence = 'daily' | 'weekly';
export type RewardKind = 'xp' | 'coins' | 'badge' | 'collectible' | 'story';

export interface Reward {
  kind: RewardKind;
  amount?: number;
  itemId?: string;
}

export interface Region {
  id: RegionId;
  nameKey: string;
  descriptionKey: string;
  accent: string;
}

export interface JourneyCheckpoint {
  id: string;
  nameKey: string;
  atSteps: number;
  storyKey: string;
  reward: Reward;
}

export interface Journey {
  id: string;
  regionId: RegionId;
  nameKey: string;
  storyKey: string;
  difficulty: Difficulty;
  virtualSteps: number;
  unlockAfter?: string;
  rewards: Reward[];
  checkpoints: JourneyCheckpoint[];
  colors: readonly [string, string, ...string[]];
}

export interface UserProfile {
  id: string;
  language: Language;
  avatarId: string;
  level: number;
  xp: number;
  coins: number;
  createdAt: string;
}

export interface StepRecord {
  dateKey: string;
  timezone: string;
  source: 'mock' | 'healthkit' | 'health-connect';
  sourceTotal: number;
  appliedSteps: number;
  syncedAt: string;
}

export interface UserProgress {
  currentJourneyId: string;
  journeySteps: Record<string, number>;
  unlockedJourneyIds: string[];
  completedJourneyIds: string[];
  claimedCheckpointIds: string[];
  checkpointClaimDates: Record<string, string>;
  earnedAchievementIds: string[];
  totalSteps: number;
  totalDistanceKm: number;
  streak: number;
  lastActiveDateKey?: string;
}

export interface DailyGoal {
  targetSteps: number;
  todaySteps: number;
  dateKey: string;
}

export interface Quest {
  id: string;
  titleKey: string;
  descriptionKey: string;
  cadence: QuestCadence;
  metric: 'dailySteps' | 'dailyGoal' | 'activeDays' | 'checkpoint' | 'totalSteps';
  target: number;
  reward: Reward;
}

export interface Achievement {
  id: string;
  titleKey: string;
  descriptionKey: string;
  metric: 'totalSteps' | 'completedRoutes' | 'distanceKm' | 'streak' | 'regionRoutes';
  target: number;
  regionId?: RegionId;
  reward: Reward;
}

export interface InventoryItem {
  id: string;
  nameKey: string;
  quantity: number;
  acquiredAt: string;
}

export interface RewardMoment {
  id: string;
  kind: 'walk' | 'checkpoint' | 'route' | 'quest' | 'achievement';
  titleKey: string;
  storyKey?: string;
  xp: number;
  coins: number;
  collectibleNameKey?: string;
}

export interface PersistedGameState {
  version: 2;
  onboardingComplete: boolean;
  profile: UserProfile;
  progress: UserProgress;
  dailyGoal: DailyGoal;
  stepRecords: StepRecord[];
  inventory: InventoryItem[];
  claimedQuestKeys: string[];
}
