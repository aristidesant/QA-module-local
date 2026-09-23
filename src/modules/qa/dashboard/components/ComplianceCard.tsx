import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	Card,
	Stack,
	Group,
	Text,
	Progress,
	ThemeIcon,
	Badge,
} from '@mantine/core';
import { IconChevronRight, IconShieldCheck } from '@tabler/icons-react';
import { SCORE_BAND_COLOR } from '~/modules/qa/constants/badgeColors';
import type { MetricTrend } from '~/modules/qa/calls/agentMetrics';
import type { ComplianceCategory } from '../mockData';
import DrillRow from './DrillRow';
import { TrendIndicator } from './TrendIndicator';
import styles from '../Dashboard.module.css';

interface ComplianceCardProps {
	categories: ComplianceCategory[];
	/** Short line under the card title, used to scope the card per role */
	subtitle?: string;
	issueCounts?: Partial<Record<ComplianceCategory['name'], number>>;
	onCategoryClick?: (name: ComplianceCategory['name']) => void;
	/** Overall compliance average's trend vs. the prior period of equal length. Omitted when the caller has no period concept. */
	trend?: MetricTrend;
}

/** Maps a compliance category status to a theme-aware Mantine color token */
export const getComplianceColor = (status: ComplianceCategory['status']) => {
	switch (status) {
		case 'compliant':
			return SCORE_BAND_COLOR.good;
		case 'warning':
			return SCORE_BAND_COLOR.warning;
		case 'violation':
			return SCORE_BAND_COLOR.critical;
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
export const ComplianceCard: React.FC<ComplianceCardProps> = ({
	categories,
	subtitle,
	issueCounts,
	onCategoryClick,
	trend,
}) => {
	const { t } = useTranslation('qa.dashboard');
	const averageScore = categories.length
		? Math.round(
				categories.reduce((sum, category) => sum + category.score, 0) /
					categories.length
			)
		: 0;

	return (
		<Card
			className={styles.metricCard}
			p='lg'
			radius='md'
			withBorder
			shadow='sm'
			h='100%'
		>
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
						{trend && <TrendIndicator trend={trend} />}
					</div>
					<ThemeIcon size='lg' color='gray' radius='md'>
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
					{categories.map((category) => {
						const count = issueCounts?.[category.name];
						const clickable = Boolean(onCategoryClick) && (count ?? 0) > 0;
						return (
							<DrillRow
								key={category.name}
								onClick={
									clickable ? () => onCategoryClick!(category.name) : undefined
								}
								hint={t('drill.hint')}
							>
								<Group justify='space-between' mb={4}>
									<Group gap='xs' align='center'>
										<Text size='sm' fw={500}>
											{category.name}
										</Text>
										<Badge
											size='xs'
											color={getComplianceColor(category.status)}
											variant='light'
										>
											{category.status.charAt(0).toUpperCase() +
												category.status.slice(1)}
										</Badge>
									</Group>
									<Group gap={6} wrap='nowrap'>
										<Text size='sm' fw={600}>
											{category.score}%
										</Text>
										{count !== undefined && (
											<Text size='xs' c='dimmed'>
												{t('drill.calls', { count })}
											</Text>
										)}
										{clickable && <IconChevronRight size={14} />}
									</Group>
								</Group>
								<Progress
									value={category.score}
									size='sm'
									color={getComplianceColor(category.status)}
								/>
							</DrillRow>
						);
					})}
				</Stack>
			</Stack>
		</Card>
	);
};

export default ComplianceCard;
