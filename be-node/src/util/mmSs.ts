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
