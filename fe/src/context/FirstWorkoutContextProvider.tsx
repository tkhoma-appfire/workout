import { createContext, useEffect, useReducer } from 'react'
import { fetchFirstWorkoutDate } from '@/utils/http.js'
import type { PropsWithChildren } from 'react';

const now = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0]

const initialState = {
	firstWorkout: formatDate(now),
	error: null
}

function reducer(state: typeof initialState,
    action: { type: string; payload?: any }) {
	switch (action.type) {
		case 'FETCH_FIRST_WORKOUT_START':
			return {
				...state,
				error: null
			}
		case 'FETCH_FIRST_WORKOUT_SUCCESS':
			return {
				firstWorkout: action.payload.firstDate,
				error: null
			}
		case 'FETCH_FIRST_WORKOUT_FAILURE':
			return {
				...state,
				error: action.payload
			}
		default:
			return state
	}
}

export const FirstWorkoutContext = createContext<{
	state: typeof initialState;
} | undefined>(undefined);

export function FirstWorkoutContextProvider({children}: PropsWithChildren<{}>) {
	const [state, dispatch] = useReducer(reducer, initialState)

	useEffect(() => {
		dispatch({ type: 'FETCH_FIRST_WORKOUT_START' })

		void (async () => {
			try {
				const result = await fetchFirstWorkoutDate();
				dispatch({
					type: 'FETCH_FIRST_WORKOUT_SUCCESS',
					payload: result,
				});
			} catch (error) {
				const message = error instanceof Error
					? error.message
					: 'Failed to fetch first workout date';
				dispatch({
					type: 'FETCH_FIRST_WORKOUT_FAILURE',
					payload: message,
				});
			}
		})();
	}, [])
	
	return (
		<FirstWorkoutContext value={{state}}>
			{children}
		</FirstWorkoutContext>
	)
}
