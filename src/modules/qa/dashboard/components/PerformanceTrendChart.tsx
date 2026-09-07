import React from 'react';
import { Stack, Text } from '@mantine/core';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import classes from './PerformanceTrendChart.module.css';

/**
 * Data point for the performance trend chart
 */
export interface PerformanceTrendPoint {
	week: string;
	score: number;
}

/**
 * Props for the PerformanceTrendChart component
 */
export interface PerformanceTrendChartProps {
	/**
	 * Array of performance data points with week labels and scores (0-100)
	 */
	data: PerformanceTrendPoint[];
}

/**
 * Custom tooltip component for the performance trend chart
 */
const CustomTooltip = ({ active, payload }: any) => {
	if (active && payload && payload.length) {
		const { week, score } = payload[0].payload;
		return (
			<div className={classes.tooltip}>
				<p className={classes.tooltipLabel}>{week}</p>
				<p className={classes.tooltipValue}>{score}%</p>
			</div>
		);
	}
	return null;
};

/**
 * Performance Trend Chart Component
 *
 * Displays a 4-week performance score trend using a line chart.
 * The chart shows a single blue line representing performance scores
 * on a 0-100 scale with a custom tooltip displaying week and percentage.
 *
 * @example
 * ```tsx
 * <PerformanceTrendChart
 *   data={[
 *     { week: 'Week 1', score: 82 },
 *     { week: 'Week 2', score: 85 },
 *     { week: 'Week 3', score: 87 },
 *     { week: 'Week 4', score: 90 }
 *   ]}
 * />
 * ```
 */
export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
	data,
}) => {
	return (
		<Stack gap='md' className={classes.container}>
			<div>
				<Text fw={600} size='sm' className={classes.title}>
					4-Week Performance Trend
				</Text>
			</div>

			<div className={classes.chartWrapper}>
				<ResponsiveContainer width='100%' height={300}>
					<LineChart
						data={data}
						margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
					>
						<CartesianGrid
							strokeDasharray='3 3'
							stroke='var(--mantine-color-gray-3)'
						/>
						{/* inline-style-allow: Recharts axis font sizing */}
						<XAxis
							dataKey='week'
							stroke='var(--mantine-color-gray-5)'
							style={{ fontSize: '11px' }}
							tick={{ fill: 'var(--mantine-color-gray-6)' }}
						/>
						{/* inline-style-allow: Recharts axis font sizing */}
						<YAxis
							domain={[0, 100]}
							stroke='var(--mantine-color-gray-5)'
							style={{ fontSize: '11px' }}
							tick={{ fill: 'var(--mantine-color-gray-6)' }}
							width={30}
							label={{
								value: '%',
								angle: -90,
								position: 'insideLeft',
								fill: 'var(--mantine-color-gray-6)',
								offset: 10,
							}}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Line
							type='monotone'
							dataKey='score'
							stroke='#4c6ef5'
							dot={{ fill: '#4c6ef5', r: 4 }}
							activeDot={{ r: 6 }}
							strokeWidth={2.5}
							name='Performance Score'
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</Stack>
	);
};

export default PerformanceTrendChart;
