import cors from "cors";
import express from "express";
import type { Pool } from "pg";
import { createWorkoutRoutes } from "./routes/workoutRoutes.js";

const LOCAL_VITE_ORIGINS = ["http://localhost:5173", "http://localhost:5173/"];

const DEFAULT_ORIGINS = [
  ...LOCAL_VITE_ORIGINS,
  "https://workout-8djdlmtuw-secondffgfs-projects.vercel.app",
];

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, "");
}

function getAllowedOrigins(): string[] {
  const configured = process.env.CORS_ORIGINS;
  const fromEnv = configured
    ? configured.split(",").map((origin) => normalizeOrigin(origin)).filter(Boolean)
    : [];

  return [...new Set([...DEFAULT_ORIGINS.map(normalizeOrigin), ...fromEnv])];
}

export function createApp(pool: Pool) {
  const app = express();

  app.use(cors({
    origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      const allowed = getAllowedOrigins();
      if (!origin || allowed.includes(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  }));

  app.use((req, res, next) => {
    if (req.path === "/api/add_flagged") {
      express.text({ type: "*/*" })(req, res, next);
      return;
    }

    if (req.path === "/api/import/csv") {
      next();
      return;
    }

    express.json()(req, res, next);
  });
  app.use("/api", createWorkoutRoutes(pool));

  app.get("/health", async (_req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok" });
    } catch {
      res.status(503).json({ status: "error", database: "unavailable" });
    }
  });

  return app;
}
