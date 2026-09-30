import { createContext, useCallback, useEffect, useReducer, useRef } from 'react'
import { fetchCalendarEvents } from '@/utils/http'
import { isIsoDateString } from '@/utils/date'
import {
  resolveCalendarEventRange,
  type CalendarRefreshOptions,
} from '@/utils/calendarRefresh'
import type { PropsWithChildren } from 'react';

type CalendarState = {
	startDate: string;
	endDate: string;
	events: any[];
	calendarError: string | null;
};

type VisibleRange = {
	startDate: string;
	endDate: string;
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
	refreshEvents: (options?: CalendarRefreshOptions) => Promise<void>;
	syncVisibleRange: (startDate: string, endDate: string) => void;
}>({
	state: initialState,
	fetchEvents: async () => {},
	refreshEvents: async () => {},
	syncVisibleRange: () => {},
});

export function CalendarContextProvider({children}: PropsWithChildren<{}>) {
	const [state, dispatch] = useReducer(reducer, initialState)
	const stateRef = useRef(state);
	stateRef.current = state;

	const visibleRangeRef = useRef<VisibleRange>({ startDate: '', endDate: '' });

	const syncVisibleRange = useCallback((startDate: string, endDate: string) => {
		if (!isIsoDateString(startDate) || !isIsoDateString(endDate)) {
			return;
		}

		visibleRangeRef.current = { startDate, endDate };
	}, []);

	useEffect(() => {
		const { startDate, endDate } = state;
		if (isIsoDateString(startDate) && isIsoDateString(endDate)) {
			visibleRangeRef.current = { startDate, endDate };
		}
	}, [state.startDate, state.endDate]);

	const fetchEvents = useCallback(async (startDate: string, endDate: string) => {
		if (!isIsoDateString(startDate) || !isIsoDateString(endDate)) {
			return;
		}

		syncVisibleRange(startDate, endDate);

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
	}, [state.startDate, state.endDate, syncVisibleRange]);

	const refreshEventsImpl = useCallback(async (options?: CalendarRefreshOptions) => {
		const range = resolveCalendarEventRange(
			options,
			visibleRangeRef.current,
			stateRef.current,
		);
		if (!range) {
			return;
		}

		const { startDate, endDate } = range;
		syncVisibleRange(startDate, endDate);
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
	}, [syncVisibleRange]);

	const refreshEventsRef = useRef(refreshEventsImpl);
	refreshEventsRef.current = refreshEventsImpl;

	const refreshEvents = useCallback((options?: CalendarRefreshOptions) => {
		return refreshEventsRef.current(options);
	}, []);

	return (
		<CalendarContext value={{state, fetchEvents, refreshEvents, syncVisibleRange}}>
			{children}
		</CalendarContext>
	)
}
