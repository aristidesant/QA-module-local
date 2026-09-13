import { SimpleGrid, Stack } from '@mantine/core';
import { IconBook, IconCalendarDue, IconMailForward } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import { AcceptanceCard } from '../../components/AcceptanceCard';
import { AssignmentCard } from '../../components/AssignmentCard';
import { groupAssignments } from '../../helpers';

interface AssignmentsTabProps {
	assignments: LmsAssignment[];
	contentById: Record<string, LmsContent>;
	onOpen: (contentId: string) => void;
	onAccept: (assignmentId: string) => void;
	onPropose: (assignment: LmsAssignment) => void;
}

export function AssignmentsTab({ assignments, contentById, onOpen, onAccept, onPropose }: AssignmentsTabProps) {
	const { t } = useTranslation('qa.lms');
	const groups = groupAssignments(assignments);
	const isEmpty = !groups.needsResponse.length && !groups.mandatory.length && !groups.optional.length;

	if (isEmpty) {
		return <EmptyState message={t('agent.assignments.empty')} />;
	}

	return (
		<Stack gap='md'>
			{groups.needsResponse.length > 0 && (
				<SectionCard
					title={t('agent.assignments.needsResponse')}
					description={t('agent.assignments.needsResponseDescription')}
					icon={IconMailForward}
					headerAccent='yellow'
				>
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
						{groups.needsResponse.map((a) => (
							<AcceptanceCard
								key={a.id}
								assignment={a}
								content={contentById[a.contentId]}
								onAccept={() => onAccept(a.id)}
								onPropose={() => onPropose(a)}
							/>
						))}
					</SimpleGrid>
				</SectionCard>
			)}

			{groups.mandatory.length > 0 && (
				<SectionCard
					title={t('agent.assignments.mandatory')}
					description={t('agent.assignments.mandatoryDescription')}
					icon={IconCalendarDue}
				>
					<Stack gap='sm'>
						{groups.mandatory.map((a) => (
							<AssignmentCard
								key={a.id}
								assignment={a}
								content={contentById[a.contentId]}
								onOpen={() => onOpen(a.contentId)}
							/>
						))}
					</Stack>
				</SectionCard>
			)}

			{groups.optional.length > 0 && (
				<SectionCard
					title={t('agent.assignments.optional')}
					description={t('agent.assignments.optionalDescription')}
					icon={IconBook}
				>
					<Stack gap='sm'>
						{groups.optional.map((a) => (
							<AssignmentCard
								key={a.id}
								assignment={a}
								content={contentById[a.contentId]}
								onOpen={() => onOpen(a.contentId)}
							/>
						))}
					</Stack>
				</SectionCard>
			)}
		</Stack>
	);
}
