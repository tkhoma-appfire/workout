import type { Pool } from "pg";
import {
  findCalendarEvents,
  type CalendarEventRow,
} from "../repositories/calendarRepository.js";
import type { CalendarEventModel, DateRange } from "../types/workout.js";

function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    return date.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

export function mapCalendarEventRow(row: CalendarEventRow): CalendarEventModel {
  return {
    id: row.id,
    date: formatDate(row.date),
    trainingLoad: row.training_load,
    calories: row.calories,
  };
}

function assertDateRange(range: DateRange | null | undefined): DateRange {
  if (!range?.startDate || !range?.endDate) {
    throw new Error("startDate and endDate are required");
  }

  return range;
}

export async function getCalendarEvents(
  pool: Pool,
  range: DateRange | null | undefined,
): Promise<CalendarEventModel[]> {
  const { startDate, endDate } = assertDateRange(range);
  const rows = await findCalendarEvents(pool, { startDate, endDate });

  return rows.map(mapCalendarEventRow);
}
