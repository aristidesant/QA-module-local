import { Group, Paper, SimpleGrid, Text } from '@mantine/core';
import { formatMetric } from '../../helpers';
import type { AnalyticsMetricId } from '../../types';
import TrendChart from './TrendChart';
import { SERIES_CURRENT } from './seriesColors';

export interface SmallMultipleItem {
	key: string;
	label: string;
	data: { period: string; value: number | null }[];
}

interface SmallMultiplesProps {
	items: SmallMultipleItem[];
	metricId: AnalyticsMetricId;
}

/** One neutral line per segment: the readable alternative to a chart with more than four lines. */
export default function SmallMultiples({
	items,
	metricId,
}: SmallMultiplesProps) {
	return (
		<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='sm'>
			{items.map((item) => {
				const last = [...item.data].reverse().find((p) => p.value !== null);
				return (
					<Paper key={item.key} withBorder p='sm' radius='md'>
						<Group justify='space-between' wrap='nowrap' gap='xs' mb={4}>
							<Text size='xs' fw={600} lineClamp={1}>
								{item.label}
							</Text>
							<Text size='xs' c='dimmed'>
								{formatMetric(metricId, last?.value ?? null)}
							</Text>
						</Group>
						<TrendChart
							compact
							h={110}
							metricId={metricId}
							data={item.data.map((p) => ({
								period: p.period,
								value: p.value,
							}))}
							series={[
								{ name: 'value', label: item.label, color: SERIES_CURRENT },
							]}
						/>
					</Paper>
				);
			})}
		</SimpleGrid>
	);
}
