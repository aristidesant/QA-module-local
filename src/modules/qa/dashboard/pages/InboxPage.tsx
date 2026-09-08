import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Stack, Title, Text, Group, Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { AgentInbox } from '../components';
import { mockInboxItems } from '~/models/qa/mockData';
import type { InboxItem } from '~/models/qa';

/**
 * InboxPage
 *
 * Landing screen for the role-specific inbox routes
 * (/qa/agent/inbox, /qa/supervisor/inbox, /qa/qa-manager/inbox,
 * /qa/operation-manager/inbox). Clicking a row in a dashboard's Critical
 * Issues table navigates here, so the mockup flow resolves to a real screen.
 *
 * Mock-only: mark-as-read and clear mutate local state, nothing is persisted.
 */
export const InboxPage: React.FC = () => {
	const navigate = useNavigate();
	const [items, setItems] = useState<InboxItem[]>(mockInboxItems);

	const handleMarkAsRead = (itemId: number) =>
		setItems(current => current.map(item => (item.id === itemId ? { ...item, isRead: true } : item)));

	const handleClear = (itemId: number) => setItems(current => current.filter(item => item.id !== itemId));

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Title order={1}>Inbox</Title>
						<Text c='dimmed' mt='xs'>
							Alerts, recognitions, and issues that need your attention
						</Text>
					</div>
					<Button variant='light' leftSection={<IconArrowLeft size={16} />} onClick={() => navigate(-1)}>
						Back
					</Button>
				</Group>

				<SectionCard title='Notifications' description='Everything routed to you this period'>
					<AgentInbox items={items} onMarkAsRead={handleMarkAsRead} onClear={handleClear} />
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default InboxPage;
