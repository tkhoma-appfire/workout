import { Router } from "express";
import type { Pool } from "pg";
import { getCalendarEvents } from "../services/calendarService.js";
import { getCurrentPeriodWorkouts } from "../services/currentPeriodService.js";
import { upsertFlagged } from "../services/flaggedService.js";
import { getFirstWorkoutDate } from "../services/firstWorkoutService.js";
import { getWorkoutsPerPeriod } from "../services/workoutResponseBuilder.js";
import type { DateRange, WorkoutsPeriod } from "../types/workout.js";

export function createWorkoutRoutes(pool: Pool): Router {
  const router = Router();

  router.get("/current_period", async (_req, res) => {
    try {
      const response = await getCurrentPeriodWorkouts(pool);
      res.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load current period";
      res.status(500).json({ error: message });
    }
  });

  router.get("/first_workout_date", async (_req, res) => {
    try {
      const response = await getFirstWorkoutDate(pool);
      res.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load first workout date";
      res.status(404).json({ error: message });
    }
  });

  router.post("/add_flagged", async (req, res) => {
    try {
      const body = req.body as string | undefined;
      const flaggedDay = body === "" ? null : body ?? null;
      const days = await upsertFlagged(pool, flaggedDay);
      res.json(days);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update flagged day";
      res.status(400).json({ error: message });
    }
  });

  router.post("/calendar_events", async (req, res) => {
    try {
      const range = req.body as DateRange | null | undefined;
      const events = await getCalendarEvents(pool, range);
      res.json(events);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load calendar events";
      res.status(400).json({ error: message });
    }
  });

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
