import type { Pool, PoolClient } from "pg";
import { upsertExerciseNameId } from "./exerciseNameRepository.js";
import type { WorkoutFullRow } from "../types/workout.js";
import type { WorkoutWriteExercise, WorkoutWritePayload } from "../types/workoutWrite.js";

const WORKOUT_BY_DATE_SELECT = `
  SELECT w.id,
    w.date,
    w.exercise_time,
    w.calories,
    w.puls,
    w.puls_max,
    w.intensive,
    w.aero,
    w.anaero,
    w.tl,
    w.rounds,
    w.comment,
    e.weight,
    e.ex_order,
    n.value AS name,
    false AS favorite
  FROM exercise e
  LEFT JOIN workout w ON e.workout_id = w.id
  LEFT JOIN exercise_name n ON e.name = n.id
`;

export async function workoutExistsByDate(
  client: PoolClient,
  date: string,
  excludeWorkoutId?: string,
): Promise<boolean> {
  const params: string[] = [date];
  let query = "SELECT EXISTS(SELECT 1 FROM workout WHERE date = $1";

  if (excludeWorkoutId) {
    params.push(excludeWorkoutId);
    query += " AND id <> $2";
  }

  query += ") AS exists";

  const result = await client.query<{ exists: boolean }>(query, params);
  return result.rows[0]?.exists ?? false;
}

export async function findWorkoutByDate(
  pool: Pool,
  date: string,
): Promise<WorkoutFullRow[]> {
  const result = await pool.query<WorkoutFullRow>(
    `${WORKOUT_BY_DATE_SELECT}
     WHERE w.date = $1
     ORDER BY e.ex_order ASC`,
    [date],
  );

  return result.rows;
}

export async function findWorkoutDateById(
  client: PoolClient,
  workoutId: string,
): Promise<string | null> {
  const result = await client.query<{ date: Date }>(
    "SELECT date FROM workout WHERE id = $1",
    [workoutId],
  );

  const date = result.rows[0]?.date;
  if (!date) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

async function insertExercises(
  client: PoolClient,
  workoutId: string,
  exercises: WorkoutWriteExercise[],
): Promise<void> {
  for (const [index, exercise] of exercises.entries()) {
    const nameId = await upsertExerciseNameId(client, exercise.exercise);
    const order = exercise.order ?? index + 1;

    await client.query(
      `
        INSERT INTO exercise (name, weight, workout_id, ex_order)
        VALUES ($1, $2, $3, $4)
      `,
      [nameId, exercise.weight, workoutId, order],
    );
  }
}

export async function insertWorkout(
  client: PoolClient,
  payload: WorkoutWritePayload,
): Promise<void> {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO workout (
        date,
        exercise_time,
        calories,
        puls,
        puls_max,
        intensive,
        aero,
        anaero,
        tl,
        rounds,
        comment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `,
    [
      payload.date,
      payload.time,
      payload.calories,
      payload.puls,
      payload.maxPuls,
      payload.intensive,
      payload.aero,
      payload.anaero,
      payload.trainingLoad,
      payload.rounds,
      payload.comment,
    ],
  );

  const workoutId = result.rows[0]?.id;
  if (!workoutId) {
    throw new Error(`Failed to insert workout for ${payload.date}`);
  }

  if (payload.exercises.length > 0) {
    await insertExercises(client, workoutId, payload.exercises);
  }
}

export async function updateWorkout(
  client: PoolClient,
  workoutId: string,
  payload: WorkoutWritePayload,
): Promise<void> {
  const result = await client.query(
    `
      UPDATE workout
      SET date = $2,
        exercise_time = $3,
        calories = $4,
        puls = $5,
        puls_max = $6,
        intensive = $7,
        aero = $8,
        anaero = $9,
        tl = $10,
        rounds = $11,
        comment = $12
      WHERE id = $1
    `,
    [
      workoutId,
      payload.date,
      payload.time,
      payload.calories,
      payload.puls,
      payload.maxPuls,
      payload.intensive,
      payload.aero,
      payload.anaero,
      payload.trainingLoad,
      payload.rounds,
      payload.comment,
    ],
  );

  if (result.rowCount === 0) {
    return;
  }

  await client.query(
    "DELETE FROM exercise WHERE workout_id = $1",
    [workoutId],
  );

  if (payload.exercises.length > 0) {
    await insertExercises(client, workoutId, payload.exercises);
  }
}
