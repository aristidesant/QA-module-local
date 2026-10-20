import { useTranslation } from 'react-i18next';
import { Box, SimpleGrid, Text, UnstyledButton } from '@mantine/core';
import { Sparkline } from '@mantine/charts';
import {
	IconTrendingDown,
	IconTrendingUp,
	IconMinus,
} from '@tabler/icons-react';
import { formatSeconds } from '~/modules/qa/team/helpers';
import { comparison, isImprovement, metricMeta } from '../../helpers';
import type { AnalyticsMetricId } from '../../types';
import { SERIES_CURRENT } from './seriesColors';
import classes from './charts.module.css';

export interface MetricTileProps {
	label: string;
	value: string;
	metricId: AnalyticsMetricId;
	current: number | null;
	previous: number | null;
	/** Volume has no good or bad direction: the arrow shows without a verdict. */
	neutral?: boolean;
	sparkline?: number[];
	/** Comparison switched on and possible; otherwise no delta is shown. */
	compare: boolean;
	hint?: string;
	onClick?: () => void;
}

const sign = (n: number) => (n > 0 ? '+' : n < 0 ? '−' : '');

/** The change since the previous period, in the metric's own unit. */
function deltaText(
	metricId: AnalyticsMetricId,
	cmp: ReturnType<typeof comparison>,
	pts: string
): string {
	const abs = cmp.absoluteChange ?? 0;
	switch (metricMeta(metricId).unit) {
		case 'PERCENT':
			return `${sign(abs)}${Math.abs(abs)} ${pts}`;
		case 'SCORE_5':
			return `${sign(abs)}${Math.abs(abs).toFixed(1)}`;
		case 'SECONDS':
			return `${sign(abs)}${formatSeconds(Math.abs(abs))}`;
		default:
			return cmp.percentageChange === null
				? `${sign(abs)}${Math.abs(abs)}`
				: `${sign(cmp.percentageChange)}${Math.abs(cmp.percentageChange)}%`;
	}
}

/** Label, value, change against the previous period and a sparkline. Clickable when it leads somewhere. */
export default function MetricTile({
	label,
	value,
	metricId,
	current,
	previous,
	neutral = false,
	sparkline,
	compare,
	hint,
	onClick,
}: MetricTileProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const cmp = comparison(current, previous);
	const improved = neutral
		? null
		: isImprovement(cmp, metricMeta(metricId).higherIsBetter);
	const Icon =
		cmp.trend === 'UP'
			? IconTrendingUp
			: cmp.trend === 'DOWN'
				? IconTrendingDown
				: IconMinus;

	const body = (
		<>
			<Text className={classes.tileLabel}>{label}</Text>
			<Text className={classes.tileValue}>{value}</Text>
			{compare && cmp.trend !== 'UNAVAILABLE' ? (
				<span
					className={`${classes.tileDelta} ${improved === false ? classes.tileDeltaBad : ''}`}
				>
					<Icon size={12} />
					{deltaText(metricId, cmp, t('charts.points'))}{' '}
					{t('charts.vsPrevious')}
				</span>
			) : (
				<span className={classes.tileDelta}>{hint ?? ' '}</span>
			)}
			{sparkline && sparkline.length > 1 && (
				<Box className={classes.tileSpark}>
					<Sparkline
						h={28}
						data={sparkline}
						color={SERIES_CURRENT}
						fillOpacity={0.08}
						strokeWidth={1.5}
						curveType='monotone'
					/>
				</Box>
			)}
		</>
	);

	return onClick ? (
		<UnstyledButton
			className={`${classes.tile} ${classes.tileInteractive}`}
			onClick={onClick}
		>
			{body}
		</UnstyledButton>
	) : (
		<div className={classes.tile}>{body}</div>
	);
}

export function MetricTileRow({
	tiles,
	columns,
}: {
	tiles: MetricTileProps[];
	columns?: number;
}) {
	return (
		<SimpleGrid
			cols={{
				base: 2,
				md: 3,
				lg: columns ?? (tiles.length >= 6 ? 6 : tiles.length),
			}}
			spacing='sm'
		>
			{tiles.map((tile) => (
				<MetricTile key={`${tile.metricId}-${tile.label}`} {...tile} />
			))}
		</SimpleGrid>
	);
}
