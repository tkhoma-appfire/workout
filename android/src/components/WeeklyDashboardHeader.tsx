import React, {useMemo} from 'react';
import {useWeekDashboard} from '../hooks/useWeekDashboard';
import {countWorkingDaysInWeek, isSelectedWeekCurrent} from '../utils/weekPeriodFormat';
import {
  getRangeStreakPresentation,
  getStreakPresentation,
} from '../utils/streakPresentation';
import {
  longestStreakInDateSpan,
  longestStreakRangeInDateSpan,
  summarizeStreak,
} from '../utils/streak';
import PeriodOverview from './PeriodOverview';

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function WeeklyDashboardHeader(): React.JSX.Element {
  const {
    startOfPeriod,
    weekLabel,
    weekMonday,
    weekSunday,
    monthAnchor,
    workouts,
    previousWorkouts,
    monthWorkouts,
    loading,
    error,
    canGoPrevious,
    canGoNext,
    shiftWeek,
  } = useWeekDashboard();

  const workingDaysInWeek = countWorkingDaysInWeek();
  const isCurrentWeek = isSelectedWeekCurrent(startOfPeriod);
  const weekStartIso = toIsoDate(weekMonday);
  const weekEndIso = toIsoDate(weekSunday);

  const activeStreakWorkouts = useMemo(() => {
    if (!isCurrentWeek) {
      return [];
    }
    return [...previousWorkouts.content, ...workouts.content];
  }, [isCurrentWeek, previousWorkouts.content, workouts.content]);

  const streakSummary = useMemo(
    () => summarizeStreak(activeStreakWorkouts),
    [activeStreakWorkouts],
  );

  const longestWeekStreak = useMemo(
    () => longestStreakInDateSpan(workouts.content, weekStartIso, weekEndIso),
    [workouts.content, weekStartIso, weekEndIso],
  );

  const weekStreakRange = useMemo(
    () => longestStreakRangeInDateSpan(workouts.content, weekStartIso, weekEndIso),
    [workouts.content, weekStartIso, weekEndIso],
  );

  const streakPresentation = useMemo(() => {
    if (isCurrentWeek) {
      return getStreakPresentation(streakSummary);
    }
    return getRangeStreakPresentation(weekStreakRange, 'No streak this week');
  }, [isCurrentWeek, streakSummary, weekStreakRange]);

  const streakCardTitle = isCurrentWeek ? 'Active Streak' : 'Week Streak';
  const streakDayCount = isCurrentWeek
    ? streakSummary.current
    : longestWeekStreak;
  const streakValue = loading
    ? '—'
    : `${streakDayCount} Day${streakDayCount === 1 ? '' : 's'}`;

  return (
    <PeriodOverview
      title={weekLabel}
      subtitle={`${workingDaysInWeek} working day${workingDaysInWeek === 1 ? '' : 's'} in week`}
      previousAccessibilityLabel="Previous week"
      nextAccessibilityLabel="Next week"
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
      onShift={shiftWeek}
      loading={loading}
      error={error}
      workouts={workouts}
      previousWorkouts={previousWorkouts}
      periodNoun="week"
      workoutGoalFooter="Goal: 6 / week"
      streakCardTitle={streakCardTitle}
      streakValue={streakValue}
      streakPresentation={streakPresentation}
      heatmapWorkouts={monthWorkouts.content}
      monthAnchor={monthAnchor}
    />
  );
}
