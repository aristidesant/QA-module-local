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
			<Card className={styles.metricCard} p="md" radius="md" withBorder>
				<Stack gap="xs">
					<Text fw={600} size="sm">
						Auto-Fails
					</Text>
					<Group justify="space-between">
						<div>
							<Text size="xs" c="dimmed">
								Section
							</Text>
							<Text fw={700} size="lg">
								{sectionAutoFails}
							</Text>
						</div>
						<div>
							<Text size="xs" c="dimmed">
								Global
							</Text>
							<Text fw={700} size="lg">
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
