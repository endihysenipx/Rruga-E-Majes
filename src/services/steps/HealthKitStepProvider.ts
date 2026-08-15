import type { StepPermission, StepProvider, StepSnapshot } from './StepProvider';

export class HealthKitStepProvider implements StepProvider {
  readonly id = 'healthkit' as const;
  async isAvailable(): Promise<boolean> { return false; }
  async getPermission(): Promise<StepPermission> { return 'unavailable'; }
  async requestPermission(): Promise<StepPermission> { return 'unavailable'; }
  async getTodaySteps(): Promise<StepSnapshot> {
    throw new Error('HealthKit requires the Milestone 2 native development build.');
  }
}
