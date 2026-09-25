import WorkoutPieChart from "@/components/general/UI/chart/WorkoutPieChart";
import WorkoutDetail from "@/components/general/WorkoutDetail";
import { Suspense, useState } from "react";
import {
  Await,
  useLoaderData,
  useRevalidator,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { apiUrl } from "@/utils/http";
import type { WorkoutType } from "@/types";

function loadFavorites(): Promise<WorkoutType[]> {
  return fetch(apiUrl("/api/favorites"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Response("Not Found", { status: 404 });
    }
    return response.json() as Promise<WorkoutType[]>;
  });
}

function FavoritesLoading() {
  return (
    <div className="mt-14 w-full pr-2 text-center text-slate-500">
      Loading favorites…
    </div>
  );
}

function FavoritesBody({ favorites }: { favorites: WorkoutType[] }) {
  const { revalidate } = useRevalidator();
  const [rightWorkout, setRightWorkout] = useState<any>(null);
  const [leftWorkout, setLeftWorkout] = useState<any>(null);

  const selectWorkout = (workout: any, checked: boolean) => {
    if (checked) {
      setRightWorkout(workout);
    } else {
      setLeftWorkout(workout);
    }
  };

  return (
    <>
      <div className="w-full mt-14 pr-2">
        <WorkoutDetail
          workouts={favorites}
          showCheckbox
          selectWorkout={selectWorkout}
          refreshWorkouts={revalidate}
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

const Favorite = () => {
  const { favorites } = useLoaderData() as {
    favorites: Promise<WorkoutType[]>;
  };

  return (
    <div className="mx-16">
      <Suspense fallback={<FavoritesLoading />}>
        <Await
          resolve={favorites}
          errorElement={
            <div className="mt-14 w-full pr-2 text-center text-red-600">
              Failed to load favorites.
            </div>
          }
        >
          {(favoriteWorkouts: WorkoutType[]) => (
            <FavoritesBody favorites={favoriteWorkouts} />
          )}
        </Await>
      </Suspense>
    </div>
  );
};

export default Favorite;

export function loader(_args: LoaderFunctionArgs) {
  void _args;
  return {
    favorites: loadFavorites(),
  };
}
