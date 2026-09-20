import { Router } from "express";
import type { Pool } from "pg";
import { getWorkoutsPerPeriod } from "../services/workoutResponseBuilder.js";
import type { WorkoutsPeriod } from "../types/workout.js";

export function createWorkoutRoutes(pool: Pool): Router {
  const router = Router();

  router.post("/workouts", async (req, res) => {
    try {
      const period = req.body as WorkoutsPeriod | null | undefined;
      const response = await getWorkoutsPerPeriod(pool, period);
      res.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load workouts";
      res.status(400).json({ error: message });
    }
  });

  return router;
}
