import {useCallback, useEffect, useMemo, useState} from 'react';
import {isApiConfigured} from '../config/api';
import {
  fetchFirstWorkoutDate,
  loadMonthWorkouts,
  loadWeekWorkouts,
} from '../api/workouts';
import type {WorkoutData} from '../types/workout';
import {formatMonthValue} from '../utils/monthPeriod';
import {emptyWorkoutData} from '../utils/periodComparison';
import {
  currentWeekPeriodRange,
  endOfIsoWeekSunday,
  formatWeekLabel,
  formatWeekPeriodRange,
  isWeekInRange,
  parseWeekPeriod,
  previousWeekPeriod,
  startOfIsoWeekMonday,
} from '../utils/weekPeriodFormat';

type WeekDashboardState = {
  startOfPeriod: string;
  weekLabel: string;
  weekMonday: Date;
  weekSunday: Date;
  monthAnchor: Date;
  workouts: WorkoutData;
  previousWorkouts: WorkoutData;
  monthWorkouts: WorkoutData;
  firstWorkoutDate: string;
  loading: boolean;
  error: string | null;
  canGoPrevious: boolean;
  canGoNext: boolean;
  shiftWeek: (delta: number) => void;
  refresh: () => void;
};

export function useWeekDashboard(): WeekDashboardState {
  const [startOfPeriod, setStartOfPeriod] = useState(() =>
    currentWeekPeriodRange(),
  );
  const [firstWorkoutDate, setFirstWorkoutDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [workouts, setWorkouts] = useState<WorkoutData>(emptyWorkoutData);
  const [previousWorkouts, setPreviousWorkouts] =
    useState<WorkoutData>(emptyWorkoutData);
  const [monthWorkouts, setMonthWorkouts] =
    useState<WorkoutData>(emptyWorkoutData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    if (!isApiConfigured()) {
      return;
    }

    void fetchFirstWorkoutDate()
      .then(result => setFirstWorkoutDate(result.firstDate))
      .catch(() => {
        // Keep default; week clamp still works with today.
      });
  }, [fetchKey]);

  const weekMonday = useMemo(
    () => parseWeekPeriod(startOfPeriod),
    [startOfPeriod],
  );
  const weekSunday = useMemo(
    () => endOfIsoWeekSunday(weekMonday),
    [weekMonday],
  );
  const weekLabel = useMemo(
    () => formatWeekLabel(weekMonday),
    [weekMonday],
  );
  const monthAnchor = useMemo(
    () => new Date(weekMonday.getFullYear(), weekMonday.getMonth(), 1),
    [weekMonday],
  );

  const canGoPrevious = useMemo(() => {
    const prev = new Date(weekMonday);
    prev.setDate(prev.getDate() - 7);
    return isWeekInRange(prev, firstWorkoutDate);
  }, [weekMonday, firstWorkoutDate]);

  const canGoNext = useMemo(() => {
    const next = new Date(weekMonday);
    next.setDate(next.getDate() + 7);
    return isWeekInRange(next, firstWorkoutDate);
  }, [weekMonday, firstWorkoutDate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (!isApiConfigured()) {
      setLoading(false);
      setError(
        'Set API_BASE_URL in src/config/api.ts to your Vercel deployment URL.',
      );
      return () => {
        cancelled = true;
      };
    }

    const previousPeriod = previousWeekPeriod(startOfPeriod);
    const monthPeriod = formatMonthValue(weekMonday);

    void Promise.all([
      loadWeekWorkouts(startOfPeriod),
      loadWeekWorkouts(previousPeriod).catch(() => emptyWorkoutData()),
      loadMonthWorkouts(monthPeriod).catch(() => emptyWorkoutData()),
    ])
      .then(([current, previous, month]) => {
        if (cancelled) {
          return;
        }
        setWorkouts(current);
        setPreviousWorkouts(previous);
        setMonthWorkouts(month);
      })
      .catch(err => {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Failed to load week data';
        setError(message);
        setWorkouts(emptyWorkoutData());
        setPreviousWorkouts(emptyWorkoutData());
        setMonthWorkouts(emptyWorkoutData());
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [startOfPeriod, fetchKey, weekMonday]);

  const shiftWeek = useCallback(
    (delta: number) => {
      const next = new Date(weekMonday);
      next.setDate(next.getDate() + delta * 7);
      if (!isWeekInRange(next, firstWorkoutDate)) {
        return;
      }
      setStartOfPeriod(formatWeekPeriodRange(startOfIsoWeekMonday(next)));
    },
    [weekMonday, firstWorkoutDate],
  );

  const refresh = useCallback(() => {
    setFetchKey(key => key + 1);
  }, []);

  return {
    startOfPeriod,
    weekLabel,
    weekMonday,
    weekSunday,
    monthAnchor,
    workouts,
    previousWorkouts,
    monthWorkouts,
    firstWorkoutDate,
    loading,
    error,
    canGoPrevious,
    canGoNext,
    shiftWeek,
    refresh,
  };
}
