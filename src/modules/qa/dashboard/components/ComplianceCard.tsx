import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Anchor,
	Card,
	Stack,
	Group,
	Text,
	Progress,
	ThemeIcon,
	Badge,
} from '@mantine/core';
import { IconChevronRight, IconShieldCheck } from '@tabler/icons-react';
import { SCORE_BAND_TONE } from '~/modules/qa/constants/badgeColors';
import type { DashboardMetricTrend } from '~/modules/qa/calls/agentMetrics';
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
	trend?: DashboardMetricTrend;
}

/** Maps a compliance category status to its dashboard tone: neutral when compliant, amber / danger otherwise. */
export const getComplianceColor = (status: ComplianceCategory['status']) => {
	switch (status) {
		case 'compliant':
			return SCORE_BAND_TONE.good;
		case 'warning':
			return SCORE_BAND_TONE.warning;
		case 'violation':
			return SCORE_BAND_TONE.critical;
		default:
			return 'gray';
	}
};

/** Only non-compliant categories carry a status badge; the dashboard colors exceptions only. */
const isComplianceException = (status: ComplianceCategory['status']) =>
	status !== 'compliant';

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

	// Exceptions first: compliant categories stay hidden until the reader asks for them.
	const [showAll, setShowAll] = useState(false);
	const exceptions = categories.filter((category) =>
		isComplianceException(category.status)
	);
	const visibleRows = showAll ? categories : exceptions;
	const hiddenCount = categories.length - visibleRows.length;

	return (
		<Card
			className={styles.metricCard}
			p='lg'
			radius='md'
			withBorder
			shadow='none'
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
					<ThemeIcon size='lg' variant='light' color='gray' radius='md'>
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
					{visibleRows.map((category) => {
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
										{isComplianceException(category.status) && (
											<Badge
												size='xs'
												color={getComplianceColor(category.status)}
												variant='light'
											>
												{t(`compliance.status.${category.status}`)}
											</Badge>
										)}
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
									size='xs'
									color={getComplianceColor(category.status)}
									aria-label={`${category.name} ${category.score}%`}
								/>
							</DrillRow>
						);
					})}

					{!showAll && exceptions.length === 0 && (
						<Text size='sm' c='dimmed'>
							{t('breakdown.allOnTarget')}
						</Text>
					)}
					{hiddenCount > 0 && (
						<Anchor
							component='button'
							type='button'
							size='xs'
							c='dimmed'
							onClick={() => setShowAll(true)}
						>
							{t('breakdown.showAll', { count: categories.length })}
						</Anchor>
					)}
					{showAll && exceptions.length < categories.length && (
						<Anchor
							component='button'
							type='button'
							size='xs'
							c='dimmed'
							onClick={() => setShowAll(false)}
						>
							{t('breakdown.showExceptions')}
						</Anchor>
					)}
				</Stack>
			</Stack>
		</Card>
	);
};

export default ComplianceCard;
