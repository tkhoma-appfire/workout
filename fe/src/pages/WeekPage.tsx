import {
  formatWeekPeriodRange,
  parseWeekAnchor,
} from "@/utils/weekPeriodFormat";
import { buildWeekSelectOptions, resolveSelectedWeekValue } from "@/utils/weekSelectorOptions";
import { fetchFirstWorkoutDate } from "@/utils/http";
import { useLoaderData, useSearchParams } from "react-router-dom";
import type { WeekPageLoaderData } from "@/types";
import { formatMonthlyChartData, formatGroupedNumber } from "@/utils/utils";
import WorkoutDetail from "@/components/general/WorkoutDetail";
import WorkoutBarChart from "@/components/general/UI/chart/WorkoutBarChart";
import WeekSelector from "@/components/dashboard/WeekSelector";

const WeekPage = () => {
  const [, setSearchParams] = useSearchParams();
  const {
    weekSelectOptions,
    selectedWeekValue,
    ...workouts
  }: WeekPageLoaderData = useLoaderData();

  const chartData = formatMonthlyChartData(workouts.content);

  const handleSelectBar = (data: any) => {
    console.log("Selected bar data:", data);
  };
  
  return (
    <div className="w-full flex flex-col items-center">
      <WeekSelector
        options={weekSelectOptions}
        value={selectedWeekValue}
        onChange={(newWeek: string) => {
          setSearchParams((prevParams: URLSearchParams) => {
            const m = newWeek.match(/^\d{1,2}\.\d{1,2}(\.\d{2})?/);
            const nextParams = new URLSearchParams(prevParams);
            if (m) {
              nextParams.set("start", m[0]);
            } else {
              nextParams.set("start", '');
            }
            return nextParams;
          });
        }}
      />
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
    </div>
  )
};

export default WeekPage;

export async function loader(params: { request: Request }) {
  const url = new URL(params.request.url);
  const searchStart = url.searchParams.get("start");
  const startOfPeriod = formatWeekPeriodRange(parseWeekAnchor(searchStart));

  const [{ firstDate: firstWorkoutDate }, response] = await Promise.all([
    fetchFirstWorkoutDate(),
    fetch("/api/workouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timePeriod: "WEEK",
        startOfPeriod,
      }),
    }),
  ]);

  if (!response.ok) throw new Response("Not Found", { status: 404 });

  const { weekOptions, selectOptions } = buildWeekSelectOptions(firstWorkoutDate);
  const data = await response.json();

  return {
    ...data,
    weekSelectOptions: selectOptions,
    selectedWeekValue: resolveSelectedWeekValue(weekOptions, searchStart),
  } satisfies WeekPageLoaderData;
}