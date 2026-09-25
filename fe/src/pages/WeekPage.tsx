import { Suspense, useContext, useMemo } from "react";
import {
  formatWeekPeriodRange,
  parseWeekAnchor,
} from "@/utils/weekPeriodFormat";
import { buildWeekSelectOptions, resolveSelectedWeekValue } from "@/utils/weekSelectorOptions";
import { apiUrl } from "@/utils/http";
import { Await, useLoaderData, useSearchParams } from "react-router-dom";
import type { WorkoutData } from "@/types";
import { formatMonthlyChartData, formatGroupedNumber } from "@/utils/utils";
import WorkoutDetail from "@/components/general/WorkoutDetail";
import WorkoutBarChart from "@/components/general/UI/chart/WorkoutBarChart";
import WeekSelector from "@/components/dashboard/WeekSelector";
import { FirstWorkoutContext } from "@/context/FirstWorkoutContextProvider";

function loadWeekWorkouts(startOfPeriod: string): Promise<WorkoutData> {
  return fetch(apiUrl("/api/workouts"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timePeriod: "WEEK",
      startOfPeriod,
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Response("Not Found", { status: 404 });
    }

    return response.json() as Promise<WorkoutData>;
  });
}

function WeekWorkoutsLoading() {
  return (
    <div className="mt-8 w-full px-16 text-center text-slate-500">
      Loading workouts…
    </div>
  );
}

function WeekWorkoutsBody({ workouts }: { workouts: WorkoutData }) {
  const chartData = formatMonthlyChartData(workouts.content);

  const handleSelectBar = (data: unknown) => {
    console.log("Selected bar data:", data);
  };

  return (
    <>
      <div className="flex justify-evenly w-full font-semibold text-lg px-16 mt-4">
        <div className="whitespace-nowrap">{workouts.statistics.exerciseTime}</div>
        <div className="whitespace-nowrap">{formatGroupedNumber(workouts.statistics.calories)} ccal</div>
        <div className="whitespace-nowrap">{workouts.totalElements} workouts</div>
      </div>
      <div className="w-full mt-4 pr-2">
        <WorkoutBarChart
          payload={chartData}
          onBarClick={handleSelectBar}
        />
      </div>
      <div className="w-full mt-4 pr-2">
        <WorkoutDetail
          workouts={workouts.content}
          selectWorkout={handleSelectBar}
        />
      </div>
    </>
  );
}

const WeekPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { workouts } = useLoaderData() as { workouts: Promise<WorkoutData> };
  const firstWorkoutState = useContext(FirstWorkoutContext);
  const firstWorkout = firstWorkoutState?.state.firstWorkout ?? "";
  const searchStart = searchParams.get("start");

  const { selectOptions, weekOptions } = useMemo(
    () => buildWeekSelectOptions(firstWorkout),
    [firstWorkout],
  );

  const selectedWeekValue = useMemo(
    () => resolveSelectedWeekValue(weekOptions, searchStart),
    [weekOptions, searchStart],
  );

  return (
    <div className="w-full flex flex-col items-center">
      <WeekSelector
        options={selectOptions}
        value={selectedWeekValue}
        onChange={(newWeek: string) => {
          setSearchParams((prevParams: URLSearchParams) => {
            const m = newWeek.match(/^\d{1,2}\.\d{1,2}(\.\d{2})?/);
            const nextParams = new URLSearchParams(prevParams);
            if (m) {
              nextParams.set("start", m[0]);
            } else {
              nextParams.set("start", "");
            }
            return nextParams;
          });
        }}
      />
      <Suspense fallback={<WeekWorkoutsLoading />}>
        <Await
          resolve={workouts}
          errorElement={
            <div className="mt-8 w-full px-16 text-center text-red-600">
              Failed to load workouts for this week.
            </div>
          }
        >
          {(workoutData: WorkoutData) => <WeekWorkoutsBody workouts={workoutData} />}
        </Await>
      </Suspense>
    </div>
  );
};

export function loader(params: { request: Request }) {
  const url = new URL(params.request.url);
  const searchStart = url.searchParams.get("start");
  const startOfPeriod = formatWeekPeriodRange(parseWeekAnchor(searchStart));

  return {
    workouts: loadWeekWorkouts(startOfPeriod),
  };
}

export default WeekPage;
