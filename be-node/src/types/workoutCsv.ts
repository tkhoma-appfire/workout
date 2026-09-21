export type WorkoutCsv = {
  date: string;
  exercise_time: string;
  calories: string;
  puls: string;
  max_puls: string;
  intensive: string;
  aerobish: string;
  anaerobish: string;
  training_load: string;
  rounds: string;
  comment: string;
  exercises: string;
};

export type ParsedExercise = {
  name: string;
  weight: number;
  order: number;
};

export type WorkoutImport = {
  date: string;
  exerciseTime: number | null;
  calories: number | null;
  puls: number | null;
  maxPuls: number | null;
  intensive: string | null;
  aerobish: string | null;
  anaerobish: string | null;
  trainingLoad: number | null;
  rounds: string | null;
  comment: string | null;
  exercises: ParsedExercise[];
};
