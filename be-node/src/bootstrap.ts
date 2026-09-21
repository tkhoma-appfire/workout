import type { Express } from "express";
import { Pool } from "pg";
import { createApp } from "./expressApp.js";
import { getDatabaseConfig } from "./db/config.js";
import { runMigrations } from "./db/migrate.js";

let initPromise: Promise<Express> | undefined;

export function getApp(): Promise<Express> {
  if (!initPromise) {
    initPromise = (async () => {
      const pool = new Pool(getDatabaseConfig());
      await runMigrations(pool);
      return createApp(pool);
    })();
  }

  return initPromise;
}
