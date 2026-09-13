import { Group, Text } from '@mantine/core';
import { IconMinus, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import type { Trend } from '../types';
import { trendColor, trendDelta } from '../helpers';

interface TrendDeltaProps {
	delta: number;
	trend: Trend;
	unit: '%' | '/5' | 's' | '';
	betterWhen?: 'higher' | 'lower';
	suffix?: string;
}

export function TrendDelta({ delta, trend, unit, betterWhen = 'higher', suffix }: TrendDeltaProps) {
	const color = trendColor(trend, betterWhen);
	const Icon = trend === 'up' ? IconTrendingUp : trend === 'down' ? IconTrendingDown : IconMinus;

	return (
		<Group gap={4} wrap='nowrap'>
			<Icon size={14} color={`var(--mantine-color-${color}-6)`} />
			<Text size='xs' c={color}>
				{trendDelta(delta, unit)}{suffix ? ` ${suffix}` : ''}
			</Text>
		</Group>
	);
}
