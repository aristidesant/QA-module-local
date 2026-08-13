import React from 'react';
import { SimpleGrid, Stack, Text } from '@mantine/core';
import { AggregatedMetric } from '../../../types/analyticsTypes';
import { StatCard } from '~/components/StatCard/StatCard';

interface AggregatedMetricsPanelProps {
	metrics: AggregatedMetric[];
}

const AggregatedMetricsPanel: React.FC<AggregatedMetricsPanelProps> = ({
	metrics,
}) => {
	if (metrics.length === 0) {
		return (
			<Stack gap='md'>
				<Text fw={600} size='sm'>
					Aggregated Metrics
				</Text>
				<Text c='dimmed' size='sm' ta='center' py='xl'>
					No data available for this period
				</Text>
			</Stack>
		);
	}

	return (
		<Stack gap='md'>
			<Text fw={600} size='sm'>
				Aggregated Metrics
			</Text>
			<SimpleGrid cols={{ base: 2, sm: 4 }} spacing='md'>
				{metrics.map((metric, idx) => (
					<StatCard
						key={idx}
						title={metric.label}
						value={`${metric.value}${metric.suffix || ''}`}
					/>
				))}
			</SimpleGrid>
		</Stack>
	);
};

export default AggregatedMetricsPanel;
