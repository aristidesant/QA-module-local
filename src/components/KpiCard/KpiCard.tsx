import {
	IconInfoCircle,
	IconMinus,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import { Text, Tooltip } from '@mantine/core';
import type {
	MetricComparison,
	MetricTrend,
} from '~/models/AnalyticsDashboard';
import styles from './KpiCard.module.css';

const formatValue = (value: string | number | boolean | null | undefined) => {
	if (typeof value === 'number') return value.toLocaleString();
	if (typeof value === 'boolean') return value ? 'True' : 'False';
	if (value === null || value === undefined || value === '') return '-';
	return String(value);
};

const formatPct = (pct: number | null): string => {
	if (pct === null) return '';
	const sign = pct > 0 ? '+' : '';
	return `${sign}${pct.toFixed(1)}%`;
};

const sanitizeColorToken = (value?: string) =>
	(value ?? 'default').replace(/[^a-zA-Z0-9_-]/g, '');

const SPARKLINE_GREEN = '#10b981';
const SPARKLINE_RED = '#ef4444';

const UP_PATH =
	'M0 50 Q 15 45 30 48 T 60 38 T 90 40 T 120 28 T 150 20 T 180 12 Q 190 8 200 5';
const DOWN_PATH =
	'M0 10 Q 12 8 24 12 T 48 18 Q 60 22 72 20 T 96 30 Q 108 34 120 32 T 144 42 Q 156 46 168 44 T 192 56 Q 196 58 200 60';

const TREND_CONFIG: Record<
	MetricTrend,
	{ icon: React.ReactNode; className: string } | null
> = {
	UP: {
		icon: <IconTrendingUp size={16} stroke={2.4} />,
		className: styles['trend--up'],
	},
	DOWN: {
		icon: <IconTrendingDown size={16} stroke={2.4} />,
		className: styles['trend--down'],
	},
	FLAT: {
		icon: <IconMinus size={16} stroke={2.4} />,
		className: styles['trend--flat'],
	},
	UNAVAILABLE: null,
};

export interface KpiCardProps {
	title: string;
	subtitle?: string;
	value?: string | number | boolean | null;
	accentColor?: string;
	isUnsupported?: boolean;
	unsupportedMessage?: string;
	className?: string;
	comparison?: MetricComparison;
	variant?: 'default' | 'comparison-hero' | 'comparison-compact';
	cardSurface?: 'default' | 'builderPreview';
	comparisonLabel?: string;
	comparisonDetail?: string;
	showCompactComparisonTooltip?: boolean;
}

export const KpiCard = ({
	title,
	subtitle,
	value,
	accentColor,
	isUnsupported = false,
	unsupportedMessage,
	className,
	comparison,
	variant = 'default',
	cardSurface = 'default',
	comparisonLabel,
	comparisonDetail,
	showCompactComparisonTooltip = false,
}: KpiCardProps) => {
	const trendConfig =
		comparison && comparison.trend !== 'UNAVAILABLE'
			? TREND_CONFIG[comparison.trend]
			: null;
	const hasComparisonContent = Boolean(
		comparison && comparisonDetail && variant !== 'default'
	);
	const isComparisonHero =
		hasComparisonContent && variant === 'comparison-hero';
	const isComparisonCompact =
		hasComparisonContent && variant === 'comparison-compact';
	const comparisonCompactTooltipLabel =
		showCompactComparisonTooltip && comparisonDetail
			? comparisonDetail
			: undefined;
	const sparklineTrend =
		comparison?.trend === 'UP' ||
		comparison?.trend === 'DOWN' ||
		comparison?.trend === 'FLAT'
			? comparison.trend
			: null;
	const isBuilderPreview = cardSurface === 'builderPreview';
	const sparklineColor =
		sparklineTrend === 'DOWN' ? SPARKLINE_RED : SPARKLINE_GREEN;
	const gradientId = `kpi-spark-gradient-${sanitizeColorToken(accentColor)}-${sparklineTrend ?? 'none'}`;

	return (
		<div
			className={[styles.cardWrapper, className ?? '']
				.filter(Boolean)
				.join(' ')}
		>
			<div
				className={[
					styles.card,
					isUnsupported ? styles.unsupported : '',
					isBuilderPreview ? styles.cardBuilderPreview : '',
					isComparisonHero ? styles['card--comparisonHero'] : '',
					isComparisonCompact ? styles['card--comparisonCompact'] : '',
				]
					.filter(Boolean)
					.join(' ')}
				style={
					accentColor
						? ({ '--kpi-accent': accentColor } as React.CSSProperties)
						: undefined
				}
			>
				{sparklineTrend ? (
					<div className={styles.sparklineLayer} aria-hidden='true'>
						<svg
							viewBox='0 0 200 60'
							preserveAspectRatio='none'
							className={styles.sparklineSvg}
						>
							<defs>
								<linearGradient id={gradientId} x1='0' x2='0' y1='0' y2='1'>
									<stop
										offset='0%'
										stopColor={sparklineColor}
										stopOpacity='0.35'
									/>
									<stop
										offset='100%'
										stopColor={sparklineColor}
										stopOpacity='0'
									/>
								</linearGradient>
							</defs>
							<path
								className={styles.sparklineArea}
								d={sparklineTrend === 'UP' ? UP_PATH : DOWN_PATH}
								fill={`url(#${gradientId})`}
							/>
							<path
								className={styles.sparklinePath}
								d={sparklineTrend === 'UP' ? UP_PATH : DOWN_PATH}
								fill='none'
								stroke={sparklineColor}
							/>
						</svg>
					</div>
				) : null}
				<div className={styles.header}>
					<div className={styles.headerCopy}>
						<Text fw={600} size='sm' className={styles.title}>
							{title}
						</Text>
						{subtitle ? (
							<span className={styles.subtitle}>{subtitle}</span>
						) : null}
					</div>
				</div>

				{isUnsupported ? (
					<Text size='sm' c='dimmed' className={styles.unsupportedMessage}>
						{unsupportedMessage}
					</Text>
				) : (
					<>
						<p className={styles.value}>{formatValue(value)}</p>
						{isComparisonHero ? (
							<>
								<div className={styles.divider} />
								<div className={styles.comparisonHeroMeta}>
									<div className={styles.comparisonHeroLead}>
										{trendConfig ? (
											<div
												className={`${styles.trend} ${trendConfig.className}`}
											>
												<span className={styles.trendIcon}>
													{trendConfig.icon}
												</span>
												<span className={styles.trendPct}>
													{formatPct(comparison!.percentageChange)}
												</span>
											</div>
										) : null}
										{comparisonLabel ? (
											<span className={styles.comparisonLabel}>
												{comparisonLabel}
											</span>
										) : null}
									</div>
									<div className={styles.infoPanel}>
										<div className={styles.infoIcon}>
											<IconInfoCircle size={15} stroke={2} />
										</div>
										<span className={styles.infoText}>{comparisonDetail}</span>
									</div>
								</div>
							</>
						) : null}
						{isComparisonCompact ? (
							<div className={styles.comparisonCompactMeta}>
								<div className={styles.comparisonCompactCopy}>
									<span className={styles.yesterdayLabel}>
										{comparisonDetail}
									</span>
									{comparisonLabel ? (
										<span className={styles.comparisonInlineLabel}>
											{comparisonLabel}
										</span>
									) : null}
								</div>
								{trendConfig ? (
									comparisonCompactTooltipLabel ? (
										<Tooltip
											label={comparisonCompactTooltipLabel}
											withArrow
											multiline
											maw={220}
											position='top-end'
										>
											<div
												className={`${styles.trend} ${trendConfig.className}`}
											>
												<span className={styles.trendIcon}>
													{trendConfig.icon}
												</span>
												<span className={styles.trendPct}>
													{formatPct(comparison!.percentageChange)}
												</span>
											</div>
										</Tooltip>
									) : (
										<div className={`${styles.trend} ${trendConfig.className}`}>
											<span className={styles.trendIcon}>
												{trendConfig.icon}
											</span>
											<span className={styles.trendPct}>
												{formatPct(comparison!.percentageChange)}
											</span>
										</div>
									)
								) : null}
							</div>
						) : null}
						{!hasComparisonContent && (trendConfig || comparisonLabel) ? (
							<div className={styles.comparisonMeta}>
								{trendConfig ? (
									<div className={`${styles.trend} ${trendConfig.className}`}>
										<span className={styles.trendIcon}>{trendConfig.icon}</span>
										<span className={styles.trendPct}>
											{formatPct(comparison!.percentageChange)}
										</span>
									</div>
								) : null}
								{comparisonLabel ? (
									<span className={styles.previousValue}>
										{comparisonLabel}
									</span>
								) : null}
							</div>
						) : null}
					</>
				)}
			</div>
		</div>
	);
};

export default KpiCard;
