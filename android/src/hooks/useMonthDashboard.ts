import {useCallback, useEffect, useMemo, useState} from 'react';
import {isApiConfigured} from '../config/api';
import {fetchFirstWorkoutDate, loadMonthWorkouts} from '../api/workouts';
import type {WorkoutData} from '../types/workout';
import {
  formatMonthLabel,
  formatMonthValue,
  isMonthInRange,
  monthStart,
  parseMonthPeriod,
  previousMonthPeriod,
} from '../utils/monthPeriod';
import {emptyWorkoutData} from '../utils/periodComparison';

type MonthDashboardState = {
  startOfPeriod: string;
  monthLabel: string;
  workouts: WorkoutData;
  previousWorkouts: WorkoutData;
  firstWorkoutDate: string;
  loading: boolean;
  error: string | null;
  canGoPrevious: boolean;
  canGoNext: boolean;
  shiftMonth: (delta: number) => void;
  refresh: () => void;
};

export function useMonthDashboard(): MonthDashboardState {
  const [startOfPeriod, setStartOfPeriod] = useState(() =>
    formatMonthValue(new Date()),
  );
  const [firstWorkoutDate, setFirstWorkoutDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [workouts, setWorkouts] = useState<WorkoutData>(emptyWorkoutData);
  const [previousWorkouts, setPreviousWorkouts] =
    useState<WorkoutData>(emptyWorkoutData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    void fetchFirstWorkoutDate()
      .then(result => setFirstWorkoutDate(result.firstDate))
      .catch(() => {
        // Keep default; month clamp still works with today.
      });
  }, []);

  const monthAnchor = useMemo(
    () => parseMonthPeriod(startOfPeriod),
    [startOfPeriod],
  );

  const monthLabel = useMemo(
    () => formatMonthLabel(monthAnchor),
    [monthAnchor],
  );

  const canGoPrevious = useMemo(() => {
    const prev = new Date(monthAnchor);
    prev.setMonth(prev.getMonth() - 1);
    return isMonthInRange(prev, firstWorkoutDate);
  }, [monthAnchor, firstWorkoutDate]);

  const canGoNext = useMemo(() => {
    const next = new Date(monthAnchor);
    next.setMonth(next.getMonth() + 1);
    return isMonthInRange(next, firstWorkoutDate);
  }, [monthAnchor, firstWorkoutDate]);

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

    const previousPeriod = previousMonthPeriod(startOfPeriod);

    void Promise.all([
      loadMonthWorkouts(startOfPeriod),
      loadMonthWorkouts(previousPeriod).catch(() => emptyWorkoutData()),
    ])
      .then(([current, previous]) => {
        if (cancelled) {
          return;
        }
        setWorkouts(current);
        setPreviousWorkouts(previous);
      })
      .catch(err => {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Failed to load month data';
        setError(message);
        setWorkouts(emptyWorkoutData());
        setPreviousWorkouts(emptyWorkoutData());
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [startOfPeriod, fetchKey]);

  const shiftMonth = useCallback(
    (delta: number) => {
      const next = new Date(monthAnchor);
      next.setMonth(next.getMonth() + delta);
      if (!isMonthInRange(next, firstWorkoutDate)) {
        return;
      }
      setStartOfPeriod(formatMonthValue(monthStart(next)));
    },
    [monthAnchor, firstWorkoutDate],
  );

  const refresh = useCallback(() => {
    setFetchKey(key => key + 1);
  }, []);

  return {
    startOfPeriod,
    monthLabel,
    workouts,
    previousWorkouts,
    firstWorkoutDate,
    loading,
    error,
    canGoPrevious,
    canGoNext,
    shiftMonth,
    refresh,
  };
}
