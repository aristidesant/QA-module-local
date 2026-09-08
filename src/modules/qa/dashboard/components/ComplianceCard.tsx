import React from 'react';
import { Card, Stack, Group, Text, Progress, ThemeIcon, Badge } from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';
import type { ComplianceCategory } from '../mockData';
import styles from '../Dashboard.module.css';

interface ComplianceCardProps {
	categories: ComplianceCategory[];
	/** Short line under the card title, used to scope the card per role */
	subtitle?: string;
}

/** Maps a compliance category status to a theme-aware Mantine color token */
export const getComplianceColor = (status: ComplianceCategory['status']) => {
	switch (status) {
		case 'compliant':
			return 'teal';
		case 'warning':
			return 'yellow';
		case 'violation':
			return 'red';
		default:
			return 'gray';
	}
};

/**
 * ComplianceCard
 *
 * Card 2 of the Performance Score row. Previously this markup was duplicated
 * as a local component inside each of the four dashboards; it now lives here
 * so every role renders an identical compliance breakdown.
 *
 * Uses Mantine color tokens only, so it renders correctly in dark and light mode.
 */
export const ComplianceCard: React.FC<ComplianceCardProps> = ({ categories, subtitle }) => {
	const averageScore = categories.length
		? Math.round(categories.reduce((sum, category) => sum + category.score, 0) / categories.length)
		: 0;

	return (
		<Card className={styles.metricCard} p='lg' radius='md' withBorder shadow='sm' h='100%'>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<div>
						<Text fw={600} size='md'>
							Compliance
						</Text>
						{subtitle && (
							<Text size='xs' c='dimmed'>
								{subtitle}
							</Text>
						)}
					</div>
					<ThemeIcon size='lg' color='green' radius='md'>
						<IconShieldCheck size={20} />
					</ThemeIcon>
				</Group>

				<Group gap='xs' align='baseline'>
					<Text className={styles.scoreValue}>{averageScore}</Text>
					<Text size='sm' c='dimmed'>
						% average
					</Text>
				</Group>

				<Stack gap='sm'>
					{categories.map(category => (
						<div key={category.name}>
							<Group justify='space-between' mb={4}>
								<Group gap='xs' align='center'>
									<Text size='sm' fw={500}>
										{category.name}
									</Text>
									<Badge size='xs' color={getComplianceColor(category.status)} variant='light'>
										{category.status.charAt(0).toUpperCase() + category.status.slice(1)}
									</Badge>
								</Group>
								<Text size='sm' fw={600}>
									{category.score}%
								</Text>
							</Group>
							<Progress value={category.score} size='sm' color={getComplianceColor(category.status)} />
						</div>
					))}
				</Stack>
			</Stack>
		</Card>
	);
};

export default ComplianceCard;
