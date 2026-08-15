import assert from 'node:assert/strict';
import test from 'node:test';

import { journeys } from '../src/data/seed';
import { advanceJourney, calculateLevel, getQuestClaimKey, progressPercent, reconcileSourceTotal, resetDailyGoalIfNeeded, updateActivityStreak } from '../src/domain/gameLogic';
import type { UserProgress } from '../src/domain/models';

const progress: UserProgress = {
  currentJourneyId: 'gjeravica', journeySteps: { gjeravica: 11_800 }, unlockedJourneyIds: ['gjeravica'],
  completedJourneyIds: [], claimedCheckpointIds: [], checkpointClaimDates: {}, earnedAchievementIds: [], totalSteps: 11_800,
  totalDistanceKm: 9.07, streak: 1,
};

test('reconcileSourceTotal applies only unseen steps', () => {
  const now = new Date(2026, 7, 2, 12);
  const first = reconcileSourceTotal([], 1_200, 'mock', now);
  const second = reconcileSourceTotal([first.record], 1_550, 'mock', now);
  const duplicate = reconcileSourceTotal([second.record], 1_550, 'mock', now);
  assert.equal(first.delta, 1_200);
  assert.equal(second.delta, 350);
  assert.equal(duplicate.delta, 0);
});

test('lower provider totals never subtract progress', () => {
  const now = new Date(2026, 7, 2, 12);
  const previous = reconcileSourceTotal([], 2_000, 'mock', now).record;
  const result = reconcileSourceTotal([previous], 1_500, 'mock', now);
  assert.equal(result.delta, 0);
  assert.equal(result.record.sourceTotal, 2_000);
});

test('completing a journey unlocks its direct successors', () => {
  const result = advanceJourney(progress, journeys, 500);
  assert.equal(result.journeySteps.gjeravica, 12_000);
  assert.ok(result.completedJourneyIds.includes('gjeravica'));
  assert.ok(result.unlockedJourneyIds.includes('rugova'));
  assert.ok(result.unlockedJourneyIds.includes('theth'));
});

test('daily goal resets on a new local date', () => {
  const goal = { targetSteps: 8_000, todaySteps: 4_200, dateKey: '2026-08-01' };
  const result = resetDailyGoalIfNeeded(goal, new Date(2026, 7, 2, 0, 5));
  assert.equal(result.todaySteps, 0);
  assert.equal(result.dateKey, '2026-08-02');
});

test('progress and level helpers clamp invalid values', () => {
  assert.equal(progressPercent(12_000, 8_000), 100);
  assert.equal(progressPercent(-1, 8_000), 0);
  assert.equal(calculateLevel(0), 1);
  assert.ok(calculateLevel(2_500) > 1);
});

test('activity streak increments only on consecutive local dates', () => {
  const first = updateActivityStreak({ ...progress, streak: 2, lastActiveDateKey: '2026-08-01' }, new Date(2026, 7, 2, 9));
  const duplicate = updateActivityStreak(first, new Date(2026, 7, 2, 18));
  const broken = updateActivityStreak(first, new Date(2026, 7, 5, 9));
  assert.equal(first.streak, 3);
  assert.equal(duplicate.streak, 3);
  assert.equal(broken.streak, 1);
});

test('quest claim keys are scoped to their cadence period', () => {
  const date = new Date(2026, 7, 5, 12);
  assert.equal(getQuestClaimKey('walk3000', 'daily', date), 'walk3000:2026-08-05');
  assert.equal(getQuestClaimKey('threeDays', 'weekly', date), 'threeDays:2026-08-03');
});
