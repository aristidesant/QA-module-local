import React from 'react';
import { Card, Stack, Text, Group, ThemeIcon, Badge, SimpleGrid } from '@mantine/core';
import { IconAlertTriangle, IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import styles from '../Dashboard.module.css';

interface AutoFailsCardProps {
	sectionAutoFails: number;
	globalAutoFails: number;
	compact?: boolean;
}

export const AutoFailsCard: React.FC<AutoFailsCardProps> = ({
	sectionAutoFails,
	globalAutoFails,
	compact = false,
}) => {
	if (compact) {
		return (
			<Card className={styles.metricCard} p='lg' radius='md' withBorder shadow='sm' h='100%'>
				<Stack gap='md' h='100%'>
					<Group justify='space-between' align='flex-start' wrap='nowrap'>
						<div>
							<Text fw={600} size='md'>
								Auto-Fails
							</Text>
							<Text size='xs' c='dimmed'>
								Automatic failures this week
							</Text>
						</div>
						<ThemeIcon size='lg' color='yellow' radius='md'>
							<IconAlertTriangle size={20} />
						</ThemeIcon>
					</Group>

					<Group gap='lg' align='flex-end'>
						<div>
							<Text size='xs' c='dimmed' fw={500} mb='xs'>
								Section
							</Text>
							<Text fw={700} size='xl'>
								{sectionAutoFails}
							</Text>
						</div>
						<div>
							<Text size='xs' c='dimmed' fw={500} mb='xs'>
								Global
							</Text>
							<Text fw={700} size='xl'>
								{globalAutoFails}
							</Text>
						</div>
					</Group>
				</Stack>
			</Card>
		);
	}

	return (
		<Card className={styles.metricCard} p="lg" radius="md" withBorder>
			<Stack gap="md">
				<Group justify="space-between" align="flex-start">
					<div>
						<Text fw={600} size="md">
							Auto-Fails
						</Text>
						<Text size="xs" c="dimmed">
							Automatic failures detected this week
						</Text>
					</div>
					<ThemeIcon size="lg" color="yellow" radius="md">
						<IconAlertTriangle size={20} />
					</ThemeIcon>
				</Group>

				<SimpleGrid cols={2} spacing="md">
					<div>
						<Text size="xs" c="dimmed" fw={500} mb="xs">
							Section Auto-Fails
						</Text>
						<Text fw={700} size="xl">
							{sectionAutoFails}
						</Text>
						<Text size="xs" c="dimmed">
							This section
						</Text>
					</div>

					<div>
						<Text size="xs" c="dimmed" fw={500} mb="xs">
							Global Auto-Fails
						</Text>
						<Text fw={700} size="xl">
							{globalAutoFails}
						</Text>
						<Text size="xs" c="dimmed">
							Platform-wide
						</Text>
					</div>
				</SimpleGrid>
			</Stack>
		</Card>
	);
};
