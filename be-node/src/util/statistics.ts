type StatisticsSource = {
  calories: number | null;
  time: number | null;
};

export function calculateStatistics(workouts: StatisticsSource[]) {
  let calories = 0;
  let totalMinutes = 0;

  for (const workout of workouts) {
    calories += workout.calories ?? 0;
    totalMinutes += workout.time ?? 0;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    calories,
    exerciseTime: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`,
  };
}
