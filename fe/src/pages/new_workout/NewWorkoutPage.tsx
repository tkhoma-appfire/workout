import { App } from "antd";
import { useContext, useState } from "react";
import { useLoaderData, useNavigate, useRevalidator } from "react-router-dom";
import StepWorkoutMetrics from "./StepWorkoutMetrics";
import StepExercises from "./StepExercises";
import StepBasicInfo from "./StepBasicInfo";
import type { ExerciseNameOption, NewWorkoutFormData } from "../../types";
import { format, isValid } from 'date-fns'
import { addWorkout, fetchWorkoutTemplate } from "@/utils/http";
import { createDefaultRounds } from "@/utils/rounds";
import { CalendarContext } from "@/context/CalendarContextProvider";
import { CurrentPeriodContext } from "@/context/CurrentPeriodContextProvider";
import WorkoutDateAndTimeFields from "@/components/workout/WorkoutDateAndTimeFields";
import { validateWorkoutStep, validationWarningForStep } from "@/utils/workoutForm";
const steps = ["Workout Metrics", "Exercises", "Basic Info"];

const todayLocal = () => format(new Date(), "yyyy-MM-dd");

const NewWorkoutPage = () => {
  const currentDate = todayLocal();
  const exerciseOptions = useLoaderData() as ExerciseNameOption[];
  const { refreshEvents: refreshCalendarEvents } = useContext(CalendarContext);
  const { fetchCurrentPeriodWorkouts } = useContext(CurrentPeriodContext);
  const { message } = App.useApp();
  const [templateDate, setTemplateDate] = useState(currentDate);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<NewWorkoutFormData>(() => ({
    time: 0,
    calories: 0,
    puls: 0,
    maxPuls: 0,
    intensive: "",
    aero: "",
    anaero: "",
    trainingLoad: 0,
    exercises: [],
    date: currentDate,
    workoutTime: "",
    rounds: createDefaultRounds(),
    comment: "",
  }));

  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const updateField = <K extends keyof NewWorkoutFormData>(
    key: K,
    value: NewWorkoutFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const goNext = () => {
    if (!validateWorkoutStep(currentStep, formData)) {
      message.warning(validationWarningForStep(currentStep));
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = () => {
    if (!validateWorkoutStep(currentStep, formData)) {
      message.warning(validationWarningForStep(currentStep));
      return;
    }

    const payload = {
      ...formData,
      exercises: formData.exercises.map((exercise, index) => ({
        ...exercise,
        order: index + 1,
      })),
    };

    const workoutDate = formData.date;

    message.success("Workout submitted");
    navigate("/month");

    void (async () => {
      try {
        await addWorkout(payload);
        await refreshCalendarEvents({ anchorDate: workoutDate });
        await fetchCurrentPeriodWorkouts();
        revalidator.revalidate();
      } catch {
        message.error("Failed to add workout!");
      }
    })();
  };

  const handleTemplateDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateDate(e.target.value);
  };

  const handleTemplateDateBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (!newDate) {
      return;
    }

    const parsedTemplateDate = new Date(`${newDate}T12:00:00`);
    if (!isValid(parsedTemplateDate)) {
      message.warning("Invalid template date");
      return;
    }

    const templateDateFormatted = format(parsedTemplateDate, "yyyy-MM-dd");
    setTemplateDate(templateDateFormatted);

    try {
      const template = await fetchWorkoutTemplate(templateDateFormatted);
      setFormData((prev) => ({
        ...prev,
        rounds: template.rounds,
        comment: template.comment,
        exercises: template.exercises.map((exercise: { exercise: string; weight: number }) => ({
          exercise: exercise.exercise,
          weight: exercise.weight,
        })),
      }));
    } catch {
      message.warning("Template workout was not found!");
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden px-6 py-8 md:px-12">
      <h2 className="shrink-0 text-2xl font-semibold text-slate-800">Add New Workout</h2>

      <div className="mt-6 grid shrink-0 grid-cols-1 gap-3 md:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;

          return (
            <div
              key={step}
              className={`rounded-lg border px-4 py-3 ${isActive ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white"}`}
            >
              <div className="text-sm text-slate-500">Step {index + 1}</div>
              <div className={`font-medium ${isDone ? "text-sky-700" : "text-slate-800"}`}>{step}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 shrink-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <WorkoutDateAndTimeFields
          formData={formData}
          updateField={updateField}
          showTemplateDate
          templateDate={templateDate}
          onTemplateDateChange={handleTemplateDateChange}
          onTemplateDateBlur={handleTemplateDateBlur}
        />
      </div>

      <div
        id="step-content"
        className={`mt-6 min-h-0 flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${
          currentStep === 1
            ? "flex flex-col overflow-hidden"
            : "overflow-y-auto"
        }`}
      >
        {currentStep === 0 && (
          <StepWorkoutMetrics formData={formData} updateField={updateField} />
        )}
        {currentStep === 1 && (
          <StepExercises
            formData={formData}
            updateField={updateField}
            exerciseOptions={exerciseOptions}
          />
        )}
        {currentStep === 2 && (
          <StepBasicInfo formData={formData} updateField={updateField} />
        )}
      </div>

      <div className="mt-6 flex shrink-0 items-center justify-end gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStep === 0}
          className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        {currentStep < steps.length - 1 && (
          <button
            type="button"
            onClick={goNext}
            className="rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
          >
            Next
          </button>
        )}

        {currentStep === steps.length - 1 && (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            Submit Workout
          </button>
        )}
      </div>
    </div>
  );
};

export default NewWorkoutPage;