import { useState } from 'react';
import { Collapse, SimpleGrid, Stack } from '@mantine/core';
import { IconRoute, IconSchool } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type { LmsContent, LmsLearningPath, LmsPathEnrollment } from '~/models/qa';
import { PathCard } from '../../components/PathCard';
import { PathStepper } from '../../components/PathStepper';

interface PathsTabProps {
	paths: LmsLearningPath[];
	enrollments: LmsPathEnrollment[];
	contentById: Record<string, LmsContent>;
	onOpenModule: (contentId: string) => void;
	onEnrol: (pathId: string) => void;
}

export function PathsTab({ paths, enrollments, contentById, onOpenModule, onEnrol }: PathsTabProps) {
	const { t } = useTranslation('qa.lms');
	const [expanded, setExpanded] = useState<string | null>(null);

	const enrolledPathIds = enrollments.map((e) => e.pathId);
	const mine = paths.filter((p) => enrolledPathIds.includes(p.id));
	const available = paths.filter((p) => p.status === 'PUBLISHED' && !enrolledPathIds.includes(p.id));

	if (!paths.length) {
		return <EmptyState message={t('agent.paths.empty')} />;
	}

	return (
		<Stack gap='md'>
			{mine.length > 0 && (
				<SectionCard
					title={t('agent.paths.enrolled')}
					description={t('agent.paths.enrolledDescription')}
					icon={IconRoute}
				>
					<Stack gap='md'>
						<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
							{mine.map((path) => (
								<PathCard
									key={path.id}
									path={path}
									enrollment={enrollments.find((e) => e.pathId === path.id)}
									contentById={contentById}
									onOpen={() => setExpanded(expanded === path.id ? null : path.id)}
								/>
							))}
						</SimpleGrid>

						{mine.map((path) => (
							<Collapse key={`c-${path.id}`} expanded={expanded === path.id}>
								<PathStepper
									path={path}
									enrollment={enrollments.find((e) => e.pathId === path.id)}
									contentById={contentById}
									onOpenModule={onOpenModule}
								/>
							</Collapse>
						))}
					</Stack>
				</SectionCard>
			)}

			{available.length > 0 && (
				<SectionCard
					title={t('agent.paths.available')}
					description={t('agent.paths.availableDescription')}
					icon={IconSchool}
				>
					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
						{available.map((path) => (
							<PathCard
								key={path.id}
								path={path}
								contentById={contentById}
								onEnrol={() => onEnrol(path.id)}
							/>
						))}
					</SimpleGrid>
				</SectionCard>
			)}
		</Stack>
	);
}
