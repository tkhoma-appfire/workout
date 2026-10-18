export function formatMmSsInput(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  const minutes = digits.slice(0, digits.length - 2) || "0";
  const seconds = digits.slice(-2).padStart(2, "0");
  return `${parseInt(minutes, 10)}:${seconds}`;
}

export function isAllowedMmSsInput(value: string): boolean {
  return /^\d{0,4}$/.test(value.replace(":", ""))
    || /^\d{1,2}:\d{0,2}$/.test(value);
}

export function isValidMmSs(value: string): boolean {
  const match = value.match(/^(\d+):(\d{2})$/);
  if (!match) {
    return false;
  }

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return seconds >= 0 && seconds < 60 && (minutes > 0 || seconds > 0);
}

/** Workout clock time `hh:mm` (hours 0–23, minutes 0–59). */
export function formatHhMmInput(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  const minutes = digits.slice(-2).padStart(2, "0");
  const hours = digits.slice(0, -2) || "0";
  return `${parseInt(hours, 10)}:${minutes}`;
}

export function isAllowedHhMmInput(value: string): boolean {
  return /^\d{0,4}$/.test(value.replace(":", ""))
    || /^\d{1,2}:\d{0,2}$/.test(value);
}

export function isValidHhMm(value: string): boolean {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return false;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return (
    hours >= 0
    && hours <= 23
    && minutes >= 0
    && minutes < 60
    && (hours > 0 || minutes > 0)
  );
}

export function normalizeHhMm(value: unknown): string | undefined {
  if (typeof value === "string" && isValidHhMm(value)) {
    return value.trim();
  }

  return undefined;
}

export function normalizeMmSs(value: unknown): string | undefined {
  if (typeof value === "string" && isValidMmSs(value)) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return `${Math.floor(value)}:00`;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber) && asNumber > 0) {
      return `${Math.floor(asNumber)}:00`;
    }
  }

  return undefined;
}
