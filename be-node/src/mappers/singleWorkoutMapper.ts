import type { SingleWorkoutModel, WorkoutFullRow } from "../types/workout.js";
import { formatShortAxisLabel } from "../util/dateFormat.js";

function formatWorkoutDate(date: Date | string): string {
  if (typeof date === "string") {
    return date.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

export function toSingleWorkoutModels(rows: WorkoutFullRow[]): SingleWorkoutModel[] {
  const byId = new Map<string, WorkoutFullRow[]>();

  for (const row of rows) {
    const group = byId.get(row.id) ?? [];
    group.push(row);
    byId.set(row.id, group);
  }

  const models = [...byId.values()].map((projections) => mapWorkoutProjections(projections));
  models.sort((left, right) => right.date.localeCompare(left.date));
  return models;
}

function mapWorkoutProjections(projections: WorkoutFullRow[]): SingleWorkoutModel {
  const first = projections[0];
  if (!first) {
    throw new Error("Workout projection is empty");
  }

  const date = formatWorkoutDate(first.date);

  const model: SingleWorkoutModel = {
    id: first.id,
    date,
    time: first.exercise_time,
    calories: first.calories,
    puls: first.puls,
    maxPuls: first.puls_max,
    intensive: first.intensive,
    aero: first.aero,
    anaero: first.anaero,
    trainingLoad: first.tl,
    rounds: first.rounds,
    comment: first.comment,
    favorite: first.favorite ?? false,
    exercises: [],
    xaxisLabel: formatShortAxisLabel(date),
  };

  for (const projection of projections) {
    model.exercises.push({
      exercise: projection.name ?? "",
      weight: projection.weight,
      order: projection.ex_order,
    });
  }

  return model;
}

export function countDistinctWorkoutDates(rows: WorkoutFullRow[]): number {
  const dates = new Set<string>();

  for (const row of rows) {
    dates.add(formatWorkoutDate(row.date));
  }

  return dates.size;
}
