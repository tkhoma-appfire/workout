import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { PoolConfig } from "pg";

export function getDatabaseConfig(): PoolConfig {
  if (process.env.DB_HOST) {
    return {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME ?? "workoutdb",
      user: process.env.DB_USER ?? "tkhoma",
      password: process.env.DB_PASSWORD ?? "mypass",
    };
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    return { connectionString: databaseUrl };
  }

  return {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? "workoutdb",
    user: process.env.DB_USER ?? "tkhoma",
    password: process.env.DB_PASSWORD ?? "mypass",
  };
}

export function getMigrationsDir(): string {
  if (process.env.MIGRATIONS_DIR) {
    return process.env.MIGRATIONS_DIR;
  }

  return join(fileURLToPath(new URL(".", import.meta.url)), "migration");
}
