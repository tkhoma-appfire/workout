import { formatRoundsDisplay } from "@/utils/rounds";

type Exercise = {
	order: number;
	exercise: string;
	weight: string | number;
};

type WorkoutTooltipContentProps = {
	item: {
		exercises: Exercise[];
		time: number;
		rounds: string;
		comment?: string;
	};
};

export default function WorkoutTooltipContent({ item }: WorkoutTooltipContentProps) {
	const sortedExercises = [...item.exercises].sort((a, b) => a.order - b.order)

	return (
		<div className="bg-gray-100 p-2 p-4">
			<p className="mb-2 text-sx">
				<span className="font-bold">Training Time:</span> {item.time} minutes
			</p>
			<p className="text-[0.65rem] my-2">{formatRoundsDisplay(item.rounds)}</p>
			<div className="ml-4">
				{sortedExercises.map((entry, index) => (
					<p className="text-xs" key={index}>
						<span style={{ color: '#74d4ff' }}>●</span> {entry.exercise}: {entry.weight}
					</p>
				))}
			</div>
			{item.comment &&
				<p className="text-[0.65rem] mt-2 w-56">{item.comment}</p>
			}
		</div>
	)
}
