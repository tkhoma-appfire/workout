import type { Pool } from "pg";
import type { WorkoutFullRow } from "../types/workout.js";

export async function findAllFlaggedDays(pool: Pool): Promise<string[]> {
  const result = await pool.query<{ day: string }>(
    "SELECT day FROM flagged ORDER BY day ASC",
  );

  return result.rows.map((row) => row.day);
}

export async function insertFlaggedDay(pool: Pool, day: string): Promise<void> {
  await pool.query(
    "INSERT INTO flagged (day) VALUES ($1)",
    [day],
  );
}

export async function deleteFlaggedDay(pool: Pool, day: string): Promise<void> {
  await pool.query(
    "DELETE FROM flagged WHERE day = $1",
    [day],
  );
}

export async function findFlaggedWorkouts(pool: Pool): Promise<WorkoutFullRow[]> {
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
        false AS favorite
      FROM exercise e
      LEFT JOIN workout w ON e.workout_id = w.id
      LEFT JOIN exercise_name n ON e.name = n.id
      RIGHT JOIN flagged f ON (CAST(f.day AS DATE) + INTERVAL '1 day') = w.date
      ORDER BY w.date ASC, e.ex_order ASC
    `,
  );

  return result.rows;
}
