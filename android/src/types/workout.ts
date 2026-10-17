export type WorkoutType = {
  exercises: {
    exercise: string;
    weight: number;
    order?: number;
  }[];
  id: unknown;
  date: unknown;
  xaxisLabel: string;
  time: unknown;
  rounds: unknown;
  comment: unknown;
  calories?: number;
  trainingLoad?: number;
};

export type WorkoutData = {
  statistics: {
    exerciseTime: string;
    calories: number;
  };
  content: WorkoutType[];
  totalElements: number;
};

export type FirstWorkoutDateResponse = {
  firstDate: string;
};
