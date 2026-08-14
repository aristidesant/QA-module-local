import React from 'react';
import { Stack, Group, Text, Badge, ThemeIcon, Button } from '@mantine/core';
import { IconAlertTriangle, IconTrendingDown } from '@tabler/icons-react';

interface Alert {
	id: string;
	type: 'critical' | 'caution';
	title: string;
	description: string;
	relatedTab?: string;
}

interface PerformanceAlertsSectionProps {
	alerts: Alert[];
	onAlertClick?: (tabName: string) => void;
}

const PerformanceAlertsSection: React.FC<PerformanceAlertsSectionProps> = ({
	alerts,
	onAlertClick,
}) => {
	if (alerts.length === 0) {
		return null;
	}

	const getSeverityColor = (type: 'critical' | 'caution') => {
		return type === 'critical' ? 'red' : 'yellow';
	};

	const getSeverityIcon = (type: 'critical' | 'caution') => {
		return type === 'critical' ? (
			<IconAlertTriangle size={20} />
		) : (
			<IconTrendingDown size={20} />
		);
	};

	return (
		<Stack gap='md'>
			<Text fw={600} size='lg'>
				Performance Alerts
			</Text>
			<Stack gap='md'>
				{alerts.map((alert) => {
					const borderColor =
						getSeverityColor(alert.type) === 'red' ? '#FA5252' : '#FDB833';
					return (
						<div
							key={alert.id}
							// inline-style-allow: alert card styling with dynamic border color
							style={{
								borderLeft: '4px solid ' + borderColor,
								borderRadius: '8px',
								borderRight: '1px solid var(--mantine-color-gray-2)',
								borderTop: '1px solid var(--mantine-color-gray-2)',
								borderBottom: '1px solid var(--mantine-color-gray-2)',
								padding: '16px',
							}}
						>
							<Group justify='space-between' align='flex-start'>
								{/* inline-style-allow: flex layout for alert content */}
								<Group align='flex-start' gap='md' style={{ flex: 1 }}>
									<ThemeIcon
										size='lg'
										radius='md'
										variant='light'
										color={getSeverityColor(alert.type)}
									>
										{getSeverityIcon(alert.type)}
									</ThemeIcon>
									{/* inline-style-allow: flex layout for alert text */}
									<Stack gap='xs' style={{ flex: 1 }}>
										<Group gap='sm'>
											<Text fw={600} size='sm'>
												{alert.title}
											</Text>
											<Badge
												size='sm'
												color={getSeverityColor(alert.type)}
												variant='light'
											>
												{alert.type === 'critical' ? 'Critical' : 'Caution'}
											</Badge>
										</Group>
										<Text size='sm' c='dimmed'>
											{alert.description}
										</Text>
									</Stack>
								</Group>
								{alert.relatedTab && (
									<Button
										size='xs'
										variant='light'
										onClick={() => onAlertClick?.(alert.relatedTab!)}
									>
										View
									</Button>
								)}
							</Group>
						</div>
					);
				})}
			</Stack>
		</Stack>
	);
};

export default PerformanceAlertsSection;
