import type {FirstWorkoutDateResponse, WorkoutData} from '../types/workout';
import {apiUrl} from './http';

export async function fetchFirstWorkoutDate(): Promise<FirstWorkoutDateResponse> {
  const response = await fetch(apiUrl('/api/first_workout_date'), {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  });

  if (!response.ok) {
    throw new Error('Failed to fetch first workout date');
  }

  return response.json() as Promise<FirstWorkoutDateResponse>;
}

export async function loadMonthWorkouts(
  startOfPeriod: string,
): Promise<WorkoutData> {
  const response = await fetch(apiUrl('/api/workouts'), {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      timePeriod: 'MONTH',
      startOfPeriod,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to load workouts for this month');
  }

  return response.json() as Promise<WorkoutData>;
}

export async function loadWeekWorkouts(
  startOfPeriod: string,
): Promise<WorkoutData> {
  const response = await fetch(apiUrl('/api/workouts'), {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      timePeriod: 'WEEK',
      startOfPeriod,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to load workouts for this week');
  }

  return response.json() as Promise<WorkoutData>;
}
