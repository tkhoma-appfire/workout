import type { Pool } from "pg";
import { WorkoutExistsError, WorkoutNotFoundError } from "../errors/workoutErrors.js";
import { toSingleWorkoutModels } from "../mappers/singleWorkoutMapper.js";
import {
  findWorkoutByDate,
  findWorkoutDateById,
  insertWorkout,
  updateWorkout,
  workoutExistsByDate,
} from "../repositories/workoutWriteRepository.js";
import type { SingleWorkoutModel } from "../types/workout.js";
import type { WorkoutWritePayload } from "../types/workoutWrite.js";
import {
  normalizeWorkoutTime,
  roundWorkoutTimeToFiveMinutes,
} from "../util/mmSs.js";

function assertValidWorkoutTime(payload: WorkoutWritePayload): void {
  if (!normalizeWorkoutTime(payload.workoutTime)) {
    throw new Error("Invalid workoutTime: expected hh:mm");
  }
}

function applyWorkoutTimeRoundingOnCreate(payload: WorkoutWritePayload): void {
  assertValidWorkoutTime(payload);
  payload.workoutTime = roundWorkoutTimeToFiveMinutes(payload.workoutTime);
}

export async function addWorkout(pool: Pool, payload: WorkoutWritePayload): Promise<void> {
  applyWorkoutTimeRoundingOnCreate(payload);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (await workoutExistsByDate(client, payload.date)) {
      throw new WorkoutExistsError(payload.date);
    }

    await insertWorkout(client, payload);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function editWorkout(pool: Pool, payload: WorkoutWritePayload): Promise<void> {
  assertValidWorkoutTime(payload);
  if (!payload.id) {
    throw new WorkoutNotFoundError();
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentDate = await findWorkoutDateById(client, payload.id);
    if (!currentDate) {
      throw new WorkoutNotFoundError();
    }

    if (
      currentDate !== payload.date
      && await workoutExistsByDate(client, payload.date, payload.id)
    ) {
      throw new WorkoutExistsError(payload.date);
    }

    await updateWorkout(client, payload.id, payload);

    const updated = await findWorkoutDateById(client, payload.id);
    if (!updated) {
      throw new WorkoutNotFoundError();
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getWorkoutTemplate(
  pool: Pool,
  date: string,
): Promise<SingleWorkoutModel> {
  const rows = await findWorkoutByDate(pool, date);
  if (rows.length === 0 || !rows[0]?.id) {
    throw new WorkoutNotFoundError();
  }

  const models = toSingleWorkoutModels(rows);
  const workout = models[0];
  if (!workout) {
    throw new WorkoutNotFoundError();
  }

  return workout;
}
