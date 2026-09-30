const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDateString(value: string): boolean {
  if (!ISO_DATE.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime());
}

export function formatLocalDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const weekday = d.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeekSunday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const weekday = d.getDay();
  const diff = weekday === 0 ? 0 : 7 - weekday;
  d.setDate(d.getDate() + diff);
  return d;
}

/** dayGridMonth visible range (firstDay Monday), for calendar_events refresh fallback. */
export function monthViewVisibleRange(anchorIso: string): {
  startDate: string;
  endDate: string;
} | null {
  if (!isIsoDateString(anchorIso)) {
    return null;
  }

  const anchor = new Date(`${anchorIso}T12:00:00`);
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12);
  const lastOfMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 12);
  const startDate = formatLocalDate(startOfWeekMonday(firstOfMonth));
  const endDate = formatLocalDate(endOfWeekSunday(lastOfMonth));

  if (!isIsoDateString(startDate) || !isIsoDateString(endDate)) {
    return null;
  }

  return { startDate, endDate };
}
