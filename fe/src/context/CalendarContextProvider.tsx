import { createContext, useCallback, useReducer } from 'react'
import { fetchCalendarEvents } from '@/utils/http'
import type { PropsWithChildren } from 'react';

type CalendarState = {
	startDate: string;
	endDate: string;
	events: any[];
	calendarError: string | null;
};

const initialState: CalendarState = {
	startDate: '',
	endDate: '',
	events: [],
	calendarError: null
};

function reducer(
	state: CalendarState,
	action: { type: string; payload?: any; startDate?: string; endDate?: string }
): CalendarState {
	switch (action.type) {
		case 'FETCH_START':
			return {
				...state,
				calendarError: null,
				startDate: action.startDate || state.startDate,
				endDate: action.endDate || state.endDate,
			};
		case 'FETCH_SUCCESS':
			return {
				...state,
				events: Array.isArray(action.payload) ? action.payload : [],
			};
		case 'FETCH_FAILURE':
			return { ...state, calendarError: action.payload };
		default:
			return state;
	}
}

export const CalendarContext = createContext<{
	state: CalendarState;
	fetchEvents: (startDate: string, endDate: string) => Promise<void>;
	refreshEvents: () => Promise<void>;
}>({
	state: initialState,
	fetchEvents: async () => {},
	refreshEvents: async () => {}
});

export function CalendarContextProvider({children}: PropsWithChildren<{}>) {
	const [state, dispatch] = useReducer(reducer, initialState)

	const fetchEvents = useCallback(async (startDate: string, endDate: string) => {
		if (!startDate || !endDate) {
			return;
		}

		const inputDate = new Date(`${startDate}T12:00:00`);
		if (Number.isNaN(inputDate.getTime())) {
			return;
		}

		const today = new Date();
		today.setHours(23, 59, 59, 999);

		if (state.startDate === startDate && state.endDate === endDate ||
				inputDate > today ) {
			return
		}
		dispatch({ type: 'FETCH_START', startDate, endDate })

		try {
			const result = await fetchCalendarEvents(startDate, endDate);
			dispatch({ type: 'FETCH_SUCCESS', payload: result });
		} catch (error) {
			const message = error instanceof Error
				? error.message
				: 'Failed to fetch calendar events!';
			dispatch({ type: 'FETCH_FAILURE', payload: message });
		}
	}, [state.startDate, state.endDate]);

	const refreshEvents = useCallback(async () => {
		const { startDate, endDate } = state;
		if (!startDate || !endDate) {
			return;
		}

		dispatch({ type: 'FETCH_START', startDate, endDate });

		try {
			const result = await fetchCalendarEvents(startDate, endDate);
			dispatch({ type: 'FETCH_SUCCESS', payload: result });
		} catch (error) {
			const message = error instanceof Error
				? error.message
				: 'Failed to fetch calendar events!';
			dispatch({ type: 'FETCH_FAILURE', payload: message });
		}
	}, [state.startDate, state.endDate]);

	return (
		<CalendarContext value={{state, fetchEvents, refreshEvents}}>
			{children}
		</CalendarContext>
	)
}
