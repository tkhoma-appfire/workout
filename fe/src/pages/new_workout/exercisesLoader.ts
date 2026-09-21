import type { LoaderFunctionArgs } from "react-router-dom";
import type { ExerciseNameOption } from "@/types";
import { apiUrl } from "@/utils/http";

export async function exercisesLoader(
  args: LoaderFunctionArgs,
): Promise<ExerciseNameOption[]> {
  void args;
  const response = await fetch(apiUrl("/api/exercises"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Response("Not Found", { status: 404 });
  const raw: { label: string; value: string }[] = await response.json();
  return raw.map(({ label, value }) => ({
    value,
    label,
  }));
}
