import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useMonthDashboard} from '../hooks/useMonthDashboard';
import {colors} from '../theme';
import {
  buildLoadPercentDelta,
} from '../utils/periodComparison';
import {countWorkingDaysInMonth, parseMonthPeriod} from '../utils/monthPeriod';
import {
  formatAvgMinutesPerSession,
  formatExerciseTimeHhMm,
  formatTimeDeltaHhMm,
} from '../utils/statisticsDisplay';
import {DumbbellIcon, StopwatchIcon} from './DashboardIcons';
import StatCard from './StatCard';

export default function MonthlyDashboardHeader(): React.JSX.Element {
  const {
    startOfPeriod,
    monthLabel,
    workouts,
    previousWorkouts,
    loading,
    error,
    canGoPrevious,
    canGoNext,
    shiftMonth,
  } = useMonthDashboard();

  const workingDaysInMonth = useMemo(
    () => countWorkingDaysInMonth(parseMonthPeriod(startOfPeriod)),
    [startOfPeriod],
  );

  const workoutDelta = useMemo(() => {
    const pct = buildLoadPercentDelta(workouts, previousWorkouts);
    return `↑ ${pct}`;
  }, [workouts, previousWorkouts]);

  const timeDelta = useMemo(() => {
    const delta = formatTimeDeltaHhMm(
      workouts.statistics.exerciseTime,
      previousWorkouts.statistics.exerciseTime,
    );
    return `↑ ${delta}`;
  }, [workouts, previousWorkouts]);

  const workoutValue = loading ? '—' : String(workouts.totalElements);
  const timeValue = loading
    ? '—'
    : formatExerciseTimeHhMm(workouts.statistics.exerciseTime);

  return (
    <View style={styles.wrap}>
      <View style={styles.monthNav}>
        <Pressable
          accessibilityLabel="Previous month"
          disabled={!canGoPrevious || loading}
          onPress={() => shiftMonth(-1)}
          style={({pressed}) => [
            styles.navBtn,
            (!canGoPrevious || loading) && styles.navBtnDisabled,
            pressed && canGoPrevious && styles.navBtnPressed,
          ]}>
          <Text style={styles.navChevron}>‹</Text>
        </Pressable>
        <View style={styles.monthCenter}>
          <Text style={styles.monthTitle}>{monthLabel}</Text>
          <Text style={styles.monthSubtitle}>
            {workingDaysInMonth} working day
            {workingDaysInMonth === 1 ? '' : 's'} in month
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Next month"
          disabled={!canGoNext || loading}
          onPress={() => shiftMonth(1)}
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
          footer="Goal: 24 / month"
          icon={<DumbbellIcon />}
          iconTint={colors.accentGreenDim}
        />
        <View style={styles.statsGap} />
        <StatCard
          title="Total Time"
          value={timeValue}
          delta={loading ? '—' : timeDelta}
          deltaColor={colors.accentBlue}
          footer={loading ? '' : formatAvgMinutesPerSession(workouts)}
          icon={<StopwatchIcon />}
          iconTint={colors.accentBlueDim}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  monthNav: {
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
  monthCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  monthTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  monthSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statsGap: {
    width: 12,
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
