export type ExerciseNameOption = {
  value: string;
  label: string;
};

export type NewWorkoutFormData = {
// metrics    
    time: number;
    calories: number;
    puls: number;
    maxPuls: number;
    intensive: string;
    aero: string;
    anaero: string;
    trainingLoad: number;

// exercises
    exercises: {
        exercise: string;
        weight: number;
    }[];

// basic info
  date: string;
  rounds: string;
  comment: string;
};

export type WorkoutType = {
  exercises: {
    exercise: string;
    weight: number;
    order?: number;
  }[];
  id: any;
  date: any;
  xaxisLabel: string;
  time: any;
  rounds: any;
  comment: any;
  calories?: number;
  puls?: number;
  maxPuls?: number;
  intensive?: string;
  aero?: string;
  anaero?: string;
  trainingLoad?: number;
  favorite?: boolean;
}

export type YearlyWorkoutType = {
  date: string;
  calories: number;
  trainings: number;
  time: number;
  trainingLoad: number;
  xaxisLabel: string;
};

export type WorkoutData = {
  statistics: {
    exerciseTime: string;
    calories: number;
  };
  content: WorkoutType[];
  totalElements: number;
};

export type YearlyWorkoutData = {
  statistics: {
    exerciseTime: string;
    calories: number;
  };
  content: YearlyWorkoutType[];
  totalElements: number;
};

export type YearPageLoaderData = {
  year: number;
  compareYear: number | null;
  current: YearlyWorkoutData;
  comparison: YearlyWorkoutData | null;
};

export type WeekSelectOption = { value: string; label: string };

export type WeekPageLoaderData = WorkoutData & {
  weekSelectOptions: WeekSelectOption[];
  selectedWeekValue: string;
};