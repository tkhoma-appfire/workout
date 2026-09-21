import cors from "cors";
import express from "express";
import type { Pool } from "pg";
import { createWorkoutRoutes } from "./routes/workoutRoutes.js";

function getAllowedOrigins(): string[] {
  const configured = process.env.CORS_ORIGINS;
  if (configured) {
    return configured.split(",").map((origin) => origin.trim()).filter(Boolean);
  }

  return ["http://localhost:5173", "https://workout-ne921qvqb-secondffgfs-projects.vercel.app", "https://workout-fe-git-master-secondffgfs-projects.vercel.app"];
}

export function createApp(pool: Pool) {
  const app = express();

  app.use(cors({
    origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      if (!origin || getAllowedOrigins().includes(origin)) {
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
