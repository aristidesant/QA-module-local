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
import { IconChevronRight, IconClipboardCheck } from '@tabler/icons-react';
import {
	getScoreBand,
	SCORE_BAND_COLOR,
} from '~/modules/qa/constants/badgeColors';
import DrillRow from './DrillRow';
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
}

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
}) => {
	const { t } = useTranslation('qa.dashboard');

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
							Quality Assurance
						</Text>
						{subtitle && (
							<Text size='xs' c='dimmed'>
								{subtitle}
							</Text>
						)}
					</div>
					<ThemeIcon size='lg' color='gray' radius='md'>
						<IconClipboardCheck size={20} />
					</ThemeIcon>
				</Group>

				<Stack gap='sm'>
					{QA_CATEGORIES.map((category) => {
						const count = issueCounts?.[category.key];
						const clickable = Boolean(onCategoryClick) && (count ?? 0) > 0;
						const band = getScoreBand(score[category.key]);
						const bandLabel =
							band === 'good'
								? 'On target'
								: band === 'warning'
									? 'Watch'
									: 'At risk';
						const bandColor = SCORE_BAND_COLOR[band];
						return (
							<DrillRow
								key={category.key}
								onClick={
									clickable ? () => onCategoryClick!(category.key) : undefined
								}
								hint={t('drill.hint')}
							>
								<Group justify='space-between' mb={4}>
									<Group gap='xs' align='center'>
										<Text size='sm' fw={500}>
											{category.label}
										</Text>
										<Badge size='xs' variant='light' color={bandColor}>
											{bandLabel}
										</Badge>
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
								<Progress
									value={score[category.key]}
									size='sm'
									color={bandColor}
								/>
							</DrillRow>
						);
					})}

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
											<Badge
												size='xs'
												variant='light'
												color={autoFails > 0 ? 'red' : 'gray'}
											>
												{autoFails > 0
													? t('autoFails.present')
													: t('autoFails.none')}
											</Badge>
										</Group>
										<Group gap={6} wrap='nowrap'>
											<Text
												size='sm'
												fw={600}
												c={autoFails > 0 ? 'red' : undefined}
											>
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
