import { BASE_URL_DEVELOPMENT } from "@/constants";
import type { NewWorkoutFormData } from "@/types";

export const apiUrl = (path: string) => `${BASE_URL_DEVELOPMENT}${path}`;

export const fetchCalendarEvents = async (startDate: string, endDate: string) => {
 	const response = await fetch(
 		apiUrl('/api/calendar_events'),
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ startDate, endDate })
		}
 	)
 	if (!response.ok) {
 		throw new Error('Failed to fetch calendar events')
 	}
 	return response.json()
}

export async function fetchFirstWorkoutDate() {
	const response = await fetch(
		apiUrl('/api/first_workout_date'),
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		}
	)

	if (!response.ok) {
		throw new Error('Failed to fetch first workout date!')
	}

	return await response.json()
}

export async function fetchCurrentPeriod() {
	const response = await fetch(
		apiUrl('/api/current_period'),
	)

	if (!response.ok) {
		throw new Error('Failed to fetch current period data!')
	}

	return await response.json()
}

export async function fetchWorkoutTemplate(date: string) {
	const response = await fetch(
		apiUrl(`/api/template_workout?date=${date}`),
		{
			method: 'GET',
		}
	)

	if (!response.ok) {
		throw new Error('Failed to fetch workout template!')
	}

	return await response.json()
}

export async function addWorkout(workout: NewWorkoutFormData) {
	const response = await fetch(
		apiUrl('/api/add_workout'),
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(workout)
		}
	)
	if (!response.ok) {
		throw new Error('Failed to add workout!')
	}
}

export async function editWorkout(workout: NewWorkoutFormData & { id: string }) {
	const response = await fetch(
		apiUrl('/api/edit_workout'),
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(workout)
		}
	)
	if (!response.ok) {
		throw new Error('Failed to edit workout!')
	}
}