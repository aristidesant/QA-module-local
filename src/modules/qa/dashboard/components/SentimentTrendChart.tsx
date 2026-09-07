import { useState } from 'react';
import { Stack, Text, SegmentedControl } from '@mantine/core';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import type { SentimentTrendPoint } from '../../dashboard/mockData';
import classes from './SentimentTrendChart.module.css';

export interface SentimentTrendChartProps {
	data: SentimentTrendPoint[];
}

type SentimentViewType = 'both' | 'agent' | 'customer';

export const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({
	data,
}) => {
	const [viewType, setViewType] = useState<SentimentViewType>('both');

	// Filter data based on selected view
	const getChartData = () => {
		return data.map((point) => ({
			label: point.label,
			agentSentiment: point.agentAverage,
			customerSentiment: point.customerAverage,
		}));
	};

	const chartData = getChartData();

	// Determine which lines to show
	const showAgent = viewType === 'both' || viewType === 'agent';
	const showCustomer = viewType === 'both' || viewType === 'customer';

	// Custom tooltip formatter
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className={classes.tooltip}>
					<p className={classes.tooltipLabel}>{label}</p>
					{payload.map((entry: any, index: number) => (
						<p
							key={`tooltip-${index}`}
							style={{ color: entry.color, margin: '4px 0' }}
						>
							{entry.name}: {entry.value.toFixed(1)}/5.0
						</p>
					))}
				</div>
			);
		}
		return null;
	};

	return (
		<Stack gap='md' className={classes.container}>
			<div>
				<Text fw={600} size='sm' className={classes.title}>
					4-Week Sentiment Trend
				</Text>
			</div>

			<SegmentedControl
				data={[
					{ value: 'both', label: 'Both' },
					{ value: 'agent', label: 'Agent' },
					{ value: 'customer', label: 'Customer' },
				]}
				value={viewType}
				onChange={(value) => setViewType(value as SentimentViewType)}
				size='sm'
				className={classes.control}
			/>

			<div className={classes.chartWrapper}>
				<ResponsiveContainer width='100%' height={300}>
					<LineChart
						data={chartData}
						margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
					>
						<CartesianGrid
							strokeDasharray='3 3'
							stroke='var(--mantine-color-gray-3)'
						/>
						{/* inline-style-allow: Recharts axis font sizing */}
						<XAxis
							dataKey='label'
							stroke='var(--mantine-color-gray-5)'
							style={{ fontSize: '11px' }}
							tick={{ fill: 'var(--mantine-color-gray-6)' }}
						/>
						{/* inline-style-allow: Recharts axis font sizing */}
						<YAxis
							domain={[0, 5]}
							stroke='var(--mantine-color-gray-5)'
							style={{ fontSize: '11px' }}
							tick={{ fill: 'var(--mantine-color-gray-6)' }}
							width={30}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend
							wrapperStyle={{
								paddingTop: '16px',
							}}
						/>
						{showAgent && (
							<Line
								type='monotone'
								dataKey='agentSentiment'
								name='Agent Sentiment'
								stroke='#4c6ef5'
								dot={{ fill: '#4c6ef5', r: 4 }}
								activeDot={{ r: 6 }}
								strokeWidth={2.5}
							/>
						)}
						{showCustomer && (
							<Line
								type='monotone'
								dataKey='customerSentiment'
								name='Customer Sentiment'
								stroke='#51cf66'
								dot={{ fill: '#51cf66', r: 4 }}
								activeDot={{ r: 6 }}
								strokeWidth={2.5}
							/>
						)}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</Stack>
	);
};

export default SentimentTrendChart;
