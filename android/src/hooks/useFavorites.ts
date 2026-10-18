import {useCallback, useEffect, useState} from 'react';
import {fetchFavorites} from '../api/workouts';
import {isApiConfigured} from '../config/api';
import type {WorkoutType} from '../types/workout';

type FavoritesState = {
  workouts: WorkoutType[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useFavorites(): FavoritesState {
  const [workouts, setWorkouts] = useState<WorkoutType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

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

    void fetchFavorites()
      .then(result => {
        if (cancelled) {
          return;
        }
        setWorkouts(Array.isArray(result) ? result : []);
      })
      .catch(err => {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Failed to load favorite workouts';
        setError(message);
        setWorkouts([]);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const refresh = useCallback(() => {
    setFetchKey(key => key + 1);
  }, []);

  return {workouts, loading, error, refresh};
}
