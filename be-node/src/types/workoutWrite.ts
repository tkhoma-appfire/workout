export type WorkoutWriteExercise = {
  exercise: string;
  weight: number;
  order?: number;
};

export type WorkoutWritePayload = {
  id?: string;
  date: string;
  time: number;
  calories: number;
  puls: number;
  maxPuls: number;
  intensive: string;
  aero: string;
  anaero: string;
  trainingLoad: number;
  rounds: string;
  comment: string;
  exercises: WorkoutWriteExercise[];
};
