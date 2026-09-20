import type { DateRange } from "../types/workout.js";
import { formatIsoDate } from "../util/dateFormat.js";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatCurrentMonth(): string {
  const now = new Date();
  return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

function parseDdMmYy(value: string): Date {
  const [day, month, year] = value.split(".").map(Number);
  if (day == null || month == null || year == null) {
    throw new Error(`Invalid date: ${value}`);
  }

  return new Date(2000 + year, month - 1, day);
}

function parseDdMmYyyy(value: string): Date {
  const [day, month, year] = value.split(".").map(Number);
  if (day == null || month == null || year == null) {
    throw new Error(`Invalid date: ${value}`);
  }

  return new Date(year, month - 1, day);
}

function startOfIsoWeek(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

function endOfIsoWeek(date: Date): Date {
  const result = startOfIsoWeek(date);
  result.setDate(result.getDate() + 6);
  return result;
}

export function parseWeek(input?: string | number | null): DateRange {
  if (!input || typeof input !== "string") {
    throw new Error("Invalid week period");
  }

  const parts = input.split(" - ");
  if (parts.length !== 2) {
    throw new Error(`Invalid date range format: ${input}`);
  }

  const startPart = parts[0];
  const endPart = parts[1];
  if (!startPart || !endPart) {
    throw new Error(`Invalid date range format: ${input}`);
  }

  const hasYear = startPart.split(".").length === 3;

  if (hasYear) {
    const startDate = parseDdMmYy(startPart);
    const endDate = parseDdMmYy(endPart);
    return {
      startDate: formatIsoDate(startOfIsoWeek(startDate)),
      endDate: formatIsoDate(endOfIsoWeek(endDate)),
    };
  }

  const year = new Date().getFullYear();
  const anchor = parseDdMmYyyy(`${startPart}.${year}`);
  return {
    startDate: formatIsoDate(startOfIsoWeek(anchor)),
    endDate: formatIsoDate(endOfIsoWeek(anchor)),
  };
}

export function parseMonth(input?: string | number | null): DateRange {
  const monthInput = input == null || input === ""
    ? formatCurrentMonth()
    : String(input);

  const match = monthInput.match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (!match) {
    throw new Error(`Invalid month format: ${monthInput}`);
  }

  const monthName = match[1];
  if (!monthName) {
    throw new Error(`Invalid month format: ${monthInput}`);
  }

  const monthIndex = MONTH_NAMES.findIndex(
    (month) => month.toLowerCase() === monthName.toLowerCase(),
  );
  if (monthIndex < 0) {
    throw new Error(`Invalid month format: ${monthInput}`);
  }

  const year = Number(match[2]);
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0);

  return {
    startDate: formatIsoDate(start),
    endDate: formatIsoDate(end),
  };
}

export function parseYear(input?: string | number | null): DateRange {
  const year = Number(input ?? new Date().getFullYear());
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}
