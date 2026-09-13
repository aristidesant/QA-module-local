import { useState } from 'react';
import { Anchor, Badge, Button, Chip, Group, Stack, Text, Timeline, ThemeIcon } from '@mantine/core';
import {
	IconAlertTriangle, IconAward, IconBell, IconClipboardCheck, IconFlag, IconGavel, IconNote, IconSchool, IconTrophy,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import type { ActivityEvent, ActivityType } from '../types';
import { ACTIVITY_META } from '../constants';
import { formatDateTime } from '../helpers';

const ICONS: Record<ActivityType, typeof IconBell> = {
	evaluation: IconClipboardCheck,
	badge: IconAward,
	milestone: IconFlag,
	coaching: IconSchool,
	lms: IconSchool,
	alert: IconBell,
	dispute: IconGavel,
	note: IconNote,
	rank: IconTrophy,
};

const ALL_TYPES: ActivityType[] = ['evaluation', 'badge', 'milestone', 'coaching', 'lms', 'alert', 'dispute', 'note', 'rank'];

interface ActivityTimelineProps {
	events: ActivityEvent[];
	filter: ActivityType | 'all';
	onFilterChange: (filter: ActivityType | 'all') => void;
}

export function ActivityTimeline({ events, filter, onFilterChange }: ActivityTimelineProps) {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const [limit, setLimit] = useState(20);

	const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter);
	const visible = filtered.slice(0, limit);

	if (events.length === 0) {
		return <EmptyState message={t('activity.empty')} />;
	}

	return (
		<Stack gap='md'>
			<Chip.Group value={filter} onChange={(v) => onFilterChange((v as ActivityType | 'all') || 'all')}>
				<Group gap='xs'>
					<Chip value='all' size='xs'>{t('activity.filterAll')}</Chip>
					{ALL_TYPES.map((type) => (
						<Chip key={type} value={type} size='xs' color={ACTIVITY_META[type].color}>
							{t(ACTIVITY_META[type].labelKey)}
						</Chip>
					))}
				</Group>
			</Chip.Group>

			{filtered.length === 0 ? (
				<EmptyState message={t('activity.empty')} />
			) : (
				<>
					<Timeline bulletSize={24} lineWidth={2}>
						{visible.map((event) => {
							const Icon = ICONS[event.type];
							const meta = ACTIVITY_META[event.type];
							return (
								<Timeline.Item
									key={event.id}
									bullet={(
										<ThemeIcon size={24} radius='xl' color={meta.color} variant='light'>
											<Icon size={14} />
										</ThemeIcon>
									)}
									title={(
										<Group gap='xs'>
											<Text fw={600} size='sm'>{event.title}</Text>
											<Badge size='xs' variant='light' color={meta.color}>{t(meta.labelKey)}</Badge>
										</Group>
									)}
								>
									<Text size='sm'>{event.description}</Text>
									<Text size='xs' c='dimmed'>{formatDateTime(event.date)}</Text>
									{event.link && (
										<Anchor size='xs' onClick={() => navigate(event.link!)}>
											{t('activity.open')}
										</Anchor>
									)}
								</Timeline.Item>
							);
						})}
					</Timeline>
					{filtered.length > limit && (
						<Button variant='subtle' onClick={() => setLimit((l) => l + 20)}>
							{t('activity.showMore')}
						</Button>
					)}
				</>
			)}
		</Stack>
	);
}
