import type { Pool } from "pg";
import { toSingleWorkoutModels } from "../mappers/singleWorkoutMapper.js";
import {
  deleteFlaggedDay,
  findAllFlaggedDays,
  findFlaggedWorkouts,
  insertFlaggedDay,
} from "../repositories/flaggedRepository.js";
import type { SingleWorkoutModel } from "../types/workout.js";

function normalizeFlaggedDay(value: string): string {
  return value.trim().slice(0, 10);
}

export async function upsertFlagged(
  pool: Pool,
  date: string | null | undefined,
): Promise<string[]> {
  const flaggedDays = await findAllFlaggedDays(pool);
  const result = [...flaggedDays];

  if (date == null || date === "") {
    return result;
  }

  const day = normalizeFlaggedDay(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error(`Invalid flagged day: ${date}`);
  }

  if (flaggedDays.includes(day)) {
    await deleteFlaggedDay(pool, day);
    return result.filter((flaggedDay) => flaggedDay !== day);
  }

  await insertFlaggedDay(pool, day);
  result.push(day);
  result.sort();
  return result;
}

export async function getFlaggedWorkouts(pool: Pool): Promise<SingleWorkoutModel[]> {
  const rows = await findFlaggedWorkouts(pool);
  return toSingleWorkoutModels(rows);
}
