import type {WorkoutType} from '../types/workout';

export function workoutDayIso(workout: WorkoutType): string {
  const raw = String(workout.date ?? '');
  return raw.length >= 10 ? raw.slice(0, 10) : raw;
}

export function uniqueSortedWorkoutDays(workouts: WorkoutType[]): string[] {
  const days = new Set<string>();
  for (const workout of workouts) {
    const day = workoutDayIso(workout);
    if (day) {
      days.add(day);
    }
  }
  return Array.from(days).sort();
}

function addDays(iso: string, delta: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + delta);
  return date.toISOString().slice(0, 10);
}

function daysBetween(startIso: string, endIso: string): number {
  const start = new Date(`${startIso}T12:00:00`).getTime();
  const end = new Date(`${endIso}T12:00:00`).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function longestConsecutiveStreak(sortedDays: string[]): number {
  if (sortedDays.length === 0) {
    return 0;
  }

  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i] === addDays(sortedDays[i - 1], 1)) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

/** Consecutive training days ending on the latest workout day (still active if ≤1 day gap to today). */
export function currentActiveStreak(
  sortedDays: string[],
  todayIso: string,
): number {
  const set = new Set(sortedDays);
  const pastOrToday = sortedDays.filter(day => day <= todayIso);
  if (pastOrToday.length === 0) {
    return 0;
  }

  const end = pastOrToday[pastOrToday.length - 1];
  if (daysBetween(end, todayIso) > 1) {
    return 0;
  }

  let count = 0;
  let cursor = end;
  while (set.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export type StreakSummary = {
  current: number;
  best: number;
  isPersonalRecord: boolean;
};

function isIsoDateInMonth(iso: string, year: number, month: number): boolean {
  const parsed = new Date(`${iso}T12:00:00`);
  return (
    !Number.isNaN(parsed.getTime())
    && parsed.getFullYear() === year
    && parsed.getMonth() === month
  );
}

export function activeDaysInCalendarMonth(
  workouts: WorkoutType[],
  monthAnchor: Date,
): number {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const days = uniqueSortedWorkoutDays(workouts).filter(day =>
    isIsoDateInMonth(day, year, month),
  );
  return days.length;
}

export type StreakDateRange = {
  start: string;
  end: string;
  length: number;
};

function daysInCalendarMonth(
  workouts: WorkoutType[],
  monthAnchor: Date,
): string[] {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  return uniqueSortedWorkoutDays(workouts).filter(day =>
    isIsoDateInMonth(day, year, month),
  );
}

/** Longest consecutive run inside the month; ties pick the latest run in the month. */
export function longestStreakRangeInCalendarMonth(
  workouts: WorkoutType[],
  monthAnchor: Date,
): StreakDateRange | null {
  const days = daysInCalendarMonth(workouts, monthAnchor);
  if (days.length === 0) {
    return null;
  }

  let best: StreakDateRange = {
    start: days[0],
    end: days[0],
    length: 1,
  };
  let runStart = days[0];
  let runEnd = days[0];
  let runLen = 1;

  const considerRun = () => {
    if (
      runLen > best.length
      || (runLen === best.length && runEnd > best.end)
    ) {
      best = {start: runStart, end: runEnd, length: runLen};
    }
  };

  for (let i = 1; i < days.length; i++) {
    if (days[i] === addDays(days[i - 1], 1)) {
      runEnd = days[i];
      runLen++;
    } else {
      considerRun();
      runStart = days[i];
      runEnd = days[i];
      runLen = 1;
    }
  }
  considerRun();

  return best.length > 0 ? best : null;
}

export function formatStreakDateRange(startIso: string, endIso: string): string {
  const formatDay = (iso: string) =>
    new Intl.DateTimeFormat('en', {month: 'short', day: 'numeric'}).format(
      new Date(`${iso}T12:00:00`),
    );
  const start = formatDay(startIso);
  const end = formatDay(endIso);
  if (startIso === endIso) {
    return start;
  }
  return `${start} – ${end}`;
}

/** Longest consecutive workout days that all fall inside the given calendar month. */
export function longestStreakInCalendarMonth(
  workouts: WorkoutType[],
  monthAnchor: Date,
): number {
  return longestStreakRangeInCalendarMonth(workouts, monthAnchor)?.length ?? 0;
}

export function summarizeStreak(
  workouts: WorkoutType[],
  todayIso = new Date().toISOString().slice(0, 10),
): StreakSummary {
  const days = uniqueSortedWorkoutDays(workouts);
  const current = currentActiveStreak(days, todayIso);
  const best = longestConsecutiveStreak(days);
  return {
    current,
    best,
    isPersonalRecord: current > 0 && current >= best,
  };
}
