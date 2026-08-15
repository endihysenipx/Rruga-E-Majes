import type { PersistedGameState } from '@/domain/models';

const STATE_KEY = 'udhetari-game-state';
let memoryState: PersistedGameState | null = null;

function storage(): Storage | undefined {
  return typeof globalThis.localStorage === 'undefined' ? undefined : globalThis.localStorage;
}

export async function loadGameState(): Promise<PersistedGameState | null> {
  const saved = storage()?.getItem(STATE_KEY);
  if (!saved) return memoryState;
  try {
    return JSON.parse(saved) as PersistedGameState;
  } catch {
    return null;
  }
}

export async function saveGameState(state: PersistedGameState): Promise<void> {
  memoryState = state;
  storage()?.setItem(STATE_KEY, JSON.stringify(state));
}
