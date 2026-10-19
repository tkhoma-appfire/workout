import {
  formatStreakDateRange,
  type StreakDateRange,
  type StreakSummary,
} from './streak';

export type StreakIconVariant = 'idle' | 'start' | 'building' | 'roll' | 'peak';

export type StreakPresentation = {
  footer: string;
  badgeLabel: string | null;
  iconVariant: StreakIconVariant;
};

export function getStreakPresentation(summary: StreakSummary): StreakPresentation {
  const {current, isPersonalRecord} = summary;

  if (current === 0) {
    return {
      footer: 'Log a workout to start a streak',
      badgeLabel: null,
      iconVariant: 'idle',
    };
  }

  if (isPersonalRecord && current >= 2) {
    return {
      footer: 'Your best run this week',
      badgeLabel: 'Best',
      iconVariant: 'peak',
    };
  }

  if (current === 1) {
    return {
      footer: isPersonalRecord
        ? 'First workout this week'
        : 'Come back tomorrow to continue',
      badgeLabel: null,
      iconVariant: 'start',
    };
  }

  if (current === 2) {
    return {
      footer: 'Two training days in a row',
      badgeLabel: null,
      iconVariant: 'building',
    };
  }

  if (current <= 4) {
    return {
      footer: 'Momentum is building',
      badgeLabel: null,
      iconVariant: 'roll',
    };
  }

  return {
    footer: 'Outstanding week so far',
    badgeLabel: null,
    iconVariant: 'peak',
  };
}

export function getRangeStreakPresentation(
  streakRange: StreakDateRange | null,
  emptyFooter: string,
): StreakPresentation {
  const longest = streakRange?.length ?? 0;
  let iconVariant: StreakIconVariant = 'idle';
  if (longest >= 5) {
    iconVariant = 'peak';
  } else if (longest >= 3) {
    iconVariant = 'roll';
  } else if (longest === 2) {
    iconVariant = 'building';
  } else if (longest === 1) {
    iconVariant = 'start';
  }

  const footer =
    streakRange && streakRange.length > 0
      ? formatStreakDateRange(streakRange.start, streakRange.end)
      : emptyFooter;

  return {
    footer,
    badgeLabel: null,
    iconVariant,
  };
}

export function getMonthStreakPresentation(
  streakRange: StreakDateRange | null,
  monthName: string,
): StreakPresentation {
  return getRangeStreakPresentation(streakRange, `No streak in ${monthName}`);
}
