import { Badge, Group, Text, Tooltip } from '@mantine/core';
import {
	IconMinus,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { TIER_META, type PerformanceTier } from '../scorecard';

/** The only weak aspects flagged in color: the ones the evaluation itself calls critical. */
export const CRITICAL_ISSUES = new Set([
	'auto-fail',
	'qa-ecn',
	'qa-ecc',
	'qa-ecuf',
]);

/** The scorecard as a plain number with its group in words; only the Critical group is colored. */
export function TierScore({
	score,
	tier,
}: {
	score: number;
	tier: PerformanceTier;
}) {
	const { t } = useTranslation('qa.coaching');
	return (
		<Group gap={8} wrap='nowrap'>
			<Text size='sm' fw={600}>
				{score}
			</Text>
			{tier === 'CRITICAL' ? (
				<Badge size='xs' variant='light' color='red'>
					{t(TIER_META.CRITICAL.labelKey)}
				</Badge>
			) : (
				<Text size='xs' c='dimmed'>
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
}: {
	verdict: 'IMPROVED' | 'SAME' | 'DECLINED' | null;
	current: number;
	previous: number | null;
}) {
	const { t } = useTranslation('qa.coaching');
	if (!verdict || previous === null) {
		return (
			<Text size='sm' c='dimmed'>
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
			<Group gap={4} wrap='nowrap' c={declined ? 'red' : 'dimmed'}>
				<Icon size={14} />
				<Text size='sm' c='inherit' fw={declined ? 600 : 400}>
					{delta > 0 ? '+' : ''}
					{delta}
				</Text>
			</Group>
		</Tooltip>
	);
}
