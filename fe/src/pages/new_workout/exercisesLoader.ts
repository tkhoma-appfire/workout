import type { LoaderFunctionArgs } from "react-router-dom";
import type { ExerciseNameOption } from "@/types";
import { apiUrl } from "@/utils/http";

export function loadExerciseOptions(): Promise<ExerciseNameOption[]> {
  return fetch(apiUrl("/api/exercises"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Response("Not Found", { status: 404 });
    }
    return response.json() as Promise<{ label: string; value: string }[]>;
  }).then((raw) =>
    raw.map(({ label, value }) => ({
      value,
      label,
    })),
  );
}

export async function exercisesLoader(
  args: LoaderFunctionArgs,
): Promise<ExerciseNameOption[]> {
  void args;
  return loadExerciseOptions();
}
