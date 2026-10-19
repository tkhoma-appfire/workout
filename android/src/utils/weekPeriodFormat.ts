const pad2 = (n: number) => String(n).padStart(2, '0');

/** Backend week strings use `dd.MM.yy` (matches be-node). */
export function formatDdMmYy(date: Date): string {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear() % 100;
  return `${pad2(d)}.${pad2(m)}.${pad2(y)}`;
}

/** Monday–Sunday (matches backend `DayOfWeek.MONDAY`). */
export function startOfIsoWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diffFromMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffFromMonday);
  return d;
}

export function endOfIsoWeekSunday(monday: Date): Date {
  const d = new Date(monday);
  d.setDate(d.getDate() + 6);
  return d;
}

/** `dd.MM.yy - dd.MM.yy` for `timePeriod: "WEEK"`. */
export function formatWeekPeriodRange(anchorInWeek: Date): string {
  const monday = startOfIsoWeekMonday(anchorInWeek);
  const sunday = endOfIsoWeekSunday(monday);
  return `${formatDdMmYy(monday)} - ${formatDdMmYy(sunday)}`;
}

export function currentWeekPeriodRange(): string {
  return formatWeekPeriodRange(new Date());
}

function parseDdMmYy(token: string): Date {
  const parts = token.split('.').map(Number);
  const day = parts[0];
  const month = parts[1];
  if (day == null || month == null) {
    return new Date();
  }
  const yearPart = parts[2];
  const year = yearPart == null ? new Date().getFullYear() : 2000 + yearPart;
  return new Date(year, month - 1, day);
}

/** Monday of the week described by `dd.MM.yy - dd.MM.yy`. */
export function parseWeekPeriod(period: string): Date {
  const first = period.trim().split(/\s*-\s*/)[0] ?? '';
  const match = first.match(/^\d{1,2}\.\d{1,2}(\.\d{2})?/);
  if (!match) {
    return startOfIsoWeekMonday(new Date());
  }
  return startOfIsoWeekMonday(parseDdMmYy(match[0]));
}

export function previousWeekPeriod(currentPeriod: string): string {
  const monday = parseWeekPeriod(currentPeriod);
  monday.setDate(monday.getDate() - 7);
  return formatWeekPeriodRange(monday);
}

export function isSelectedWeekCurrent(startOfPeriod: string): boolean {
  return formatWeekPeriodRange(parseWeekPeriod(startOfPeriod))
    === currentWeekPeriodRange();
}

export function formatWeekLabel(monday: Date): string {
  const start = startOfIsoWeekMonday(monday);
  const end = endOfIsoWeekSunday(start);
  const startMonth = new Intl.DateTimeFormat('en', {month: 'short'}).format(start);
  const endMonth = new Intl.DateTimeFormat('en', {month: 'short'}).format(end);

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${startMonth} ${start.getDate()}, ${start.getFullYear()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
}

/** Weekdays (Mon–Fri) in an ISO week. */
export function countWorkingDaysInWeek(): number {
  return 5;
}

function weekMondayKey(date: Date): number {
  const monday = startOfIsoWeekMonday(date);
  return monday.getFullYear() * 10000 + (monday.getMonth() + 1) * 100 + monday.getDate();
}

export function isWeekInRange(
  weekMonday: Date,
  firstWorkoutIso: string,
  lastMonday: Date = startOfIsoWeekMonday(new Date()),
): boolean {
  const parsedFirst = new Date(`${firstWorkoutIso}T12:00:00`);
  const firstMonday = startOfIsoWeekMonday(
    Number.isNaN(parsedFirst.getTime()) ? new Date() : parsedFirst,
  );
  const target = weekMondayKey(weekMonday);
  return target >= weekMondayKey(firstMonday) && target <= weekMondayKey(lastMonday);
}
