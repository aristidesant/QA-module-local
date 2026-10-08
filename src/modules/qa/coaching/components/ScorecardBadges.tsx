import { Badge, Stack, Text, Tooltip } from '@mantine/core';
import {
	IconMinus,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { VERDICT_COLOR } from '~/modules/qa/lms/constants';
import {
	SCORECARD_DIMENSION_META,
	SCORECARD_DIMENSION_ORDER,
	SCORECARD_WEIGHTS,
	TIER_META,
	tierFor,
	type PerformanceTier,
	type ScorecardDimension,
	type ScorecardTrend,
	type WeeklyScorecard,
} from '../scorecard';

type BadgeSize = 'xs' | 'sm' | 'md';

export function TierBadge({
	tier,
	size = 'sm',
}: {
	tier: PerformanceTier;
	size?: BadgeSize;
}) {
	const { t } = useTranslation('qa.coaching');
	return (
		<Badge size={size} variant='light' color={TIER_META[tier].color}>
			{t(TIER_META[tier].labelKey)}
		</Badge>
	);
}

/** The weekly composite, colored by its tier; the tooltip lists the four aspects with their weights. */
export function ScorecardBadge({
	scorecard,
	size = 'sm',
}: {
	scorecard: WeeklyScorecard | null;
	size?: BadgeSize;
}) {
	const { t } = useTranslation('qa.coaching');
	if (!scorecard) {
		return (
			<Text size='sm' c='dimmed'>
				—
			</Text>
		);
	}
	return (
		<Tooltip
			withArrow
			label={
				<Stack gap={2}>
					<Text size='xs' fw={600}>
						{t('agents.scorecard.tooltipTitle')}
					</Text>
					{SCORECARD_DIMENSION_ORDER.map((d) => (
						<Text key={d} size='xs'>
							{t('agents.scorecard.tooltipLine', {
								label: t(SCORECARD_DIMENSION_META[d].labelKey),
								value: scorecard.dimensions[d],
								weight: SCORECARD_WEIGHTS[d],
							})}
						</Text>
					))}
				</Stack>
			}
		>
			<Badge
				size={size}
				variant='filled'
				color={TIER_META[tierFor(scorecard.score)].color}
			>
				{scorecard.score}
			</Badge>
		</Tooltip>
	);
}

export function ScorecardDimensionBadge({
	dimension,
	size = 'sm',
}: {
	dimension: ScorecardDimension;
	size?: BadgeSize;
}) {
	const { t } = useTranslation('qa.coaching');
	const meta = SCORECARD_DIMENSION_META[dimension];
	return (
		<Badge size={size} variant='light' color={meta.color}>
			{t(meta.labelKey)}
		</Badge>
	);
}

/** Week-over-week verdict: Improved / No change / Declined, with "previous → current" in the tooltip. */
export function ScorecardTrendBadge({
	trend,
	size = 'sm',
	tooltipKey = 'agents.trend.tooltip',
}: {
	trend: ScorecardTrend | null;
	size?: BadgeSize;
	/** i18n key with {{previous}}, {{current}}, {{delta}} placeholders. */
	tooltipKey?: string;
}) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	if (!trend) {
		return (
			<Tooltip label={t('agents.trend.noPrevious')} withArrow>
				<Text size='sm' c='dimmed'>
					—
				</Text>
			</Tooltip>
		);
	}
	const Icon =
		trend.verdict === 'IMPROVED'
			? IconTrendingUp
			: trend.verdict === 'DECLINED'
				? IconTrendingDown
				: IconMinus;
	const signed = `${trend.delta > 0 ? '+' : ''}${trend.delta}`;
	return (
		<Tooltip
			withArrow
			label={t(tooltipKey, {
				previous: trend.previous,
				current: trend.current,
				delta: signed,
			})}
		>
			<Badge
				size={size}
				variant='light'
				color={VERDICT_COLOR[trend.verdict]}
				leftSection={<Icon size={12} />}
			>
				{t(`verdict.${trend.verdict}`, { ns: 'qa.lms' })}
			</Badge>
		</Tooltip>
	);
}
