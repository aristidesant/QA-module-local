import { Avatar, Badge, Button, Group, Paper, Progress, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconPlus, IconRoute, IconUsersGroup } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type { CoachingCohort, LmsAssignment, LmsLearningPath } from '~/models/qa';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';

interface CohortsTabProps {
	cohorts: CoachingCohort[];
	paths: LmsLearningPath[];
	assignments: LmsAssignment[];
	onOpen: (cohortId: string) => void;
	onCreate: () => void;
}

const initials = (name: string) =>
	name
		.split(' ')
		.map((p) => p[0])
		.join('')
		.slice(0, 2);

export function CohortsTab({ cohorts, paths, assignments, onOpen, onCreate }: CohortsTabProps) {
	const { t } = useTranslation('qa.coaching');

	if (cohorts.length === 0) {
		return (
			<EmptyState
				message={t('cohorts.empty')}
				action={
					<Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
						{t('newCohort')}
					</Button>
				}
			/>
		);
	}

	return (
		<SectionCard
			title={t('cohorts.title')}
			description={t('cohorts.description')}
			icon={IconUsersGroup}
			headerActions={
				<Button size='sm' leftSection={<IconPlus size={16} />} onClick={onCreate}>
					{t('newCohort')}
				</Button>
			}
		>
			<SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing='md'>
				{cohorts.map((cohort) => {
					const members = TEAM_AGENTS.filter((a) => cohort.agentIds.includes(a.id));
					const path = paths.find((p) => p.id === cohort.pathId);
					const cohortAssignments = assignments.filter((a) => cohort.agentIds.includes(a.agentId));
					const completed = cohortAssignments.filter((a) => a.status === 'COMPLETED').length;
					const completion = cohortAssignments.length
						? Math.round((completed / cohortAssignments.length) * 100)
						: 0;
					const improved = cohortAssignments.filter((a) => a.impact?.verdict === 'IMPROVED').length;

					return (
						<Paper
							key={cohort.id}
							withBorder
							p='md'
							radius='md'
							className={pointerStyles.pointer}
							onClick={() => onOpen(cohort.id)}
						>
							<Stack gap='sm'>
								<Stack gap={2}>
									<Text fw={600}>{cohort.name}</Text>
									<Text size='xs' c='dimmed' lineClamp={2}>
										{cohort.description}
									</Text>
								</Stack>

								<Group gap='xs'>
									<Avatar.Group spacing='sm'>
										{members.slice(0, 5).map((m) => (
											<Avatar key={m.id} size={26} radius='xl' color={m.avatarColor}>
												{initials(m.name)}
											</Avatar>
										))}
										{members.length > 5 && (
											<Avatar size={26} radius='xl'>
												+{members.length - 5}
											</Avatar>
										)}
									</Avatar.Group>
									<Text size='xs' c='dimmed'>
										{t('cohorts.members', { count: members.length })}
									</Text>
								</Group>

								<Group gap='xs'>
									{path && (
										<Badge size='xs' variant='light' color='blue' leftSection={<IconRoute size={12} />}>
											{path.title}
										</Badge>
									)}
									{cohort.ruleIds.length > 0 && (
										<Badge size='xs' variant='outline'>
											{t('cohorts.rules')}: {cohort.ruleIds.length}
										</Badge>
									)}
									{cohort.tags.map((tag) => (
										<Badge key={tag} size='xs' variant='dot' color='gray'>
											{tag}
										</Badge>
									))}
								</Group>

								<Stack gap={4}>
									<Group justify='space-between'>
										<Text size='xs' c='dimmed'>
											{t('cohorts.completion')}
										</Text>
										<Text size='xs' fw={600}>
											{completion}%
										</Text>
									</Group>
									<Progress value={completion} size='sm' radius='xl' />
									<Text size='xs' c='dimmed'>
										{t('cohorts.improved')}: {improved}
									</Text>
								</Stack>
							</Stack>
						</Paper>
					);
				})}
			</SimpleGrid>
		</SectionCard>
	);
}
