import { Suspense, useContext, useState } from "react";
import { FirstWorkoutContext } from "@/context/FirstWorkoutContextProvider";
import MonthSelector from "@/components/dashboard/MonthSelector";
import {
  Await,
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import WorkoutBarChart from "@/components/general/UI/chart/WorkoutBarChart";
import { formatMonthlyChartData } from "@/utils/utils";
import PeriodStatisticsRow from "@/components/dashboard/PeriodStatisticsRow";
import {
  formatLoadComparisonLabel,
  previousMonthPeriod,
  totalTrainingLoad,
} from "@/utils/periodComparison";
import type { WorkoutData, WorkoutType } from "@/types";
import WorkoutDetail from "@/components/general/WorkoutDetail";
import EditWorkoutDialog from "@/components/workout/EditWorkoutDialog";
import { apiUrl } from "@/utils/http";
import { resolveWorkoutSelection } from "@/utils/workoutForm";

const formatMonthValue = (date: Date) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);

const normalizeStartOfPeriod = (startParam: string | null) => {
  if (!startParam) {
    return formatMonthValue(new Date());
  }

  const parsed = new Date(`1 ${startParam}`);
  if (Number.isNaN(parsed.getTime())) {
    return formatMonthValue(new Date());
  }

  return formatMonthValue(parsed);
};

function loadMonthWorkouts(startOfPeriod: string): Promise<WorkoutData> {
  return fetch(apiUrl("/api/workouts"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timePeriod: "MONTH",
      startOfPeriod,
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Response("Not Found", { status: 404 });
    }

    return response.json() as Promise<WorkoutData>;
  });
}

export type MonthPageWorkoutBundle = {
  current: WorkoutData;
  loadComparisonLabel: string | null;
};

function loadMonthWorkoutsWithComparison(
  startOfPeriod: string,
): Promise<MonthPageWorkoutBundle> {
  const previousPeriod = previousMonthPeriod(startOfPeriod);

  return Promise.all([
    loadMonthWorkouts(startOfPeriod),
    loadMonthWorkouts(previousPeriod),
  ]).then(([current, previous]) => ({
    current,
    loadComparisonLabel: formatLoadComparisonLabel(
      totalTrainingLoad(current.content),
      totalTrainingLoad(previous.content),
      "last month",
    ),
  }));
}

function MonthWorkoutsLoading() {
  return (
    <div className="mt-8 w-full px-16 text-center text-slate-500">
      Loading workouts…
    </div>
  );
}

function MonthWorkoutsBody({ bundle }: { bundle: MonthPageWorkoutBundle }) {
  const { current: workouts, loadComparisonLabel } = bundle;
  const revalidator = useRevalidator();
  const [editOpen, setEditOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutType | null>(null);

  const chartData = formatMonthlyChartData(workouts.content);

  const openEditDialog = (selection: unknown) => {
    const workout = resolveWorkoutSelection(selection, workouts.content);
    if (!workout) {
      return;
    }
    setEditingWorkout(workout);
    setEditOpen(true);
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
          onBarClick={openEditDialog}
        />
      </div>
      <div className="w-full mt-4 pr-2">
        <WorkoutDetail
          workouts={workouts.content}
          selectWorkout={openEditDialog}
        />
      </div>
      <EditWorkoutDialog
        open={editOpen}
        workout={editingWorkout}
        onClose={() => {
          setEditOpen(false);
          setEditingWorkout(null);
        }}
        onSaved={() => revalidator.revalidate()}
      />
    </>
  );
}

const MonthPage = () => {
  const firstWorkoutState:
  {
    state:{
      firstWorkout: string;
      error: string | null
    }
  } | undefined = useContext(FirstWorkoutContext);
  const firstWorkout = firstWorkoutState?.state.firstWorkout || '';
  const [searchParams, setSearchParams] = useSearchParams();
  const { workouts } = useLoaderData() as { workouts: Promise<MonthPageWorkoutBundle> };

  return (
    <div className="w-full flex flex-col items-center">
      <MonthSelector
        value={normalizeStartOfPeriod(searchParams.get("start"))}
        onChange={(newMonth: string) => {
          setSearchParams((prevParams: URLSearchParams) => {
            const nextParams = new URLSearchParams(prevParams);
            nextParams.set("start", newMonth);
            return nextParams;
          });
        }}
        startDate={firstWorkout}
      />
      <Suspense fallback={<MonthWorkoutsLoading />}>
        <Await
          resolve={workouts}
          errorElement={
            <div className="mt-8 w-full px-16 text-center text-red-600">
              Failed to load workouts for this month.
            </div>
          }
        >
          {(bundle: MonthPageWorkoutBundle) => <MonthWorkoutsBody bundle={bundle} />}
        </Await>
      </Suspense>
    </div>
  );
};

export function loader(params: { request: Request }) {
  const url = new URL(params.request.url);
  const startOfPeriod = normalizeStartOfPeriod(url.searchParams.get("start"));

  return {
    workouts: loadMonthWorkoutsWithComparison(startOfPeriod),
  };
}

export default MonthPage;
