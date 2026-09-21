import { Router } from "express";
import type { Pool } from "pg";
import { upload } from "../middleware/upload.js";
import { getExercises } from "../services/exerciseService.js";
import { getCalendarEvents } from "../services/calendarService.js";
import { getCurrentPeriodWorkouts } from "../services/currentPeriodService.js";
import { upsertFlagged } from "../services/flaggedService.js";
import { getFavoriteWorkouts, toggleFavorite } from "../services/favoriteService.js";
import { getFirstWorkoutDate } from "../services/firstWorkoutService.js";
import { exportCsv } from "../services/exportService.js";
import { importCsv } from "../services/importService.js";
import { searchWorkouts } from "../services/searchService.js";
import { getWorkoutsPerPeriod } from "../services/workoutResponseBuilder.js";
import type { DateRange, WorkoutsPeriod } from "../types/workout.js";

export function createWorkoutRoutes(pool: Pool): Router {
  const router = Router();

  router.get("/exercises", async (req, res) => {
    try {
      const idValue = req.query.id_value === "true";
      const exercises = await getExercises(pool, idValue);
      res.json(exercises);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load exercises";
      res.status(500).json({ error: message });
    }
  });

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

  router.get("/export/csv", async (_req, res) => {
    try {
      const content = await exportCsv(pool);
      if (!content) {
        res.status(404).send();
        return;
      }

      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", 'attachment; filename="workout.zip"');
      res.setHeader("Content-Length", content.length);
      res.send(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to export workouts";
      res.status(500).json({ error: message });
    }
  });

  router.post("/import/csv", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "File is required" });
        return;
      }

      const message = await importCsv(pool, req.file.buffer);
      res.send(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import workouts";
      res.status(400).json({ error: message });
    }
  });

  router.post("/favorites", async (req, res) => {
    try {
      const workoutId = (req.body as { workout?: string })?.workout;
      if (!workoutId) {
        res.status(400).json({ error: "workout is required" });
        return;
      }

      await toggleFavorite(pool, workoutId);
      res.status(202).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update favorite";
      res.status(400).json({ error: message });
    }
  });

  router.get("/favorites", async (_req, res) => {
    try {
      const favorites = await getFavoriteWorkouts(pool);
      res.json(favorites);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load favorites";
      res.status(500).json({ error: message });
    }
  });

  router.get("/search", async (req, res) => {
    try {
      const exercises = typeof req.query.exercises === "string"
        ? req.query.exercises
        : undefined;
      const onlySelected = req.query.onlySelected === "true";
      const workouts = await searchWorkouts(pool, exercises, onlySelected);
      res.json(workouts);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to search workouts";
      res.status(500).json({ error: message });
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
