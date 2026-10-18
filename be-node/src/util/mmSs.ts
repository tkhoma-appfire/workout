/** Workout clock time `hh:mm` (24h, minutes 00–59). */
export function isValidWorkoutTimeHhMm(value: string): boolean {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return false;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return (
    hours >= 0
    && hours <= 23
    && minutes >= 0
    && minutes < 60
    && (hours > 0 || minutes > 0)
  );
}

export function normalizeWorkoutTime(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return isValidWorkoutTimeHhMm(trimmed) ? trimmed : null;
}

/** Nearest 5-minute clock mark, e.g. 16:07 → 16:05, 16:08 → 16:10. */
export function roundWorkoutTimeToFiveMinutes(value: string): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    throw new Error("Invalid workoutTime");
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const totalMinutes = hours * 60 + minutes;
  const rounded = Math.min(
    Math.round(totalMinutes / 5) * 5,
    23 * 60 + 55,
  );
  const roundedHours = Math.floor(rounded / 60);
  const roundedMinutes = rounded % 60;

  return `${roundedHours}:${String(roundedMinutes).padStart(2, "0")}`;
}
