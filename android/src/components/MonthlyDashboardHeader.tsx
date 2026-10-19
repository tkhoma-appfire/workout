import React, {useMemo} from 'react';
import {useMonthDashboard} from '../hooks/useMonthDashboard';
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
import PeriodOverview from './PeriodOverview';

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

  const streakCardTitle = isCurrentMonth ? 'Active Streak' : 'Month Streak';
  const streakDayCount = isCurrentMonth
    ? streakSummary.current
    : longestMonthStreak;
  const streakValue = loading
    ? '—'
    : `${streakDayCount} Day${streakDayCount === 1 ? '' : 's'}`;

  return (
    <PeriodOverview
      title={monthLabel}
      subtitle={`${workingDaysInMonth} working day${workingDaysInMonth === 1 ? '' : 's'} in month`}
      previousAccessibilityLabel="Previous month"
      nextAccessibilityLabel="Next month"
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
      onShift={shiftMonth}
      loading={loading}
      error={error}
      workouts={workouts}
      previousWorkouts={previousWorkouts}
      periodNoun="month"
      workoutGoalFooter="Goal: 24 / month"
      streakCardTitle={streakCardTitle}
      streakValue={streakValue}
      streakPresentation={streakPresentation}
      heatmapWorkouts={workouts.content}
      monthAnchor={monthAnchor}
    />
  );
}
