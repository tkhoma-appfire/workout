import type { Pool } from "pg";
import { toSingleWorkoutModels, countDistinctWorkoutDates } from "../mappers/singleWorkoutMapper.js";
import { toYearlyWorkoutModels } from "../mappers/yearlyWorkoutMapper.js";
import { findWorkoutsForPeriod } from "../repositories/workoutRepository.js";
import type {
  DateRange,
  WorkoutsPeriod,
  WorkoutsResponse,
} from "../types/workout.js";
import { calculateStatistics } from "../util/statistics.js";
import { parseMonth, parseWeek, parseYear } from "./dateRangeParser.js";

function parseDateRange(period: WorkoutsPeriod): DateRange | null {
  const timePeriod = period.timePeriod ?? "MONTH";

  switch (timePeriod) {
    case "ALL":
      return null;
    case "WEEK":
      return parseWeek(period.startOfPeriod);
    case "YEAR":
      return parseYear(period.startOfPeriod);
    default:
      return parseMonth(period.startOfPeriod);
  }
}

export async function getWorkoutsPerPeriod(
  pool: Pool,
  period: WorkoutsPeriod | null | undefined,
): Promise<WorkoutsResponse<unknown>> {
  const workoutsPeriod = period ?? { timePeriod: "MONTH", startOfPeriod: null };
  const dateRange = parseDateRange(workoutsPeriod);
  const rows = await findWorkoutsForPeriod(pool, dateRange);
  const timePeriod = workoutsPeriod.timePeriod ?? "MONTH";

  if (timePeriod === "YEAR") {
    const content = toYearlyWorkoutModels(rows);
    return {
      content,
      statistics: calculateStatistics(content),
      totalElements: countDistinctWorkoutDates(rows),
    };
  }

  const content = toSingleWorkoutModels(rows);
  return {
    content,
    statistics: calculateStatistics(content),
    totalElements: countDistinctWorkoutDates(rows),
  };
}
