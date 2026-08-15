import type { StepPermission, StepProvider, StepSnapshot } from './StepProvider';

export class HealthConnectStepProvider implements StepProvider {
  readonly id = 'health-connect' as const;
  async isAvailable(): Promise<boolean> { return false; }
  async getPermission(): Promise<StepPermission> { return 'unavailable'; }
  async requestPermission(): Promise<StepPermission> { return 'unavailable'; }
  async getTodaySteps(): Promise<StepSnapshot> {
    throw new Error('Health Connect requires the Milestone 2 native development build.');
  }
}
