import React from 'react';
import { Group, Text } from '@mantine/core';
import {
	IconTrendingUp,
	IconTrendingDown,
	IconMinus,
} from '@tabler/icons-react';
import type {
	DashboardMetricTrend,
	MetricTrend,
} from '~/modules/qa/calls/agentMetrics';

interface TrendIndicatorProps {
	trend: DashboardMetricTrend;
	/** Whether an 'up' reading is the good direction for this metric. Default true (QA, Compliance, sentiment, effective contacts, conversion rate all read this way). */
	upIsGood?: boolean;
}

const ICON: Record<MetricTrend, typeof IconTrendingUp> = {
	up: IconTrendingUp,
	down: IconTrendingDown,
	stable: IconMinus,
};

/**
 * One line per Performance Score card: this period's percentage-point change
 * vs. the immediately-preceding period of equal length. The dashboard colors
 * exceptions only, so the line is dimmed unless the direction is bad for the
 * metric it sits under. Shade 7 keeps the 12px text at AA contrast.
 */
export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
	trend,
	upIsGood = true,
}) => {
	const Icon = ICON[trend.direction];
	const isBad =
		trend.direction !== 'stable' && (trend.direction === 'up') !== upIsGood;
	const sign = trend.deltaPct > 0 ? '+' : '';

	return (
		<Group gap={4} wrap='nowrap'>
			<Icon
				size={14}
				color={
					isBad
						? 'var(--mantine-color-danger-7)'
						: 'var(--mantine-color-dimmed)'
				}
			/>
			<Text size='xs' c={isBad ? 'danger.7' : 'dimmed'}>
				{sign}
				{trend.deltaPct}%
			</Text>
		</Group>
	);
};

export default TrendIndicator;
