import WorkoutPieChart from "@/components/general/UI/chart/WorkoutPieChart";
import WorkoutDetail from "@/components/general/WorkoutDetail";
import { useState } from "react";
import { useLoaderData, useRevalidator, type LoaderFunctionArgs } from "react-router-dom";
import { apiUrl } from "@/utils/http";

const Favorite = () => {
  const favorites = useLoaderData() as any[];
  const { revalidate } = useRevalidator();
  const [rightWorkout, setRightWorkout] = useState(null);
  const [leftWorkout, setLeftWorkout] = useState(null);

  const selectWorkout = (workout: any, checked: boolean) => {
    if (checked) {
      setRightWorkout(workout);
    } else {
      setLeftWorkout(workout);
    }
  };

  return (
    <div className="mx-16">
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
    </div>
  );
};

export default Favorite;

export async function loader(
  _args: LoaderFunctionArgs,
): Promise<any[]> {
  const response = await fetch(apiUrl("/api/favorites"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Response("Not Found", { status: 404 });
  return (await response.json()) as any[];
}