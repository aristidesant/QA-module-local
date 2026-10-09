import {
	Avatar,
	Button,
	Paper,
	Progress,
	SimpleGrid,
	Stack,
	Text,
} from '@mantine/core';
import { IconPlus, IconUsersGroup } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type {
	CoachingCohort,
	LmsAssignment,
	LmsLearningPath,
} from '~/models/qa';
import { initials } from '~/modules/qa/team/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import styles from './CohortsTab.module.css';

/** How many members show as initials before the rest collapse into "+N". */
const MAX_AVATARS = 4;

interface CohortsTabProps {
	cohorts: CoachingCohort[];
	paths: LmsLearningPath[];
	assignments: LmsAssignment[];
	onOpen: (cohortId: string) => void;
	onCreate: () => void;
}

export function CohortsTab({
	cohorts,
	paths,
	assignments,
	onOpen,
	onCreate,
}: CohortsTabProps) {
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
				<Button
					size='sm'
					leftSection={<IconPlus size={16} />}
					onClick={onCreate}
				>
					{t('newCohort')}
				</Button>
			}
		>
			<SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing='md'>
				{cohorts.map((cohort) => {
					const members = TEAM_AGENTS.filter((a) =>
						cohort.agentIds.includes(a.id)
					);
					const path = paths.find((p) => p.id === cohort.pathId);
					const cohortAssignments = assignments.filter((a) =>
						cohort.agentIds.includes(a.agentId)
					);
					const completed = cohortAssignments.filter(
						(a) => a.status === 'COMPLETED'
					).length;
					const completion = cohortAssignments.length
						? Math.round((completed / cohortAssignments.length) * 100)
						: 0;
					const improved = cohortAssignments.filter(
						(a) => a.impact?.verdict === 'IMPROVED'
					).length;
					const facts = [
						t('cohorts.members', { count: members.length }),
						path?.title,
						cohort.ruleIds.length > 0
							? t('cohorts.rulesCount', { count: cohort.ruleIds.length })
							: null,
					]
						.filter(Boolean)
						.join(' · ');

					return (
						<Paper
							key={cohort.id}
							withBorder
							p='md'
							radius='md'
							className={styles.card}
							role='button'
							tabIndex={0}
							onClick={() => onOpen(cohort.id)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onOpen(cohort.id);
								}
							}}
						>
							<Stack gap='sm'>
								<Stack gap={2}>
									<Text size='sm' fw={600}>
										{cohort.name}
									</Text>
									<Text size='xs' c='dimmed' lineClamp={1}>
										{facts}
									</Text>
								</Stack>

								<Avatar.Group spacing='xs'>
									{members.slice(0, MAX_AVATARS).map((m) => (
										<Avatar
											key={m.id}
											size={24}
											radius='xl'
											color='gray'
											title={m.name}
										>
											{initials(m.name)}
										</Avatar>
									))}
									{members.length > MAX_AVATARS && (
										<Avatar size={24} radius='xl' color='gray'>
											+{members.length - MAX_AVATARS}
										</Avatar>
									)}
								</Avatar.Group>

								<Stack gap={4}>
									<Progress
										value={completion}
										size='xs'
										color='gray'
										aria-label={t('cohorts.progressLabel', {
											percent: completion,
										})}
									/>
									<Text size='xs' c='dimmed'>
										{t('cohorts.progressLine', {
											percent: completion,
											improved,
										})}
									</Text>
								</Stack>

								{cohort.tags.length > 0 && (
									<Text size='xs' c='dimmed'>
										{cohort.tags.join(' · ')}
									</Text>
								)}
							</Stack>
						</Paper>
					);
				})}
			</SimpleGrid>
		</SectionCard>
	);
}
