import { Button, Group } from '@mantine/core';
import type { TimeRange } from '~/stores/emotionSentimentFilterStore';
import { useEmotionSentimentFilterStore } from '~/stores/emotionSentimentFilterStore';

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
	{ value: '7d', label: 'Last 7 days' },
	{ value: '30d', label: 'Last 30 days' },
	{ value: '90d', label: 'Last 90 days' },
];

export default function TimeRangeControl() {
	const timeRange = useEmotionSentimentFilterStore((state) => state.timeRange);
	const setTimeRange = useEmotionSentimentFilterStore(
		(state) => state.setTimeRange
	);

	return (
		<Group gap='xs'>
			{TIME_RANGE_OPTIONS.map((option) => (
				<Button
					key={option.value}
					size='xs'
					variant={timeRange === option.value ? 'filled' : 'default'}
					onClick={() => setTimeRange(option.value)}
				>
					{option.label}
				</Button>
			))}
		</Group>
	);
}
