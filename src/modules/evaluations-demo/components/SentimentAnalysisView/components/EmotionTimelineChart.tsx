import { useMemo } from 'react';
import { Group, Stack, Text } from '@mantine/core';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import type { EmotionData, Emotion } from '../types';
import styles from './EmotionTimelineChart.module.css';

const EMOTION_COLORS: Record<Emotion, string> = {
	satisfaction: '#51cf66',
	frustration: '#ff922b',
	anger: '#ff6b6b',
	neutral: '#909090',
	excitement: '#ffd60a',
	sadness: '#748ffc',
};

interface EmotionTimelineChartProps {
	data: EmotionData[];
	title: string;
	avgEmotion: Emotion;
	trend: 'improving' | 'declining' | 'stable';
}

export default function EmotionTimelineChart({
	data,
	title,
	avgEmotion,
	trend,
}: EmotionTimelineChartProps) {
	// Group data by timestamp and get the emotion for that point
	const chartData = useMemo(
		() =>
			data.reduce(
				(acc, point) => {
					const existing = acc.find((d) => d.time === point.timestamp);
					if (existing) {
						existing.intensity = (existing.intensity + point.intensity) / 2;
					} else {
						acc.push({
							time: point.timestamp,
							intensity: point.intensity,
							emotion: point.emotion,
						});
					}
					return acc;
				},
				[] as Array<{
					time: number;
					intensity: number;
					emotion: Emotion;
				}>
			),
		[data]
	);

	const trendEmoji = {
		improving: '📈',
		declining: '📉',
		stable: '➡️',
	}[trend];

	return (
		<Stack gap='sm' className={styles.container}>
			<div>
				<Text fw={600} size='sm' className={styles.title}>
					{title}
				</Text>
			</div>

			<div className={styles.chartWrapper}>
				<ResponsiveContainer width='100%' height={140}>
					<LineChart
						data={chartData}
						margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
					>
						<CartesianGrid
							strokeDasharray='3 3'
							stroke='var(--mantine-color-gray-3)'
						/>
						{/* inline-style-allow: Recharts axis font sizing */}
						<XAxis
							dataKey='time'
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
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: 'var(--mantine-color-gray-8)',
								border: '1px solid var(--mantine-color-gray-6)',
								borderRadius: '4px',
								padding: '8px',
							}}
							labelStyle={{ color: 'var(--mantine-color-gray-1)' }}
							formatter={(value) => `${Math.round(value as number)}%`}
							labelFormatter={(label) => `${label}s`}
						/>
						<Line
							type='monotone'
							dataKey='intensity'
							stroke={EMOTION_COLORS[avgEmotion]}
							dot={{ fill: EMOTION_COLORS[avgEmotion], r: 3 }}
							activeDot={{ r: 5 }}
							strokeWidth={2.5}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>

			<Group justify='space-between' gap='xs'>
				<Text size='xs' c='dimmed'>
					📊 Avg. Emotion: {avgEmotion}
				</Text>
				<Text size='xs' c='dimmed'>
					{trendEmoji} Trend: {trend}
				</Text>
			</Group>
		</Stack>
	);
}
