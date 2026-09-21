import type { Pool } from "pg";
import {
  deleteFlaggedDay,
  findAllFlaggedDays,
  insertFlaggedDay,
} from "../repositories/flaggedRepository.js";

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
