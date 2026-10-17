import type {WorkoutData} from '../types/workout';

export function parseExerciseTimeToMinutes(exerciseTime: string): number {
  const parts = exerciseTime.split(':').map(part => Number(part));
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  return hours * 60 + minutes;
}

/** API `statistics.exerciseTime` is `HH:MM:00` — show as `hh:mm`. */
export function formatExerciseTimeHhMm(exerciseTime: string): string {
  const parts = exerciseTime.split(':');
  const hours = Number(parts[0] ?? 0);
  const minutes = Number(parts[1] ?? 0);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return '00:00';
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatMinutesAsHhMm(totalMinutes: number): string {
  const abs = Math.abs(Math.round(totalMinutes));
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatTimeDeltaHhMm(
  currentTime: string,
  previousTime: string,
): string {
  const diff =
    parseExerciseTimeToMinutes(currentTime)
    - parseExerciseTimeToMinutes(previousTime);
  const rounded = Math.round(diff);
  if (rounded === 0) {
    return '+00:00';
  }
  const sign = rounded > 0 ? '+' : '-';
  return `${sign}${formatMinutesAsHhMm(rounded)}`;
}

export function formatAvgMinutesPerSession(data: WorkoutData): string {
  if (data.totalElements === 0) {
    return 'No sessions this month';
  }
  const totalMinutes = parseExerciseTimeToMinutes(
    data.statistics.exerciseTime,
  );
  const avgMinutes = Math.round(totalMinutes / data.totalElements);
  return `Avg ~${formatMinutesAsHhMm(avgMinutes)} / session`;
}
