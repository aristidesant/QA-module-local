import { Badge, Button, Group, Paper, RingProgress, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAward, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { LmsContent, LmsLearningPath, LmsPathEnrollment } from '~/models/qa';
import { LMS_AREA_META } from '../constants';
import { nextModule, pathProgress } from '../helpers';
import { AreaBadge } from './Badges';
import classes from './Cards.module.css';

interface PathCardProps {
	path: LmsLearningPath;
	enrollment?: LmsPathEnrollment;
	contentById: Record<string, LmsContent>;
	onOpen?: () => void;
	onEnrol?: () => void;
}

export function PathCard({ path, enrollment, contentById, onOpen, onEnrol }: PathCardProps) {
	const { t } = useTranslation('qa.lms');
	const areaMeta = LMS_AREA_META[path.area];
	const progress = pathProgress(path, enrollment);
	const next = nextModule(path, enrollment, contentById);
	const done = !!enrollment?.completedAt;

	return (
		<Paper withBorder p='md' radius='md' className={classes.areaBar} data-area={path.area}>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<Stack gap={6} flex={1} miw={0}>
						<Group gap='xs'>
							<AreaBadge area={path.area} size='xs' />
							<Badge size='xs' variant='default'>
								{t(`levels.${path.level}`)}
							</Badge>
						</Group>
						<Text fw={600}>{path.title}</Text>
						<Text size='xs' c='dimmed' lineClamp={2}>
							{path.description}
						</Text>
					</Stack>
					{enrollment && (
						<RingProgress
							size={64}
							thickness={7}
							roundCaps
							sections={[{ value: progress.percent, color: done ? 'green' : areaMeta.color }]}
							label={
								<Text size='xs' ta='center' fw={600}>
									{progress.percent}%
								</Text>
							}
						/>
					)}
				</Group>

				<Group gap='sm'>
					<Text size='xs' c='dimmed'>
						{t('agent.paths.modules', { done: progress.done, total: progress.total })}
					</Text>
					<Text size='xs' c='dimmed'>
						·
					</Text>
					<Text size='xs' c='dimmed'>
						{t('common.minutes', { count: path.estimatedMin })}
					</Text>
					{path.badgeName && (
						<Badge size='xs' variant='light' color='yellow' leftSection={<IconAward size={12} />}>
							{t('agent.paths.badge', { badge: path.badgeName })}
						</Badge>
					)}
				</Group>

				{done ? (
					<Group gap={6}>
						<ThemeIcon size='sm' color='green' variant='light' radius='xl'>
							<IconCircleCheck size={14} />
						</ThemeIcon>
						<Text size='xs' c='dimmed'>
							{t('agent.paths.completedOn', { date: enrollment?.completedAt })}
						</Text>
					</Group>
				) : (
					next && (
						<Text size='xs' c='dimmed'>
							{t('agent.paths.nextUp')}: <strong>{next.title}</strong>
						</Text>
					)
				)}

				<Group justify='space-between' align='center'>
					{enrollment?.dueDate ? (
						<Text size='xs' c='dimmed'>
							{t('agent.paths.dueDate', { date: enrollment.dueDate })}
						</Text>
					) : (
						<span />
					)}
					{enrollment ? (
						<Button size='xs' variant='light' onClick={onOpen} disabled={done}>
							{done ? t('cta.review') : t('cta.continue')}
						</Button>
					) : (
						<Button size='xs' variant='light' onClick={onEnrol}>
							{t('agent.paths.enrol')}
						</Button>
					)}
				</Group>
			</Stack>
		</Paper>
	);
}
