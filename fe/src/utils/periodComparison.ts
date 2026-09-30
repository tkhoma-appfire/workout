import type { WorkoutData, WorkoutType } from "@/types";
import { formatWeekPeriodRange } from "@/utils/weekPeriodFormat";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const emptyWorkoutData = (): WorkoutData => ({
  content: [],
  statistics: {
    exerciseTime: "00:00:00",
    calories: 0,
  },
  totalElements: 0,
});

export function totalTrainingLoad(workouts: WorkoutType[]): number {
  return workouts.reduce((sum, workout) => {
    const load = Number(workout.trainingLoad);
    return sum + (Number.isFinite(load) ? load : 0);
  }, 0);
}

function parseMonthPeriod(period: string): Date {
  const match = period.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) {
    return new Date();
  }

  const monthToken = match[1].toLowerCase();
  const year = Number(match[2]);
  const monthIndex = MONTH_NAMES.findIndex(
    (name) =>
      name.toLowerCase() === monthToken
      || monthToken.startsWith(name.toLowerCase())
      || name.toLowerCase().startsWith(monthToken.slice(0, 3)),
  );

  if (monthIndex < 0) {
    const fallback = new Date(`1 ${period}`);
    return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
  }

  return new Date(year, monthIndex, 1);
}

/** Matches be-node `parseMonth` (`MMM yyyy`, English). */
export function formatMonthPeriodLabel(date: Date): string {
  const month = MONTH_NAMES[date.getMonth()];
  return `${month} ${date.getFullYear()}`;
}

export function previousMonthPeriod(currentPeriod: string): string {
  const parsed = parseMonthPeriod(currentPeriod);
  parsed.setMonth(parsed.getMonth() - 1);
  return formatMonthPeriodLabel(parsed);
}

export function previousWeekPeriod(anchorInWeek: Date): string {
  const previousAnchor = new Date(anchorInWeek);
  previousAnchor.setDate(previousAnchor.getDate() - 7);
  return formatWeekPeriodRange(previousAnchor);
}

export function formatPercentComparisonLabel(
  current: number,
  previous: number,
  suffix: string,
): string {
  if (current === 0 && previous === 0) {
    return `0% ${suffix}`;
  }

  if (previous === 0) {
    return `+100% ${suffix}`;
  }

  if (current === 0) {
    return `-100% ${suffix}`;
  }

  const percentChange = ((current - previous) / previous) * 100;
  const rounded = Math.round(percentChange);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}% ${suffix}`;
}

export function buildPeriodComparisonLabel(
  current: WorkoutData,
  previous: WorkoutData,
  versusLabel: string,
): string {
  const currentLoad = totalTrainingLoad(current.content);
  const previousLoad = totalTrainingLoad(previous.content);

  if (currentLoad > 0 || previousLoad > 0) {
    return formatPercentComparisonLabel(
      currentLoad,
      previousLoad,
      `load vs ${versusLabel}`,
    );
  }

  return formatPercentComparisonLabel(
    current.statistics.calories,
    previous.statistics.calories,
    `kcal vs ${versusLabel}`,
  );
}
