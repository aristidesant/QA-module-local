import { Stack } from '@mantine/core';
import { IconMailForward, IconSchool } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import EmptyState from '~/components/EmptyState';
import { SectionCard } from '~/components/SectionCard';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import type { AgentProfile } from '~/modules/qa/team/types';
import { AcceptanceCard } from '../../components/AcceptanceCard';
import { groupAssignments, pickNextUp } from '../../helpers';
import { AreaLedger } from '../AreaLedger';
import { NextUpCard } from '../NextUpCard';

interface AssignmentsTabProps {
	assignments: LmsAssignment[];
	contentById: Record<string, LmsContent>;
	profile: AgentProfile | undefined;
	onOpen: (contentId: string) => void;
	onAccept: (assignmentId: string) => void;
	onPropose: (assignment: LmsAssignment) => void;
}

export function AssignmentsTab({
	assignments,
	contentById,
	profile,
	onOpen,
	onAccept,
	onPropose,
}: AssignmentsTabProps) {
	const { t } = useTranslation('qa.lms');
	const groups = groupAssignments(assignments);
	const nextUp = pickNextUp(assignments);
	const nextContent = nextUp ? contentById[nextUp.contentId] : undefined;
	const rest = [
		...groups.mandatory.filter((a) => a.id !== nextUp?.id),
		...groups.optional,
	];
	const isEmpty = !groups.needsResponse.length && !nextUp && !rest.length;

	if (isEmpty) {
		return (
			<EmptyState
				icon={<IconSchool size={28} />}
				message={t('agent.assignments.empty')}
				description={t('agent.assignments.emptyDescription')}
			/>
		);
	}

	return (
		<Stack gap='lg'>
			{groups.needsResponse.length > 0 && (
				<SectionCard
					title={t('agent.assignments.needsResponse')}
					description={t('agent.assignments.needsResponseDescription')}
					icon={IconMailForward}
					headerAccent='yellow'
					contentSpacing={0}
				>
					{groups.needsResponse.map((a) => (
						<AcceptanceCard
							key={a.id}
							assignment={a}
							content={contentById[a.contentId]}
							onAccept={() => onAccept(a.id)}
							onPropose={() => onPropose(a)}
						/>
					))}
				</SectionCard>
			)}

			{nextUp && nextContent && (
				<NextUpCard
					assignment={nextUp}
					content={nextContent}
					profile={profile}
					onOpen={() => onOpen(nextContent.id)}
				/>
			)}

			<AreaLedger
				open={rest}
				completed={groups.completed}
				contentById={contentById}
				profile={profile}
				onOpen={onOpen}
			/>
		</Stack>
	);
}
