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

export function StopwatchIcon(): React.JSX.Element {
  return (
    <View style={styles.stopwatch}>
      <View style={[styles.stopwatchFace, {borderColor: colors.accentBlue}]} />
      <View style={[styles.stopwatchHand, {backgroundColor: colors.accentBlue}]} />
      <View style={[styles.stopwatchButton, {backgroundColor: colors.accentBlue}]} />
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
});
