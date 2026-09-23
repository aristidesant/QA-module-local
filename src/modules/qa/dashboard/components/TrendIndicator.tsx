import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Text } from '@mantine/core';
import {
	IconTrendingUp,
	IconTrendingDown,
	IconMinus,
} from '@tabler/icons-react';
import type { MetricTrend } from '~/modules/qa/calls/agentMetrics';

interface TrendIndicatorProps {
	trend: MetricTrend;
	/** Whether an 'up' reading is the good direction for this metric. Default true (QA, Compliance, sentiment, effective contacts, conversion rate all read this way). */
	upIsGood?: boolean;
}

const ICON: Record<MetricTrend, typeof IconTrendingUp> = {
	up: IconTrendingUp,
	down: IconTrendingDown,
	stable: IconMinus,
};

/**
 * One line per Performance Score card: this period's trend vs. the
 * immediately-preceding period of equal length, colored by whether that
 * direction is good or bad for the metric it sits under.
 */
export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
	trend,
	upIsGood = true,
}) => {
	const { t } = useTranslation('qa.dashboard');
	const Icon = ICON[trend];
	const isGood = trend === 'stable' ? null : (trend === 'up') === upIsGood;
	const color = trend === 'stable' ? 'gray' : isGood ? 'green' : 'red';

	return (
		<Group gap={4} wrap='nowrap'>
			<Icon size={14} color={`var(--mantine-color-${color}-6)`} />
			<Text size='xs' c={color}>
				{t(`performanceScore.trend.${trend}`)}
			</Text>
		</Group>
	);
};

export default TrendIndicator;
