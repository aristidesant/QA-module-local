import { Group, Text } from '@mantine/core';
import {
	IconMinus,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import type { Trend } from '../types';
import { trendDelta } from '../helpers';

interface TrendDeltaProps {
	delta: number;
	trend: Trend;
	unit: '%' | '/5' | 's' | '';
	suffix?: string;
}

/** Direction is shown by the arrow and the signed number; it carries no colour. */
export function TrendDelta({ delta, trend, unit, suffix }: TrendDeltaProps) {
	const Icon =
		trend === 'up'
			? IconTrendingUp
			: trend === 'down'
				? IconTrendingDown
				: IconMinus;

	return (
		<Group gap={4} wrap='nowrap'>
			<Icon size={14} color='var(--mantine-color-dimmed)' />
			<Text size='xs' c='dimmed'>
				{trendDelta(delta, unit)}
				{suffix ? ` ${suffix}` : ''}
			</Text>
		</Group>
	);
}
