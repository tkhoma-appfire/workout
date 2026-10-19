import React, {type ReactNode} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {WorkoutData, WorkoutType} from '../types/workout';
import {colors} from '../theme';
import {buildLoadPercentDelta} from '../utils/periodComparison';
import {
  formatAvgCaloriesPerSession,
  formatAvgMinutesPerSession,
  formatExerciseTimeHhMm,
  formatGroupedNumber,
  formatTimeDeltaHhMm,
} from '../utils/statisticsDisplay';
import type {StreakPresentation} from '../utils/streakPresentation';
import {
  DumbbellIcon,
  FlameIcon,
  StopwatchIcon,
  StreakIcon,
  type StreakIconVariant,
} from './DashboardIcons';
import MonthlyConsistencyHeatmap from './MonthlyConsistencyHeatmap';
import StatCard from './StatCard';

type PeriodOverviewProps = {
  title: string;
  subtitle: string;
  previousAccessibilityLabel: string;
  nextAccessibilityLabel: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onShift: (delta: number) => void;
  loading: boolean;
  error: string | null;
  workouts: WorkoutData;
  previousWorkouts: WorkoutData;
  periodNoun: string;
  workoutGoalFooter: string;
  streakCardTitle: string;
  streakValue: string;
  streakPresentation: StreakPresentation;
  heatmapWorkouts: WorkoutType[];
  monthAnchor: Date;
};

export default function PeriodOverview({
  title,
  subtitle,
  previousAccessibilityLabel,
  nextAccessibilityLabel,
  canGoPrevious,
  canGoNext,
  onShift,
  loading,
  error,
  workouts,
  previousWorkouts,
  periodNoun,
  workoutGoalFooter,
  streakCardTitle,
  streakValue,
  streakPresentation,
  heatmapWorkouts,
  monthAnchor,
}: PeriodOverviewProps): React.JSX.Element {
  const workoutDelta = `↑ ${buildLoadPercentDelta(workouts, previousWorkouts)}`;
  const timeDelta = `↑ ${formatTimeDeltaHhMm(
    workouts.statistics.exerciseTime,
    previousWorkouts.statistics.exerciseTime,
  )}`;
  const workoutValue = loading ? '—' : String(workouts.totalElements);
  const timeValue = loading
    ? '—'
    : formatExerciseTimeHhMm(workouts.statistics.exerciseTime);
  const burnAmount = loading
    ? '—'
    : formatGroupedNumber(workouts.statistics.calories);

  const streakBadge: ReactNode =
    !loading && streakPresentation.badgeLabel ? (
      <View style={styles.bestBadge}>
        <Text style={styles.bestFlame}>🔥</Text>
        <Text style={styles.bestLabel}>{streakPresentation.badgeLabel}</Text>
      </View>
    ) : undefined;

  const streakIconVariant: StreakIconVariant = loading
    ? 'idle'
    : streakPresentation.iconVariant;

  return (
    <View style={styles.wrap}>
      <View style={styles.periodNav}>
        <Pressable
          accessibilityLabel={previousAccessibilityLabel}
          disabled={!canGoPrevious || loading}
          onPress={() => onShift(-1)}
          style={({pressed}) => [
            styles.navBtn,
            (!canGoPrevious || loading) && styles.navBtnDisabled,
            pressed && canGoPrevious && styles.navBtnPressed,
          ]}>
          <Text style={styles.navChevron}>‹</Text>
        </Pressable>
        <View style={styles.periodCenter}>
          <Text style={styles.periodTitle}>{title}</Text>
          <Text style={styles.periodSubtitle}>{subtitle}</Text>
        </View>
        <Pressable
          accessibilityLabel={nextAccessibilityLabel}
          disabled={!canGoNext || loading}
          onPress={() => onShift(1)}
          style={({pressed}) => [
            styles.navBtn,
            (!canGoNext || loading) && styles.navBtnDisabled,
            pressed && canGoNext && styles.navBtnPressed,
          ]}>
          <Text style={styles.navChevron}>›</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.accentBlue} style={styles.spinner} />
      ) : null}

      <View style={styles.statsRow}>
        <StatCard
          title="Total Workouts"
          value={workoutValue}
          delta={loading ? '—' : workoutDelta}
          deltaColor={colors.accentGreen}
          footer={workoutGoalFooter}
          icon={<DumbbellIcon />}
          iconTint={colors.accentGreenDim}
        />
        <View style={styles.statsGap} />
        <StatCard
          title="Total Time"
          value={timeValue}
          delta={loading ? '—' : timeDelta}
          deltaColor={colors.accentBlue}
          footer={loading ? '' : formatAvgMinutesPerSession(workouts, periodNoun)}
          icon={<StopwatchIcon />}
          iconTint={colors.accentBlueDim}
        />
      </View>

      <View style={[styles.statsRow, styles.statsRowSecond]}>
        <StatCard
          title="Active Burn"
          value={burnAmount}
          valueSuffix={loading ? undefined : 'kcal'}
          footer={loading ? '' : formatAvgCaloriesPerSession(workouts, periodNoun)}
          icon={<FlameIcon />}
          iconTint={colors.accentOrangeDim}
        />
        <View style={styles.statsGap} />
        <StatCard
          title={streakCardTitle}
          value={streakValue}
          badge={streakBadge}
          footer={loading ? '' : streakPresentation.footer}
          icon={<StreakIcon variant={streakIconVariant} />}
          iconTint={colors.accentPurpleDim}
        />
      </View>

      <MonthlyConsistencyHeatmap
        workouts={heatmapWorkouts}
        monthAnchor={monthAnchor}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.navButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navBtnPressed: {
    opacity: 0.75,
  },
  navChevron: {
    color: colors.textMuted,
    fontSize: 28,
    lineHeight: 30,
    marginTop: -2,
  },
  periodCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  periodTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  periodSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statsRowSecond: {
    marginTop: 12,
  },
  statsGap: {
    width: 12,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bestFlame: {
    fontSize: 14,
  },
  bestLabel: {
    color: colors.accentPurple,
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    color: '#f87171',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  spinner: {
    marginBottom: 12,
  },
});
