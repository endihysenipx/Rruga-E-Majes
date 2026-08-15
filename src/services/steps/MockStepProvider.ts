import type { StepPermission, StepProvider, StepSnapshot } from './StepProvider';
import { getDateKey } from '@/domain/gameLogic';

export class MockStepProvider implements StepProvider {
  readonly id = 'mock' as const;
  private total = 0;
  private dateKey = getDateKey();

  constructor(initialTotal = 0) {
    this.total = initialTotal;
  }

  async isAvailable(): Promise<boolean> { return true; }
  async getPermission(): Promise<StepPermission> { return 'granted'; }
  async requestPermission(): Promise<StepPermission> { return 'granted'; }

  async getTodaySteps(): Promise<StepSnapshot> {
    const currentDateKey = getDateKey();
    if (currentDateKey !== this.dateKey) {
      this.total = 0;
      this.dateKey = currentDateKey;
    }
    this.total += 420 + Math.floor(Math.random() * 280);
    return { total: this.total, source: this.id, capturedAt: new Date().toISOString() };
  }
}
