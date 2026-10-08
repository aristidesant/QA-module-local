import type { ReactNode } from 'react';
import {
	Badge,
	Button,
	Divider,
	Group,
	List,
	Stack,
	Text,
} from '@mantine/core';
import { IconPhone, IconSparkles } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingBrief, LmsAssignment, LmsContent } from '~/models/qa';
import type { CallIssueKey } from '~/modules/qa/calls/issues';
import { LMS_AREA_META, LMS_FORMAT_META } from '~/modules/qa/lms/constants';
import { managerPersona, today } from '~/modules/qa/lms/helpers';
import { day } from '~/modules/qa/lms/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useLmsStore } from '~/stores/qa/lmsStore';
import { SCORECARD_DIMENSION_META } from '../scorecard';
import { CRITICAL_ISSUES, ScoreTrendText, TierScore } from './QuietIndicators';
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

/** One block of the brief: a plain heading, an optional action on the right, then the content. */
function BriefBlock({
	title,
	action,
	children,
}: {
	title: string;
	action?: ReactNode;
	children: ReactNode;
}) {
	return (
		<Stack gap={6}>
			<Group justify='space-between' align='center' wrap='nowrap'>
				<Text size='sm' fw={600}>
					{title}
				</Text>
				{action}
			</Group>
			{children}
		</Stack>
	);
}

/**
 * The pre-loaded content of a weekly-batch session in one quiet card: plain
 * headings and dividers instead of one box per block, and color only where
 * something is critical (a Critical group, a falling score, a critical error).
 */
export function SessionBrief({
	brief,
	agentId,
	role,
	assignments,
	contentById,
	onOpenCall,
}: SessionBriefProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.calls', 'qa.lms']);
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
			<Stack gap='lg'>
				<Group gap='lg'>
					<TierScore score={brief.score} tier={brief.tier} />
					<ScoreTrendText
						verdict={brief.trend}
						current={brief.score}
						previous={brief.previousScore}
					/>
					<Text size='xs' c='dimmed'>
						{t(`sessions.batch.reason.${brief.reason}`)}
					</Text>
				</Group>

				<Divider />

				<BriefBlock title={t('sessions.brief.findings')}>
					{brief.findings.length === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('sessions.brief.noFindings')}
						</Text>
					) : (
						<Stack gap='sm'>
							{brief.findings.map((f) => {
								const critical = CRITICAL_ISSUES.has(f.issue);
								return (
									<Stack key={f.issue} gap={4}>
										<Group gap='xs'>
											<Badge
												size='sm'
												variant={critical ? 'light' : 'outline'}
												color={critical ? 'red' : 'gray'}
											>
												{t(`issues.${f.issue as CallIssueKey}`, {
													ns: 'qa.calls',
												})}
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
													color='gray'
													leftSection={<IconPhone size={10} />}
													className={pointerStyles.pointer}
													onClick={() => onOpenCall(id)}
												>
													{id}
												</Badge>
											))}
										</Group>
									</Stack>
								);
							})}
						</Stack>
					)}
				</BriefBlock>

				<Divider />

				<BriefBlock title={t('sessions.brief.approach')}>
					<Text size='sm'>{brief.approach}</Text>
				</BriefBlock>
				<BriefBlock title={t('sessions.brief.solution')}>
					<Text size='sm'>{brief.solution}</Text>
				</BriefBlock>
				<BriefBlock title={t('sessions.brief.example')}>
					<Text size='sm' className={queueStyles.preWrap}>
						{brief.example}
					</Text>
				</BriefBlock>

				<Divider />

				<BriefBlock
					title={t('sessions.brief.suggested')}
					action={
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
									<Text size='sm' component='span'>
										{c.title}
									</Text>
									<Text size='xs' c='dimmed' component='span'>
										{' · '}
										{t(LMS_FORMAT_META[c.format].labelKey, { ns: 'qa.lms' })}
										{' · '}
										{t(LMS_AREA_META[c.area].labelKey, { ns: 'qa.lms' })}
										{alreadyOpen.includes(c) &&
											` · ${t('sessions.brief.alreadyAssigned')}`}
									</Text>
								</List.Item>
							))}
						</List>
					)}
				</BriefBlock>

				<Divider />

				<BriefBlock title={t('sessions.brief.previous')}>
					{brief.previous ? (
						<Stack gap={2}>
							<Text size='sm'>
								{brief.previous.topic} ·{' '}
								{dayjs(brief.previous.date).format('D MMM YYYY')}
							</Text>
							<Text
								size='xs'
								c={brief.previous.verdict === 'DECLINED' ? 'red' : 'dimmed'}
								fw={brief.previous.verdict === 'DECLINED' ? 600 : 400}
							>
								{brief.previous.dimension
									? t(
											SCORECARD_DIMENSION_META[brief.previous.dimension]
												.labelKey
										)
									: t('sessions.brief.composite')}
								: {brief.previous.before} → {brief.previous.after} ·{' '}
								{t(`verdict.${brief.previous.verdict}`, { ns: 'qa.lms' })}
							</Text>
						</Stack>
					) : (
						<Text size='sm' c='dimmed'>
							{t('sessions.brief.noPrevious')}
						</Text>
					)}
				</BriefBlock>
			</Stack>
		</SectionCard>
	);
}
