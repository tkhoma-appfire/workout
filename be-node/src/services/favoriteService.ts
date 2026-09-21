import type { Pool } from "pg";
import { toSingleWorkoutModels } from "../mappers/singleWorkoutMapper.js";
import {
  addOrRemoveFavorite,
  findFavoriteWorkouts,
} from "../repositories/favoriteRepository.js";
import type { SingleWorkoutModel } from "../types/workout.js";

export async function toggleFavorite(pool: Pool, workoutId: string): Promise<void> {
  await addOrRemoveFavorite(pool, workoutId);
}

export async function getFavoriteWorkouts(pool: Pool): Promise<SingleWorkoutModel[]> {
  const rows = await findFavoriteWorkouts(pool);
  return toSingleWorkoutModels(rows);
}
