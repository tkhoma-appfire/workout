import { useEffect, useState } from "react";
import type { WorkoutData } from "@/types";
import {
  buildPeriodComparisonLabel,
  emptyWorkoutData,
  previousMonthPeriod,
  previousWeekPeriod,
} from "@/utils/periodComparison";
import { parseWeekAnchor } from "@/utils/weekPeriodFormat";

type PeriodMode = "month" | "week";

export function usePeriodComparisonLabel(
  current: WorkoutData,
  mode: PeriodMode,
  periodKey: string,
  loadPeriod: (startOfPeriod: string) => Promise<WorkoutData>,
  versusLabel: string,
): string {
  const [label, setLabel] = useState(() =>
    buildPeriodComparisonLabel(current, emptyWorkoutData(), versusLabel),
  );

  useEffect(() => {
    let cancelled = false;

    const previousPeriod = mode === "month"
      ? previousMonthPeriod(periodKey)
      : previousWeekPeriod(parseWeekAnchor(periodKey));

    void loadPeriod(previousPeriod)
      .catch(() => emptyWorkoutData())
      .then((previous) => {
        if (cancelled) {
          return;
        }
        setLabel(buildPeriodComparisonLabel(current, previous, versusLabel));
      });

    return () => {
      cancelled = true;
    };
  }, [current, mode, periodKey, versusLabel]);

  return label;
}
