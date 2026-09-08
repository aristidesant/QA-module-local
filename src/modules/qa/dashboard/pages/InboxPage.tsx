import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Stack, Title, Text, Group, Button, Badge } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { useNotificationStore } from '~/stores/qa/notificationStore';
import AgentInboxTable from '~/modules/qa/agent/inbox/AgentInboxTable';
import InboxFilters from '~/modules/qa/agent/inbox/InboxFilters';
import type { AgentNotification } from '~/models/qa/notifications';

/**
 * InboxPage
 *
 * Landing screen for the role-specific inbox routes
 * (/qa/agent/inbox, /qa/supervisor/inbox, /qa/qa-manager/inbox,
 * /qa/operation-manager/inbox). Displays Agent Inbox with notifications,
 * filtering options (status, type, date range, search), and action capabilities
 * (mark as read, archive, view details).
 *
 * Uses useNotificationStore to manage notification state.
 */
export const InboxPage: React.FC = () => {
	const navigate = useNavigate();

	// Store
	const notifications = useNotificationStore((state) => state.notifications);
	const markAsRead = useNotificationStore((state) => state.markAsRead);
	const markAsUnread = useNotificationStore((state) => state.markAsUnread);
	const archiveNotification = useNotificationStore((state) => state.archiveNotification);
	const getUnreadCount = useNotificationStore((state) => state.getUnreadCount);

	// Filter state
	const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
	const [typeFilter, setTypeFilter] = useState<AgentNotification['category'][]>([]);
	const [dateFromFilter, setDateFromFilter] = useState<Date | null>(null);
	const [dateToFilter, setDateToFilter] = useState<Date | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	// Filter notifications
	const filteredNotifications = useMemo(() => {
		let filtered = notifications.filter((n) => !n.archived);

		// Status filter
		if (statusFilter === 'read') {
			filtered = filtered.filter((n) => n.read);
		} else if (statusFilter === 'unread') {
			filtered = filtered.filter((n) => !n.read);
		}

		// Type filter
		if (typeFilter.length > 0) {
			filtered = filtered.filter((n) => typeFilter.includes(n.category));
		}

		// Date range filter
		if (dateFromFilter) {
			const fromTime = dateFromFilter.getTime();
			filtered = filtered.filter(
				(n) => new Date(n.createdAt).getTime() >= fromTime
			);
		}
		if (dateToFilter) {
			const toTime = dateToFilter.getTime();
			// Set to end of day
			const endOfDay = new Date(toTime);
			endOfDay.setHours(23, 59, 59, 999);
			filtered = filtered.filter(
				(n) => new Date(n.createdAt).getTime() <= endOfDay.getTime()
			);
		}

		// Search filter (title + message)
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((n) =>
				n.title.toLowerCase().includes(query) ||
				n.message.toLowerCase().includes(query)
			);
		}

		// Sort by date descending (newest first)
		filtered.sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return dateB - dateA;
		});

		return filtered;
	}, [
		notifications,
		statusFilter,
		typeFilter,
		dateFromFilter,
		dateToFilter,
		searchQuery,
	]);

	const handleClearFilters = () => {
		setStatusFilter('all');
		setTypeFilter([]);
		setDateFromFilter(null);
		setDateToFilter(null);
		setSearchQuery('');
	};

	const handleViewDetails = (notificationId: string) => {
		// TODO: In future, open a detail modal or navigate to detail page
		// For now, mark as read if unread
		const notification = notifications.find((n) => n.id === notificationId);
		if (notification && !notification.read) {
			markAsRead(notificationId);
		}
	};

	const unreadCount = getUnreadCount();

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Group gap='md' align='flex-end'>
							<div>
								<Title order={1}>Inbox</Title>
								<Text c='dimmed' mt='xs'>
									Alerts, recognitions, and issues that need your attention
								</Text>
							</div>
							{unreadCount > 0 && (
								<Badge color='blue' variant='filled' size='lg'>
									{unreadCount} Unread
								</Badge>
							)}
						</Group>
					</div>
					<Button
						variant='light'
						leftSection={<IconArrowLeft size={16} />}
						onClick={() => navigate(-1)}
					>
						Back
					</Button>
				</Group>

				<SectionCard
					title='Notifications'
					description='Everything routed to you this period'
				>
					<Stack gap='md'>
						<InboxFilters
							status={statusFilter}
							onStatusChange={setStatusFilter}
							selectedTypes={typeFilter}
							onTypesChange={setTypeFilter}
							dateFrom={dateFromFilter}
							dateTo={dateToFilter}
							onDateChange={(from: Date | null | undefined, to: Date | null | undefined) => {
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
						/>
					</Stack>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default InboxPage;
