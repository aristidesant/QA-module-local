import React, { useState } from 'react';
import {
	Card,
	Stack,
	Group,
	Text,
	Badge,
	ActionIcon,
	ThemeIcon,
	Popover,
	Button,
	Divider,
	Checkbox,
	Center,
	ScrollArea,
} from '@mantine/core';
import {
	IconBell,
	IconCheck,
	IconX,
	IconTrendingUp,
	IconAlertCircle,
	IconGift,
	IconMessage,
	IconUsers,
} from '@tabler/icons-react';
import type { InboxItem } from '~/models/qa';
import styles from '../Dashboard.module.css';

interface AgentInboxProps {
	items: InboxItem[];
	onMarkAsRead?: (itemId: number) => void;
	onClear?: (itemId: number) => void;
	compact?: boolean;
	maxItems?: number;
}

const getIconForItemType = (type: string) => {
	switch (type) {
		case 'PERFORMANCE_ALERT':
			return <IconAlertCircle size={18} />;
		case 'COMPLIANCE_ALERT':
			return <IconAlertCircle size={18} />;
		case 'AUTO_FAIL_ALERT':
			return <IconAlertCircle size={18} />;
		case 'RANKING_NOTIFICATION':
			return <IconTrendingUp size={18} />;
		case 'REACTION':
			return <IconGift size={18} />;
		case 'ACHIEVEMENT':
			return <IconGift size={18} />;
		case 'TEAM_UPDATE':
			return <IconUsers size={18} />;
		default:
			return <IconBell size={18} />;
	}
};

const getSeverityColor = (severity: string) => {
	switch (severity) {
		case 'CRITICAL':
			return 'red';
		case 'HIGH':
			return 'orange';
		case 'MEDIUM':
			return 'yellow';
		case 'LOW':
			return 'blue';
		default:
			return 'gray';
	}
};

const InboxItemRow: React.FC<{
	item: InboxItem;
	onMarkAsRead?: (itemId: number) => void;
	onClear?: (itemId: number) => void;
}> = ({ item, onMarkAsRead, onClear }) => {
	return (
		<Group justify="space-between" align="flex-start" p="md" style={{ backgroundColor: item.isRead ? 'transparent' : 'var(--mantine-color-gray-0)' }}>
			<Group align="flex-start" style={{ flex: 1 }}>
				<ThemeIcon size="lg" color={getSeverityColor(item.severity)} radius="md">
					{getIconForItemType(item.type)}
				</ThemeIcon>
				<Stack gap={4} style={{ flex: 1 }}>
					<Group justify="space-between">
						<Text fw={item.isRead ? 400 : 600} size="sm">
							{item.title}
						</Text>
						<Badge size="sm" variant="light">
							{item.type.replace(/_/g, ' ')}
						</Badge>
					</Group>
					<Text size="xs" c="dimmed">
						{item.description}
					</Text>
					{item.createdAt && (
						<Text size="xs" c="dimmed">
							{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
						</Text>
					)}
				</Stack>
			</Group>
			<Group gap="xs">
				{!item.isRead && (
					<ActionIcon size="sm" variant="subtle" color="blue" onClick={() => onMarkAsRead?.(item.id)}>
						<IconCheck size={16} />
					</ActionIcon>
				)}
				<ActionIcon size="sm" variant="subtle" color="gray" onClick={() => onClear?.(item.id)}>
					<IconX size={16} />
				</ActionIcon>
			</Group>
		</Group>
	);
};

export const AgentInbox: React.FC<AgentInboxProps> = ({
	items,
	onMarkAsRead,
	onClear,
	compact = false,
	maxItems = 5,
}) => {
	const [opened, setOpened] = useState(false);
	const unreadCount = items.filter((i) => !i.isRead).length;
	const displayItems = compact ? items.slice(0, maxItems) : items;

	if (compact) {
		return (
			<Popover position="bottom-end" withArrow shadow="md" opened={opened} onChange={setOpened}>
				<Popover.Target>
					<ActionIcon
						size="lg"
						radius="md"
						variant="light"
						onClick={() => setOpened(!opened)}
						style={{ position: 'relative' }}
					>
						<IconBell size={20} />
						{unreadCount > 0 && (
							<Badge size="sm" variant="filled" circle color="red" style={{ position: 'absolute', top: -5, right: -5 }}>
								{unreadCount}
							</Badge>
						)}
					</ActionIcon>
				</Popover.Target>
				<Popover.Dropdown p={0} style={{ width: 400 }}>
					<Stack gap={0}>
						<Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
							<Text fw={600}>Notifications</Text>
							{unreadCount > 0 && <Badge>{unreadCount} New</Badge>}
						</Group>
						<ScrollArea style={{ maxHeight: 400 }}>
							{displayItems.length === 0 ? (
								<Center p="lg">
									<Text size="sm" c="dimmed">
										No notifications
									</Text>
								</Center>
							) : (
								<Stack gap={0}>
									{displayItems.map((item) => (
										<React.Fragment key={item.id}>
											<InboxItemRow item={item} onMarkAsRead={onMarkAsRead} onClear={onClear} />
											<Divider />
										</React.Fragment>
									))}
								</Stack>
							)}
						</ScrollArea>
						{items.length > maxItems && (
							<Button variant="subtle" fullWidth p="md">
								View All ({items.length})
							</Button>
						)}
					</Stack>
				</Popover.Dropdown>
			</Popover>
		);
	}

	return (
		<Card className={styles.metricCard} p="lg" radius="md" withBorder>
			<Stack gap="md">
				<Group justify="space-between">
					<div>
						<Text fw={600} size="md">
							Inbox
						</Text>
						<Text size="xs" c="dimmed">
							Alerts & Recognitions
						</Text>
					</div>
					{unreadCount > 0 && <Badge color="red">{unreadCount} Unread</Badge>}
				</Group>

				<ScrollArea style={{ height: 400 }}>
					<Stack gap={0}>
						{displayItems.length === 0 ? (
							<Center p="lg">
								<Text size="sm" c="dimmed">
									No notifications
								</Text>
							</Center>
						) : (
							displayItems.map((item) => (
								<React.Fragment key={item.id}>
									<InboxItemRow item={item} onMarkAsRead={onMarkAsRead} onClear={onClear} />
									<Divider />
								</React.Fragment>
							))
						)}
					</Stack>
				</ScrollArea>

				{items.length > displayItems.length && (
					<Button variant="subtle" fullWidth>
						View All ({items.length})
					</Button>
				)}
			</Stack>
		</Card>
	);
};
