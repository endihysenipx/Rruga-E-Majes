import * as SQLite from 'expo-sqlite';

import type { PersistedGameState } from '@/domain/models';

const DATABASE_NAME = 'udhetari.db';
const STATE_KEY = 'game-state';

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= SQLite.openDatabaseAsync(DATABASE_NAME);
  const database = await databasePromise;
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  return database;
}

export async function loadGameState(): Promise<PersistedGameState | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value: string }>('SELECT value FROM app_state WHERE key = ?', STATE_KEY);
  if (!row) return null;
  try {
    return JSON.parse(row.value) as PersistedGameState;
  } catch {
    return null;
  }
}

export async function saveGameState(state: PersistedGameState): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    STATE_KEY,
    JSON.stringify(state),
    new Date().toISOString(),
  );
}
