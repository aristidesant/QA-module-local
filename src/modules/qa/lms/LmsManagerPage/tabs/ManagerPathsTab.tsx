import { Badge, Button, Group, Paper, Progress, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconAward, IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { LmsLearningPath } from '~/models/qa';
import { LMS_AREA_META } from '../../constants';
import { AreaBadge } from '../../components/Badges';
import classes from '../../components/Cards.module.css';

interface ManagerPathsTabProps {
	paths: LmsLearningPath[];
	enrolledCounts: Record<string, number>;
	onOpen: (pathId: string) => void;
	onAssign: (pathId: string) => void;
}

export function ManagerPathsTab({ paths, enrolledCounts, onOpen, onAssign }: ManagerPathsTabProps) {
	const { t } = useTranslation('qa.lms');

	return (
		<SectionCard title={t('manager.paths.title')} description={t('manager.paths.description')}>
			<SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing='md'>
				{paths.map((path) => (
					<Paper key={path.id} withBorder p='md' radius='md' className={classes.areaBar} data-area={path.area}>
						<Stack gap='sm'>
							<Group gap='xs'>
								<AreaBadge area={path.area} size='xs' />
								<Badge size='xs' variant='default'>
									{t(`levels.${path.level}`)}
								</Badge>
							</Group>

							<Stack gap={2}>
								<Text fw={600}>{path.title}</Text>
								<Text size='xs' c='dimmed' lineClamp={2}>
									{path.description}
								</Text>
							</Stack>

							<Group gap='sm'>
								<Text size='xs' c='dimmed'>
									{t('manager.paths.modules', { count: path.modules.length })}
								</Text>
								<Group gap={4}>
									<IconUsers size={14} color='var(--mantine-color-dimmed)' />
									<Text size='xs' c='dimmed'>
										{t('manager.paths.enrolled', { count: enrolledCounts[path.id] ?? path.enrolledCount })}
									</Text>
								</Group>
							</Group>

							{path.badgeName && (
								<Badge size='xs' variant='light' color='yellow' leftSection={<IconAward size={12} />}>
									{path.badgeName}
								</Badge>
							)}

							<Stack gap={4}>
								<Progress value={path.completionRate} size='sm' radius='xl' color={LMS_AREA_META[path.area].color} />
								<Text size='xs' c='dimmed'>
									{t('manager.paths.completion', { value: path.completionRate })}
								</Text>
							</Stack>

							<Group justify='flex-end' gap='xs'>
								<Button size='xs' variant='default' onClick={() => onOpen(path.id)}>
									{t('manager.paths.viewPath')}
								</Button>
								<Button size='xs' variant='light' onClick={() => onAssign(path.id)}>
									{t('manager.paths.assignPath')}
								</Button>
							</Group>
						</Stack>
					</Paper>
				))}
			</SimpleGrid>
		</SectionCard>
	);
}
