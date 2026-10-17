import type {WorkoutData, WorkoutType} from '../types/workout';

export function parseExerciseTimeToMinutes(exerciseTime: string): number {
  const parts = exerciseTime.split(':').map(part => Number(part));
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  return hours * 60 + minutes;
}

export function formatExerciseTimeHours(exerciseTime: string): string {
  const totalMinutes = parseExerciseTimeToMinutes(exerciseTime);
  const hours = totalMinutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded}h`;
}

export function formatTimeHoursDelta(
  currentTime: string,
  previousTime: string,
): string {
  const currentHours =
    parseExerciseTimeToMinutes(currentTime) / 60;
  const previousHours =
    parseExerciseTimeToMinutes(previousTime) / 60;
  const diff = Math.round((currentHours - previousHours) * 10) / 10;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff}h`;
}

export function countActiveTrainingDays(workouts: WorkoutType[]): number {
  const days = new Set<string>();
  for (const workout of workouts) {
    const raw = String(workout.date ?? '');
    const day = raw.length >= 10 ? raw.slice(0, 10) : raw;
    if (day) {
      days.add(day);
    }
  }
  return days.size;
}

export function formatAvgMinutesPerSession(data: WorkoutData): string {
  if (data.totalElements === 0) {
    return 'No sessions this month';
  }
  const totalMinutes = parseExerciseTimeToMinutes(
    data.statistics.exerciseTime,
  );
  const avg = Math.round(totalMinutes / data.totalElements);
  return `Avg ~${avg} min / session`;
}
