const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string): Date {
  if (ISO_DATE.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    if (year == null || month == null || day == null) {
      throw new Error(`Invalid date: ${value}`);
    }

    return new Date(year, month - 1, day);
  }

  return new Date(value);
}

export function formatShortAxisLabel(date: string): string {
  const parsed = parseIsoDate(date);
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}

export function formatMonthAxisLabel(date: string): string {
  const parsed = parseIsoDate(date);
  return String(parsed.getMonth() + 1).padStart(2, "0");
}
