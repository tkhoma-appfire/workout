import type { NewWorkoutFormData } from "../../types";
import { formatMmSsInput, isAllowedMmSsInput } from "@/utils/timeFormat";

type StepWorkoutMetricsProps = {
  formData: NewWorkoutFormData;
  updateField: <K extends keyof NewWorkoutFormData>(
    key: K,
    value: NewWorkoutFormData[K],
  ) => void;
};

const StepWorkoutMetrics = ({ formData, updateField }: StepWorkoutMetricsProps) => {
  const handleTimeChange = (name: "intensive" | "aero" | "anaero", value: string) => {
    if (isAllowedMmSsInput(value)) {
      updateField(name as keyof NewWorkoutFormData, formatMmSsInput(value));
    }
  };

  return (
    <>
    <div className="grid gap-4 grid-cols-2">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Exercise Time</span>
        <input
          type="number"
          min={1}
          value={formData.time}
          onChange={(e) => updateField("time", Number(e.target.value))}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Calories</span>
        <input
          type="number"
          min={1}
          value={formData.calories}
          onChange={(e) => updateField("calories", Number(e.target.value))}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Puls</span>
        <input
          type="number"
          min={0}
          value={formData.puls}
          onChange={(e) => updateField("puls", Number(e.target.value))}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Max Puls</span>
        <input
          type="number"
          min={0}
          value={formData.maxPuls}
          onChange={(e) => updateField("maxPuls", Number(e.target.value))}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Intensive</span>
        <input
          type="text"
          value={formData.intensive}
          onChange={(e) => handleTimeChange("intensive", e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Aero</span>
        <input
          type="text"
          value={formData.aero}
          onChange={(e) => handleTimeChange("aero", e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Anaero</span>
        <input
          type="text"
          value={formData.anaero}
          onChange={(e) => handleTimeChange("anaero", e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Load</span>
        <input
          type="number"
          min={0}
          value={formData.trainingLoad}
          onChange={(e) => updateField("trainingLoad", Number(e.target.value))}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
        />
      </label>
    </div>
    </>
  );
};

export default StepWorkoutMetrics;
