import type { Pool } from "pg";
import type { WorkoutFullRow } from "../types/workout.js";

export async function addOrRemoveFavorite(pool: Pool, workoutId: string): Promise<void> {
  await pool.query(
    `
      WITH ins AS (
        INSERT INTO favorite (fav_order, workout)
        SELECT COALESCE(MAX(fav_order), 0) + 1, $1
        FROM favorite
        ON CONFLICT (workout) DO NOTHING
        RETURNING id
      )
      DELETE FROM favorite
      WHERE workout = $1
        AND NOT EXISTS (SELECT 1 FROM ins)
    `,
    [workoutId],
  );
}

export async function findFavoriteWorkouts(pool: Pool): Promise<WorkoutFullRow[]> {
  const result = await pool.query<WorkoutFullRow>(
    `
      SELECT w.id,
        w.date,
        w.exercise_time,
        w.calories,
        w.puls,
        w.puls_max,
        w.intensive,
        w.aero,
        w.anaero,
        w.tl,
        w.rounds,
        w.comment,
        e.weight,
        e.ex_order,
        n.value AS name,
        true AS favorite
      FROM exercise e
      LEFT JOIN workout w ON e.workout_id = w.id
      LEFT JOIN exercise_name n ON e.name = n.id
      RIGHT JOIN favorite f ON f.workout = w.id
      ORDER BY f.fav_order DESC, e.ex_order ASC
    `,
  );

  return result.rows;
}
