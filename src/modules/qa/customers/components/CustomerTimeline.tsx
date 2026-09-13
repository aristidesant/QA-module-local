import { useState } from 'react';
import { Anchor, Badge, Button, Chip, Group, Stack, Text, ThemeIcon, Timeline } from '@mantine/core';
import { IconBan, IconCalendarEvent, IconClipboardText, IconNote, IconPhone, IconTag } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { formatDateTime } from '~/modules/qa/team/helpers';
import type { CustomerEvent, CustomerEventType } from '../types';
import { EVENT_META } from '../constants';

const ICONS: Record<CustomerEventType, typeof IconPhone> = {
	contact: IconPhone,
	offer: IconTag,
	survey: IconClipboardText,
	note: IconNote,
	followUp: IconCalendarEvent,
	flag: IconBan,
};

const ALL_TYPES: CustomerEventType[] = ['contact', 'offer', 'survey', 'note', 'followUp', 'flag'];

interface CustomerTimelineProps {
	events: CustomerEvent[];
	filter: CustomerEventType | 'all';
	onFilterChange: (filter: CustomerEventType | 'all') => void;
}

export function CustomerTimeline({ events, filter, onFilterChange }: CustomerTimelineProps) {
	const { t } = useTranslation('qa.customers');
	const navigate = useNavigate();
	const [limit, setLimit] = useState(20);

	if (events.length === 0) {
		return <EmptyState message={t('timeline.empty')} />;
	}

	const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter);
	const visible = filtered.slice(0, limit);

	return (
		<Stack gap='md'>
			<Chip.Group value={filter} onChange={(v) => onFilterChange((v as CustomerEventType | 'all') || 'all')}>
				<Group gap='xs'>
					<Chip value='all' size='xs'>{t('timeline.filterAll')}</Chip>
					{ALL_TYPES.map((type) => (
						<Chip key={type} value={type} size='xs' color={EVENT_META[type].color}>{t(EVENT_META[type].labelKey)}</Chip>
					))}
				</Group>
			</Chip.Group>

			{filtered.length === 0 ? (
				<EmptyState message={t('timeline.empty')} />
			) : (
				<>
					<Timeline bulletSize={24} lineWidth={2}>
						{visible.map((event) => {
							const Icon = ICONS[event.type];
							const meta = EVENT_META[event.type];
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
											{t('timeline.open')}
										</Anchor>
									)}
								</Timeline.Item>
							);
						})}
					</Timeline>
					{filtered.length > limit && (
						<Button variant='subtle' onClick={() => setLimit((l) => l + 20)}>
							{t('timeline.showMore')}
						</Button>
					)}
				</>
			)}
		</Stack>
	);
}
