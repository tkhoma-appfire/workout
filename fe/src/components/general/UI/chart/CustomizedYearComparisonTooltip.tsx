import type { YearlyComparisonChartRow } from "@/utils/utils";

type CustomizedYearComparisonTooltipProps = {
	active?: boolean;
	payload?: any[];
	label?: string;
	baseYear?: number;
	compareYear?: number;
};

function formatTime(minutes: number) {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}:${remainingMinutes.toString().padStart(2, '0')}`;
}

function YearColumn({ year, time, calories, trainings, trainingLoad }: {
	year?: number;
	time: number;
	calories: number;
	trainings: number;
	trainingLoad: number;
}) {
	return (
		<div>
			<p className="mb-2 font-bold">{year}</p>
			<p className="mb-2 text-sx">
				<span className="font-bold">Training Time:</span> {formatTime(time)} hours
			</p>
			<p className="mb-2 text-sx">
				<span className="font-bold">Calories:</span> {calories}
			</p>
			<p className="mb-2 text-sx">
				<span className="font-bold">Trainings:</span> {trainings}
			</p>
			<p className="mb-2 text-sx">
				<span className="font-bold">Training Load:</span> {trainingLoad}
			</p>
		</div>
	)
}

export default function CustomizedYearComparisonTooltip({
	active,
	payload,
	label,
	baseYear,
	compareYear
}: CustomizedYearComparisonTooltipProps) {
	if (!active || !payload || payload.length === 0) {
		return null
	}

	const month: YearlyComparisonChartRow = payload[0].payload

	return (
		<div className="border rounded border-gray-600">
			<div className="bg-gray-100 p-4">
				<p className="mb-2 font-bold">Month: {label}</p>
				<div className="flex gap-6">
					<YearColumn
						year={baseYear}
						time={month.value}
						calories={month.calories}
						trainings={month.trainings}
						trainingLoad={month.trainingLoad}
					/>
					<YearColumn
						year={compareYear}
						time={month.compareValue}
						calories={month.compareCalories}
						trainings={month.compareTrainings}
						trainingLoad={month.compareTrainingLoad}
					/>
				</div>
			</div>
		</div>
	)
}
