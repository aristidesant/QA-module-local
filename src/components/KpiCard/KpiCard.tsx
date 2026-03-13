import {
	IconMinus,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import { Text } from '@mantine/core';
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

const TREND_CONFIG: Record<
	MetricTrend,
	{ icon: React.ReactNode; color: string; className: string } | null
> = {
	UP: {
		icon: <IconTrendingUp size={13} />,
		color: '#16a34a',
		className: styles['trend--up'],
	},
	DOWN: {
		icon: <IconTrendingDown size={13} />,
		color: '#dc2626',
		className: styles['trend--down'],
	},
	FLAT: {
		icon: <IconMinus size={13} />,
		color: '#64748b',
		className: styles['trend--flat'],
	},
	UNAVAILABLE: null,
};

export interface KpiCardProps {
	title: string;
	value?: string | number | boolean | null;
	accentColor?: string;
	isLive?: boolean;
	liveLabel?: string;
	isUnsupported?: boolean;
	unsupportedMessage?: string;
	className?: string;
	comparison?: MetricComparison;
}

export const KpiCard = ({
	title,
	value,
	accentColor,
	isLive = false,
	liveLabel = 'Live',
	isUnsupported = false,
	unsupportedMessage,
	className,
	comparison,
}: KpiCardProps) => {
	const trendConfig =
		comparison && comparison.trend !== 'UNAVAILABLE'
			? TREND_CONFIG[comparison.trend]
			: null;

	return (
		<div
			className={`${styles.card} ${isUnsupported ? styles.unsupported : ''} ${className ?? ''}`}
			style={
				accentColor
					? ({ '--kpi-accent': accentColor } as React.CSSProperties)
					: undefined
			}
		>
			<div className={styles.header}>
				<Text fw={600} size='sm' className={styles.title}>
					{title}
				</Text>
				{isLive && !isUnsupported && (
					<div className={styles.liveIndicator}>
						<div className={styles.liveDot} />
						<span className={styles.liveLabel}>{liveLabel}</span>
					</div>
				)}
			</div>

			{isUnsupported ? (
				<Text size='sm' c='dimmed' className={styles.unsupportedMessage}>
					{unsupportedMessage}
				</Text>
			) : (
				<>
					<p className={styles.value}>{formatValue(value)}</p>
					{trendConfig ? (
						<div className={`${styles.trend} ${trendConfig.className}`}>
							<span className={styles.trendIcon}>{trendConfig.icon}</span>
							<span className={styles.trendPct}>
								{formatPct(comparison!.percentageChange)}
							</span>
						</div>
					) : null}
				</>
			)}
		</div>
	);
};

export default KpiCard;
