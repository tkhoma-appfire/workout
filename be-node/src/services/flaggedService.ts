import type { Pool } from "pg";
import { toSingleWorkoutModels } from "../mappers/singleWorkoutMapper.js";
import {
  deleteFlaggedDay,
  findAllFlaggedDays,
  findFlaggedWorkouts,
  insertFlaggedDay,
} from "../repositories/flaggedRepository.js";
import type { SingleWorkoutModel } from "../types/workout.js";

export async function upsertFlagged(
  pool: Pool,
  date: string | null | undefined,
): Promise<string[]> {
  const flaggedDays = await findAllFlaggedDays(pool);
  const result = [...flaggedDays];

  if (date == null || date === "") {
    return result;
  }

  if (flaggedDays.includes(date)) {
    await deleteFlaggedDay(pool, date);
    return result.filter((day) => day !== date);
  }

  await insertFlaggedDay(pool, date);
  result.push(date);
  result.sort();
  return result;
}

export async function getFlaggedWorkouts(pool: Pool): Promise<SingleWorkoutModel[]> {
  const rows = await findFlaggedWorkouts(pool);
  return toSingleWorkoutModels(rows);
}
