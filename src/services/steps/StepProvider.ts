import type { StepRecord } from '@/domain/models';

export type StepPermission = 'undetermined' | 'granted' | 'denied' | 'unavailable';

export interface StepSnapshot {
  total: number;
  source: StepRecord['source'];
  capturedAt: string;
}

export interface StepProvider {
  readonly id: StepRecord['source'];
  isAvailable(): Promise<boolean>;
  getPermission(): Promise<StepPermission>;
  requestPermission(): Promise<StepPermission>;
  getTodaySteps(): Promise<StepSnapshot>;
}
