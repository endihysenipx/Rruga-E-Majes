import type { PersistedGameState } from '@/domain/models';

export interface CloudSyncGateway {
  pull(userId: string): Promise<PersistedGameState | null>;
  push(userId: string, state: PersistedGameState): Promise<void>;
}

export class OfflineCloudSyncGateway implements CloudSyncGateway {
  async pull(): Promise<null> { return null; }
  async push(): Promise<void> { /* Milestone 3: Supabase implementation. */ }
}
