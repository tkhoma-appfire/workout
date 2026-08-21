import type { NewWorkoutFormData, WorkoutType } from "@/types";

type WorkoutLike = Partial<WorkoutType> & {
  payload?: Partial<WorkoutType>;
};

const emptyFormData = (): NewWorkoutFormData => ({
  time: 0,
  calories: 0,
  puls: 0,
  maxPuls: 0,
  intensive: "",
  aero: "",
  anaero: "",
  trainingLoad: 0,
  exercises: [],
  date: "",
  rounds: "",
  comment: "",
});

export function resolveWorkoutSelection(
  selection: unknown,
  workouts: WorkoutType[],
): WorkoutType | null {
  if (!selection || typeof selection !== "object") {
    return null;
  }

  const item = selection as WorkoutLike;
  const payload = item.payload ?? item;
  const id = payload.id;
  const date = payload.date;

  if (id != null) {
    const byId = workouts.find((workout) => workout.id === id);
    if (byId) {
      return byId;
    }
  }

  if (date != null) {
    const byDate = workouts.find((workout) => workout.date === date);
    if (byDate) {
      return byDate;
    }
  }

  if (payload.id != null || payload.date != null) {
    return payload as WorkoutType;
  }

  return null;
}

export function workoutToFormData(workout: WorkoutType | null): NewWorkoutFormData {
  if (!workout) {
    return emptyFormData();
  }

  const exercises = [...(workout.exercises ?? [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((exercise) => ({
      exercise: exercise.exercise ?? "",
      weight: Number(exercise.weight ?? 0),
    }));

  return {
    time: Number(workout.time ?? 0),
    calories: Number(workout.calories ?? 0),
    puls: Number(workout.puls ?? 0),
    maxPuls: Number(workout.maxPuls ?? 0),
    intensive: workout.intensive ?? "",
    aero: workout.aero ?? "",
    anaero: workout.anaero ?? "",
    trainingLoad: Number(workout.trainingLoad ?? 0),
    exercises,
    date: String(workout.date ?? ""),
    rounds: workout.rounds ?? "",
    comment: workout.comment ?? "",
  };
}

export function validateWorkoutStep(
  step: number,
  formData: NewWorkoutFormData,
): boolean {
  if (step === 0) {
    return (
      formData.time > 0
      && formData.calories > 0
      && formData.puls > 0
      && formData.maxPuls > 0
      && formData.intensive.trim() !== ""
      && formData.aero.trim() !== ""
      && formData.anaero.trim() !== ""
      && formData.trainingLoad >= 0
    );
  }

  if (step === 1) {
    return (
      formData.exercises.length > 0
      && formData.exercises.every(
        (exercise) => exercise.exercise.trim() !== "" && exercise.weight >= 0,
      )
    );
  }

  if (step === 2) {
    return (
      formData.date.trim() !== ""
      && formData.rounds.trim() !== ""
      && formData.comment.trim() !== ""
    );
  }

  return true;
}

export function validationWarningForStep(step: number): string {
  switch (step) {
    case 0:
      return "Enter workout metrics: positive time, calories, pulses, all intensity fields, and training load.";
    case 1:
      return "Complete the exercises step before continuing.";
    case 2:
      return "Fill in required basic info before saving.";
    default:
      return "Please complete this step before continuing.";
  }
}
