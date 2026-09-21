import type { Pool } from "pg";
import { findCalendarEvents } from "../repositories/calendarRepository.js";
import { findCurrentMonthCalories } from "../repositories/workoutRepository.js";
import type { CurrentPeriodWorkouts, DateRange } from "../types/workout.js";
import { formatIsoDate } from "../util/dateFormat.js";
import { calculateStatistics } from "../util/statistics.js";
import { mapCalendarEventRow } from "./calendarService.js";

function startOfIsoWeek(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

function getCurrentPeriodRanges(): { currentWeek: DateRange; prevWeek: DateRange } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = startOfIsoWeek(today);
  const endOfPrevWeek = new Date(startOfWeek);
  endOfPrevWeek.setDate(endOfPrevWeek.getDate() - 1);

  const startOfPrevWeek = new Date(endOfPrevWeek);
  startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 6);

  return {
    currentWeek: {
      startDate: formatIsoDate(startOfWeek),
      endDate: formatIsoDate(today),
    },
    prevWeek: {
      startDate: formatIsoDate(startOfPrevWeek),
      endDate: formatIsoDate(endOfPrevWeek),
    },
  };
}

export async function getCurrentPeriodWorkouts(
  pool: Pool,
): Promise<CurrentPeriodWorkouts> {
  const { currentWeek, prevWeek } = getCurrentPeriodRanges();

  const [currentWeekRows, prevWeekRows, monthCalories] = await Promise.all([
    findCalendarEvents(pool, currentWeek),
    findCalendarEvents(pool, prevWeek),
    findCurrentMonthCalories(pool),
  ]);

  return {
    currentWeek: currentWeekRows.map(mapCalendarEventRow),
    prevWeek: prevWeekRows.map(mapCalendarEventRow),
    statistics: calculateStatistics(
      currentWeekRows.map((row) => ({
        calories: row.calories,
        time: row.exercise_time,
      })),
    ),
    monthCalories,
  };
}
