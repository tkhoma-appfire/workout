import type { Pool } from "pg";
import { findFirstWorkoutDate } from "../repositories/workoutRepository.js";

export type FirstWorkoutDate = {
  firstDate: string;
};

export async function getFirstWorkoutDate(pool: Pool): Promise<FirstWorkoutDate> {
  const firstDate = await findFirstWorkoutDate(pool);
  if (!firstDate) {
    throw new Error("No workouts found");
  }

  return { firstDate };
}
