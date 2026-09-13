import { Avatar, Badge, Button, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconClockPause, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { CoachingQueueItem, LmsContent } from '~/models/qa';
import { AreaBadge } from '~/modules/qa/lms/components/Badges';
import { PRIORITY_COLOR, REASON_META } from '../constants';
import classes from './Queue.module.css';

interface QueueCardProps {
	item: CoachingQueueItem;
	contentById: Record<string, LmsContent>;
	onAction: (item: CoachingQueueItem) => void;
	onDetails: (agentId: string) => void;
	onProfile: (agentId: string) => void;
	onSnooze: (agentId: string) => void;
}

const initials = (name: string) =>
	name
		.split(' ')
		.map((p) => p[0])
		.join('')
		.slice(0, 2);

export function QueueCard({ item, contentById, onAction, onDetails, onProfile, onSnooze }: QueueCardProps) {
	const { t } = useTranslation('qa.coaching');
	const visibleReasons = item.reasons.slice(0, 3);
	const hidden = item.reasons.length - visibleReasons.length;

	return (
		<Paper withBorder p='md' radius='md' className={classes.priorityBar} data-priority={item.priority}>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<Group gap='sm' wrap='nowrap'>
						<Avatar radius='xl' color={PRIORITY_COLOR[item.priority]}>
							{initials(item.agentName)}
						</Avatar>
						<Stack gap={2}>
							<Group gap='xs'>
								<Text fw={600}>{item.agentName}</Text>
								<Badge size='xs' color={PRIORITY_COLOR[item.priority]} variant='filled'>
									{t(`priority.${item.priority}`)}
								</Badge>
							</Group>
							<Text size='xs' c='dimmed'>
								{item.team}
							</Text>
						</Stack>
					</Group>

					<Stack gap={2} align='flex-end'>
						<Text size='xs' c='dimmed'>
							{t('queue.weakest')}
						</Text>
						<Group gap={6}>
							<AreaBadge area={item.weakestArea} size='xs' />
							<Text size='sm' fw={600}>
								{item.weakestValue}
							</Text>
						</Group>
					</Stack>
				</Group>

				<Stack gap={4}>
					{visibleReasons.map((reason, i) => {
						const meta = REASON_META[reason.kind];
						const Icon = meta.icon;
						return (
							<Group key={`${reason.kind}-${i}`} gap='xs' wrap='nowrap'>
								<ThemeIcon size='sm' variant='light' color={meta.color} radius='xl'>
									<Icon size={12} />
								</ThemeIcon>
								<Text size='xs'>{reason.detail}</Text>
							</Group>
						);
					})}
					{hidden > 0 && (
						<Text size='xs' c='dimmed'>
							{t('queue.moreReasons', { count: hidden })}
						</Text>
					)}
				</Stack>

				{item.suggestedContentIds.length > 0 && (
					<Stack gap={4}>
						<Text size='xs' c='dimmed'>
							{t('queue.suggestedMaterial')}
						</Text>
						<Group gap={4}>
							{item.suggestedContentIds.map((id) => (
								<Badge key={id} size='xs' variant='outline'>
									{contentById[id]?.title ?? id}
								</Badge>
							))}
						</Group>
					</Stack>
				)}

				<Group justify='space-between' align='center'>
					<Button size='xs' variant='subtle' leftSection={<IconClockPause size={14} />} onClick={() => onSnooze(item.agentId)}>
						{t('queue.snooze')}
					</Button>
					<Group gap='xs'>
						<Button size='xs' variant='subtle' leftSection={<IconUser size={14} />} onClick={() => onProfile(item.agentId)}>
							{t('queue.openProfile')}
						</Button>
						<Button size='xs' variant='default' onClick={() => onDetails(item.agentId)}>
							{t('queue.openDrawer')}
						</Button>
						<Button size='xs' color={PRIORITY_COLOR[item.priority]} onClick={() => onAction(item)}>
							{t(`queue.suggested.${item.suggestedAction}`)}
						</Button>
					</Group>
				</Group>
			</Stack>
		</Paper>
	);
}
