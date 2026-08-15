import { journeys } from '@/data/seed';
import type { Quest } from '@/domain/models';
import type { useGameStore } from './useGameStore';

type State = ReturnType<typeof useGameStore.getState>;

export function questProgress(quest: Quest, state: State): number {
  switch (quest.metric) {
    case 'dailySteps': return state.dailyGoal.todaySteps;
    case 'dailyGoal': return state.dailyGoal.todaySteps >= state.dailyGoal.targetSteps ? 1 : 0;
    case 'activeDays': return Math.min(state.progress.streak, quest.target);
    case 'checkpoint': return state.progress.claimedCheckpointIds.length > 0 ? 1 : 0;
    case 'totalSteps': return state.progress.totalSteps;
  }
}

export function completedRoutesInRegion(state: State, regionId: string): number {
  return state.progress.completedJourneyIds.filter((id) => journeys.find((journey) => journey.id === id)?.regionId === regionId).length;
}
