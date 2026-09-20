import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Pool, PoolClient } from "pg";
import type { AppliedMigration, MigrationFile } from "./types.js";

const migrationPattern = /^V(\d+)__(.+)\.sql$/;

// Flyway-compatible CRC32 checksum.
function calculateChecksum(content: string): number {
  const buffer = Buffer.from(content, "utf8");
  let crc = 0xffffffff;

  for (let index = 0; index < buffer.length; index++) {
    crc ^= buffer[index] ?? 0;
    for (let bit = 0; bit < 8; bit++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }

  // Flyway stores CRC32 as a signed 32-bit int (PostgreSQL INTEGER).
  return (crc ^ 0xffffffff) | 0;
}

export async function loadMigrationFiles(migrationsDir: string): Promise<MigrationFile[]> {
  const entries = await readdir(migrationsDir);
  const migrations = entries
    .filter((entry) => migrationPattern.test(entry))
    .map((filename) => {
      const match = filename.match(migrationPattern);
      if (!match) {
        throw new Error(`Invalid migration filename: ${filename}`);
      }

      const version = match[1];
      const description = match[2];
      if (!version || !description) {
        throw new Error(`Invalid migration filename: ${filename}`);
      }

      return {
        version,
        description: description.replace(/_/g, " "),
        filename,
      };
    })
    .sort((left, right) => Number(left.version) - Number(right.version));

  return Promise.all(migrations.map(async (migration) => {
    const path = join(migrationsDir, migration.filename);
    const sql = await readFile(path, "utf8");

    return {
      ...migration,
      path,
      sql,
      checksum: calculateChecksum(sql),
    };
  }));
}

export async function ensureHistoryTable(client: Pool | PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS flyway_schema_history (
      installed_rank INT NOT NULL,
      version VARCHAR(50),
      description VARCHAR(200) NOT NULL,
      type VARCHAR(20) NOT NULL,
      script VARCHAR(1000) NOT NULL,
      checksum INTEGER,
      installed_by VARCHAR(100) NOT NULL,
      installed_on TIMESTAMP NOT NULL DEFAULT NOW(),
      execution_time INTEGER NOT NULL,
      success BOOLEAN NOT NULL,
      CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank)
    )
  `);
}

export async function getAppliedMigrations(client: Pool | PoolClient): Promise<AppliedMigration[]> {
  const result = await client.query<{
    version: string | null;
    description: string;
    script: string;
    success: boolean;
  }>(`
    SELECT version, description, script, success
    FROM flyway_schema_history
    WHERE success = true
    ORDER BY installed_rank
  `);

  return result.rows;
}

export function getPendingMigrations(
  files: MigrationFile[],
  applied: AppliedMigration[],
): MigrationFile[] {
  const appliedVersions = new Set(
    applied
      .map((migration) => migration.version)
      .filter((version): version is string => version != null),
  );

  return files.filter((file) => !appliedVersions.has(file.version));
}

async function getNextInstalledRank(client: PoolClient): Promise<number> {
  const result = await client.query<{ max: string | null }>(
    "SELECT MAX(installed_rank) AS max FROM flyway_schema_history",
  );
  const currentMax = result.rows[0]?.max;
  return currentMax ? Number(currentMax) + 1 : 1;
}

export async function applyMigration(
  client: PoolClient,
  migration: MigrationFile,
  installedBy: string,
): Promise<void> {
  const startedAt = Date.now();

  await client.query("BEGIN");

  try {
    await client.query(migration.sql);

    const installedRank = await getNextInstalledRank(client);
    await client.query(
      `
        INSERT INTO flyway_schema_history (
          installed_rank,
          version,
          description,
          type,
          script,
          checksum,
          installed_by,
          installed_on,
          execution_time,
          success
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9)
      `,
      [
        installedRank,
        migration.version,
        migration.description,
        "SQL",
        migration.filename,
        migration.checksum,
        installedBy,
        Date.now() - startedAt,
        true,
      ],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
