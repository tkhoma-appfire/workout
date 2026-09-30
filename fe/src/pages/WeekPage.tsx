import { Suspense, useContext, useMemo } from "react";
import {
  formatWeekPeriodRange,
  parseWeekAnchor,
} from "@/utils/weekPeriodFormat";
import { buildWeekSelectOptions, resolveSelectedWeekValue } from "@/utils/weekSelectorOptions";
import { apiUrl } from "@/utils/http";
import { Await, useLoaderData, useSearchParams } from "react-router-dom";
import type { WorkoutData } from "@/types";
import { formatMonthlyChartData } from "@/utils/utils";
import PeriodStatisticsRow from "@/components/dashboard/PeriodStatisticsRow";
import {
  buildPeriodComparisonLabel,
  emptyWorkoutData,
  previousWeekPeriod,
} from "@/utils/periodComparison";
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

export type WeekPageWorkoutBundle = {
  current: WorkoutData;
  loadComparisonLabel: string;
};

function loadWeekWorkoutsWithComparison(
  startOfPeriod: string,
  weekAnchor: Date,
): Promise<WeekPageWorkoutBundle> {
  const previousPeriod = previousWeekPeriod(weekAnchor);

  return loadWeekWorkouts(startOfPeriod).then(async (current) => {
    const previous = await loadWeekWorkouts(previousPeriod).catch(() => emptyWorkoutData());

    return {
      current,
      loadComparisonLabel: buildPeriodComparisonLabel(current, previous, "last week"),
    };
  });
}

function WeekWorkoutsLoading() {
  return (
    <div className="mt-8 w-full px-16 text-center text-slate-500">
      Loading workouts…
    </div>
  );
}

function WeekWorkoutsBody({ bundle }: { bundle: WeekPageWorkoutBundle }) {
  const { current: workouts, loadComparisonLabel } = bundle;
  const chartData = formatMonthlyChartData(workouts.content);

  const handleSelectBar = (data: unknown) => {
    console.log("Selected bar data:", data);
  };

  return (
    <>
      <PeriodStatisticsRow
        workouts={workouts}
        loadComparisonLabel={loadComparisonLabel}
      />
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
  const { workouts } = useLoaderData() as { workouts: Promise<WeekPageWorkoutBundle> };
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
          {(bundle: WeekPageWorkoutBundle) => <WeekWorkoutsBody bundle={bundle} />}
        </Await>
      </Suspense>
    </div>
  );
};

export function loader(params: { request: Request }) {
  const url = new URL(params.request.url);
  const searchStart = url.searchParams.get("start");
  const weekAnchor = parseWeekAnchor(searchStart);
  const startOfPeriod = formatWeekPeriodRange(weekAnchor);

  return {
    workouts: loadWeekWorkoutsWithComparison(startOfPeriod, weekAnchor),
  };
}

export default WeekPage;
