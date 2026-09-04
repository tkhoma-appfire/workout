import type { WorkoutType, YearlyWorkoutType } from "@/types"

export function formatMonthlyChartData(payload: WorkoutType[]) {
   const shortLabel = payload.length > 12
   let chartData = payload.map((workout: WorkoutType) => {
     let exercises: WorkoutType["exercises"] = []
     if (workout.exercises && workout.exercises.length > 0) {
       exercises = [...workout.exercises].sort(
         (a, b) => (a.order ?? 0) - (b.order ?? 0),
       )
     }
     return ({
       id: workout.id,
       date: workout.date,
       label: shortLabel ? workout.xaxisLabel.substring(0, 2) : workout.xaxisLabel,
       value: workout.time,
       time: workout.time,
       exercises: exercises,
       rounds: workout.rounds,
       comment: workout.comment
     })
    })

    chartData.sort((a: { date: string }, b: { date: string }) =>
        new Date(a.date).getTime() - new Date(b.date).getTime())
    return chartData
}

export type YearlyChartRow = {
	date: string;
	label: string;
	value: number;
	calories: number;
	trainings: number;
	trainingLoad: number;
}

export type YearlyComparisonChartRow = YearlyChartRow & {
	compareValue: number;
	compareCalories: number;
	compareTrainings: number;
	compareTrainingLoad: number;
}

export function formatYearlyChartData(payload: YearlyWorkoutType[]) {
	let chartData = payload.map(workout => {
		return ({
			date: workout.date,
			label: workout.xaxisLabel,
			value: workout.time,
			calories: workout.calories,
			trainings: workout.trainings,
			trainingLoad: Math.round(workout.trainingLoad / workout.trainings),
		})
	})

	chartData.sort((a: { date: string }, b: { date: string }) =>
		new Date(a.date).getTime() - new Date(b.date).getTime())
	return chartData
}

// Both years are aligned on the month label ("01".."12") so the same month of
// each year is drawn side by side, including months only one of the years has.
export function mergeYearlyChartData(
	base: YearlyChartRow[],
	compare: YearlyChartRow[]
): YearlyComparisonChartRow[] {
	const emptyRow = (label: string, date: string): YearlyComparisonChartRow => ({
		date,
		label,
		value: 0,
		calories: 0,
		trainings: 0,
		trainingLoad: 0,
		compareValue: 0,
		compareCalories: 0,
		compareTrainings: 0,
		compareTrainingLoad: 0,
	})

	const byMonth = new Map<string, YearlyComparisonChartRow>()

	base.forEach(row => {
		byMonth.set(row.label, { ...emptyRow(row.label, row.date), ...row })
	})

	compare.forEach(row => {
		const merged = byMonth.get(row.label) ?? emptyRow(row.label, row.date)
		byMonth.set(row.label, {
			...merged,
			compareValue: row.value,
			compareCalories: row.calories,
			compareTrainings: row.trainings,
			compareTrainingLoad: row.trainingLoad,
		})
	})

	return [...byMonth.values()].sort((a, b) => a.label.localeCompare(b.label))
}