import type { Pool } from "pg";
import type { DateRange } from "../types/workout.js";

export type CalendarEventRow = {
  id: string;
  date: Date;
  training_load: number | null;
  calories: number | null;
  exercise_time: number | null;
};

export async function findCalendarEvents(
  pool: Pool,
  range: DateRange,
): Promise<CalendarEventRow[]> {
  const result = await pool.query<CalendarEventRow>(
    `
      SELECT w.id,
        w.date,
        w.tl AS training_load,
        w.calories,
        w.exercise_time
      FROM workout w
      WHERE w.date >= $1
        AND w.date <= $2
      ORDER BY w.date ASC
    `,
    [range.startDate, range.endDate],
  );

  return result.rows;
}
