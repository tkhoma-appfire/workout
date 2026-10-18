import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {WorkoutType} from '../types/workout';
import {colors} from '../theme';
import {
  buildMonthHeatmap,
  type HeatmapDay,
  type HeatmapIntensity,
  mondayOffsetForMonth,
} from '../utils/heatmapIntensity';

function localIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const INTENSITY_COLORS: Record<HeatmapIntensity, string> = {
  rest: colors.heatmapRest,
  light: colors.heatmapLight,
  moderate: colors.heatmapModerate,
  heavy: colors.heatmapHeavy,
};

const INTENSITY_TEXT: Record<HeatmapIntensity, string> = {
  rest: colors.heatmapRestText,
  light: colors.heatmapActiveText,
  moderate: colors.heatmapActiveText,
  heavy: colors.heatmapHeavyText,
};

type MonthlyConsistencyHeatmapProps = {
  workouts: WorkoutType[];
  monthAnchor: Date;
  loading?: boolean;
};

export default function MonthlyConsistencyHeatmap({
  workouts,
  monthAnchor,
  loading = false,
}: MonthlyConsistencyHeatmapProps): React.JSX.Element {
  const heatmapDays = useMemo(
    () => buildMonthHeatmap(workouts, monthAnchor),
    [workouts, monthAnchor],
  );

  const todayIso = localIsoDate(new Date());

  const leadingBlanks = useMemo(
    () => mondayOffsetForMonth(monthAnchor),
    [monthAnchor],
  );

  const cells = useMemo(() => {
    const items: Array<HeatmapDay | null> = [];
    for (let i = 0; i < leadingBlanks; i++) {
      items.push(null);
    }
    for (const day of heatmapDays) {
      items.push(day);
    }
    while (items.length % 7 !== 0) {
      items.push(null);
    }
    return items;
  }, [heatmapDays, leadingBlanks]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.calendarGlyph}>📅</Text>
          <Text style={styles.title}>MONTHLY CONSISTENCY HEATMAP</Text>
        </View>
        <Text style={styles.hint}>Tap date for log</Text>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell, index) => {
          if (!cell) {
            return <View key={`empty-${index}`} style={styles.cell} />;
          }

          const bg = INTENSITY_COLORS[cell.intensity];
          const textColor = INTENSITY_TEXT[cell.intensity];
          const isToday = cell.iso === todayIso;

          return (
            <Pressable
              key={cell.iso}
              accessibilityLabel={`Day ${cell.day}${isToday ? ', today' : ''}, training load ${cell.trainingLoad}`}
              style={[
                styles.cell,
                styles.dayCell,
                {backgroundColor: bg},
                isToday && styles.todayCell,
              ]}
              onPress={() => {
                // Placeholder for workout log navigation.
              }}>
              <Text style={[styles.dayNumber, {color: textColor}]}>
                {loading ? '·' : cell.day}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendLabel}>Intensity:</Text>
        {(['rest', 'light', 'moderate', 'heavy'] as HeatmapIntensity[]).map(
          level => (
            <View key={level} style={styles.legendItem}>
              <View
                style={[
                  styles.legendSwatch,
                  {backgroundColor: INTENSITY_COLORS[level]},
                ]}
              />
              <Text style={styles.legendText}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </View>
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarGlyph: {
    fontSize: 16,
  },
  title: {
    flex: 1,
    color: colors.accentBlue,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  hint: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '500',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 3,
  },
  dayCell: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.accentBlue,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  legendLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '500',
  },
});
