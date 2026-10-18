export function isValidMmSs(value: string): boolean {
  const match = value.trim().match(/^(\d+):(\d{2})$/);
  if (!match) {
    return false;
  }

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return seconds >= 0 && seconds < 60 && (minutes > 0 || seconds > 0);
}

export function normalizeWorkoutTime(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return isValidMmSs(trimmed) ? trimmed : null;
}

const FIVE_MINUTES_SECONDS = 5 * 60;

/** Nearest 5-minute mark (seconds always :00), e.g. 17:03 → 15:00, 18:02 → 20:00. */
export function roundWorkoutTimeToFiveMinutes(value: string): string {
  const match = value.trim().match(/^(\d+):(\d{2})$/);
  if (!match) {
    throw new Error("Invalid workoutTime");
  }

  const totalSeconds = Number(match[1]) * 60 + Number(match[2]);
  let roundedSeconds = Math.round(totalSeconds / FIVE_MINUTES_SECONDS)
    * FIVE_MINUTES_SECONDS;

  if (roundedSeconds === 0 && totalSeconds > 0) {
    roundedSeconds = FIVE_MINUTES_SECONDS;
  }

  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
