import type {WorkoutType} from '../types/workout';
import {workoutDayIso} from './streak';

export type HeatmapIntensity = 'rest' | 'light' | 'moderate' | 'heavy';

export type HeatmapDay = {
  day: number;
  iso: string;
  intensity: HeatmapIntensity;
  trainingLoad: number;
};

function loadForWorkout(workout: WorkoutType): number {
  const load = Number(workout.trainingLoad);
  return Number.isFinite(load) && load > 0 ? load : 0;
}

export function aggregateDailyLoad(
  workouts: WorkoutType[],
  monthAnchor: Date,
): Map<string, number> {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const byDay = new Map<string, number>();

  for (const workout of workouts) {
    const iso = workoutDayIso(workout);
    if (!iso) {
      continue;
    }
    const parsed = new Date(`${iso}T12:00:00`);
    if (
      parsed.getFullYear() !== year
      || parsed.getMonth() !== month
    ) {
      continue;
    }
    const load = loadForWorkout(workout);
    if (load <= 0) {
      continue;
    }
    byDay.set(iso, (byDay.get(iso) ?? 0) + load);
  }

  return byDay;
}

function classifyLoad(
  load: number,
  thresholds: {light: number; moderate: number; heavy: number},
): HeatmapIntensity {
  if (load <= 0) {
    return 'rest';
  }
  if (load < thresholds.light) {
    return 'light';
  }
  if (load < thresholds.moderate) {
    return 'moderate';
  }
  return 'heavy';
}

export function buildMonthHeatmap(
  workouts: WorkoutType[],
  monthAnchor: Date,
): HeatmapDay[] {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyLoad = aggregateDailyLoad(workouts, monthAnchor);
  const loads = Array.from(dailyLoad.values()).sort((a, b) => a - b);

  const light =
    loads.length > 0
      ? loads[Math.floor(loads.length * 0.33)] ?? loads[0]
      : 20;
  const moderate =
    loads.length > 0
      ? loads[Math.floor(loads.length * 0.66)] ?? loads[loads.length - 1]
      : 35;
  const heavy = loads.length > 0 ? loads[loads.length - 1] : 50;

  const lightThreshold = Math.max(light, 1);
  const moderateThreshold = Math.max(moderate, lightThreshold + 1);
  const thresholds = {
    light: lightThreshold,
    moderate: moderateThreshold,
    heavy: Math.max(heavy, moderateThreshold),
  };

  const days: HeatmapDay[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const trainingLoad = dailyLoad.get(iso) ?? 0;
    days.push({
      day,
      iso,
      trainingLoad,
      intensity: classifyLoad(trainingLoad, thresholds),
    });
  }

  return days;
}

/** Monday-first column index (0–6) for the 1st of the month. */
export function mondayOffsetForMonth(monthAnchor: Date): number {
  const first = new Date(
    monthAnchor.getFullYear(),
    monthAnchor.getMonth(),
    1,
  );
  const sundayBased = first.getDay();
  return sundayBased === 0 ? 6 : sundayBased - 1;
}
