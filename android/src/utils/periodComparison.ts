import type {WorkoutData, WorkoutType} from '../types/workout';

export const emptyWorkoutData = (): WorkoutData => ({
  content: [],
  statistics: {
    exerciseTime: '00:00:00',
    calories: 0,
  },
  totalElements: 0,
});

export function totalTrainingLoad(workouts: WorkoutType[]): number {
  return workouts.reduce((sum, workout) => {
    const load = Number(workout.trainingLoad);
    return sum + (Number.isFinite(load) ? load : 0);
  }, 0);
}

export function formatPercentComparisonLabel(
  current: number,
  previous: number,
): string {
  if (current === 0 && previous === 0) {
    return '0%';
  }
  if (previous === 0) {
    return '+100%';
  }
  if (current === 0) {
    return '-100%';
  }

  const percentChange = ((current - previous) / previous) * 100;
  const rounded = Math.round(percentChange);
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded}%`;
}

export function buildLoadPercentDelta(
  current: WorkoutData,
  previous: WorkoutData,
): string {
  const currentLoad = totalTrainingLoad(current.content);
  const previousLoad = totalTrainingLoad(previous.content);

  if (currentLoad > 0 || previousLoad > 0) {
    return formatPercentComparisonLabel(currentLoad, previousLoad);
  }

  return formatPercentComparisonLabel(
    current.statistics.calories,
    previous.statistics.calories,
  );
}
