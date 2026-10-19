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
import { IconChevronRight, IconClipboardCheck } from '@tabler/icons-react';
import {
	SCORE_BAND_TONE,
	isExceptionBand,
} from '~/modules/qa/constants/badgeColors';
import { bandFor } from '~/modules/qa/settings/helpers';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import type { DashboardMetricTrend } from '~/modules/qa/calls/agentMetrics';
import DrillRow from './DrillRow';
import { TrendIndicator } from './TrendIndicator';
import styles from '../Dashboard.module.css';

/** QA score breakdown shape shared by every role's weekly metrics */
export interface QualityAssuranceScore {
	total: number;
	ecn: number;
	enc: number;
	ecc: number;
	ecuf: number;
}

export type QaCategoryKey = keyof Omit<QualityAssuranceScore, 'total'>;

interface QualityAssuranceCardProps {
	score: QualityAssuranceScore;
	/** Short line under the card title, used to scope the card per role */
	subtitle?: string;
	/** Auto-fails of the period. Rendered as an extra breakdown row when provided. */
	autoFails?: number;
	/** Calls behind each row (agent drill-down). Rows render a count and become clickable when `onCategoryClick` is set. */
	issueCounts?: Partial<Record<QaCategoryKey | 'autoFails', number>>;
	onCategoryClick?: (key: QaCategoryKey | 'autoFails') => void;
	/** Overall QA score's trend vs. the prior period of equal length. Omitted when the caller has no period concept. */
	trend?: DashboardMetricTrend;
	/** Portfolio view (Operation Manager): keeps the rows but drops progress bars, call counts and drill-down. */
	compact?: boolean;
}

/** Label of each score band, in `qa.dashboard`. */
const BAND_LABEL_KEY = {
	good: 'bands.onTarget',
	warning: 'bands.watch',
	critical: 'bands.atRisk',
} as const;

/**
 * The four QA breakdown categories, in display order.
 * Colors reuse the palette previously applied to the standalone
 * DashboardMetricCard tiles so the visual language stays consistent.
 */
const QA_CATEGORIES: { key: QaCategoryKey; label: string }[] = [
	{ key: 'ecn', label: 'ECN' },
	{ key: 'enc', label: 'ENC' },
	{ key: 'ecc', label: 'ECC' },
	{ key: 'ecuf', label: 'ECUF' },
];

/**
 * QualityAssuranceCard
 *
 * Card 1 of the Performance Score row. Presents the QA breakdown
 * (ECN, ENC, ECC, ECUF) together with the overall QA total, replacing the
 * four separate DashboardMetricCard tiles used previously.
 */
export const QualityAssuranceCard: React.FC<QualityAssuranceCardProps> = ({
	score,
	subtitle,
	autoFails,
	issueCounts,
	onCategoryClick,
	trend,
	compact = false,
}) => {
	const { t } = useTranslation('qa.dashboard');
	const thresholds = useSettingsStore(selectThresholds);
	const totalBand = bandFor(score.total, thresholds.qa.scoreBands);
	const totalBandColor = SCORE_BAND_TONE[totalBand];

	// Exceptions first: on-target categories stay hidden until the reader asks for them.
	const [showAll, setShowAll] = useState(false);
	const rows = QA_CATEGORIES.map((category) => ({
		...category,
		band: bandFor(
			score[category.key],
			thresholds.qa.categoryBands[category.key]
		),
	}));
	const exceptions = rows.filter((row) => isExceptionBand(row.band));
	const visibleRows = showAll ? rows : exceptions;
	const hiddenCount = rows.length - visibleRows.length;

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
							Quality Assurance
						</Text>
						{subtitle && (
							<Text size='xs' c='dimmed'>
								{subtitle}
							</Text>
						)}
						{trend && <TrendIndicator trend={trend} />}
					</div>
					<ThemeIcon size='lg' variant='light' color='gray' radius='md'>
						<IconClipboardCheck size={20} />
					</ThemeIcon>
				</Group>

				<Group gap='xs' align='baseline'>
					<Text className={styles.scoreValue}>{score.total}</Text>
					<Text size='sm' c='dimmed'>
						{t('qualityAssurance.averageScore')}
					</Text>
					<Badge size='xs' variant='light' color={totalBandColor}>
						{t(BAND_LABEL_KEY[totalBand])}
					</Badge>
				</Group>

				<Stack gap='sm'>
					{visibleRows.map((category) => {
						const count = issueCounts?.[category.key];
						const clickable = Boolean(onCategoryClick) && (count ?? 0) > 0;
						const bandColor = SCORE_BAND_TONE[category.band];
						return (
							<DrillRow
								key={category.key}
								onClick={
									clickable ? () => onCategoryClick!(category.key) : undefined
								}
								hint={t('drill.hint')}
							>
								<Group justify='space-between' mb={compact ? 0 : 4}>
									<Group gap='xs' align='center'>
										<Text size='sm' fw={500}>
											{category.label}
										</Text>
										{isExceptionBand(category.band) && (
											<Badge size='xs' variant='light' color={bandColor}>
												{t(BAND_LABEL_KEY[category.band])}
											</Badge>
										)}
									</Group>
									<Group gap={6} wrap='nowrap'>
										<Text size='sm' fw={600}>
											{score[category.key]}%
										</Text>
										{count !== undefined && (
											<Text size='xs' c='dimmed'>
												{t('drill.calls', { count })}
											</Text>
										)}
										{clickable && <IconChevronRight size={14} />}
									</Group>
								</Group>
								{!compact && (
									<Progress
										value={score[category.key]}
										size='xs'
										color={bandColor}
										aria-label={`${category.label} ${score[category.key]}%`}
									/>
								)}
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
							{t('breakdown.showAll', { count: rows.length })}
						</Anchor>
					)}
					{showAll && exceptions.length < rows.length && (
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

					{autoFails !== undefined &&
						(() => {
							const count = issueCounts?.autoFails ?? autoFails;
							const clickable = Boolean(onCategoryClick) && count > 0;
							return (
								<DrillRow
									onClick={
										clickable ? () => onCategoryClick!('autoFails') : undefined
									}
									hint={t('drill.hint')}
								>
									<Group justify='space-between'>
										<Group gap='xs' align='center'>
											<Text size='sm' fw={500}>
												{t('businessInsights.autoFails')}
											</Text>
											{autoFails > 0 && (
												<Badge size='xs' variant='light' color='danger'>
													{t('autoFails.present')}
												</Badge>
											)}
										</Group>
										<Group gap={6} wrap='nowrap'>
											<Text size='sm' fw={600}>
												{autoFails}
											</Text>
											{clickable && <IconChevronRight size={14} />}
										</Group>
									</Group>
								</DrillRow>
							);
						})()}
				</Stack>
			</Stack>
		</Card>
	);
};

export default QualityAssuranceCard;
