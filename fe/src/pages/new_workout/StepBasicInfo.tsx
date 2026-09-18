import RoundsInput from "@/components/workout/RoundsInput";
import type { NewWorkoutFormData } from "../../types";

type StepBasicInfoProps = {
  formData: NewWorkoutFormData;
  updateField: <K extends keyof NewWorkoutFormData>(
    key: K,
    value: NewWorkoutFormData[K],
  ) => void;
};

const StepBasicInfo = ({ formData, updateField }: StepBasicInfoProps) => {
  return (
    <>
    <div className="grid grid-cols-1 px-16">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Rounds</span>
        <RoundsInput
          value={formData.rounds}
          onChange={(rounds) => updateField("rounds", rounds)}
        />
      </div>
    </div>
    <div className="grid grid-cols-1 px-16 mt-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Comment</span>
        <textarea
          value={formData.comment}
          onChange={(e) => updateField("comment", e.target.value)}
          rows={4}
          placeholder="e.g. добавляти 2к..."
          className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
        />
      </label>
    </div>
    </>
  );
};

export default StepBasicInfo;
