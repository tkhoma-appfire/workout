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
import { formatMonthlyChartData, formatGroupedNumber } from "@/utils/utils";
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

function MonthWorkoutsLoading() {
  return (
    <div className="mt-8 w-full px-16 text-center text-slate-500">
      Loading workouts…
    </div>
  );
}

function MonthWorkoutsBody({ workouts }: { workouts: WorkoutData }) {
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
      <div className="flex justify-evenly w-full font-semibold text-lg px-16 mt-4">
        <div className="whitespace-nowrap">{workouts.statistics.exerciseTime}</div>
        <div className="whitespace-nowrap">{formatGroupedNumber(workouts.statistics.calories)} ccal</div>
        <div className="whitespace-nowrap">{workouts.totalElements} workouts</div>
      </div>
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
  const { workouts } = useLoaderData() as { workouts: Promise<WorkoutData> };

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
          {(workoutData: WorkoutData) => <MonthWorkoutsBody workouts={workoutData} />}
        </Await>
      </Suspense>
    </div>
  );
};

export function loader(params: { request: Request }) {
  const url = new URL(params.request.url);
  const startOfPeriod = normalizeStartOfPeriod(url.searchParams.get("start"));

  return {
    workouts: loadMonthWorkouts(startOfPeriod),
  };
}

export default MonthPage;
