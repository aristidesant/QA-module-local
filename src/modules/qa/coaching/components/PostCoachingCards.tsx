import { Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconSchool } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import type { LmsContent } from '~/models/qa';
import { ImpactBadge } from '~/modules/qa/lms/components/Badges';
import { VERDICT_COLOR } from '~/modules/qa/lms/constants';
import type { PostCoachingSummary, TierTenure } from '../postCoaching';
import { TIER_META, type ScorecardTrendVerdict } from '../scorecard';
import { ScorecardTrendBadge, TierBadge } from './ScorecardBadges';

/** Signed change against the "before" window, coloured by the ±3 verdict band. */
function DeltaBadge({
	delta,
	verdict,
}: {
	delta: number | null;
	verdict: ScorecardTrendVerdict | null;
}) {
	if (delta === null || verdict === null) return null;
	return (
		<Badge size='xs' variant='light' color={VERDICT_COLOR[verdict]}>
			{delta > 0 ? '+' : ''}
			{delta}
		</Badge>
	);
}

interface PostCoachingCardsProps {
	summary: PostCoachingSummary;
	tenure: TierTenure;
	contentById: Record<string, LmsContent>;
}

/**
 * Three tiles: the coaching scorecard since the last completed coach-led
 * session (against the equal-length window before it), how long the agent has
 * been in their current group, and the material completed since the session.
 */
export function PostCoachingCards({
	summary,
	tenure,
	contentById,
}: PostCoachingCardsProps) {
	const { t } = useTranslation('qa.coaching');
	const {
		anchor,
		windowDays,
		after,
		before,
		trend,
		tier,
		materialsCompleted,
		latestMaterial,
	} = summary;
	const latestContent = latestMaterial
		? contentById[latestMaterial.contentId]
		: undefined;

	const beforeText = (value: number | null) =>
		value === null
			? t('agents.postCoaching.noBefore')
			: t('agents.postCoaching.before', { value });

	const description = anchor ? (
		<Stack gap={2}>
			<Text size='sm'>
				{t('agents.postCoaching.anchor', {
					topic: anchor.session.topic,
					date: dayjs(anchor.session.date).format('D MMM YYYY'),
					coach: anchor.session.coachName,
				})}
				{' · '}
				{t('agents.postCoaching.daysAgo', { count: anchor.daysAgo })}
			</Text>
			<Text size='xs' c='dimmed'>
				{t('agents.postCoaching.windows', {
					after: after?.calls ?? 0,
					before: before?.calls ?? 0,
					days: windowDays,
				})}
			</Text>
		</Stack>
	) : (
		t('agents.postCoaching.noSession')
	);

	return (
		<SectionCard
			icon={IconSchool}
			title={t('agents.postCoaching.title')}
			description={description}
			headerActions={
				<Group gap='xs'>
					{tier && <TierBadge tier={tier} />}
					<ScorecardTrendBadge
						trend={trend}
						tooltipKey='agents.postCoaching.trendTooltip'
					/>
				</Group>
			}
		>
			<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='sm'>
				<StatCard
					variant='compact'
					title={t('agents.postCoaching.cards.scorecard')}
					value={after ? after.score : '—'}
					color={
						tier ? `var(--mantine-color-${TIER_META[tier].color}-7)` : undefined
					}
					badge={
						after && (
							<Badge size='xs' variant='light' color='gray'>
								{t('agents.postCoaching.calls', { count: after.calls })}
							</Badge>
						)
					}
					subtitle={
						<Group gap={6} wrap='nowrap'>
							<Text size='xs' c='dimmed'>
								{beforeText(before?.score ?? null)}
							</Text>
							<DeltaBadge
								delta={trend?.delta ?? null}
								verdict={trend?.verdict ?? null}
							/>
						</Group>
					}
				/>

				<StatCard
					variant='compact'
					title={t('agents.tierTenure.title')}
					value={
						tenure.tier
							? tenure.atLeast
								? t('agents.tierTenure.weeksAtLeast', { count: tenure.weeks })
								: t('agents.tierTenure.weeks', { count: tenure.weeks })
							: '—'
					}
					badge={tenure.tier && <TierBadge tier={tenure.tier} size='xs' />}
					subtitle={
						<Text size='xs' c='dimmed' lineClamp={1}>
							{!tenure.tier || !tenure.since
								? t('agents.tierTenure.noData')
								: tenure.previousTier
									? t('agents.tierTenure.sinceFrom', {
											date: dayjs(tenure.since).format('D MMM'),
											tier: t(TIER_META[tenure.previousTier].labelKey),
										})
									: t('agents.tierTenure.since', {
											date: dayjs(tenure.since).format('D MMM'),
										})}
						</Text>
					}
				/>

				<StatCard
					variant='compact'
					title={t('agents.postCoaching.cards.materials')}
					value={materialsCompleted.length}
					badge={
						latestMaterial && (
							<ImpactBadge impact={latestMaterial.impact} size='xs' />
						)
					}
					subtitle={
						<Text size='xs' c='dimmed' lineClamp={1}>
							{latestContent
								? t('agents.postCoaching.latestMaterial', {
										title: latestContent.title,
									})
								: t('agents.postCoaching.noMaterials')}
						</Text>
					}
				/>
			</SimpleGrid>
		</SectionCard>
	);
}
