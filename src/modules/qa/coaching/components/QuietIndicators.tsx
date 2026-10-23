import { Badge, Group, Text, Tooltip } from '@mantine/core';
import {
	IconMinus,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CRITICAL_ISSUE_KEYS } from '~/modules/qa/calls/issues';
import { TIER_META, type PerformanceTier } from '../scorecard';

/** The only weak aspects flagged in color: the ones the evaluation itself calls critical. */
export const CRITICAL_ISSUES = CRITICAL_ISSUE_KEYS;

/** The scorecard as a plain number with its group in words; only the Critical group is colored. */
export function TierScore({
	score,
	tier,
	size = 'sm',
}: {
	score: number;
	tier: PerformanceTier;
	/** 'xl' gives the number the weight of a headline figure. */
	size?: 'sm' | 'xl';
}) {
	const { t } = useTranslation('qa.coaching');
	const large = size === 'xl';
	return (
		<Group gap={8} wrap='nowrap' align={large ? 'baseline' : 'center'}>
			<Text size={size} fw={large ? 700 : 600} lh={large ? 1.1 : undefined}>
				{score}
			</Text>
			{tier === 'CRITICAL' ? (
				<Badge size={large ? 'sm' : 'xs'} variant='light' color='red'>
					{t(TIER_META.CRITICAL.labelKey)}
				</Badge>
			) : (
				<Text size={large ? 'sm' : 'xs'} c='dimmed'>
					{t(TIER_META[tier].labelKey)}
				</Text>
			)}
		</Group>
	);
}

/** Week-over-week movement as plain text with an arrow; only a decline is colored. */
export function ScoreTrendText({
	verdict,
	current,
	previous,
	size = 'sm',
}: {
	verdict: 'IMPROVED' | 'SAME' | 'DECLINED' | null;
	current: number;
	previous: number | null;
	/** 'xl' gives the change the weight of a headline figure. */
	size?: 'sm' | 'xl';
}) {
	const { t } = useTranslation('qa.coaching');
	const large = size === 'xl';
	if (!verdict || previous === null) {
		return (
			<Text size={size} c='dimmed'>
				—
			</Text>
		);
	}
	const delta = current - previous;
	const declined = verdict === 'DECLINED';
	const Icon =
		verdict === 'IMPROVED'
			? IconTrendingUp
			: declined
				? IconTrendingDown
				: IconMinus;
	return (
		<Tooltip
			withArrow
			label={t('agents.trend.tooltip', {
				previous,
				current,
				delta: `${delta > 0 ? '+' : ''}${delta}`,
			})}
		>
			<Group
				gap={4}
				wrap='nowrap'
				c={declined ? 'red' : large ? undefined : 'dimmed'}
			>
				<Icon size={large ? 20 : 14} />
				<Text
					size={size}
					c='inherit'
					fw={large ? 700 : declined ? 600 : 400}
					lh={large ? 1.1 : undefined}
				>
					{delta > 0 ? '+' : ''}
					{delta}
				</Text>
			</Group>
		</Tooltip>
	);
}
