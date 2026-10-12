import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Anchor, Badge, Group, Stack, Text } from '@mantine/core';
import { IconPhone } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { LmsContent } from '~/models/qa';
import { FormatBadge } from '~/modules/qa/lms/components/Badges';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';
import { LMS_AREA_META } from '~/modules/qa/lms/constants';
import { dueLabel } from '~/modules/qa/lms/helpers';
import type { CallIssueKey } from '~/modules/qa/calls/issues';
import { COACHING_PLAYBOOK } from '~/modules/qa/coaching/playbook';
import { CRITICAL_ISSUES } from '~/modules/qa/coaching/components/QuietIndicators';
import { Caption } from '~/modules/qa/coaching/components/SessionBrief';
import queueStyles from '~/modules/qa/coaching/components/Queue.module.css';
import { selectSessions, useCoachingStore } from '~/stores/qa/coachingStore';
import { findCoachingSessionFor } from '../helpers';
import {
	selectAssignments,
	selectContent,
	useLmsStore,
} from '~/stores/qa/lmsStore';

interface CoachingSessionContextProps {
	/** The coaching session the message points at. */
	sessionId: string;
	/** The agent the message is for, used to find their latest weekly session. */
	agentId: string;
	/** Opens a material; leave out when the viewer cannot open it. */
	onOpenMaterial?: (contentId: string) => void;
}

/**
 * What the coaching session covers, read live from the same record the
 * supervisor sees in Coachings → Sessions: the problem, how to approach it, the
 * fix, an example and the evidence calls.
 */
export function CoachingSessionContext({
	sessionId,
	agentId,
	onOpenMaterial,
}: CoachingSessionContextProps) {
	const { t } = useTranslation(['qa.inbox', 'qa.calls']);
	const { t: tLms } = useTranslation('qa.lms');
	const navigate = useNavigate();
	const sessions = useCoachingStore(selectSessions);
	const assignments = useLmsStore(selectAssignments);
	const library = useLmsStore(selectContent);

	const session = findCoachingSessionFor(sessions, sessionId, agentId);
	const brief = session?.brief;

	// What the agent should study: the material this coaching suggests, anything linked to it, and what
	// the agent already has open for this issue (the brief leaves that out of its suggestions),
	// each marked mandatory when the agent has it assigned as such.
	const materials = useMemo(() => {
		if (!session) return [];
		const issue = session.brief?.findings[0]?.issue as CallIssueKey | undefined;
		const open = (id: string) =>
			assignments.some(
				(a) =>
					a.agentId === agentId &&
					a.contentId === id &&
					a.status !== 'COMPLETED'
			);
		const ids = [
			...(session.brief?.suggestedContentIds ?? []),
			...(issue ? COACHING_PLAYBOOK[issue].contentIds.filter(open) : []),
			...session.linkedAssignmentIds
				.map((id) => assignments.find((a) => a.id === id)?.contentId)
				.filter((id): id is string => Boolean(id)),
		];
		return [...new Set(ids)].flatMap((id) => {
			const content = library.find((c) => c.id === id);
			if (!content) return [];
			const assignment = assignments
				.filter(
					(a) =>
						a.agentId === agentId &&
						a.contentId === id &&
						a.status !== 'COMPLETED'
				)
				.sort((a, b) => Number(b.mandatory) - Number(a.mandatory))[0];
			return [{ content, assignment: assignment ?? null }];
		});
	}, [session, assignments, library, agentId]);

	if (!session || !brief) return null;

	const finding = brief.findings[0];
	const evidence = session.evidenceCallIds.length
		? session.evidenceCallIds
		: (finding?.evidenceCallIds ?? []);
	const critical = finding ? CRITICAL_ISSUES.has(finding.issue) : false;

	return (
		<Stack gap='md'>
			<SectionCard title={t('details.coaching.sessionTitle')} padding='md'>
				<Stack gap='lg'>
					{finding && (
						<Stack gap={6}>
							<Caption>{t('details.coaching.problem')}</Caption>
							<Group gap='sm'>
								<Badge
									size='sm'
									variant={critical ? 'light' : 'outline'}
									color={critical ? 'red' : 'gray'}
								>
									{t(`issues.${finding.issue}`, { ns: 'qa.calls' })}
								</Badge>
								<Text size='xs' c='dimmed'>
									{t('details.coaching.problemOf', {
										count: finding.calls,
										total: brief.calls,
									})}
								</Text>
							</Group>
						</Stack>
					)}

					{brief.approach && (
						<Stack gap={4}>
							<Caption>{t('details.coaching.approach')}</Caption>
							<Text size='sm' className={queueStyles.preWrap}>
								{brief.approach}
							</Text>
						</Stack>
					)}

					{brief.solution && (
						<Stack gap={4}>
							<Caption>{t('details.coaching.solution')}</Caption>
							<Text size='sm' className={queueStyles.preWrap}>
								{brief.solution}
							</Text>
						</Stack>
					)}

					{brief.example && (
						<Stack gap={4}>
							<Caption>{t('details.coaching.example')}</Caption>
							<Text size='sm' c='dimmed' className={queueStyles.preWrap}>
								{brief.example}
							</Text>
						</Stack>
					)}

					{evidence.length > 0 && (
						<Stack gap={6}>
							<Caption>{t('details.coaching.evidence')}</Caption>
							<Group gap='xs'>
								{evidence.map((callId) => (
									<Badge
										key={callId}
										size='sm'
										variant='outline'
										color='gray'
										leftSection={<IconPhone size={12} />}
										className={pointerStyles.pointer}
										onClick={() => navigate(`/qa/campaigns/1/calls/${callId}`)}
									>
										{callId}
									</Badge>
								))}
							</Group>
						</Stack>
					)}
				</Stack>
			</SectionCard>

			<SectionCard title={t('details.coaching.materialsTitle')} padding='md'>
				{materials.length === 0 ? (
					<Text size='sm' c='dimmed'>
						{t('details.coaching.noMaterials')}
					</Text>
				) : (
					<Stack gap='sm'>
						{materials.map(({ content, assignment }) => (
							<Group key={content.id} justify='space-between' wrap='nowrap'>
								<Stack gap={2} miw={0}>
									{onOpenMaterial ? (
										<Anchor
											component='button'
											type='button'
											size='sm'
											ta='left'
											onClick={() => onOpenMaterial(content.id)}
										>
											{content.title}
										</Anchor>
									) : (
										<Text size='sm'>{content.title}</Text>
									)}
									<Group gap='xs'>
										<FormatBadge format={content.format} size='xs' />
										<Text size='xs' c='dimmed'>
											{tLms(
												LMS_AREA_META[content.area as LmsContent['area']]
													.labelKey
											)}
											{assignment && ` · ${dueLabel(tLms, assignment)}`}
										</Text>
									</Group>
								</Stack>
								<Badge
									size='xs'
									variant={assignment?.mandatory ? 'filled' : 'outline'}
									color='gray'
								>
									{assignment?.mandatory
										? t('details.coaching.mandatory')
										: t('details.coaching.suggested')}
								</Badge>
							</Group>
						))}
					</Stack>
				)}
			</SectionCard>
		</Stack>
	);
}
