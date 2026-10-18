import React, {useCallback} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FavoriteWorkoutCard from '../components/FavoriteWorkoutCard';
import {useFavorites} from '../hooks/useFavorites';
import {colors} from '../theme';
import type {WorkoutType} from '../types/workout';

function workoutKey(workout: WorkoutType, index: number): string {
  if (workout.id != null) {
    return String(workout.id);
  }
  return `favorite-${index}`;
}

export default function FavoritesScreen(): React.JSX.Element {
  const {workouts, loading, error, refresh} = useFavorites();

  const renderItem = useCallback(
    ({item}: {item: WorkoutType}) => <FavoriteWorkoutCard workout={item} />,
    [],
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={workouts}
      keyExtractor={workoutKey}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl
          refreshing={loading && workouts.length > 0}
          onRefresh={refresh}
          tintColor={colors.accentBlue}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.subtitle}>
            {loading ? 'Loading saved workouts' : `${workouts.length} saved workout${workouts.length === 1 ? '' : 's'}`}
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator color={colors.accentBlue} style={styles.spinner} />
        ) : (
          <Text style={styles.empty}>No favorite workouts yet.</Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  error: {
    color: '#f87171',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
  separator: {
    height: 12,
  },
  spinner: {
    marginTop: 24,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 15,
  },
});
