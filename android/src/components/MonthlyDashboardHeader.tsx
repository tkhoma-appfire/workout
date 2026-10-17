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
import {
  countWorkingDaysInMonth,
  formatMonthNameOnly,
  isSelectedMonthCurrent,
  parseMonthPeriod,
} from '../utils/monthPeriod';
import {
  getMonthStreakPresentation,
  getStreakPresentation,
} from '../utils/streakPresentation';
import {
  longestStreakInCalendarMonth,
  longestStreakRangeInCalendarMonth,
  summarizeStreak,
} from '../utils/streak';
import {
  formatAvgCaloriesPerSession,
  formatAvgMinutesPerSession,
  formatExerciseTimeHhMm,
  formatGroupedNumber,
  formatTimeDeltaHhMm,
} from '../utils/statisticsDisplay';
import {
  DumbbellIcon,
  FlameIcon,
  StopwatchIcon,
  StreakIcon,
  type StreakIconVariant,
} from './DashboardIcons';
import MonthlyConsistencyHeatmap from './MonthlyConsistencyHeatmap';
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

  const burnAmount = loading
    ? '—'
    : formatGroupedNumber(workouts.statistics.calories);

  const monthAnchor = useMemo(
    () => parseMonthPeriod(startOfPeriod),
    [startOfPeriod],
  );
  const isCurrentMonth = useMemo(
    () => isSelectedMonthCurrent(startOfPeriod),
    [startOfPeriod],
  );
  const monthNameOnly = useMemo(
    () => formatMonthNameOnly(monthAnchor),
    [monthAnchor],
  );

  const activeStreakWorkouts = useMemo(() => {
    if (!isCurrentMonth) {
      return [];
    }
    return [...previousWorkouts.content, ...workouts.content];
  }, [isCurrentMonth, previousWorkouts.content, workouts.content]);

  const streakSummary = useMemo(
    () => summarizeStreak(activeStreakWorkouts),
    [activeStreakWorkouts],
  );

  const longestMonthStreak = useMemo(
    () => longestStreakInCalendarMonth(workouts.content, monthAnchor),
    [workouts.content, monthAnchor],
  );

  const monthStreakRange = useMemo(
    () => longestStreakRangeInCalendarMonth(workouts.content, monthAnchor),
    [workouts.content, monthAnchor],
  );

  const streakPresentation = useMemo(() => {
    if (isCurrentMonth) {
      return getStreakPresentation(streakSummary);
    }
    return getMonthStreakPresentation(monthStreakRange, monthNameOnly);
  }, [isCurrentMonth, streakSummary, monthStreakRange, monthNameOnly]);

  const streakCardTitle = isCurrentMonth
    ? 'Active Streak'
    : 'Month Streak';

  const streakDayCount = isCurrentMonth
    ? streakSummary.current
    : longestMonthStreak;

  const streakValue = loading
    ? '—'
    : `${streakDayCount} Day${streakDayCount === 1 ? '' : 's'}`;

  const streakBadge =
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

      <View style={[styles.statsRow, styles.statsRowSecond]}>
        <StatCard
          title="Active Burn"
          value={burnAmount}
          valueSuffix={loading ? undefined : 'kcal'}
          footer={loading ? '' : formatAvgCaloriesPerSession(workouts)}
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
        workouts={workouts.content}
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
