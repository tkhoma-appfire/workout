import { formatGroupedNumber } from "@/utils/utils";
import type { WorkoutData } from "@/types";

type PeriodStatisticsRowProps = {
  workouts: WorkoutData;
  loadComparisonLabel: string;
};

export default function PeriodStatisticsRow({
  workouts,
  loadComparisonLabel,
}: PeriodStatisticsRowProps) {
  return (
    <div className="mt-4 w-full px-8 sm:px-16">
      <div className="flex flex-wrap items-center justify-evenly gap-x-4 gap-y-2 font-semibold text-lg">
        <div className="whitespace-nowrap">{workouts.statistics.exerciseTime}</div>
        <div className="whitespace-nowrap">
          {formatGroupedNumber(workouts.statistics.calories)} ccal
        </div>
        <div className="whitespace-nowrap">{workouts.totalElements} workouts</div>
      </div>
      <p className="mt-2 text-center text-base font-medium text-sky-700">
        {loadComparisonLabel}
      </p>
    </div>
  );
}
