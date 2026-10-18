import type { NewWorkoutFormData } from "@/types";
import { formatMmSsInput, isAllowedMmSsInput } from "@/utils/timeFormat";

type WorkoutDateAndTimeFieldsProps = {
  formData: NewWorkoutFormData;
  updateField: <K extends keyof NewWorkoutFormData>(
    key: K,
    value: NewWorkoutFormData[K],
  ) => void;
  showTemplateDate?: boolean;
  templateDate?: string;
  onTemplateDateChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTemplateDateBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

const WorkoutDateAndTimeFields = ({
  formData,
  updateField,
  showTemplateDate = false,
  templateDate,
  onTemplateDateChange,
  onTemplateDateBlur,
}: WorkoutDateAndTimeFieldsProps) => {
  const handleWorkoutTimeChange = (value: string) => {
    if (isAllowedMmSsInput(value)) {
      updateField("workoutTime", formatMmSsInput(value));
    }
  };

  return (
    <div className="text-sm text-slate-600 grid grid-cols-1 gap-4 px-16 md:grid-cols-3">
      <label className="flex flex-col gap-2 w-full max-w-xs">
        <span className="text-sm font-medium text-slate-700">Workout Date</span>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => updateField("date", e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
        />
      </label>
      <label className="flex flex-col gap-2 w-full max-w-xs">
        <span className="text-sm font-medium text-slate-700">Workout Time</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="mm:ss"
          value={formData.workoutTime}
          onChange={(e) => handleWorkoutTimeChange(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
        />
      </label>
      {showTemplateDate ? (
        <label className="flex flex-col gap-2 w-full max-w-xs">
          <span className="text-sm font-medium text-slate-700">Template Workout Date</span>
          <input
            type="date"
            value={templateDate}
            onChange={onTemplateDateChange}
            onBlur={onTemplateDateBlur}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
          />
        </label>
      ) : null}
    </div>
  );
};

export default WorkoutDateAndTimeFields;
