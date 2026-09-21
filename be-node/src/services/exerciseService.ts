import type { Pool } from "pg";
import { findAllExerciseNames } from "../repositories/exerciseNameRepository.js";
import type { ExerciseNameModel } from "../types/exerciseName.js";

function sortByLabel(items: ExerciseNameModel[]): ExerciseNameModel[] {
  return [...items].sort((left, right) =>
    left.label.localeCompare(right.label, undefined, { sensitivity: "base" }),
  );
}

export async function getExercises(
  pool: Pool,
  idValue = false,
): Promise<ExerciseNameModel[]> {
  const rows = await findAllExerciseNames(pool);

  const exercises = rows.map((row) => ({
    value: idValue ? row.id : row.value,
    label: row.value,
  }));

  return sortByLabel(exercises);
}
