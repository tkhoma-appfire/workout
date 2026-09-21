import type { Pool, PoolClient } from "pg";

type ExerciseNameRow = {
  id: string;
  value: string;
};

export async function findAllExerciseNames(pool: Pool): Promise<ExerciseNameRow[]> {
  const result = await pool.query<ExerciseNameRow>(
    "SELECT id, value FROM exercise_name",
  );

  return result.rows;
}

export async function upsertExerciseNameId(
  client: PoolClient,
  value: string,
): Promise<string> {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO exercise_name (value)
      VALUES ($1)
      ON CONFLICT (value)
      DO UPDATE SET value = EXCLUDED.value
      RETURNING id
    `,
    [value],
  );

  const id = result.rows[0]?.id;
  if (!id) {
    throw new Error(`Failed to upsert exercise name: ${value}`);
  }

  return id;
}
