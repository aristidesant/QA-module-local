import type { ReactNode } from 'react';
import {
	Badge,
	Blockquote,
	Divider,
	Group,
	Paper,
	Progress,
	Stack,
	Text,
} from '@mantine/core';
import { Sparkline } from '@mantine/charts';
import {
	IconMinus,
	IconSparkles,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingBrief, CoachingBriefFinding } from '~/models/qa';
import type { CallIssueKey } from '~/modules/qa/calls/issues';
import { LMS_AREA_META } from '~/modules/qa/lms/constants';
import { COACHING_PLAYBOOK, type PlaybookEntry } from '../playbook';
import { FINDING_HISTORY_WEEKS } from '../weeklyBatch';
import { CRITICAL_ISSUES } from './QuietIndicators';
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

/** Drop in clean calls (points, first to last week) that reads as a decline. */
const DECLINE_POINTS = 5;

/**
 * One aspect to improve: the incident, the evaluation type it belongs to,
 * how much of the week it touched, how it moved over the last weeks and why
 * the platform picked it. Red only for a critical error type or a decline.
 */
function FindingCard({
	finding,
	totalCalls,
}: {
	finding: CoachingBriefFinding;
	totalCalls: number;
}) {
	const { t } = useTranslation(['qa.coaching', 'qa.calls', 'qa.lms']);
	const issue = finding.issue as CallIssueKey;
	const critical = CRITICAL_ISSUES.has(issue);
	const area = LMS_AREA_META[COACHING_PLAYBOOK[issue].area];
	const AreaIcon = area.icon;

	const history = finding.history;
	const first = history[0];
	const last = history.at(-1) ?? first;
	const delta = first && last ? last.cleanRate - first.cleanRate : 0;
	const declined = history.length > 1 && delta <= -DECLINE_POINTS;
	const improved = history.length > 1 && delta >= DECLINE_POINTS;
	const TrendIcon = declined
		? IconTrendingDown
		: improved
			? IconTrendingUp
			: IconMinus;
	const previous = history.at(-2);

	return (
		<Paper withBorder radius='md' p='md' className={styles.finding}>
			<Stack gap='md'>
				<Group gap='sm' wrap='wrap' align='center'>
					<Badge
						size='sm'
						variant={critical ? 'light' : 'outline'}
						color={critical ? 'red' : 'gray'}
					>
						{t(`issues.${issue}`, { ns: 'qa.calls' })}
					</Badge>
					<Group gap={6} wrap='nowrap'>
						<AreaIcon
							size={14}
							color='var(--mantine-color-dimmed)'
							aria-hidden
						/>
						<Text size='xs' c='dimmed'>
							{t('sessions.brief.evaluationType')}
							{' · '}
							<Text span size='xs' fw={600} c='var(--mantine-color-text)'>
								{t(area.labelKey, { ns: 'qa.lms' })}
							</Text>
						</Text>
					</Group>
				</Group>

				<div className={styles.facts}>
					<Stack gap={6}>
						<Caption>{t('sessions.brief.thisWeek')}</Caption>
						<Text size='sm' fw={600}>
							{t('sessions.brief.findingOf', {
								count: finding.calls,
								total: totalCalls,
							})}
						</Text>
						<Progress
							size='sm'
							value={finding.share}
							color={critical ? 'red' : 'gray'}
							aria-label={`${finding.share}%`}
						/>
					</Stack>

					<Stack gap={6}>
						<Caption>
							{t('sessions.brief.lastWeeks', { count: FINDING_HISTORY_WEEKS })}
						</Caption>
						{history.length < 2 ? (
							<>
								<Text size='sm' fw={600}>
									{t('sessions.brief.cleanNow', {
										value: last?.cleanRate ?? 0,
									})}
								</Text>
								<Text size='xs' c='dimmed'>
									{t('sessions.brief.noTrend')}
								</Text>
							</>
						) : (
							<>
								<Sparkline
									h={28}
									data={history.map((w) => w.cleanRate)}
									color={declined ? 'red.6' : 'gray.6'}
									fillOpacity={0.12}
									strokeWidth={1.5}
									curveType='monotone'
								/>
								<Group
									gap={4}
									wrap='nowrap'
									c={declined ? 'red' : 'dimmed'}
									title={`${dayjs(first.weekFrom).format('D MMM')} – ${dayjs(last.weekFrom).format('D MMM')}`}
								>
									<TrendIcon size={14} />
									<Text size='xs' c='inherit' fw={declined ? 600 : 400}>
										{t('sessions.brief.cleanTrend', {
											from: first.cleanRate,
											to: last.cleanRate,
										})}
									</Text>
								</Group>
							</>
						)}
					</Stack>

					<Stack gap={6}>
						<Caption>{t('sessions.brief.whyFlagged')}</Caption>
						<Text size='sm' lh={1.5}>
							{t(`sessions.brief.why.${finding.signal}`, {
								from: previous?.cleanRate ?? last?.cleanRate ?? 0,
								to: last?.cleanRate ?? 0,
							})}
						</Text>
					</Stack>
				</div>
			</Stack>
		</Paper>
	);
}

/** The approach, the fix and a real example for one aspect. */
function GuideEntry({
	title,
	entry,
}: {
	title: string | null;
	entry: Pick<PlaybookEntry, 'approach' | 'solution' | 'example'>;
}) {
	const { t } = useTranslation('qa.coaching');
	return (
		<Stack gap='md'>
			{title && (
				<Text size='sm' fw={700}>
					{title}
				</Text>
			)}
			<Stack gap={4}>
				<Text size='sm' fw={600}>
					{t('sessions.brief.approach')}
				</Text>
				<Text size='sm' lh={1.6} maw='68ch' className={queueStyles.preWrap}>
					{entry.approach}
				</Text>
			</Stack>
			<Stack gap={4}>
				<Text size='sm' fw={600}>
					{t('sessions.brief.solution')}
				</Text>
				<Text size='sm' lh={1.6} maw='68ch'>
					{entry.solution}
				</Text>
			</Stack>
			<Stack gap={4}>
				<Text size='sm' fw={600}>
					{t('sessions.brief.example')}
				</Text>
				<Blockquote color='gray' p='md' maw='68ch'>
					<Text size='sm' lh={1.6} className={queueStyles.preWrap}>
						{entry.example}
					</Text>
				</Blockquote>
			</Stack>
		</Stack>
	);
}

interface SessionBriefProps {
	brief: CoachingBrief;
	/** The coaching guide is for a 1:1; an automated message carries its own text instead. */
	showGuide: boolean;
}

/**
 * The weekly brief: the week and its calls, then each aspect to improve with
 * its evaluation type, trend and the reason it was picked, and, for a 1:1,
 * the coaching guide per aspect. The composite scorecard stays out: the
 * session is about what to work on, not the overall number.
 */
export function SessionBrief({ brief, showGuide }: SessionBriefProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.calls']);
	const findings = brief.findings;

	return (
		<SectionCard
			icon={IconSparkles}
			title={t('sessions.brief.title')}
			padding='md'
		>
			<Stack gap='lg'>
				<Group align='center' gap='md' wrap='nowrap' className={styles.strip}>
					<StripStat label={t('sessions.brief.stats.week')}>
						<Text size='sm' fw={600}>
							{dayjs(brief.weekFrom).format('D MMM')} –{' '}
							{dayjs(brief.weekTo).format('D MMM')}
						</Text>
					</StripStat>
					<Divider orientation='vertical' />
					<StripStat label={t('sessions.brief.stats.calls')}>
						<Text size='sm' fw={600}>
							{brief.calls}
						</Text>
					</StripStat>
				</Group>

				<Divider />

				<Stack gap='sm'>
					<Group gap='xs'>
						<Caption>{t('sessions.brief.findings')}</Caption>
						{findings.length > 0 && (
							<Badge size='xs' variant='light' color='gray'>
								{findings.length}
							</Badge>
						)}
					</Group>
					{findings.length === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('sessions.brief.noFindings')}
						</Text>
					) : (
						<Stack gap='sm'>
							{findings.map((finding) => (
								<FindingCard
									key={finding.issue}
									finding={finding}
									totalCalls={brief.calls}
								/>
							))}
						</Stack>
					)}
				</Stack>

				{showGuide && (
					<>
						<Divider />
						<Stack gap='lg'>
							<Caption>{t('sessions.brief.guide')}</Caption>
							{findings.length === 0 ? (
								<GuideEntry title={null} entry={brief} />
							) : (
								findings.map((finding, index) => {
									const entry =
										COACHING_PLAYBOOK[finding.issue as CallIssueKey];
									return (
										<Stack key={finding.issue} gap='lg'>
											{index > 0 && <Divider variant='dashed' />}
											<GuideEntry
												title={findings.length > 1 ? entry.topic : null}
												entry={entry}
											/>
										</Stack>
									);
								})
							)}
						</Stack>
					</>
				)}
			</Stack>
		</SectionCard>
	);
}
