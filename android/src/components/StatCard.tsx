import React, {type ReactNode} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme';

type StatCardProps = {
  title: string;
  value?: string;
  valueSuffix?: string;
  valueContent?: ReactNode;
  delta?: string;
  deltaColor?: string;
  badge?: ReactNode;
  footer: string;
  icon: ReactNode;
  iconTint: string;
};

export default function StatCard({
  title,
  value = '',
  valueSuffix,
  valueContent,
  delta,
  deltaColor = colors.textMuted,
  badge,
  footer,
  icon,
  iconTint,
}: StatCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.iconWrap, {backgroundColor: iconTint}]}>{icon}</View>
      </View>
      <View style={styles.valueRow}>
        {valueContent ?? (
          <View style={styles.valueInline}>
            <Text
              style={styles.value}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}>
              {value}
            </Text>
            {valueSuffix ? (
              <Text style={styles.valueUnit}>{valueSuffix}</Text>
            ) : null}
          </View>
        )}
        {badge}
        {delta ? (
          <Text style={[styles.delta, {color: deltaColor}]}>{delta}</Text>
        ) : null}
      </View>
      <Text style={styles.footer}>{footer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    minHeight: 132,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'nowrap',
    gap: 8,
    marginBottom: 8,
  },
  valueInline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
    maxWidth: '100%',
  },
  valueUnit: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 4,
    flexShrink: 0,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  delta: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '500',
  },
});
