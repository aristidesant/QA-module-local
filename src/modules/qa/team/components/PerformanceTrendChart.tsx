import { Chip, Group, Stack, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { PerformancePoint } from '../types';

type SeriesKey = 'overall' | 'qa' | 'sentiment' | 'compliance' | 'business';

/** Overall stays neutral as the anchor; each aspect gets one muted hue, used only here. */
const SERIES_STYLE: Record<SeriesKey, { color: string; chip: string }> = {
	overall: { color: 'var(--mantine-color-text)', chip: 'gray' },
	qa: { color: 'orange.5', chip: 'orange' },
	sentiment: { color: 'violet.5', chip: 'violet' },
	compliance: { color: 'teal.5', chip: 'teal' },
	business: { color: 'blue.5', chip: 'blue' },
};
const SERIES_ORDER: SeriesKey[] = [
	'overall',
	'qa',
	'sentiment',
	'compliance',
	'business',
];

interface PerformanceTrendChartProps {
	points: PerformancePoint[];
	visible: Record<SeriesKey, boolean>;
	onToggle: (key: SeriesKey) => void;
}

export function PerformanceTrendChart({
	points,
	visible,
	onToggle,
}: PerformanceTrendChartProps) {
	const { t } = useTranslation('qa.team');
	const series = SERIES_ORDER.filter((k) => visible[k]).map((k) => ({
		name: k,
		label: t(`overview.series.${k}`),
		color: SERIES_STYLE[k].color,
	}));

	return (
		<Stack gap='sm'>
			<Group gap='xs'>
				{SERIES_ORDER.map((key) => (
					<Chip
						key={key}
						checked={visible[key]}
						onChange={() => onToggle(key)}
						color={SERIES_STYLE[key].chip}
						variant='light'
						size='xs'
					>
						{t(`overview.series.${key}`)}
					</Chip>
				))}
			</Group>
			<LineChart
				h={320}
				data={points}
				dataKey='label'
				series={series}
				curveType='monotone'
				withLegend
				withDots
				yAxisProps={{ domain: [0, 100] }}
				strokeWidth={2}
			/>
			<Text size='xs' c='dimmed'>
				{t('overview.performanceDescription')} — sentiment is plotted on a 0–100
				scale (score/5).
			</Text>
		</Stack>
	);
}
