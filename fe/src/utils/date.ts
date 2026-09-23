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
