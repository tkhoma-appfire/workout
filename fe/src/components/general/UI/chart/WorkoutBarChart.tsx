import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	Legend,
	ResponsiveContainer
} from 'recharts'
import type { ReactElement } from 'react'
import CustomizedMonthlyTooltip from './CustomizedMonthlyTooltip'
import CustomizedYearlyTooltip from './CustomizedYearlyTooltip'

export type CompareSeries = {
	dataKey: string;
	legendLabel: string;
	fillColor?: string;
};

const WorkoutBarChart = ({
	payload,
	onBarClick,
	domain = [0, 40],
	ticks = [0, 10, 15, 20, 25, 30, 35],
	isYear,
	legendFormatter = () => 'Training Time',
	fillColor = "#74d4ff",
	dataKey = "value",
	tickFormatter = (value: any) => value,
	compare,
	tooltipContent
}: {
	payload: any[];
	onBarClick: (data: any) => void;
	domain?: [number, number];
	ticks?: number[];
	isYear?: boolean;
	legendFormatter?: (value: any) => string;
	fillColor?: string;
	dataKey?: string;
	tickFormatter?: (value: any) => string;
	compare?: CompareSeries;
	tooltipContent?: ReactElement;
}) => {
	const barSize = compare ? 8 : 10
	return (
		<ResponsiveContainer
			width="100%"
			height={300}
			style={{ outline: 'none' }}
		>
			<BarChart
				data={payload}
				margin={{ top: 20 }}
				accessibilityLayer={false}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="label" />
				<YAxis
					domain={domain}
					ticks={ticks}
					interval={0}
					tickFormatter={tickFormatter}
				/>
				<Tooltip
					cursor={false}
					content={tooltipContent ?? (isYear ? <CustomizedYearlyTooltip />
					: <CustomizedMonthlyTooltip />)}
				/>
				<Legend
					formatter={(value: any) => value}
				/>
				<Bar
					dataKey={dataKey}
					name={legendFormatter(dataKey)}
					fill={fillColor}
					barSize={barSize}
					onClick={(barData) => onBarClick(barData?.payload ?? barData)}
					cursor="pointer"
				/>
				{compare && (
					<Bar
						dataKey={compare.dataKey}
						name={compare.legendLabel}
						fill={compare.fillColor ?? "#94a3b8"}
						barSize={barSize}
						onClick={(barData) => onBarClick(barData?.payload ?? barData)}
						cursor="pointer"
					/>
				)}
			</BarChart>
		</ResponsiveContainer>
	)
}

export default WorkoutBarChart;
