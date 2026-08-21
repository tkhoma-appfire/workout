import { App, Modal } from "antd";
import { useContext, useEffect, useState } from "react";
import StepBasicInfo from "@/pages/new_workout/StepBasicInfo";
import StepExercises from "@/pages/new_workout/StepExercises";
import StepWorkoutMetrics from "@/pages/new_workout/StepWorkoutMetrics";
import type { ExerciseNameOption, NewWorkoutFormData, WorkoutType } from "@/types";
import { CalendarContext } from "@/context/CalendarContextProvider";
import { CurrentPeriodContext } from "@/context/CurrentPeriodContextProvider";
import { editWorkout } from "@/utils/http";
import {
  validateWorkoutStep,
  validationWarningForStep,
  workoutToFormData,
} from "@/utils/workoutForm";

const steps = ["Workout Metrics", "Exercises", "Basic Info"];

type EditWorkoutDialogProps = {
  open: boolean;
  workout: WorkoutType | null;
  onClose: () => void;
  onSaved?: () => void;
};

const EditWorkoutDialog = ({ open, workout, onClose, onSaved }: EditWorkoutDialogProps) => {
  const { message } = App.useApp();
  const { refreshEvents: refreshCalendarEvents } = useContext(CalendarContext);
  const { fetchCurrentPeriodWorkouts } = useContext(CurrentPeriodContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<NewWorkoutFormData>(() => workoutToFormData(null));
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseNameOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCurrentStep(0);
    setFormData(workoutToFormData(workout));
  }, [open, workout]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const loadExerciseOptions = async () => {
      const response = await fetch("/api/exercises", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load exercises");
      }

      const raw: { label: string; value: string }[] = await response.json();
      if (!cancelled) {
        setExerciseOptions(raw.map(({ label, value }) => ({ label, value })));
      }
    };

    loadExerciseOptions().catch(() => {
      if (!cancelled) {
        message.error("Failed to load exercise names");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, message]);

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

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSave = async () => {
    if (!workout?.id) {
      message.error("Workout id is missing");
      return;
    }

    if (!validateWorkoutStep(currentStep, formData)) {
      message.warning(validationWarningForStep(currentStep));
      return;
    }

    setSaving(true);
    try {
      await editWorkout({
        ...formData,
        id: String(workout.id),
        exercises: formData.exercises.map((exercise, index) => ({
          ...exercise,
          order: index + 1,
        })),
      });
      await refreshCalendarEvents();
      await fetchCurrentPeriodWorkouts();
      message.success("Workout updated");
      onSaved?.();
      onClose();
    } catch {
      message.error("Failed to update workout");
    } finally {
      setSaving(false);
    }
  };

  const dialogTitle = workout?.xaxisLabel
    ? `Edit workout — ${workout.xaxisLabel}`
    : "Edit workout";

  return (
    <Modal
      title={dialogTitle}
      open={open}
      onCancel={onClose}
      width={920}
      destroyOnClose
      footer={[
        <button
          key="cancel"
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-300 px-4 py-2 text-slate-700"
        >
          Cancel
        </button>,
        <button
          key="back"
          type="button"
          onClick={goBack}
          disabled={currentStep === 0}
          className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>,
        currentStep < steps.length - 1 ? (
          <button
            key="next"
            type="button"
            onClick={goNext}
            className="rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
          >
            Next
          </button>
        ) : (
          <button
            key="save"
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        ),
      ]}
    >
      <div className="grid shrink-0 grid-cols-1 gap-3 md:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;

          return (
            <div
              key={step}
              className={`rounded-lg border px-4 py-3 ${isActive ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white"}`}
            >
              <div className="text-sm text-slate-500">Step {index + 1}</div>
              <div className={`font-medium ${isDone ? "text-sky-700" : "text-slate-800"}`}>
                {step}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`mt-6 max-h-[28rem] rounded-xl border border-slate-200 bg-white p-6 ${
          currentStep === 1 ? "flex flex-col overflow-hidden" : "overflow-y-auto"
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
    </Modal>
  );
};

export default EditWorkoutDialog;
