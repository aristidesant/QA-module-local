import React from 'react';
import { SimpleGrid } from '@mantine/core';
import { AggregatedMetric } from '../../../types/supervisorTypes';
import StatCard from '~/components/StatCard';

interface SupervisorMetricsPanelProps {
	metrics: AggregatedMetric[];
}

const SupervisorMetricsPanel: React.FC<SupervisorMetricsPanelProps> = ({
	metrics,
}) => {
	return (
		<SimpleGrid cols={{ base: 2, sm: 4 }} spacing='md'>
			{metrics.map((metric) => (
				<StatCard
					key={metric.label}
					title={metric.label}
					value={`${metric.value}${metric.suffix ? ` ${metric.suffix}` : ''}`}
				/>
			))}
		</SimpleGrid>
	);
};

export default SupervisorMetricsPanel;
