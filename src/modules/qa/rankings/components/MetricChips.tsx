import React from 'react';
import { Badge, Group } from '@mantine/core';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { isComposite } from '../helpers';
import { useMetricLabel } from '../useMetricLabel';

interface MetricChipsProps {
	program: RankingProgram;
	size?: 'xs' | 'sm' | 'md' | 'lg';
}

/** What a ranking measures: one chip per metric, with its weight when several are combined. */
export const MetricChips: React.FC<MetricChipsProps> = ({
	program,
	size = 'sm',
}) => {
	const label = useMetricLabel();
	const composite = isComposite(program);

	return (
		<Group gap={6} wrap='wrap'>
			{program.metrics.map((metric) => (
				<Badge
					key={metric.metricId}
					size={size}
					variant='light'
					color='gray'
					tt='none'
				>
					{label(metric.metricId)}
					{composite ? ` · ${metric.weight}%` : ''}
				</Badge>
			))}
		</Group>
	);
};

export default MetricChips;
