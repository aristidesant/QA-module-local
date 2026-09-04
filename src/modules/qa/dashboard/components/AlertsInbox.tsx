import React from 'react';
import { Stack, Group, Text, Badge, Button, Paper, ActionIcon, ThemeIcon } from '@mantine/core';
import { IconBell, IconX } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';

interface Alert {
	id: number;
	title: string;
	description: string;
	severity: 'low' | 'medium' | 'high';
	timestamp: string;
	read: boolean;
}

interface AlertsInboxProps {
	alerts: Alert[];
	onMarkAsRead?: (alertId: number) => void;
	onDismiss?: (alertId: number) => void;
}

const severityColor = {
	low: 'blue',
	medium: 'yellow',
	high: 'red',
};

export const AlertsInbox: React.FC<AlertsInboxProps> = ({
	alerts,
	onMarkAsRead,
	onDismiss,
}) => {
	const unreadCount = alerts.filter(a => !a.read).length;

	if (alerts.length === 0) {
		return (
			<SectionCard title='Alerts' description='You have no active alerts'>
				<Stack align='center' gap='md' py='lg'>
					<ThemeIcon color='gray' variant='light' size='lg'>
						<IconBell size={20} />
					</ThemeIcon>
					<Text c='dimmed'>All clear!</Text>
				</Stack>
			</SectionCard>
		);
	}

	return (
		<SectionCard
			title='Alerts'
			description={`You have ${unreadCount} unread alert${unreadCount !== 1 ? 's' : ''}`}
		>
			<Stack gap='sm'>
				{alerts.map(alert => (
					<Paper key={alert.id} p='md' radius='md' withBorder>
						<Group justify='space-between' align='flex-start'>
							<div style={{ flex: 1 }}>
								<Group gap='sm' mb='xs'>
									<Badge
										color={severityColor[alert.severity]}
										variant='light'
										size='sm'
									>
										{alert.severity}
									</Badge>
									{!alert.read && (
										<Badge color='blue' variant='filled' size='sm'>
											New
										</Badge>
									)}
								</Group>
								<Text fw={500} size='sm'>
									{alert.title}
								</Text>
								<Text size='sm' c='dimmed' mt='xs'>
									{alert.description}
								</Text>
								<Text size='xs' c='dimmed' mt='xs'>
									{alert.timestamp}
								</Text>
							</div>
							<Group gap='xs'>
								{!alert.read && onMarkAsRead && (
									<Button
										size='xs'
										variant='default'
										onClick={() => onMarkAsRead(alert.id)}
									>
										Mark read
									</Button>
								)}
								{onDismiss && (
									<ActionIcon
										size='sm'
										color='gray'
										variant='subtle'
										onClick={() => onDismiss(alert.id)}
									>
										<IconX size={16} />
									</ActionIcon>
								)}
							</Group>
						</Group>
					</Paper>
				))}
			</Stack>
		</SectionCard>
	);
};
