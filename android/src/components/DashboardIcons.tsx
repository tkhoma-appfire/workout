import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors} from '../theme';

export function DumbbellIcon(): React.JSX.Element {
  return (
    <View style={styles.dumbbell}>
      <View style={[styles.weight, {backgroundColor: colors.accentGreen}]} />
      <View style={[styles.bar, {backgroundColor: colors.accentGreen}]} />
      <View style={[styles.weight, {backgroundColor: colors.accentGreen}]} />
    </View>
  );
}

export function FlameIcon(): React.JSX.Element {
  return (
    <View style={styles.flame}>
      <View style={[styles.flameOuter, {backgroundColor: colors.accentOrange}]} />
      <View style={[styles.flameInner, {backgroundColor: '#fdba74'}]} />
    </View>
  );
}

export type StreakIconVariant = 'idle' | 'start' | 'building' | 'roll' | 'peak';

type StreakIconProps = {
  variant: StreakIconVariant;
};

export function StreakIcon({variant}: StreakIconProps): React.JSX.Element {
  const tint = colors.accentPurple;
  const warm = colors.accentOrange;

  if (variant === 'idle') {
    return (
      <View style={[styles.streakRing, styles.streakRingDashed, {borderColor: colors.textSubtle}]} />
    );
  }

  if (variant === 'start') {
    return (
      <View style={[styles.streakRing, {borderColor: tint}]}>
        <View style={[styles.streakDot, {backgroundColor: tint}]} />
      </View>
    );
  }

  if (variant === 'building') {
    return (
      <View style={styles.streakBars}>
        <View style={[styles.streakBar, styles.streakBarShort, {backgroundColor: tint}]} />
        <View style={[styles.streakBar, styles.streakBarTall, {backgroundColor: tint}]} />
      </View>
    );
  }

  if (variant === 'roll') {
    return (
      <View style={styles.streakFlames}>
        <View style={[styles.miniFlame, {backgroundColor: warm}]} />
        <View style={[styles.miniFlame, styles.miniFlameMid, {backgroundColor: tint}]} />
        <View style={[styles.miniFlame, {backgroundColor: warm}]} />
      </View>
    );
  }

  return (
    <View style={[styles.streakRing, {borderColor: warm, backgroundColor: colors.accentPurpleDim}]}>
      <View style={[styles.streakStar, {backgroundColor: warm}]} />
    </View>
  );
}

export function StopwatchIcon(): React.JSX.Element {
  return (
    <View style={styles.stopwatch}>
      <View style={[styles.stopwatchFace, {borderColor: colors.accentBlue}]} />
      <View style={[styles.stopwatchHand, {backgroundColor: colors.accentBlue}]} />
      <View style={[styles.stopwatchButton, {backgroundColor: colors.accentBlue}]} />
    </View>
  );
}

export function RepeatIcon(): React.JSX.Element {
  return (
    <View style={styles.repeat}>
      <View style={[styles.repeatRing, {borderColor: colors.accentPurple}]} />
      <View style={[styles.repeatDot, {backgroundColor: colors.accentPurple}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  dumbbell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  weight: {
    width: 5,
    height: 11,
    borderRadius: 2,
  },
  bar: {
    width: 14,
    height: 3,
    borderRadius: 1,
  },
  stopwatch: {
    width: 18,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopwatchFace: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  stopwatchHand: {
    position: 'absolute',
    width: 2,
    height: 6,
    borderRadius: 1,
    top: 6,
    transform: [{rotate: '45deg'}],
  },
  stopwatchButton: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 3,
    borderRadius: 1,
  },
  flame: {
    width: 14,
    height: 18,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  flameOuter: {
    width: 12,
    height: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    transform: [{rotate: '12deg'}],
  },
  flameInner: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 8,
    borderRadius: 4,
  },
  streakRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakRingDashed: {
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  streakDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  streakBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 16,
  },
  streakBar: {
    width: 4,
    borderRadius: 2,
  },
  streakBarShort: {
    height: 8,
  },
  streakBarTall: {
    height: 14,
  },
  streakFlames: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },
  miniFlame: {
    width: 5,
    height: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  miniFlameMid: {
    height: 13,
  },
  streakStar: {
    width: 8,
    height: 8,
    borderRadius: 2,
    transform: [{rotate: '45deg'}],
  },
  repeat: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  repeatDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    right: 0,
    top: 1,
  },
});
