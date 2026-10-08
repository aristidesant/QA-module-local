import { Button, Stack, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingBrief, LmsAssignment, LmsContent } from '~/models/qa';
import { LMS_AREA_META, LMS_FORMAT_META } from '~/modules/qa/lms/constants';
import { managerPersona, today } from '~/modules/qa/lms/helpers';
import { day } from '~/modules/qa/lms/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useLmsStore } from '~/stores/qa/lmsStore';
import { SCORECARD_DIMENSION_META } from '../scorecard';

interface SuggestedMaterialCardProps {
	brief: CoachingBrief;
	agentId: string;
	role: TeamRole;
	assignments: LmsAssignment[];
	contentById: Record<string, LmsContent>;
}

/** The material the brief proposes, with one button to assign what the agent does not have open yet. */
export function SuggestedMaterialCard({
	brief,
	agentId,
	role,
	assignments,
	contentById,
}: SuggestedMaterialCardProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
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
			title={t('sessions.brief.suggested')}
			padding='md'
			headerActions={
				assignable.length > 0 && (
					<Button size='xs' variant='default' onClick={assignSuggested}>
						{t('sessions.brief.assignSuggested', { count: assignable.length })}
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
						<Stack key={c.id} gap={0}>
							<Text size='sm'>{c.title}</Text>
							<Text size='xs' c='dimmed'>
								{t(LMS_FORMAT_META[c.format].labelKey, { ns: 'qa.lms' })}
								{' · '}
								{t(LMS_AREA_META[c.area].labelKey, { ns: 'qa.lms' })}
								{alreadyOpen.includes(c) &&
									` · ${t('sessions.brief.alreadyAssigned')}`}
							</Text>
						</Stack>
					))}
				</Stack>
			)}
		</SectionCard>
	);
}

/** How the aspect worked on in the previous coach-led session moved since then; red only when it fell. */
export function PreviousSessionCard({ brief }: { brief: CoachingBrief }) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const previous = brief.previous;
	const declined = previous?.verdict === 'DECLINED';

	return (
		<SectionCard title={t('sessions.brief.previous')} padding='md'>
			{previous ? (
				<Stack gap={2}>
					<Text size='sm'>
						{previous.topic} · {dayjs(previous.date).format('D MMM YYYY')}
					</Text>
					<Text size='xs' c='dimmed'>
						{previous.dimension
							? t(SCORECARD_DIMENSION_META[previous.dimension].labelKey)
							: t('sessions.brief.composite')}
						: {previous.before} → {previous.after}
					</Text>
					<Text
						size='xs'
						c={declined ? 'red' : 'dimmed'}
						fw={declined ? 600 : 400}
					>
						{t(`verdict.${previous.verdict}`, { ns: 'qa.lms' })}
					</Text>
				</Stack>
			) : (
				<Text size='sm' c='dimmed'>
					{t('sessions.brief.noPrevious')}
				</Text>
			)}
		</SectionCard>
	);
}
