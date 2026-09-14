import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Stack, Title, Text, Group, Button, Badge } from '@mantine/core';
import { IconChecks } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	useNotificationStore,
	selectNotifications,
} from '~/stores/qa/notificationStore';
import AgentInboxTable from '~/modules/qa/agent/inbox/AgentInboxTable';
import InboxFilters from '~/modules/qa/agent/inbox/InboxFilters';
import {
	INBOX_IDENTITY,
	inboxRoleFromPath,
} from '~/modules/qa/inbox/constants';
import { inboxFor } from '~/modules/qa/inbox/helpers';
import NotificationDetailDrawer from '~/modules/qa/inbox/components/NotificationDetailDrawer';
import type { AgentNotification } from '~/models/qa/notifications';

/**
 * Role-aware inbox for `/qa/{agent,supervisor,qa-manager,operation-manager}/inbox`.
 * Each role sees only what is addressed to it; opening a row shows a detail that
 * fits the notification kind.
 */
export const InboxPage: React.FC = () => {
	const { t } = useTranslation('qa.inbox');
	const location = useLocation();
	const role = inboxRoleFromPath(location.pathname);
	const me = INBOX_IDENTITY[role];

	const notifications = useNotificationStore(selectNotifications);
	const markAsRead = useNotificationStore((s) => s.markAsRead);
	const markAsUnread = useNotificationStore((s) => s.markAsUnread);
	const archiveNotification = useNotificationStore(
		(s) => s.archiveNotification
	);
	const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>(
		'all'
	);
	const [typeFilter, setTypeFilter] = useState<AgentNotification['category'][]>(
		[]
	);
	const [dateFromFilter, setDateFromFilter] = useState<Date | null>(null);
	const [dateToFilter, setDateToFilter] = useState<Date | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	/** Everything addressed to this role, newest first. */
	const mine = useMemo(
		() => inboxFor(notifications, me.role, me.id),
		[notifications, me.role, me.id]
	);

	const unreadCount = useMemo(() => mine.filter((n) => !n.read).length, [mine]);

	const filteredNotifications = useMemo(() => {
		let filtered = mine;

		if (statusFilter === 'read') {
			filtered = filtered.filter((n) => n.read);
		} else if (statusFilter === 'unread') {
			filtered = filtered.filter((n) => !n.read);
		}

		if (typeFilter.length > 0) {
			filtered = filtered.filter((n) => typeFilter.includes(n.category));
		}

		if (dateFromFilter) {
			const fromTime = dateFromFilter.getTime();
			filtered = filtered.filter(
				(n) => new Date(n.createdAt).getTime() >= fromTime
			);
		}
		if (dateToFilter) {
			const endOfDay = new Date(dateToFilter);
			endOfDay.setHours(23, 59, 59, 999);
			filtered = filtered.filter(
				(n) => new Date(n.createdAt).getTime() <= endOfDay.getTime()
			);
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(n) =>
					n.title.toLowerCase().includes(query) ||
					n.message.toLowerCase().includes(query)
			);
		}

		return [...filtered].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);
	}, [
		mine,
		statusFilter,
		typeFilter,
		dateFromFilter,
		dateToFilter,
		searchQuery,
	]);

	const selected = useMemo(
		() => mine.find((n) => n.id === selectedId) ?? null,
		[mine, selectedId]
	);

	const handleClearFilters = () => {
		setStatusFilter('all');
		setTypeFilter([]);
		setDateFromFilter(null);
		setDateToFilter(null);
		setSearchQuery('');
	};

	const handleViewDetails = (notificationId: string) => {
		const notification = mine.find((n) => n.id === notificationId);
		if (notification && !notification.read) markAsRead(notificationId);
		setSelectedId(notificationId);
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Text size='xs' fw={500} c='dimmed' tt='uppercase'>
							{t(`page.eyebrow.${role}`)}
						</Text>
						<Group gap='md' align='center'>
							<Title order={1}>{t('page.title')}</Title>
							{unreadCount > 0 && (
								<Badge color='blue' variant='filled' size='lg'>
									{t('page.unread', { count: unreadCount })}
								</Badge>
							)}
						</Group>
						<Text c='dimmed' mt='xs'>
							{t('page.description')}
						</Text>
					</div>
					<Button
						variant='light'
						leftSection={<IconChecks size={16} />}
						disabled={unreadCount === 0}
						onClick={() => markAllAsRead(me.role, me.id)}
					>
						{t('page.markAllRead')}
					</Button>
				</Group>

				<SectionCard
					title={t('page.sectionTitle')}
					description={t('page.sectionDescription')}
				>
					<Stack gap='md'>
						<InboxFilters
							status={statusFilter}
							onStatusChange={setStatusFilter}
							selectedTypes={typeFilter}
							onTypesChange={setTypeFilter}
							dateFrom={dateFromFilter}
							dateTo={dateToFilter}
							onDateChange={(
								from: Date | null | undefined,
								to: Date | null | undefined
							) => {
								setDateFromFilter(from ?? null);
								setDateToFilter(to ?? null);
							}}
							searchQuery={searchQuery}
							onSearchChange={setSearchQuery}
							onClearFilters={handleClearFilters}
						/>
						<AgentInboxTable
							notifications={filteredNotifications}
							onMarkRead={markAsRead}
							onMarkUnread={markAsUnread}
							onArchive={archiveNotification}
							onViewDetails={handleViewDetails}
							showAbout={role !== 'agent'}
						/>
					</Stack>
				</SectionCard>
			</Stack>

			<NotificationDetailDrawer
				notification={selected}
				opened={selected !== null}
				onClose={() => setSelectedId(null)}
				viewer={role}
			/>
		</ContentContainer>
	);
};

export default InboxPage;
