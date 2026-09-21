import type { PoolClient } from "pg";

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
