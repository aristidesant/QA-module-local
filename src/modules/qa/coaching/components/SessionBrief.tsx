import { Badge, Button, Group, List, Stack, Text } from '@mantine/core';
import { IconBook, IconPhone, IconSparkles } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingBrief, LmsAssignment, LmsContent } from '~/models/qa';
import {
	CALL_ISSUE_BY_KEY,
	type CallIssueKey,
} from '~/modules/qa/calls/issues';
import { AreaBadge, FormatBadge } from '~/modules/qa/lms/components/Badges';
import { VERDICT_COLOR } from '~/modules/qa/lms/constants';
import { managerPersona, today } from '~/modules/qa/lms/helpers';
import { day } from '~/modules/qa/lms/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useLmsStore } from '~/stores/qa/lmsStore';
import { SCORECARD_DIMENSION_META, TIER_META } from '../scorecard';
import { ScorecardTrendBadge, TierBadge } from './ScorecardBadges';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';
import queueStyles from './Queue.module.css';

interface SessionBriefProps {
	brief: CoachingBrief;
	agentId: string;
	role: TeamRole;
	assignments: LmsAssignment[];
	contentById: Record<string, LmsContent>;
	onOpenCall: (callId: string) => void;
}

/** The pre-loaded content of a weekly-batch session, as cards inside the detail drawer. */
export function SessionBrief({
	brief,
	agentId,
	role,
	assignments,
	contentById,
	onOpenCall,
}: SessionBriefProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.calls', 'qa.lms']);
	const trend =
		brief.trend && brief.previousScore !== null
			? {
					verdict: brief.trend,
					current: brief.score,
					previous: brief.previousScore,
					delta: brief.score - brief.previousScore,
				}
			: null;
	const suggested = brief.suggestedContentIds
		.map((id) => contentById[id])
		.filter((c): c is LmsContent => Boolean(c));
	const alreadyOpen = suggested.filter((c) =>
		assignments.some(
			(a) =>
				a.agentId === agentId &&
				a.contentId === c.id &&
				a.status !== 'COMPLETED'
		)
	);
	const assignable = suggested.filter((c) => !alreadyOpen.includes(c));

	const assignSuggested = () => {
		const persona = managerPersona(role);
		useLmsStore.getState().assign({
			agentIds: [agentId],
			contentIds: assignable.map((c) => c.id),
			dueDate: day(today(), 14),
			mandatory: false,
			requireAcceptance: false,
			reason: 'Suggested in the weekly coaching brief',
			source: 'MANUAL',
			assignedBy: persona.name,
			assignedByRole: persona.role,
		});
		notifySuccess(t('sessions.brief.assigned', { count: assignable.length }));
	};

	return (
		<>
			<SectionCard
				icon={IconSparkles}
				title={t('sessions.brief.title')}
				description={t('sessions.brief.week', {
					from: dayjs(brief.weekFrom).format('D MMM'),
					to: dayjs(brief.weekTo).format('D MMM'),
					count: brief.calls,
				})}
				padding='md'
			>
				<Group gap='xs'>
					<Badge variant='filled' color={TIER_META[brief.tier].color}>
						{brief.score}
					</Badge>
					<TierBadge tier={brief.tier} size='sm' />
					<ScorecardTrendBadge trend={trend} size='sm' />
					<Badge size='sm' variant='outline' color='violet'>
						{t(`sessions.batch.reason.${brief.reason}`)}
					</Badge>
				</Group>
			</SectionCard>

			<SectionCard title={t('sessions.brief.findings')} padding='md'>
				{brief.findings.length === 0 ? (
					<Text size='sm' c='dimmed'>
						{t('sessions.brief.noFindings')}
					</Text>
				) : (
					<Stack gap='sm'>
						{brief.findings.map((f) => (
							<Stack key={f.issue} gap={4}>
								<Group gap='xs'>
									<Badge
										size='sm'
										variant='light'
										color={CALL_ISSUE_BY_KEY[f.issue as CallIssueKey].color}
									>
										{t(`issues.${f.issue}`, { ns: 'qa.calls' })}
									</Badge>
									<Text size='xs' c='dimmed'>
										{t('sessions.brief.findingCalls', {
											count: f.calls,
											share: f.share,
										})}
									</Text>
								</Group>
								<Group gap={6}>
									{f.evidenceCallIds.map((id) => (
										<Badge
											key={id}
											size='xs'
											variant='outline'
											leftSection={<IconPhone size={10} />}
											className={pointerStyles.pointer}
											onClick={() => onOpenCall(id)}
										>
											{id}
										</Badge>
									))}
								</Group>
							</Stack>
						))}
					</Stack>
				)}
			</SectionCard>

			<SectionCard title={t('sessions.brief.approach')} padding='md'>
				<Text size='sm'>{brief.approach}</Text>
			</SectionCard>
			<SectionCard title={t('sessions.brief.solution')} padding='md'>
				<Text size='sm'>{brief.solution}</Text>
			</SectionCard>
			<SectionCard title={t('sessions.brief.example')} padding='md'>
				<Text size='sm' className={queueStyles.preWrap}>
					{brief.example}
				</Text>
			</SectionCard>

			<SectionCard
				icon={IconBook}
				title={t('sessions.brief.suggested')}
				padding='md'
				headerActions={
					assignable.length > 0 && (
						<Button size='xs' variant='default' onClick={assignSuggested}>
							{t('sessions.brief.assignSuggested', {
								count: assignable.length,
							})}
						</Button>
					)
				}
			>
				{suggested.length === 0 ? (
					<Text size='sm' c='dimmed'>
						{t('sessions.brief.noSuggested')}
					</Text>
				) : (
					<List spacing='xs' size='sm'>
						{suggested.map((c) => (
							<List.Item key={c.id}>
								<Group gap='xs' wrap='nowrap'>
									<Text size='sm'>{c.title}</Text>
									<FormatBadge format={c.format} size='xs' />
									{c.area !== 'GENERAL' && (
										<AreaBadge area={c.area} size='xs' />
									)}
									{alreadyOpen.includes(c) && (
										<Badge size='xs' variant='light' color='gray'>
											{t('sessions.brief.alreadyAssigned')}
										</Badge>
									)}
								</Group>
							</List.Item>
						))}
					</List>
				)}
			</SectionCard>

			<SectionCard title={t('sessions.brief.previous')} padding='md'>
				{brief.previous ? (
					<Stack gap={4}>
						<Text size='sm' fw={500}>
							{brief.previous.topic} ·{' '}
							{dayjs(brief.previous.date).format('D MMM YYYY')}
						</Text>
						<Group gap='xs'>
							<Text size='xs' c='dimmed'>
								{brief.previous.dimension
									? t(
											SCORECARD_DIMENSION_META[brief.previous.dimension]
												.labelKey
										)
									: t('sessions.brief.composite')}
								: {brief.previous.before} → {brief.previous.after}
							</Text>
							<Badge
								size='xs'
								variant='light'
								color={VERDICT_COLOR[brief.previous.verdict]}
							>
								{t(`verdict.${brief.previous.verdict}`, { ns: 'qa.lms' })}
							</Badge>
						</Group>
					</Stack>
				) : (
					<Text size='sm' c='dimmed'>
						{t('sessions.brief.noPrevious')}
					</Text>
				)}
			</SectionCard>
		</>
	);
}
