import type { Pool } from "pg";
import { findFirstWorkoutDate } from "../repositories/workoutRepository.js";

export type FirstWorkoutDate = {
  firstDate: string;
};

const DEFAULT_FIRST_WORKOUT_DATE = "2000-01-01";

export async function getFirstWorkoutDate(pool: Pool): Promise<FirstWorkoutDate> {
  const firstDate = await findFirstWorkoutDate(pool);

  return { firstDate: firstDate ?? DEFAULT_FIRST_WORKOUT_DATE };
}
