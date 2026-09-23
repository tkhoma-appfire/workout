import { createContext, useCallback, useEffect, useReducer, type PropsWithChildren } from 'react'
import { fetchCurrentPeriod } from '@/utils/http.js'

const initialState = {
	prevWeek: [],
	currentWeek: [],
	statistics: {
		calories: 0
	},
	monthCalories: 0,
	error: null
}

export type CurrentPeriodState = typeof initialState;

function reducer(
    state: CurrentPeriodState,
    action: { type: string; payload?: any }
) {
	switch (action.type) {
		case 'FETCH_CURRENT_WEEK_START':
			return {
				...state,
				error: null
			}
		case 'FETCH_CURRENT_WEEK_SUCCESS':
			return {
				...state,
				...action
			}
		case 'FETCH_CURRENT_WEEK_FAILURE':
			return {
				...state,
				error: action.payload
			}
		default:
			return state
	}
}

export const CurrentPeriodContext = createContext<{
	state: CurrentPeriodState;
	fetchCurrentPeriodWorkouts: () => void;
}>({
	state: initialState,
	fetchCurrentPeriodWorkouts: () => {}
});

export function CurrentPeriodContextProvider({children}: PropsWithChildren<{}>) {
	const [state, dispatch] = useReducer(reducer, initialState)

	const fetchCurrentPeriodWorkouts = useCallback(async () => {
		dispatch({
			type: 'FETCH_CURRENT_WEEK_START'
		});

		try {
			const result = await fetchCurrentPeriod();
			dispatch({
				type: 'FETCH_CURRENT_WEEK_SUCCESS',
				...result,
			});
		} catch (error) {
			const message = error instanceof Error
				? error.message
				: 'Failed to fetch current week!';
			dispatch({
				type: 'FETCH_CURRENT_WEEK_FAILURE',
				payload: message,
			});
		}
	}, [])

	useEffect(() => {
		fetchCurrentPeriodWorkouts()
	}, [])

	return (
		<CurrentPeriodContext value={{state, fetchCurrentPeriodWorkouts}}>
			{children}
		</CurrentPeriodContext>
	)
}