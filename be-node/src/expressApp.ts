import express from "express";
import type { Pool } from "pg";
import { createWorkoutRoutes } from "./routes/workoutRoutes.js";

export function createApp(pool: Pool) {
  const app = express();

  app.use(express.json());
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
