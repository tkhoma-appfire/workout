import YearSelector from "@/components/dashboard/YearSelector";
import { Button, Tabs } from "antd";
import { useContext, useMemo, useState } from "react";
import { FirstWorkoutContext } from "@/context/FirstWorkoutContextProvider";
import { useLoaderData, useSearchParams } from "react-router-dom";
import type { YearPageLoaderData, YearlyWorkoutData } from "@/types";
import WorkoutBarChart from "@/components/general/UI/chart/WorkoutBarChart";
import type { CompareSeries } from "@/components/general/UI/chart/WorkoutBarChart";
import CustomizedYearComparisonTooltip from "@/components/general/UI/chart/CustomizedYearComparisonTooltip";
import { formatYearlyChartData, mergeYearlyChartData } from "@/utils/utils";
import { MdClear } from "react-icons/md";

const ticks = [0, 90, 180, 270, 360, 450, 540, 630, 720];
const caloriesTicks = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];
const trainingsTicks = [5, 10, 15, 20, 25, 30];
const trainingLoadTicks = [15, 20, 25, 30, 35, 40, 45, 50, 55];

const compareColors = {
	value: "#0084d1",
	calories: "#ffb86a",
	trainings: "#2f855a",
	trainingLoad: "#ffb86a",
};

function minutesToHHMM(totalMinutes: number) {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

const YearPage = () => {
  const firstWorkoutState:
  {
    state:{
      firstWorkout: string;
      error: string | null
    }
  } | undefined = useContext(FirstWorkoutContext);
  const firstWorkout = firstWorkoutState?.state.firstWorkout || '';
  const [searchParams, setSearchParams] = useSearchParams();
  const { year, compareYear, current, comparison }: YearPageLoaderData = useLoaderData();
  const [_selectedBar, setSelectedBar] = useState<any | null>(null);

  const chartData = useMemo(() => {
    const baseData = formatYearlyChartData(current.content);
    if (!comparison) return baseData;
    return mergeYearlyChartData(baseData, formatYearlyChartData(comparison.content));
  }, [current, comparison]);

  const compareSeries = useMemo(() => {
    if (!comparison) return undefined;
    return (metric: keyof typeof compareColors, label: string): CompareSeries => ({
      dataKey: `compare${metric.charAt(0).toUpperCase()}${metric.slice(1)}`,
      legendLabel: `${label} ${compareYear}`,
      fillColor: compareColors[metric],
    });
  }, [comparison, compareYear]);

  const comparisonTooltip = useMemo(
    () => comparison
      ? (
        <CustomizedYearComparisonTooltip
          baseYear={year}
          compareYear={compareYear ?? undefined}
        />
      )
      : undefined,
    [comparison, year, compareYear],
  );

  const legendLabel = (label: string) => comparison ? `${label} ${year}` : label;

  const chartTabs = useMemo(
    () => [
    {
      key: "volume",
      label: "Time & calories",
      children: (
        <div className="flex w-full flex-col gap-4 pt-2">
          <div className="w-full pr-2">
            <WorkoutBarChart
              payload={chartData}
              onBarClick={setSelectedBar}
              isYear
              legendFormatter={(_value: string) => legendLabel("Training Time")}
              domain={[0, 720]}
              ticks={ticks}
              tickFormatter={(value: number) => minutesToHHMM(value)}
              compare={compareSeries?.("value", "Training Time")}
              tooltipContent={comparisonTooltip}
            />
          </div>
          <div className="w-full pr-2">
            <WorkoutBarChart
              payload={chartData}
              onBarClick={setSelectedBar}
              isYear
              legendFormatter={(_value: string) => legendLabel("Calories")}
              fillColor="#f54a00"
              domain={[0, 8000]}
              ticks={caloriesTicks}
              dataKey="calories"
              compare={compareSeries?.("calories", "Calories")}
              tooltipContent={comparisonTooltip}
            />
          </div>
        </div>
      ),
    },
    {
      key: "sessions",
      label: "Sessions & load",
      children: (
        <div className="flex w-full flex-col gap-4 pt-2">
          <div className="w-full pr-2">
            <WorkoutBarChart
              payload={chartData}
              onBarClick={setSelectedBar}
              isYear
              legendFormatter={(_value: string) => legendLabel("Workouts count")}
              fillColor="#82ca9d"
              domain={[0, 30]}
              ticks={trainingsTicks}
              dataKey="trainings"
              compare={compareSeries?.("trainings", "Workouts count")}
              tooltipContent={comparisonTooltip}
            />
          </div>
          <div className="w-full pr-2">
            <WorkoutBarChart
              payload={chartData}
              onBarClick={setSelectedBar}
              isYear
              legendFormatter={(_value: string) => legendLabel("Training load")}
              fillColor="#f54a00"
              domain={[15, 55]}
              ticks={trainingLoadTicks}
              dataKey="trainingLoad"
              compare={compareSeries?.("trainingLoad", "Training load")}
              tooltipContent={comparisonTooltip}
            />
          </div>
        </div>
      ),
    },
  ],
    [chartData, compareSeries, comparisonTooltip, year],
  );

  const updateParam = (name: string, value?: string) => {
    setSearchParams((prevParams: URLSearchParams) => {
      const nextParams = new URLSearchParams(prevParams);
      if (value) {
        nextParams.set(name, value);
      } else {
        nextParams.delete(name);
      }
      return nextParams;
    });
  };

  const clearComparison = () => updateParam("compare", undefined);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center">
      <div className="mb-4 mt-16 flex flex-wrap items-center justify-center gap-4">
        <YearSelector
          value={String(year)}
          startDate={firstWorkout}
          onChange={(newYear?: string) => {
            if (!newYear) return;
            if (newYear === searchParams.get("compare")) {
              updateParam("compare", undefined);
            }
            updateParam("start", newYear);
          }}
        />
        <YearSelector
          value={compareYear ? String(compareYear) : undefined}
          startDate={firstWorkout}
          excludeYear={String(year)}
          placeholder="Compare with year"
          allowClear
          onChange={(newYear?: string) => updateParam("compare", newYear)}
        />
        {compareYear && (
          <Button type="primary" onClick={clearComparison}>
            <span className="text-white mr-2">
              <MdClear />
            </span>
            <span className="text-white">Clear Comparison</span>
          </Button>
        )}
      </div>
      {comparison
        ? (
          <div className="flex w-full flex-col gap-1 px-16 text-lg font-semibold">
            <StatisticsRow year={year} workouts={current} />
            <StatisticsRow year={compareYear as number} workouts={comparison} />
          </div>
        )
        : (
          <div className="flex justify-evenly w-full font-semibold text-lg px-16 mt-4">
            <div>{current.statistics.exerciseTime}</div>
            <div>{current.statistics.calories} ccal</div>
            <div>{current.totalElements} workouts</div>
          </div>
        )}
      <div className="mt-4 flex min-h-0 w-full flex-1 flex-col px-2 pb-8">
        <Tabs
          defaultActiveKey="volume"
          items={chartTabs}
          className="min-h-0 w-full flex-1"
        />
      </div>
    </div>
  );
};

const StatisticsRow = ({ year, workouts }: { year: number; workouts: YearlyWorkoutData }) => (
  <div className="flex w-full justify-evenly">
    <div className="text-gray-500">{year}</div>
    <div>{workouts.statistics.exerciseTime}</div>
    <div>{workouts.statistics.calories} ccal</div>
    <div>{workouts.totalElements} workouts</div>
  </div>
);

export default YearPage;

const parseYearAnchor = (startParam: string | null): number => {
  if (!startParam) return new Date().getFullYear();
  const trimmed = startParam.trim();
  // trimmed can be `yyyy`
  const m = trimmed.match(/^\d{4}/);
  if (m) {
    return parseInt(m[0]);
  }
  return new Date().getFullYear();
}

const parseCompareYear = (compareParam: string | null, year: number): number | null => {
  if (!compareParam) return null;
  const m = compareParam.trim().match(/^\d{4}/);
  if (!m) return null;
  const compareYear = parseInt(m[0]);
  return compareYear === year ? null : compareYear;
}

async function fetchYear(startOfPeriod: number): Promise<YearlyWorkoutData> {
  const response = await fetch("/api/workouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timePeriod: "YEAR",
      startOfPeriod,
    }),
  });

  if (!response.ok) throw new Response("Not Found", { status: 404 });

  return response.json();
}

export async function loader(params: { request: Request }) {
  const url = new URL(params.request.url);
  const year = parseYearAnchor(url.searchParams.get("start"));
  const compareYear = parseCompareYear(url.searchParams.get("compare"), year);

  const [current, comparison] = await Promise.all([
    fetchYear(year),
    compareYear ? fetchYear(compareYear) : Promise.resolve(null),
  ]);

  return { year, compareYear, current, comparison };
}
