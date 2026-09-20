import { Pool } from "pg";
import { getDatabaseConfig, getMigrationsDir } from "./config.js";
import {
  applyMigration,
  ensureHistoryTable,
  getAppliedMigrations,
  getPendingMigrations,
  loadMigrationFiles,
} from "./flyway.js";
import type { MigrationFile } from "./types.js";

export type MigrationInfo = {
  migrationsDir: string;
  applied: string[];
  pending: string[];
};

function formatMigrationName(migration: MigrationFile): string {
  return `${migration.filename} (${migration.description})`;
}

export async function getMigrationInfo(pool?: Pool): Promise<MigrationInfo> {
  const db = pool ?? new Pool(getDatabaseConfig());
  const shouldEndPool = !pool;

  try {
    const migrationsDir = getMigrationsDir();
    await ensureHistoryTable(db);
    const files = await loadMigrationFiles(migrationsDir);
    const appliedMigrations = await getAppliedMigrations(db);
    const pendingMigrations = getPendingMigrations(files, appliedMigrations);

    return {
      migrationsDir,
      applied: appliedMigrations.map((migration) => migration.script),
      pending: pendingMigrations.map(formatMigrationName),
    };
  } finally {
    if (shouldEndPool) {
      await db.end();
    }
  }
}

export async function runMigrations(pool?: Pool): Promise<void> {
  const db = pool ?? new Pool(getDatabaseConfig());
  const shouldEndPool = !pool;
  const installedBy = process.env.MIGRATIONS_INSTALLED_BY ?? "be-node";

  try {
    const migrationsDir = getMigrationsDir();
    await ensureHistoryTable(db);
    const files = await loadMigrationFiles(migrationsDir);
    const appliedMigrations = await getAppliedMigrations(db);
    const pendingMigrations = getPendingMigrations(files, appliedMigrations);

    if (pendingMigrations.length === 0) {
      console.log("No pending migrations.");
      return;
    }

    for (const migration of pendingMigrations) {
      const client = await db.connect();
      try {
        console.log(`Applying ${migration.filename}...`);
        await applyMigration(client, migration, installedBy);
        console.log(`Applied ${migration.filename}`);
      } finally {
        client.release();
      }
    }
  } finally {
    if (shouldEndPool) {
      await db.end();
    }
  }
}
