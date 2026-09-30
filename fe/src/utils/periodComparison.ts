import type { WorkoutType } from "@/types";
import { formatWeekPeriodRange } from "@/utils/weekPeriodFormat";

export function totalTrainingLoad(workouts: WorkoutType[]): number {
  return workouts.reduce((sum, workout) => {
    const load = Number(workout.trainingLoad);
    return sum + (Number.isFinite(load) ? load : 0);
  }, 0);
}

export function formatMonthPeriodLabel(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function previousMonthPeriod(currentPeriod: string): string {
  const parsed = new Date(`1 ${currentPeriod}`);
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    return formatMonthPeriodLabel(now);
  }

  parsed.setMonth(parsed.getMonth() - 1);
  return formatMonthPeriodLabel(parsed);
}

export function previousWeekPeriod(anchorInWeek: Date): string {
  const previousAnchor = new Date(anchorInWeek);
  previousAnchor.setDate(previousAnchor.getDate() - 7);
  return formatWeekPeriodRange(previousAnchor);
}

export function formatLoadPercentChange(currentLoad: number, previousLoad: number): number | null {
  if (previousLoad === 0) {
    return null;
  }

  return ((currentLoad - previousLoad) / previousLoad) * 100;
}

export function formatLoadComparisonLabel(
  currentLoad: number,
  previousLoad: number,
  versusLabel: string,
): string | null {
  if (currentLoad === 0 && previousLoad === 0) {
    return `0% load vs ${versusLabel}`;
  }

  const percentChange = formatLoadPercentChange(currentLoad, previousLoad);
  if (percentChange === null) {
    return null;
  }

  const rounded = Math.round(percentChange);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}% load vs ${versusLabel}`;
}
