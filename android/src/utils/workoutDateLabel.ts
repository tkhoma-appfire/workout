const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function formatWorkoutDateLabel(workout: {
  date?: unknown;
  xaxisLabel?: string;
}): string {
  const date =
    typeof workout.date === 'string' ? workout.date.slice(0, 10) : '';
  const axis = workout.xaxisLabel ?? '';

  if (!ISO_DATE.test(date)) {
    return axis;
  }

  const workoutYear = new Date(`${date}T12:00:00`).getFullYear();
  if (workoutYear !== new Date().getFullYear()) {
    return axis ? `${axis}.${workoutYear}` : date;
  }

  return axis || date;
}

/** Date only, e.g. `Oct 24, 2026`. */
export function formatLongWorkoutDate(date: unknown): string {
  const iso = typeof date === 'string' ? date.slice(0, 10) : '';
  if (!ISO_DATE.test(iso)) {
    return formatWorkoutDateLabel({date});
  }

  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
