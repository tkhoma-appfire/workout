const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatMonthValue(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function parseMonthPeriod(period: string): Date {
  const match = period.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) {
    const fallback = new Date(`1 ${period}`);
    return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
  }

  const monthToken = match[1].toLowerCase();
  const year = Number(match[2]);
  const monthIndex = MONTH_NAMES.findIndex(
    name =>
      name.toLowerCase() === monthToken
      || monthToken.startsWith(name.toLowerCase())
      || name.toLowerCase().startsWith(monthToken.slice(0, 3)),
  );

  if (monthIndex < 0) {
    const fallback = new Date(`1 ${period}`);
    return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
  }

  return new Date(year, monthIndex, 1);
}

export function previousMonthPeriod(currentPeriod: string): string {
  const parsed = parseMonthPeriod(currentPeriod);
  parsed.setMonth(parsed.getMonth() - 1);
  const month = MONTH_NAMES[parsed.getMonth()];
  return `${month} ${parsed.getFullYear()}`;
}

export function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Weekdays (Mon–Fri) in the calendar month of `anchor`. */
export function countWorkingDaysInMonth(anchor: Date): number {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const weekday = new Date(year, month, day).getDay();
    if (weekday !== 0 && weekday !== 6) {
      count++;
    }
  }
  return count;
}

export function isMonthInRange(
  month: Date,
  firstWorkoutIso: string,
  lastMonth: Date = monthStart(new Date()),
): boolean {
  const parsedFirst = new Date(firstWorkoutIso);
  const firstMonth = monthStart(
    Number.isNaN(parsedFirst.getTime()) ? new Date() : parsedFirst,
  );
  const target = monthStart(month);
  return target >= firstMonth && target <= lastMonth;
}
