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
 * vs. the immediately-preceding period of equal length, colored by whether
 * that direction is good or bad for the metric it sits under.
 */
export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
	trend,
	upIsGood = true,
}) => {
	const Icon = ICON[trend.direction];
	const isGood =
		trend.direction === 'stable'
			? null
			: (trend.direction === 'up') === upIsGood;
	const color =
		trend.direction === 'stable' ? 'gray' : isGood ? 'green' : 'red';
	const sign = trend.deltaPct > 0 ? '+' : '';

	return (
		<Group gap={4} wrap='nowrap'>
			<Icon size={14} color={`var(--mantine-color-${color}-6)`} />
			<Text size='xs' c={color}>
				{sign}
				{trend.deltaPct}%
			</Text>
		</Group>
	);
};

export default TrendIndicator;
