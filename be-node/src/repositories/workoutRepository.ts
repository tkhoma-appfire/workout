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
