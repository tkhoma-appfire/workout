import type { PoolClient } from "pg";
import { upsertExerciseNameId } from "./exerciseNameRepository.js";
import type { WorkoutImport } from "../types/workoutCsv.js";

export async function workoutExistsByDate(
  client: PoolClient,
  date: string,
): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM workout WHERE date = $1) AS exists",
    [date],
  );

  return result.rows[0]?.exists ?? false;
}

export async function insertWorkout(
  client: PoolClient,
  workout: WorkoutImport,
): Promise<void> {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO workout (
        date,
        exercise_time,
        calories,
        puls,
        puls_max,
        intensive,
        aero,
        anaero,
        tl,
        rounds,
        comment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `,
    [
      workout.date,
      workout.exerciseTime ?? 0,
      workout.calories,
      workout.puls,
      workout.maxPuls,
      workout.intensive,
      workout.aerobish,
      workout.anaerobish,
      workout.trainingLoad,
      workout.rounds,
      workout.comment,
    ],
  );

  const workoutId = result.rows[0]?.id;
  if (!workoutId) {
    throw new Error(`Failed to insert workout for ${workout.date}`);
  }

  for (const exercise of workout.exercises) {
    const nameId = await upsertExerciseNameId(client, exercise.name);
    await client.query(
      `
        INSERT INTO exercise (name, weight, workout_id, ex_order)
        VALUES ($1, $2, $3, $4)
      `,
      [nameId, exercise.weight, workoutId, exercise.order],
    );
  }
}
