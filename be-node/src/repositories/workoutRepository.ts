import type { Pool } from "pg";
import type { DateRange, WorkoutFullRow } from "../types/workout.js";

const WORKOUT_SELECT = `
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
    CASE
      WHEN f.id IS NOT NULL THEN true
      ELSE false
    END AS favorite
  FROM exercise e
  LEFT JOIN workout w ON e.workout_id = w.id
  LEFT JOIN exercise_name n ON e.name = n.id
  LEFT JOIN favorite f ON f.workout = w.id
`;

export async function findWorkoutsForPeriod(
  pool: Pool,
  range: DateRange | null,
): Promise<WorkoutFullRow[]> {
  const params: string[] = [];
  let whereClause = "";

  if (range) {
    params.push(range.startDate, range.endDate);
    whereClause = "WHERE w.date >= $1 AND w.date <= $2";
  }

  const result = await pool.query<WorkoutFullRow>(
    `${WORKOUT_SELECT}
     ${whereClause}
     ORDER BY w.date DESC, e.ex_order ASC`,
    params,
  );

  return result.rows;
}

export async function findFirstWorkoutDate(pool: Pool): Promise<string | null> {
  const result = await pool.query<{ first_date: Date | null }>(
    "SELECT MIN(date) AS first_date FROM workout",
  );

  const date = result.rows[0]?.first_date;
  if (!date) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

const SEARCH_LIMIT = 10;

export async function searchRecentWorkoutIds(pool: Pool): Promise<string[]> {
  const result = await pool.query<{ id: string }>(
    `
      SELECT w.id
      FROM workout w
      ORDER BY w.date DESC
      LIMIT $1
    `,
    [SEARCH_LIMIT],
  );

  return result.rows.map((row) => row.id);
}

export async function searchWorkoutIdsByExercises(
  pool: Pool,
  exercises: string[],
): Promise<string[]> {
  const result = await pool.query<{ id: string }>(
    `
      SELECT w.id
      FROM workout w
      JOIN exercise e ON e.workout_id = w.id
      JOIN exercise_name n ON e.name = n.id
      WHERE n.value = ANY($1::text[])
      GROUP BY w.id, w.date
      HAVING COUNT(DISTINCT n.value) = $2
      ORDER BY w.date DESC
      LIMIT $3
    `,
    [exercises, exercises.length, SEARCH_LIMIT],
  );

  return result.rows.map((row) => row.id);
}

export async function searchWorkoutIdsByExactExercises(
  pool: Pool,
  exercises: string[],
): Promise<string[]> {
  const result = await pool.query<{ id: string }>(
    `
      SELECT w.id
      FROM workout w
      JOIN exercise e ON e.workout_id = w.id
      JOIN exercise_name n ON e.name = n.id
      GROUP BY w.id, w.date
      HAVING COUNT(DISTINCT n.value) = $1
        AND COUNT(DISTINCT n.value) FILTER (WHERE n.value = ANY($2::text[])) = $1
      ORDER BY w.date DESC
      LIMIT $3
    `,
    [exercises.length, exercises, SEARCH_LIMIT],
  );

  return result.rows.map((row) => row.id);
}

export async function findWorkoutsByIds(
  pool: Pool,
  workoutIds: string[],
): Promise<WorkoutFullRow[]> {
  if (workoutIds.length === 0) {
    return [];
  }

  const result = await pool.query<WorkoutFullRow>(
    `${WORKOUT_SELECT}
     WHERE e.workout_id = ANY($1::uuid[])
     ORDER BY w.date DESC, e.ex_order ASC`,
    [workoutIds],
  );

  return result.rows;
}

const EXPORT_WORKOUT_SELECT = `
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
    n.value AS name
  FROM exercise e
  LEFT JOIN workout w ON e.workout_id = w.id
  LEFT JOIN exercise_name n ON e.name = n.id
`;

export type ExportWorkoutRow = Omit<WorkoutFullRow, "favorite">;

export async function findAllWorkoutsForExport(pool: Pool): Promise<ExportWorkoutRow[]> {
  const result = await pool.query<ExportWorkoutRow>(
    `${EXPORT_WORKOUT_SELECT}
     ORDER BY w.date DESC, e.ex_order ASC`,
  );

  return result.rows;
}

export async function findCurrentMonthCalories(pool: Pool): Promise<number> {
  const result = await pool.query<{ total: string }>(
    `
      SELECT COALESCE(SUM(calories), 0) AS total
      FROM workout
      WHERE date >= date_trunc('month', CURRENT_DATE)::date
        AND date < (date_trunc('month', CURRENT_DATE) + interval '1 month')::date
    `,
  );

  return Number(result.rows[0]?.total ?? 0);
}
