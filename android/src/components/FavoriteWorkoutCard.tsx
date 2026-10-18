import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme';
import type {WorkoutType} from '../types/workout';
import {formatGroupedNumber} from '../utils/statisticsDisplay';
import {
  classifyTrainingLoad,
  trainingLoadLabel,
  type TrainingLoadLevel,
} from '../utils/trainingLoad';
import {formatLongWorkoutDate} from '../utils/workoutDateLabel';
import {DumbbellIcon, FlameIcon, RepeatIcon} from './DashboardIcons';

type FavoriteWorkoutCardProps = {
  workout: WorkoutType;
};

const BADGE_COLORS: Record<
  TrainingLoadLevel,
  {border: string; text: string; background: string}
> = {
  rest: {
    border: colors.cardBorder,
    text: colors.textMuted,
    background: colors.navButton,
  },
  light: {
    border: colors.textSubtle,
    text: colors.textMuted,
    background: colors.navButton,
  },
  moderate: {
    border: colors.accentBlue,
    text: colors.accentBlue,
    background: colors.accentBlueDim,
  },
  heavy: {
    border: colors.accentGreen,
    text: colors.accentGreen,
    background: colors.accentGreenDim,
  },
};

function workoutTitle(workout: WorkoutType): string {
  const names = (workout.exercises ?? [])
    .map(item => item.exercise)
    .filter(Boolean);
  if (names.length > 0) {
    return names.join(' & ');
  }
  const comment =
    typeof workout.comment === 'string' ? workout.comment.trim() : '';
  return comment || 'Workout';
}

function roundsText(rounds: unknown): string | null {
  if (rounds == null) {
    return null;
  }
  const text = String(rounds).trim();
  return text.length > 0 ? text : null;
}

export default function FavoriteWorkoutCard({
  workout,
}: FavoriteWorkoutCardProps): React.JSX.Element {
  const title = useMemo(() => workoutTitle(workout), [workout]);
  const dateLabel = formatLongWorkoutDate(workout.date);
  const level = classifyTrainingLoad(workout.trainingLoad);
  const badge = BADGE_COLORS[level];
  const calories =
    workout.calories == null ? '—' : formatGroupedNumber(workout.calories);
  const rounds = roundsText(workout.rounds);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <DumbbellIcon />
        </View>
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <View
              style={[
                styles.badge,
                {borderColor: badge.border, backgroundColor: badge.background},
              ]}>
              <Text style={[styles.badgeLabel, {color: badge.text}]}>
                {trainingLoadLabel(level)}
              </Text>
            </View>
          </View>
          <Text style={styles.date}>{dateLabel}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <FlameIcon />
          <Text style={styles.statText}>{calories} kcal</Text>
        </View>
        {rounds ? (
          <View style={[styles.stat, styles.statFlex]}>
            <RepeatIcon />
            <Text style={styles.statText} numberOfLines={1}>
              {rounds}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accentGreenDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  date: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statFlex: {
    flex: 1,
    minWidth: 0,
  },
  statText: {
    flexShrink: 1,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
