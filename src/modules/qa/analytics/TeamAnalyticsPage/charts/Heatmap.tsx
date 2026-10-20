import { useTranslation } from 'react-i18next';
import { Box, SimpleGrid, Text, Tooltip } from '@mantine/core';
import { HEATMAP_MIN_CALLS } from '../../constants';
import { formatMetric } from '../../helpers';
import type { AnalyticsMetricId, HeatmapData } from '../../types';
import { HEAT } from './seriesColors';
import classes from './charts.module.css';

interface HeatmapProps {
	data: HeatmapData;
	metricId: AnalyticsMetricId;
}

/** Linear steps of one hue from 0 to the highest cell, so the shade always tells the same story as the number. */
const stepOf = (value: number, max: number): number =>
	max <= 0
		? 0
		: Math.min(HEAT.length - 1, Math.floor((value / max) * HEAT.length));

/**
 * Weekday × time-slot grid: darker means more, on a scale from 0 to the highest cell (shown in the
 * legend). The tooltip adds the call count, and cells built from very few calls are faded.
 */
export default function Heatmap({ data, metricId }: HeatmapProps) {
	const values = data.cells.flat().filter((v): v is number => v !== null);
	const max = values.length ? Math.max(...values) : 0;

	return (
		<div>
			<SimpleGrid cols={data.cols.length + 1} spacing={2} verticalSpacing={2}>
				<div />
				{data.cols.map((col) => (
					<Text key={col} className={classes.heatHead}>
						{col}
					</Text>
				))}
				{data.rows.map((row, r) => (
					<RowCells
						key={row.key}
						label={row.label}
						cols={data.cols}
						cells={data.cells[r]}
						counts={data.counts[r]}
						max={max}
						metricId={metricId}
					/>
				))}
			</SimpleGrid>

			<div className={classes.heatLegend}>
				<Text size='xs' c='dimmed'>
					{formatMetric(metricId, 0)}
				</Text>
				{HEAT.map((color) => (
					<Box
						key={color}
						w={28}
						h={10}
						bg={color}
						className={classes.swatch}
					/>
				))}
				<Text size='xs' c='dimmed'>
					{formatMetric(metricId, max)}
				</Text>
			</div>
		</div>
	);
}

function RowCells({
	label,
	cols,
	cells,
	counts,
	max,
	metricId,
}: {
	label: string;
	cols: string[];
	cells: (number | null)[];
	counts: number[];
	max: number;
	metricId: AnalyticsMetricId;
}) {
	const { t } = useTranslation('qa.teamAnalytics');
	return (
		<>
			<Text className={classes.heatLabel}>{label}</Text>
			{cells.map((value, c) => {
				if (value === null)
					return (
						<div
							key={cols[c]}
							className={`${classes.heatCell} ${classes.heatEmpty}`}
						>
							—
						</div>
					);
				const step = stepOf(value, max);
				const low = counts[c] < HEATMAP_MIN_CALLS;
				return (
					<Tooltip
						key={cols[c]}
						label={t('charts.heatmapCell', {
							row: label,
							col: cols[c],
							value: formatMetric(metricId, value),
							count: counts[c],
						})}
						withArrow
					>
						<Box
							bg={HEAT[step]}
							c={
								step >= 3
									? 'var(--mantine-color-white)'
									: 'var(--mantine-color-text)'
							}
							opacity={low ? 0.4 : 1}
							className={classes.heatCell}
						>
							{formatMetric(metricId, value)}
						</Box>
					</Tooltip>
				);
			})}
		</>
	);
}
