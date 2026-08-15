import type { DailyGoal, Journey, QuestCadence, StepRecord, UserProgress } from './models';

export const STEPS_PER_KM = 1_300;

export function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function calculateLevel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 250)) + 1);
}

export function progressPercent(steps: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, (steps / target) * 100));
}

export function reconcileSourceTotal(
  records: StepRecord[],
  incomingTotal: number,
  source: StepRecord['source'],
  now = new Date(),
): { delta: number; record: StepRecord } {
  const dateKey = getDateKey(now);
  const timezone = getTimezone();
  const previous = records.find((item) => item.dateKey === dateKey && item.source === source);
  const normalizedTotal = Math.max(0, Math.floor(incomingTotal));
  const delta = Math.max(0, normalizedTotal - (previous?.sourceTotal ?? 0));

  return {
    delta,
    record: {
      dateKey,
      timezone,
      source,
      sourceTotal: Math.max(normalizedTotal, previous?.sourceTotal ?? 0),
      appliedSteps: (previous?.appliedSteps ?? 0) + delta,
      syncedAt: now.toISOString(),
    },
  };
}

export function resetDailyGoalIfNeeded(goal: DailyGoal, now = new Date()): DailyGoal {
  const dateKey = getDateKey(now);
  return goal.dateKey === dateKey ? goal : { ...goal, dateKey, todaySteps: 0 };
}

export function getWeekKey(date = new Date()): string {
  const monday = new Date(date);
  const day = monday.getDay() || 7;
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - day + 1);
  return getDateKey(monday);
}

export function getQuestClaimKey(questId: string, cadence: QuestCadence, now = new Date()): string {
  const period = cadence === 'daily' ? getDateKey(now) : getWeekKey(now);
  return `${questId}:${period}`;
}

export function updateActivityStreak(progress: UserProgress, now = new Date()): UserProgress {
  const today = getDateKey(now);
  if (progress.lastActiveDateKey === today) return progress;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const continues = progress.lastActiveDateKey === getDateKey(yesterday);
  return {
    ...progress,
    streak: continues ? progress.streak + 1 : 1,
    lastActiveDateKey: today,
  };
}

export function advanceJourney(
  progress: UserProgress,
  journeys: Journey[],
  delta: number,
): UserProgress {
  if (delta <= 0) return progress;
  const current = journeys.find((journey) => journey.id === progress.currentJourneyId);
  if (!current) return progress;

  const previousSteps = progress.journeySteps[current.id] ?? 0;
  const nextSteps = Math.min(current.virtualSteps, previousSteps + delta);
  const completedNow = nextSteps >= current.virtualSteps && !progress.completedJourneyIds.includes(current.id);
  const unlocked = new Set(progress.unlockedJourneyIds);
  if (completedNow) {
    journeys.filter((journey) => journey.unlockAfter === current.id).forEach((journey) => unlocked.add(journey.id));
  }

  return {
    ...progress,
    journeySteps: { ...progress.journeySteps, [current.id]: nextSteps },
    completedJourneyIds: completedNow
      ? [...progress.completedJourneyIds, current.id]
      : progress.completedJourneyIds,
    unlockedJourneyIds: [...unlocked],
    totalSteps: progress.totalSteps + delta,
    totalDistanceKm: (progress.totalSteps + delta) / STEPS_PER_KM,
  };
}
