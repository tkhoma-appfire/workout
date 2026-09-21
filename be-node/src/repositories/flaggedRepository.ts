import type { Pool } from "pg";

export async function findAllFlaggedDays(pool: Pool): Promise<string[]> {
  const result = await pool.query<{ day: string }>(
    "SELECT day FROM flagged ORDER BY day ASC",
  );

  return result.rows.map((row) => row.day);
}

export async function insertFlaggedDay(pool: Pool, day: string): Promise<void> {
  await pool.query(
    "INSERT INTO flagged (day) VALUES ($1)",
    [day],
  );
}

export async function deleteFlaggedDay(pool: Pool, day: string): Promise<void> {
  await pool.query(
    "DELETE FROM flagged WHERE day = $1",
    [day],
  );
}
