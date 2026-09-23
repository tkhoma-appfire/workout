import { useContext, useEffect } from "react";
import { CalendarContext } from "@/context/CalendarContextProvider";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { BsFlagFill } from "react-icons/bs";
import { FirstWorkoutContext } from "@/context/FirstWorkoutContextProvider";
import useHttp from "@/hooks/useHttp";
import { formatLocalDate, isIsoDateString } from "@/utils/date";

type CalendarContextType = {
	state: {
		startDate: string;
		endDate: string;
		events: any[];
		calendarError: string | null;
	};
	fetchEvents: (startDate: string, endDate: string) => Promise<void>;
}

const requestConfig = {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	}
}

const WorkoutCalendar = () => {
  const context: CalendarContextType | undefined = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("WorkoutCalendar must be used within a CalendarContextProvider");
  }
  const { state: calendarState, fetchEvents } = context;
  const firstWorkoutState:
    { state: { firstWorkout: string; error: string | null } } | undefined = useContext(FirstWorkoutContext) 
  const firstWorkout = firstWorkoutState?.state.firstWorkout || '';

  const {
		data: flaggedDays,
		sendRequest: sendFlaggedDayRequest,
	} = useHttp<string[]>(
		"/api/add_flagged",
		requestConfig,
		[],
	);

  const handleDataSet = (arg: { startStr: string; endStr: string }) => {
    let startDateArg = arg.startStr.split('T')[0]
    let endDateArg = arg.endStr.split('T')[0]
    if (calendarState.startDate === startDateArg && calendarState.endDate === endDateArg) {
      return;
    }
    fetchEvents(startDateArg, endDateArg);
  }

  useEffect(() => {
    sendFlaggedDayRequest();
  }, []);

  const dayClickHandler = (dateStr: string) => {
    sendFlaggedDayRequest(dateStr)
  };

  const calendarEvents = Array.isArray(calendarState.events) ? calendarState.events : [];

  const calendarData = calendarEvents.map((event: { trainingLoad: any; calories: any; date: any; }) => ({
		title: `${event.trainingLoad} - ${event.calories}`,
		date: event.date,
		description: `training load: ${event.trainingLoad}\ncalories: ${event.calories}`
	}))

  function renderDayCell(arg: { date: Date; dayNumberText: string }) {
		const dateStr = formatLocalDate(arg.date);
		if (!dateStr) {
			return <div>{arg.dayNumberText}</div>;
		}
		if (flaggedDays.includes(dateStr)) {
			return (
				<div>
					<div
						className="flex items-center cursor-pointer"
						onClick={() => dayClickHandler(dateStr)}
					>
						<span className="text-red-500 mr-2">
							<BsFlagFill />
						</span>
						<span className="text-black">
							{arg.dayNumberText}
						</span>
					</div>
				</div>
			)
		}
		return (
			<div
				className="flex items-center cursor-pointer group"
				onClick={() => dayClickHandler(dateStr)}
			>	
				<span className={`text-yellow-500 mr-2 ${flaggedDays.includes(dateStr) ? '' : 'hidden group-hover:inline'}`}>
					<BsFlagFill />
				</span>
				<span className="text-black">
					{arg.dayNumberText}
				</span>
			</div>
		)
	}

	return (
		<div className="workout-calendar flex-none w-[30rem] mt-6">
			<FullCalendar
				plugins={[dayGridPlugin]}
				initialView="dayGridMonth"
				height="auto"
				firstDay={1}
				events={calendarData}
				dayCellContent={renderDayCell}
				eventColor="#0284c7"
				eventTextColor="#ffffff"
				validRange={isIsoDateString(firstWorkout) ? { start: firstWorkout } : undefined}
				eventDidMount={(info) => {
					info.el.setAttribute('title', info.event.extendedProps.description || '');
				}}
				datesSet={handleDataSet}
			/>
		</div>
  );
};

export default WorkoutCalendar;