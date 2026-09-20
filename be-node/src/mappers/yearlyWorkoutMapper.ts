import type { WorkoutFullRow, YearlyWorkoutModel } from "../types/workout.js";
import { formatMonthAxisLabel } from "../util/dateFormat.js";
import { countDistinctWorkoutDates } from "./singleWorkoutMapper.js";

function formatWorkoutDate(date: Date | string): string {
  if (typeof date === "string") {
    return date.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

export function toYearlyWorkoutModels(rows: WorkoutFullRow[]): YearlyWorkoutModel[] {
  const byMonth = new Map<string, WorkoutFullRow[]>();

  for (const row of rows) {
    const date = formatWorkoutDate(row.date);
    const monthKey = date.slice(0, 7);
    const group = byMonth.get(monthKey) ?? [];
    group.push(row);
    byMonth.set(monthKey, group);
  }

  return [...byMonth.entries()].map(([monthKey, monthRows]) =>
    mapMonthWorkoutProjections(monthRows, monthKey),
  );
}

function mapMonthWorkoutProjections(
  projections: WorkoutFullRow[],
  monthKey: string,
): YearlyWorkoutModel {
  const byDate = new Map<string, WorkoutFullRow>();

  for (const projection of projections) {
    const date = formatWorkoutDate(projection.date);
    if (!byDate.has(date)) {
      byDate.set(date, projection);
    }
  }

  let calories = 0;
  let exerciseTime = 0;
  let trainingLoad = 0;
  let date = `${monthKey}-01`;

  for (const workout of byDate.values()) {
    date = formatWorkoutDate(workout.date);
    calories += workout.calories ?? 0;
    exerciseTime += workout.exercise_time ?? 0;
    trainingLoad += workout.tl ?? 0;
  }

  return {
    calories,
    date,
    time: exerciseTime,
    trainings: countDistinctWorkoutDates(projections),
    trainingLoad,
    xaxisLabel: formatMonthAxisLabel(date),
  };
}
