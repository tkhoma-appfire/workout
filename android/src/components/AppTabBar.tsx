import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../theme';

export type AppTab = 'week' | 'month' | 'favorites';

type AppTabBarProps = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

export default function AppTabBar({
  activeTab,
  onChange,
}: AppTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, {paddingBottom: Math.max(insets.bottom, 8)}]}>
      <TabButton
        label="Week Overview"
        active={activeTab === 'week'}
        onPress={() => onChange('week')}
      />
      <TabButton
        label="Month Overview"
        active={activeTab === 'month'}
        onPress={() => onChange('month')}
      />
      <TabButton
        label="Favorites"
        active={activeTab === 'favorites'}
        onPress={() => onChange('favorites')}
      />
    </View>
  );
}

type TabButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function TabButton({label, active, onPress}: TabButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{selected: active}}
      onPress={onPress}
      style={({pressed}) => [
        styles.tab,
        pressed && styles.tabPressed,
      ]}>
      <View style={[styles.indicator, active && styles.indicatorActive]} />
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.card,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabPressed: {
    opacity: 0.7,
  },
  indicator: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginBottom: 6,
  },
  indicatorActive: {
    backgroundColor: colors.accentGreen,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    color: colors.textPrimary,
  },
});
