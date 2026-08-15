import { journeys } from '@/data/seed';
import { getDateKey, getQuestClaimKey, getWeekKey } from '@/domain/gameLogic';
import type { Quest } from '@/domain/models';
import type { useGameStore } from './useGameStore';

type State = ReturnType<typeof useGameStore.getState>;

export function questProgress(quest: Quest, state: State): number {
  const today = getDateKey();
  const weekStart = getWeekKey();
  switch (quest.metric) {
    case 'dailySteps': return state.dailyGoal.todaySteps;
    case 'dailyGoal': return state.dailyGoal.todaySteps >= state.dailyGoal.targetSteps ? 1 : 0;
    case 'activeDays': return new Set(state.stepRecords.filter((record) => record.dateKey >= weekStart && record.appliedSteps > 0).map((record) => record.dateKey)).size;
    case 'checkpoint': return Object.values(state.progress.checkpointClaimDates ?? {}).some((dateKey) => dateKey === today) ? 1 : 0;
    case 'totalSteps': return state.stepRecords.filter((record) => record.dateKey >= weekStart).reduce((sum, record) => sum + record.appliedSteps, 0);
  }
}

export function isQuestClaimed(quest: Quest, state: State): boolean {
  return state.claimedQuestKeys.includes(getQuestClaimKey(quest.id, quest.cadence));
}

export function completedRoutesInRegion(state: State, regionId: string): number {
  return state.progress.completedJourneyIds.filter((id) => journeys.find((journey) => journey.id === id)?.regionId === regionId).length;
}
