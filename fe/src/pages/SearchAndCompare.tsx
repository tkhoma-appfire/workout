import { Button, Checkbox, Select } from "antd";
import { Suspense, useState } from "react";
import { Await, useLoaderData, type LoaderFunctionArgs } from "react-router-dom";
import type { ExerciseNameOption, WorkoutType } from "@/types";
import WorkoutDetail from "@/components/general/WorkoutDetail";
import WorkoutPieChart from "@/components/general/UI/chart/WorkoutPieChart";
import { BsFlagFill } from "react-icons/bs";
import { MdSearch } from "react-icons/md";
import { apiUrl } from "@/utils/http";
import { loadExerciseOptions } from "@/pages/new_workout/exercisesLoader";

function loadSearchWorkouts(
  selectedIds: string[],
  onlySelected: boolean,
): Promise<WorkoutType[]> {
  const params = new URLSearchParams();
  if (selectedIds.length > 0) {
    params.set("exercises", selectedIds.join(","));
  }
  if (onlySelected && selectedIds.length > 0) {
    params.set("onlySelected", "true");
  }
  const query = params.toString();
  return fetch(apiUrl(`/api/search${query ? `?${query}` : ""}`)).then(
    (response) => {
      if (!response.ok) {
        throw new Response("Not Found", { status: 404 });
      }
      return response.json() as Promise<WorkoutType[]>;
    },
  );
}

function loadFlaggedWorkouts(): Promise<WorkoutType[]> {
  return fetch(apiUrl("/api/flagged")).then((response) => {
    if (!response.ok) {
      throw new Response("Not Found", { status: 404 });
    }
    return response.json() as Promise<WorkoutType[]>;
  });
}

function ExerciseSelectLoading() {
  return (
    <div className="w-[30%] text-center text-slate-500 text-sm py-2">
      Loading exercises…
    </div>
  );
}

function SearchResultsLoading() {
  return (
    <div className="w-full mt-4 pr-2 text-center text-slate-500">
      Loading workouts…
    </div>
  );
}

type SearchWorkoutsSectionProps = {
  initialWorkouts: WorkoutType[];
  workouts: WorkoutType[] | undefined;
};

function SearchWorkoutsSection({
  initialWorkouts,
  workouts,
}: SearchWorkoutsSectionProps) {
  const [rightWorkout, setRightWorkout] = useState<any>(null);
  const [leftWorkout, setLeftWorkout] = useState<any>(null);
  const displayWorkouts = workouts ?? initialWorkouts;

  const selectWorkout = (workout: any, checked: boolean) => {
    if (checked) {
      setRightWorkout(workout);
    } else {
      setLeftWorkout(workout);
    }
  };

  return (
    <>
      <div className="w-full mt-4 pr-2">
        <WorkoutDetail
          workouts={displayWorkouts}
          showCheckbox
          selectWorkout={selectWorkout}
        />
      </div>
      <div className="w-full flex mt-8">
        <div className="flex-1 flex items-center justify-center bg-blue-100">
          <WorkoutPieChart workout={leftWorkout} />
        </div>
        <div className="w-px bg-gray-400"></div>
        <div className="flex-1 flex items-center justify-center bg-green-100">
          <WorkoutPieChart workout={rightWorkout} />
        </div>
      </div>
    </>
  );
}

const SearchAndCompare = () => {
  const { exerciseOptions, initialWorkouts } = useLoaderData() as {
    exerciseOptions: Promise<ExerciseNameOption[]>;
    initialWorkouts: Promise<WorkoutType[]>;
  };
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [onlySelected, setOnlySelected] = useState(false);
  const [workouts, setWorkouts] = useState<WorkoutType[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const data = await loadSearchWorkouts(selectedIds, onlySelected);
      setWorkouts(data);
    } finally {
      setLoading(false);
    }
  };

  const showFlagged = async () => {
    setLoading(true);
    try {
      const data = await loadFlaggedWorkouts();
      setWorkouts(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12">
      <div className="w-full flex justify-evenly items-center">
        <Suspense fallback={<ExerciseSelectLoading />}>
          <Await
            resolve={exerciseOptions}
            errorElement={
              <div className="w-[30%] text-center text-red-600 text-sm">
                Failed to load exercises.
              </div>
            }
          >
            {(options: ExerciseNameOption[]) => (
              <Select
                mode="multiple"
                className="w-[30%] [&_.ant-select-selector]:border-slate-300"
                value={selectedIds}
                onChange={setSelectedIds}
                options={options}
                placeholder="Choose exercises..."
                allowClear
                showSearch
                getPopupContainer={() => document.body}
                filterOption={(input, option) => {
                  const q = input.trim().toLowerCase();
                  if (!q) return true;
                  const label = String(option?.label ?? option?.value ?? "").toLowerCase();
                  const value = String(option?.value ?? "").toLowerCase();
                  return label.includes(q) || value.includes(q);
                }}
              />
            )}
          </Await>
        </Suspense>
        <div className="flex items-center">
          <Checkbox
            checked={onlySelected}
            disabled={selectedIds.length === 0}
            onChange={(e) => setOnlySelected(e.target.checked)}
          >
            Only selected
          </Checkbox>
        </div>
        <Button type="primary" onClick={search} loading={loading}>
          <span className="text-white mr-2">
            <MdSearch />
          </span>
          <span className="text-white">Search</span>
        </Button>
        <Button type="default" onClick={showFlagged} loading={loading}>
          <span className="text-red-600 mr-2">
            <BsFlagFill />
          </span>
          <span className="text-sky-600">Show Flagged</span>
        </Button>
      </div>
      <Suspense fallback={<SearchResultsLoading />}>
        <Await
          resolve={initialWorkouts}
          errorElement={
            <div className="w-full mt-4 pr-2 text-center text-red-600">
              Failed to load search results.
            </div>
          }
        >
          {(initial: WorkoutType[]) => (
            <SearchWorkoutsSection
              initialWorkouts={initial}
              workouts={workouts}
            />
          )}
        </Await>
      </Suspense>
    </div>
  );
};

export default SearchAndCompare;

export function loader(_args: LoaderFunctionArgs) {
  void _args;
  return {
    exerciseOptions: loadExerciseOptions(),
    initialWorkouts: loadSearchWorkouts([], false),
  };
}
