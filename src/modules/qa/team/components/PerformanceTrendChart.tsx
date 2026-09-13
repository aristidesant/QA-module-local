import { Chip, Group, Stack, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { PerformancePoint } from '../types';

type SeriesKey = 'overall' | 'qa' | 'sentiment' | 'compliance' | 'business';

const SERIES_COLOR: Record<SeriesKey, string> = {
	overall: 'dark.4',
	qa: 'orange.6',
	sentiment: 'violet.6',
	compliance: 'green.6',
	business: 'blue.6',
};
const SERIES_ORDER: SeriesKey[] = ['overall', 'qa', 'sentiment', 'compliance', 'business'];

interface PerformanceTrendChartProps {
	points: PerformancePoint[];
	visible: Record<SeriesKey, boolean>;
	onToggle: (key: SeriesKey) => void;
}

export function PerformanceTrendChart({ points, visible, onToggle }: PerformanceTrendChartProps) {
	const { t } = useTranslation('qa.team');
	const series = SERIES_ORDER.filter((k) => visible[k]).map((k) => ({
		name: k,
		label: t(`overview.series.${k}`),
		color: SERIES_COLOR[k],
	}));

	return (
		<Stack gap='sm'>
			<Group gap='xs'>
				{SERIES_ORDER.map((key) => (
					<Chip key={key} checked={visible[key]} onChange={() => onToggle(key)} color={SERIES_COLOR[key].split('.')[0]} size='xs'>
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
				{t('overview.performanceDescription')} — sentiment is plotted on a 0–100 scale (score/5).
			</Text>
		</Stack>
	);
}
