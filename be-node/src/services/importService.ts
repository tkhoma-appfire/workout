import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";
import type { Pool, PoolClient } from "pg";
import { insertWorkout, workoutExistsByDate } from "../repositories/importRepository.js";
import type { ParsedExercise, WorkoutCsv, WorkoutImport } from "../types/workoutCsv.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EXERCISE_ENTRY = /\{name:\s*"([^"]*)"\s*,\s*weight:\s*(-?\d+)\s*,\s*order:\s*(\d+)\s*}/g;

function trimToNull(value: string | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  return value.trim();
}

function parseInteger(value: string | undefined): number | null {
  if (!value?.trim()) {
    return null;
  }

  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseExercises(exercisesBlob: string | undefined): ParsedExercise[] {
  if (!exercisesBlob?.trim()) {
    return [];
  }

  const exercises: ParsedExercise[] = [];
  for (const match of exercisesBlob.matchAll(EXERCISE_ENTRY)) {
    const name = match[1]?.trim();
    const weight = Number.parseInt(match[2] ?? "", 10);
    const order = Number.parseInt(match[3] ?? "", 10);

    if (!name) {
      continue;
    }

    exercises.push({ name, weight, order });
  }

  return exercises;
}

function mapToWorkout(csv: WorkoutCsv): WorkoutImport | null {
  const date = csv.date?.trim();
  if (!date || !ISO_DATE.test(date)) {
    return null;
  }

  return {
    date,
    exerciseTime: parseInteger(csv.exercise_time),
    calories: parseInteger(csv.calories),
    puls: parseInteger(csv.puls),
    maxPuls: parseInteger(csv.max_puls),
    intensive: trimToNull(csv.intensive),
    aerobish: trimToNull(csv.aerobish),
    anaerobish: trimToNull(csv.anaerobish),
    trainingLoad: parseInteger(csv.training_load),
    rounds: trimToNull(csv.rounds),
    comment: trimToNull(csv.comment),
    exercises: parseExercises(csv.exercises),
  };
}

function parseWorkoutCsv(content: string): WorkoutImport[] {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as WorkoutCsv[];

  return records
    .map((record) => mapToWorkout(record))
    .filter((workout): workout is WorkoutImport => workout != null);
}

async function importWorkouts(
  client: PoolClient,
  workouts: WorkoutImport[],
): Promise<number> {
  let importedCount = 0;

  for (const workout of workouts) {
    if (await workoutExistsByDate(client, workout.date)) {
      continue;
    }

    await insertWorkout(client, workout);
    importedCount += 1;
  }

  return importedCount;
}

export async function importCsv(pool: Pool, zipBuffer: Buffer): Promise<string> {
  const zip = new AdmZip(zipBuffer);
  let importedCount = 0;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const entry of zip.getEntries()) {
      if (!entry.entryName.endsWith(".csv") || entry.isDirectory) {
        continue;
      }

      const content = entry.getData().toString("utf8");
      const workouts = parseWorkoutCsv(content);
      importedCount += await importWorkouts(client, workouts);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return `Imported ${importedCount} workouts from ZIP`;
}
