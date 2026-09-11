import React from 'react';
import { Card, SimpleGrid, Text, ThemeIcon, Group, Stack } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import styles from '../Dashboard.module.css';

export interface COPCMetrics {
	ecn?: number | null; // Error Crítico Negocio
	enc?: number | null; // Error no Crítico
	ecc?: number | null; // Error Crítico Cumplimiento
	ecuf?: number | null; // Error Crítico Usuario Final
}

interface COPCScoreCardProps {
	metrics: COPCMetrics;
	isInvalidated?: boolean;
	compact?: boolean;
}

export const COPCScoreCard: React.FC<COPCScoreCardProps> = ({
	metrics,
	isInvalidated = false,
	compact = false,
}) => {
	const hasErrors = (metrics.ecn ?? 0) + (metrics.enc ?? 0) + (metrics.ecc ?? 0) + (metrics.ecuf ?? 0) > 0;

	if (compact) {
		return (
			<Card className={styles.metricCard} p="md" radius="md" withBorder>
				<Stack gap="xs">
					<Text fw={600} size="sm">
						COPC QA Metrics
					</Text>
					<SimpleGrid cols={2} spacing="xs">
						<div>
							<Text size="xs" c="dimmed">
								ECN
							</Text>
							<Text fw={700} size="lg">
								{metrics.ecn ?? 0}
							</Text>
						</div>
						<div>
							<Text size="xs" c="dimmed">
								ENC
							</Text>
							<Text fw={700} size="lg">
								{metrics.enc ?? 0}
							</Text>
						</div>
						<div>
							<Text size="xs" c="dimmed">
								ECC
							</Text>
							<Text fw={700} size="lg">
								{metrics.ecc ?? 0}
							</Text>
						</div>
						<div>
							<Text size="xs" c="dimmed">
								ECUF
							</Text>
							<Text fw={700} size="lg">
								{metrics.ecuf ?? 0}
							</Text>
						</div>
					</SimpleGrid>
					{isInvalidated && (
						<Group gap="xs">
							<ThemeIcon size="sm" color="red" radius="md">
								<IconAlertCircle size={16} />
							</ThemeIcon>
							<Text size="xs" c="red" fw={500}>
								Evaluation Invalidated
							</Text>
						</Group>
					)}
					{!hasErrors && !isInvalidated && (
						<Group gap="xs">
							<ThemeIcon size="sm" color="green" radius="md">
								<IconCheck size={16} />
							</ThemeIcon>
							<Text size="xs" c="green" fw={500}>
								No Errors
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
							COPC QA Assessment
						</Text>
						<Text size="xs" c="dimmed">
							Error Counts by Type
						</Text>
					</div>
					{isInvalidated ? (
						<ThemeIcon size="lg" color="red" radius="md">
							<IconAlertCircle size={20} />
						</ThemeIcon>
					) : !hasErrors ? (
						<ThemeIcon size="lg" color="green" radius="md">
							<IconCheck size={20} />
						</ThemeIcon>
					) : null}
				</Group>

				<SimpleGrid cols={4} spacing="md">
					<div>
						<Text size="xs" c="dimmed" fw={500} mb="xs">
							ECN
						</Text>
						<Text fw={700} size="xl">
							{metrics.ecn ?? 0}
						</Text>
						<Text size="xs" c="dimmed">
							Business Critical
						</Text>
					</div>
					<div>
						<Text size="xs" c="dimmed" fw={500} mb="xs">
							ENC
						</Text>
						<Text fw={700} size="xl">
							{metrics.enc ?? 0}
						</Text>
						<Text size="xs" c="dimmed">
							Non-Critical
						</Text>
					</div>
					<div>
						<Text size="xs" c="dimmed" fw={500} mb="xs">
							ECC
						</Text>
						<Text fw={700} size="xl">
							{metrics.ecc ?? 0}
						</Text>
						<Text size="xs" c="dimmed">
							Compliance
						</Text>
					</div>
					<div>
						<Text size="xs" c="dimmed" fw={500} mb="xs">
							ECUF
						</Text>
						<Text fw={700} size="xl">
							{metrics.ecuf ?? 0}
						</Text>
						<Text size="xs" c="dimmed">
							End-User
						</Text>
					</div>
				</SimpleGrid>

				{isInvalidated && (
					<Group gap="xs" p="sm" style={{ backgroundColor: 'var(--mantine-color-red-0)', borderRadius: 'var(--mantine-radius-md)' }}>
						<IconAlertCircle size={18} color="var(--mantine-color-red-6)" />
						<div>
							<Text size="sm" fw={600} c="red">
								Evaluation Invalidated
							</Text>
							<Text size="xs" c="red">
								This evaluation does not count toward QA metrics
							</Text>
						</div>
					</Group>
				)}
			</Stack>
		</Card>
	);
};
