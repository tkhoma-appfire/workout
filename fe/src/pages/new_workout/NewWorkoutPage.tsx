import { App } from "antd";
import { useContext, useState } from "react";
import { useLoaderData, useNavigate, useRevalidator } from "react-router-dom";
import StepWorkoutMetrics from "./StepWorkoutMetrics";
import StepExercises from "./StepExercises";
import StepBasicInfo from "./StepBasicInfo";
import type { ExerciseNameOption, NewWorkoutFormData } from "../../types";
import { format, isValid } from 'date-fns'
import { addWorkout, fetchWorkoutTemplate } from "@/utils/http";
import { createDefaultRounds, isValidRounds } from "@/utils/rounds";
import { CalendarContext } from "@/context/CalendarContextProvider";
import { CurrentPeriodContext } from "@/context/CurrentPeriodContextProvider";
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

  const validateStep = () => {
    if (currentStep === 0) {
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
    if (currentStep === 1) {
      return formData.exercises.length > 0 && formData.exercises.every((e) => e.exercise.trim() !== "" && e.weight >= 0);
    }
    if (currentStep === 2) {
      return formData.date.trim() !== "" && isValidRounds(formData.rounds) && formData.comment.trim() !== "";
    }
    return true;
  };

  const validationWarningForStep = (step: number) => {
    switch (step) {
      case 0:
        return "Enter workout metrics: positive time, calories, pulses, all intensity fields, and training load.";
      case 1:
        return "Complete the exercises step before continuing.";
      case 2:
        return "Fill in required basic info before submitting.";
      default:
        return "Please complete this step before continuing.";
    }
  };

  const goNext = () => {
    if (!validateStep()) {
      message.warning(validationWarningForStep(currentStep));
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = () => {
    if (!validateStep()) {
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

    message.success("Workout submitted");
    navigate("/month");

    void (async () => {
      try {
        await addWorkout(payload);
        await refreshCalendarEvents();
        await fetchCurrentPeriodWorkouts();
        revalidator.revalidate();
      } catch {
        message.error("Failed to add workout!");
      }
    })();
  };

  const changeTemplateDateHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const parsedTemplateDate = new Date(`${newDate}T12:00:00`);
    if (!isValid(parsedTemplateDate)) {
      message.warning("Invalid template date");
      return;
    }
    const templateDateFormatted = format(parsedTemplateDate, 'yyyy-MM-dd');
    setTemplateDate(templateDateFormatted);
    try {
      const template = await fetchWorkoutTemplate(templateDateFormatted);
      formData.rounds = template.rounds;
      formData.comment = template.comment;
      formData.exercises = template.exercises.map((e: { exercise: string, weight: number }) => ({
        exercise: e.exercise,
        weight: e.weight,
      }));
    } catch (error) {
      message.warning("Template workout was not found!");
      return;
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
        <div className="text-sm text-slate-600 grid grid-cols-2 gap-4 px-16">
          <label className="flex flex-col gap-2 w-[80%]">
            <span className="text-sm font-medium text-slate-700">Workout Date</span>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
            />
          </label>
          <label className="flex flex-col gap-2 w-[80%]">
              <span className="text-sm font-medium text-slate-700">Template Workout Date</span>
              <input
              type="date"
              value={templateDate}
              onChange={changeTemplateDateHandler}
              className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
              />
          </label>
        </div>
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