export type TimePeriod = "WEEK" | "MONTH" | "YEAR" | "ALL";

export type WorkoutsPeriod = {
  timePeriod?: TimePeriod;
  startOfPeriod?: string | number | null;
};

export type ExerciseModel = {
  exercise: string;
  weight: number | null;
  order: number | null;
};

export type SingleWorkoutModel = {
  id: string;
  date: string;
  time: number;
  calories: number | null;
  puls: number | null;
  maxPuls: number | null;
  intensive: string | null;
  aero: string | null;
  anaero: string | null;
  trainingLoad: number | null;
  rounds: string | null;
  comment: string | null;
  exercises: ExerciseModel[];
  favorite: boolean;
  xaxisLabel: string;
};

export type YearlyWorkoutModel = {
  date: string;
  calories: number;
  time: number;
  trainings: number;
  trainingLoad: number;
  xaxisLabel: string;
};

export type WorkoutStatistics = {
  calories: number;
  exerciseTime: string;
};

export type WorkoutsResponse<T> = {
  content: T[];
  statistics: WorkoutStatistics;
  totalElements: number;
};

export type WorkoutFullRow = {
  id: string;
  date: Date;
  exercise_time: number;
  calories: number | null;
  puls: number | null;
  puls_max: number | null;
  intensive: string | null;
  aero: string | null;
  anaero: string | null;
  tl: number | null;
  rounds: string | null;
  comment: string | null;
  weight: number | null;
  ex_order: number | null;
  name: string | null;
  favorite: boolean | null;
};

export type DateRange = {
  startDate: string;
  endDate: string;
};
