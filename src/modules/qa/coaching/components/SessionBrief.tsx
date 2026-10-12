import type { ReactNode } from 'react';
import {
	Badge,
	Blockquote,
	Divider,
	Group,
	Progress,
	Stack,
	Text,
} from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingBrief } from '~/models/qa';
import type { CallIssueKey } from '~/modules/qa/calls/issues';
import { CRITICAL_ISSUES, ScoreTrendText, TierScore } from './QuietIndicators';
import queueStyles from './Queue.module.css';
import styles from './SessionBrief.module.css';

/** Caption-style label: the small uppercase heading used for blocks and stat labels. */
export function Caption({ children }: { children: ReactNode }) {
	return (
		<Text size='xs' fw={600} tt='uppercase' c='dimmed' lh={1.3}>
			{children}
		</Text>
	);
}

/** One figure of the strip: caption, the number and a one-line note. */
function StripStat({
	label,
	children,
	note,
}: {
	label: string;
	children: ReactNode;
	note?: ReactNode;
}) {
	return (
		<Stack gap={4} flex={1} miw={0}>
			<Caption>{label}</Caption>
			{children}
			{note && (
				<Text size='xs' c='dimmed' lineClamp={1}>
					{note}
				</Text>
			)}
		</Stack>
	);
}

interface SessionBriefProps {
	brief: CoachingBrief;
}

/**
 * The weekly brief as scannable data first (the figures strip, the weak
 * aspects with their share of the week) and the coaching guide second. Color
 * only for a Critical group, a falling score and critical errors.
 */
export function SessionBrief({ brief }: SessionBriefProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.calls']);
	const finding = brief.findings[0];

	return (
		<SectionCard
			icon={IconSparkles}
			title={t('sessions.brief.title')}
			padding='md'
		>
			<Stack gap='lg'>
				<Group align='stretch' gap='md' wrap='wrap'>
					<Group
						align='flex-start'
						gap='xl'
						wrap='nowrap'
						className={styles.highlight}
						data-declined={brief.trend === 'DECLINED' || undefined}
					>
						<StripStat
							label={t('sessions.brief.stats.scorecard')}
							note={t(`sessions.batch.reason.${brief.reason}`)}
						>
							<TierScore size='xl' score={brief.score} tier={brief.tier} />
						</StripStat>
						<Divider orientation='vertical' />
						<StripStat
							label={t('sessions.brief.stats.change')}
							note={
								brief.previousScore === null
									? t('sessions.brief.stats.vsPrevious')
									: `${brief.previousScore} → ${brief.score} · ${t('sessions.brief.stats.vsPrevious')}`
							}
						>
							<ScoreTrendText
								size='xl'
								verdict={brief.trend}
								current={brief.score}
								previous={brief.previousScore}
							/>
						</StripStat>
					</Group>
					<Group align='center' gap='md' wrap='nowrap' className={styles.rest}>
						<StripStat label={t('sessions.brief.stats.calls')}>
							<Text size='xl' fw={700}>
								{brief.calls}
							</Text>
						</StripStat>
						<Divider orientation='vertical' />
						<StripStat label={t('sessions.brief.stats.week')}>
							<Text size='sm' fw={600}>
								{dayjs(brief.weekFrom).format('D MMM')} –{' '}
								{dayjs(brief.weekTo).format('D MMM')}
							</Text>
						</StripStat>
					</Group>
				</Group>

				<Divider />

				<Stack gap='sm'>
					<Caption>{t('sessions.brief.findings')}</Caption>
					{!finding ? (
						<Text size='sm' c='dimmed'>
							{t('sessions.brief.noFindings')}
						</Text>
					) : (
						<Group gap='md' wrap='nowrap' justify='space-between'>
							<Group gap='xs' wrap='nowrap' flex={1} miw={0}>
								<Badge
									size='sm'
									variant={
										CRITICAL_ISSUES.has(finding.issue) ? 'light' : 'outline'
									}
									color={CRITICAL_ISSUES.has(finding.issue) ? 'red' : 'gray'}
								>
									{t(`issues.${finding.issue as CallIssueKey}`, {
										ns: 'qa.calls',
									})}
								</Badge>
							</Group>
							<Text size='xs' c='dimmed' w={150} ta='right'>
								{t('sessions.brief.findingOf', {
									count: finding.calls,
									total: brief.calls,
								})}
							</Text>
							<Progress
								w={120}
								size='sm'
								value={finding.share}
								color={CRITICAL_ISSUES.has(finding.issue) ? 'red' : 'gray'}
								aria-label={`${finding.share}%`}
							/>
						</Group>
					)}
				</Stack>

				<Divider />

				<Stack gap='md'>
					<Caption>{t('sessions.brief.guide')}</Caption>
					<Stack gap={4}>
						<Text size='sm' fw={600}>
							{t('sessions.brief.approach')}
						</Text>
						<Text size='sm' lh={1.6} maw='68ch' className={queueStyles.preWrap}>
							{brief.approach}
						</Text>
					</Stack>
					<Stack gap={4}>
						<Text size='sm' fw={600}>
							{t('sessions.brief.solution')}
						</Text>
						<Text size='sm' lh={1.6} maw='68ch'>
							{brief.solution}
						</Text>
					</Stack>
					<Stack gap={4}>
						<Text size='sm' fw={600}>
							{t('sessions.brief.example')}
						</Text>
						<Blockquote color='gray' p='md' maw='68ch'>
							<Text size='sm' lh={1.6} className={queueStyles.preWrap}>
								{brief.example}
							</Text>
						</Blockquote>
					</Stack>
				</Stack>
			</Stack>
		</SectionCard>
	);
}
