export class WorkoutExistsError extends Error {
  constructor(date: string) {
    super(`Workout already is present for: ${date}`);
    this.name = "WorkoutExistsError";
  }
}

export class WorkoutNotFoundError extends Error {
  constructor() {
    super("Can't find workout");
    this.name = "WorkoutNotFoundError";
  }
}
