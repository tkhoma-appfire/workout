import { isIsoDateString, monthViewVisibleRange } from "@/utils/date";

export type CalendarRefreshOptions = {
  startDate?: string;
  endDate?: string;
  anchorDate?: string;
};

export type CalendarDateRange = {
  startDate: string;
  endDate: string;
};

export function resolveCalendarEventRange(
  options: CalendarRefreshOptions | undefined,
  visibleRange: CalendarDateRange,
  stateRange: CalendarDateRange,
): CalendarDateRange | null {
  const tryRange = (
    startDate: string | undefined,
    endDate: string | undefined,
  ): CalendarDateRange | null => {
    if (startDate === undefined || endDate === undefined) {
      return null;
    }
    if (!isIsoDateString(startDate) || !isIsoDateString(endDate)) {
      return null;
    }
    return { startDate, endDate };
  };

  const fromOptions = tryRange(options?.startDate, options?.endDate);
  if (fromOptions) {
    return fromOptions;
  }

  const fromVisible = tryRange(visibleRange.startDate, visibleRange.endDate);
  if (fromVisible) {
    return fromVisible;
  }

  const fromState = tryRange(stateRange.startDate, stateRange.endDate);
  if (fromState) {
    return fromState;
  }

  if (options?.anchorDate) {
    return monthViewVisibleRange(options.anchorDate);
  }

  return null;
}
