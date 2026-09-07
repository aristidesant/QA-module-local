import React from 'react';
import { Card, Stack, Text, Group, ThemeIcon, Badge, SimpleGrid } from '@mantine/core';
import { IconAlertTriangle, IconAlertCircle, IconCheckCircle } from '@tabler/icons-react';
import styles from '../Dashboard.module.css';

interface AutoFailsCardProps {
	totalCount: number;
	criticalCount?: number;
	evaluationsAffected?: number;
	campaignName?: string;
	compact?: boolean;
}

export const AutoFailsCard: React.FC<AutoFailsCardProps> = ({
	totalCount,
	criticalCount = 0,
	evaluationsAffected = 0,
	campaignName,
	compact = false,
}) => {
	const hasIssues = totalCount > 0 || criticalCount > 0;

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
								Total
							</Text>
							<Text fw={700} size="lg">
								{totalCount}
							</Text>
						</div>
						{criticalCount > 0 && (
							<div>
								<Text size="xs" c="dimmed">
									Critical
								</Text>
								<Text fw={700} size="lg" c="red">
									{criticalCount}
								</Text>
							</div>
						)}
					</Group>
					{hasIssues && (
						<Group gap="xs">
							<ThemeIcon size="sm" color={criticalCount > 0 ? 'red' : 'yellow'} radius="md">
								<IconAlertTriangle size={16} />
							</ThemeIcon>
							<Text size="xs" fw={500}>
								{criticalCount > 0 ? 'Has Critical Issues' : 'Has Issues'}
							</Text>
						</Group>
					)}
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
							Auto-Fails Tracking
						</Text>
						<Text size="xs" c="dimmed">
							Form Configuration Violations
						</Text>
					</div>
					{hasIssues ? (
						<ThemeIcon size="lg" color={criticalCount > 0 ? 'red' : 'yellow'} radius="md">
							{criticalCount > 0 ? <IconAlertCircle size={20} /> : <IconAlertTriangle size={20} />}
						</ThemeIcon>
					) : (
						<ThemeIcon size="lg" color="green" radius="md">
							<IconCheckCircle size={20} />
						</ThemeIcon>
					)}
				</Group>

				<SimpleGrid cols={3} spacing="md">
					<div>
						<Text size="xs" c="dimmed" fw={500} mb="xs">
							Total Auto-Fails
						</Text>
						<Text fw={700} size="xl">
							{totalCount}
						</Text>
						<Text size="xs" c="dimmed">
							Across evaluations
						</Text>
					</div>

					{criticalCount > 0 && (
						<div>
							<Text size="xs" c="dimmed" fw={500} mb="xs">
								Critical (Evaluation Invalidated)
							</Text>
							<Text fw={700} size="xl" c="red">
								{criticalCount}
							</Text>
							<Text size="xs" c="dimmed">
								Invalidated evaluations
							</Text>
						</div>
					)}

					{evaluationsAffected > 0 && (
						<div>
							<Text size="xs" c="dimmed" fw={500} mb="xs">
								Evaluations Affected
							</Text>
							<Text fw={700} size="xl">
								{evaluationsAffected}
							</Text>
							<Text size="xs" c="dimmed">
								With auto-fails
							</Text>
						</div>
					)}
				</SimpleGrid>

				{hasIssues && (
					<div
						style={{
							backgroundColor: criticalCount > 0 ? 'var(--mantine-color-red-0)' : 'var(--mantine-color-yellow-0)',
							padding: 'var(--mantine-spacing-sm)',
							borderRadius: 'var(--mantine-radius-md)',
						}}
					>
						<Group gap="xs">
							{criticalCount > 0 ? (
								<IconAlertCircle size={18} color="var(--mantine-color-red-6)" />
							) : (
								<IconAlertTriangle size={18} color="var(--mantine-color-yellow-6)" />
							)}
							<div>
								<Text size="sm" fw={600} c={criticalCount > 0 ? 'red' : 'yellow'}>
									{criticalCount > 0 ? 'Critical Issues Detected' : 'Auto-Fails Detected'}
								</Text>
								<Text size="xs" c={criticalCount > 0 ? 'red' : 'yellow'}>
									{criticalCount > 0
										? `${criticalCount} evaluation(s) invalidated due to auto-fail violations`
										: `${totalCount} auto-fail issue(s) in form responses`}
								</Text>
							</div>
						</Group>
					</div>
				)}

				{campaignName && (
					<Group>
						<Text size="xs" c="dimmed">
							Campaign:
						</Text>
						<Badge variant="light">{campaignName}</Badge>
					</Group>
				)}
			</Stack>
		</Card>
	);
};
