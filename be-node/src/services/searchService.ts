import type { Pool } from "pg";
import { toSingleWorkoutModels } from "../mappers/singleWorkoutMapper.js";
import {
  findWorkoutsByIds,
  searchRecentWorkoutIds,
  searchWorkoutIdsByExactExercises,
  searchWorkoutIdsByExercises,
} from "../repositories/workoutRepository.js";
import type { SingleWorkoutModel } from "../types/workout.js";

function parseExercises(exercises: string | undefined): string[] {
  if (!exercises?.trim()) {
    return [];
  }

  return exercises
    .split(",")
    .map((exercise) => exercise.trim())
    .filter(Boolean);
}

export async function searchWorkouts(
  pool: Pool,
  exercisesParam: string | undefined,
  onlySelected: boolean,
): Promise<SingleWorkoutModel[]> {
  const exercises = parseExercises(exercisesParam);

  let workoutIds: string[];
  if (exercises.length === 0) {
    workoutIds = await searchRecentWorkoutIds(pool);
  } else if (onlySelected) {
    workoutIds = await searchWorkoutIdsByExactExercises(pool, exercises);
  } else {
    workoutIds = await searchWorkoutIdsByExercises(pool, exercises);
  }

  const rows = await findWorkoutsByIds(pool, workoutIds);
  return toSingleWorkoutModels(rows);
}
