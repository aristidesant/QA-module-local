import React from 'react';
import { Card, Stack, Group, Text, Progress, ThemeIcon, Badge } from '@mantine/core';
import { IconClipboardCheck } from '@tabler/icons-react';
import styles from '../Dashboard.module.css';

/** QA score breakdown shape shared by every role's weekly metrics */
export interface QualityAssuranceScore {
	total: number;
	ecn: number;
	enc: number;
	ecc: number;
	ecuf: number;
}

interface QualityAssuranceCardProps {
	score: QualityAssuranceScore;
	/** Short line under the card title, used to scope the card per role */
	subtitle?: string;
}

/**
 * The four QA breakdown categories, in display order.
 * Colors reuse the palette previously applied to the standalone
 * DashboardMetricCard tiles so the visual language stays consistent.
 */
const QA_CATEGORIES: { key: keyof Omit<QualityAssuranceScore, 'total'>; label: string; color: string }[] = [
	{ key: 'ecn', label: 'ECN', color: 'cyan' },
	{ key: 'enc', label: 'ENC', color: 'blue' },
	{ key: 'ecc', label: 'ECC', color: 'grape' },
	{ key: 'ecuf', label: 'ECUF', color: 'indigo' },
];

/**
 * QualityAssuranceCard
 *
 * Card 1 of the Performance Score row. Presents the QA breakdown
 * (ECN, ENC, ECC, ECUF) together with the overall QA total, replacing the
 * four separate DashboardMetricCard tiles used previously.
 */
export const QualityAssuranceCard: React.FC<QualityAssuranceCardProps> = ({ score, subtitle }) => (
	<Card className={styles.metricCard} p='lg' radius='md' withBorder shadow='sm' h='100%'>
		<Stack gap='md' h='100%'>
			<Group justify='space-between' align='flex-start' wrap='nowrap'>
				<div>
					<Text fw={600} size='md'>
						Quality Assurance
					</Text>
					{subtitle && (
						<Text size='xs' c='dimmed'>
							{subtitle}
						</Text>
					)}
				</div>
				<ThemeIcon size='lg' color='blue' radius='md'>
					<IconClipboardCheck size={20} />
				</ThemeIcon>
			</Group>

			<Stack gap='sm'>
				{QA_CATEGORIES.map(category => (
					<div key={category.key}>
						<Group justify='space-between' mb={4}>
							<Group gap='xs' align='center'>
								<Text size='sm' fw={500}>
									{category.label}
								</Text>
								<Badge size='xs' variant='light' color={category.color}>
									{score[category.key] >= 90 ? 'On target' : score[category.key] >= 80 ? 'Watch' : 'At risk'}
								</Badge>
							</Group>
							<Text size='sm' fw={600}>
								{score[category.key]}%
							</Text>
						</Group>
						<Progress value={score[category.key]} size='sm' color={category.color} />
					</div>
				))}
			</Stack>
		</Stack>
	</Card>
);

export default QualityAssuranceCard;
