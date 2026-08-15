import type { StepProvider } from './StepProvider';
import { MockStepProvider } from './MockStepProvider';

let mockProvider: MockStepProvider | undefined;

export function getStepProvider(initialTotal = 0): StepProvider {
  mockProvider ??= new MockStepProvider(initialTotal);
  return mockProvider;
}
