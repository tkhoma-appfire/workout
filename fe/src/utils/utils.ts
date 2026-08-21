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