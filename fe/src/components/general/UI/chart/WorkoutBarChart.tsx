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
import CustomizedMonthlyTooltip from './CustomizedMonthlyTooltip'
import CustomizedYearlyTooltip from './CustomizedYearlyTooltip'

const WorkoutBarChart = ({
	payload,
	onBarClick,
	domain = [0, 40],
	ticks = [0, 10, 15, 20, 25, 30, 35],
	isYear,
	legendFormatter = () => 'Training Time',
	fillColor = "#74d4ff",
	dataKey = "value",
	tickFormatter = (value: any) => value
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
}) => {
	return (
		<ResponsiveContainer
			width="100%"
			height={300}
			style={{ outline: 'none' }}
		>
			<BarChart data={payload} margin={{ top: 20 }}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="label" />
				<YAxis
					domain={domain}
					ticks={ticks}
					interval={0}
					tickFormatter={tickFormatter}
				/>
				<Tooltip
					content={isYear ? <CustomizedYearlyTooltip />
					: <CustomizedMonthlyTooltip />}
				/>
				<Legend
					formatter={legendFormatter}
				/>
				<Bar
					dataKey={dataKey}
					fill={fillColor}
					barSize={10}
					onClick={(barData) => onBarClick(barData?.payload ?? barData)}
					cursor="pointer"
				/>
			</BarChart>
		</ResponsiveContainer>
	)
}

export default WorkoutBarChart;
