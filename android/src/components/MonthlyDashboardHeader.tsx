import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme';
import {DumbbellIcon, StopwatchIcon} from './DashboardIcons';
import StatCard from './StatCard';

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export default function MonthlyDashboardHeader(): React.JSX.Element {
  const [anchor, setAnchor] = useState(() => {
    const now = new Date();
    return {year: now.getFullYear(), month: now.getMonth()};
  });

  const monthLabel = useMemo(
    () => formatMonthYear(anchor.year, anchor.month),
    [anchor.year, anchor.month],
  );

  const shiftMonth = (delta: number) => {
    setAnchor(prev => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return {year: next.getFullYear(), month: next.getMonth()};
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.monthNav}>
        <Pressable
          accessibilityLabel="Previous month"
          onPress={() => shiftMonth(-1)}
          style={({pressed}) => [styles.navBtn, pressed && styles.navBtnPressed]}>
          <Text style={styles.navChevron}>‹</Text>
        </Pressable>
        <View style={styles.monthCenter}>
          <Text style={styles.monthTitle}>{monthLabel}</Text>
          <Text style={styles.monthSubtitle}>22 active training days</Text>
        </View>
        <Pressable
          accessibilityLabel="Next month"
          onPress={() => shiftMonth(1)}
          style={({pressed}) => [styles.navBtn, pressed && styles.navBtnPressed]}>
          <Text style={styles.navChevron}>›</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          title="Total Workouts"
          value="26"
          delta="↑ +14%"
          deltaColor={colors.accentGreen}
          footer="Goal: 24 / month"
          icon={<DumbbellIcon />}
          iconTint={colors.accentGreenDim}
        />
        <View style={styles.statsGap} />
        <StatCard
          title="Total Time"
          value="31.5h"
          delta="↑ +2.2h"
          deltaColor={colors.accentBlue}
          footer="Avg ~72 min / session"
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
});
