import { useState } from 'react';
import {
	ActionIcon,
	Blockquote,
	Button,
	Group,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconCheck, IconClock, IconPlus, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type {
	CoachingBrief,
	CoachingBriefPrevious,
	CoachingSessionRecord,
	LmsAssignment,
	LmsContent,
} from '~/models/qa';
import { MaterialPickerModal } from '~/modules/qa/lms/components/MaterialPickerModal';
import { LMS_AREA_META, LMS_FORMAT_META } from '~/modules/qa/lms/constants';
import { useCoachingStore } from '~/stores/qa/coachingStore';
import { SCORECARD_DIMENSION_META } from '../scorecard';
import queueStyles from './Queue.module.css';
import { Caption } from './SessionBrief';

interface SuggestedMaterialCardProps {
	sessionId: string;
	brief: CoachingBrief;
	agentId: string;
	assignments: LmsAssignment[];
	contentById: Record<string, LmsContent>;
	/** False once the session was held, sent, missed or cancelled. */
	editable: boolean;
}

/**
 * The material this session brings to the agent. The platform proposes some;
 * the supervisor can remove any of it and add more from the Learning &
 * Development library.
 */
export function SuggestedMaterialCard({
	sessionId,
	brief,
	agentId,
	assignments,
	contentById,
	editable,
}: SuggestedMaterialCardProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const [pickerOpen, setPickerOpen] = useState(false);
	const ids = brief.suggestedContentIds;
	const suggested = ids
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

	const save = (next: string[]) =>
		useCoachingStore.getState().setSuggestedMaterials(sessionId, next);

	return (
		<SectionCard
			title={t('sessions.brief.suggested')}
			padding='md'
			headerActions={
				editable && (
					<Button
						size='xs'
						variant='default'
						leftSection={<IconPlus size={14} />}
						onClick={() => setPickerOpen(true)}
					>
						{t('sessions.brief.addMaterial')}
					</Button>
				)
			}
		>
			{suggested.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{t('sessions.brief.noSuggested')}
				</Text>
			) : (
				<Stack gap='sm'>
					{suggested.map((c) => (
						<Group key={c.id} justify='space-between' wrap='nowrap'>
							<Stack gap={0} miw={0}>
								<Text size='sm'>{c.title}</Text>
								<Text size='xs' c='dimmed'>
									{t(LMS_FORMAT_META[c.format].labelKey, { ns: 'qa.lms' })}
									{' · '}
									{t(LMS_AREA_META[c.area].labelKey, { ns: 'qa.lms' })}
									{alreadyOpen.includes(c) &&
										` · ${t('sessions.brief.alreadyAssigned')}`}
								</Text>
							</Stack>
							{editable && (
								<Tooltip label={t('sessions.brief.removeMaterial')} withArrow>
									<ActionIcon
										variant='subtle'
										color='gray'
										size='sm'
										aria-label={t('sessions.brief.removeMaterial')}
										onClick={() => save(ids.filter((id) => id !== c.id))}
									>
										<IconX size={14} />
									</ActionIcon>
								</Tooltip>
							)}
						</Group>
					))}
				</Stack>
			)}

			<MaterialPickerModal
				opened={pickerOpen}
				onClose={() => setPickerOpen(false)}
				mode='content'
				selectedIds={ids}
				initialArea={null}
				onConfirm={(next) => {
					save(next);
					setPickerOpen(false);
				}}
			/>
		</SectionCard>
	);
}

interface PreviousSessionCardProps {
	/** The agent's last completed coach-led session before this one; null when there is none. */
	previous: CoachingSessionRecord | null;
	/** How the aspect worked on then has moved since, when the brief measured it. */
	comparison: CoachingBriefPrevious | null;
}

/**
 * The previous coach-led session in full: what was agreed, the commitments and
 * whether they are done, the agent's response and the supervisor's own notes.
 * Red only when the aspect worked on fell.
 */
export function PreviousSessionCard({
	previous,
	comparison,
}: PreviousSessionCardProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const declined = comparison?.verdict === 'DECLINED';

	return (
		<SectionCard title={t('sessions.previous.title')} padding='md'>
			{!previous ? (
				<Text size='sm' c='dimmed'>
					{t('sessions.brief.noPrevious')}
				</Text>
			) : (
				<Stack gap='md'>
					<Stack gap={2}>
						<Text size='sm' fw={600}>
							{previous.topic}
						</Text>
						<Text size='xs' c='dimmed'>
							{dayjs(previous.date).format('D MMM YYYY')} · {previous.coachName}
						</Text>
						{comparison && (
							<>
								<Text size='xs' c='dimmed'>
									{comparison.dimension
										? t(SCORECARD_DIMENSION_META[comparison.dimension].labelKey)
										: t('sessions.brief.composite')}
									: {comparison.before} → {comparison.after}
								</Text>
								<Text
									size='xs'
									c={declined ? 'red' : 'dimmed'}
									fw={declined ? 600 : 400}
								>
									{t(`verdict.${comparison.verdict}`, { ns: 'qa.lms' })}
								</Text>
							</>
						)}
					</Stack>

					<Stack gap={4}>
						<Caption>{t('sessions.previous.agreed')}</Caption>
						{previous.outcome ? (
							<Text size='sm'>{previous.outcome}</Text>
						) : (
							<Text size='sm' c='dimmed'>
								{t('sessions.previous.noOutcome')}
							</Text>
						)}
					</Stack>

					<Stack gap={4}>
						<Caption>{t('sessions.previous.commitments')}</Caption>
						{previous.actionItems.length === 0 ? (
							<Text size='sm' c='dimmed'>
								{t('sessions.previous.noCommitments')}
							</Text>
						) : (
							previous.actionItems.map((item) => (
								<Group key={item.id} gap='xs' wrap='nowrap' align='flex-start'>
									{item.done ? (
										<IconCheck size={14} />
									) : (
										<IconClock size={14} />
									)}
									<Text size='sm' flex={1}>
										{item.text}
									</Text>
									<Text size='xs' c='dimmed' flex='none'>
										{dayjs(item.dueDate).format('D MMM')}
									</Text>
								</Group>
							))
						)}
					</Stack>

					<Stack gap={4}>
						<Caption>{t('sessions.previous.agentResponse')}</Caption>
						<Text size='sm'>
							{previous.agentCommitment.acknowledged
								? t('sessions.detail.committedOn', {
										date: dayjs(previous.agentCommitment.acknowledgedAt).format(
											'D MMM YYYY'
										),
									})
								: t('sessions.detail.notCommitted')}
						</Text>
						{previous.agentCommitment.comment && (
							<Blockquote color='gray' p='xs' mt={0}>
								<Text size='sm'>{previous.agentCommitment.comment}</Text>
							</Blockquote>
						)}
					</Stack>

					<Stack gap={4}>
						<Caption>{t('sessions.previous.notes')}</Caption>
						{previous.notes.trim() ? (
							<Text size='sm' className={queueStyles.preWrap}>
								{previous.notes}
							</Text>
						) : (
							<Text size='sm' c='dimmed'>
								{t('sessions.previous.noNotes')}
							</Text>
						)}
					</Stack>
				</Stack>
			)}
		</SectionCard>
	);
}
