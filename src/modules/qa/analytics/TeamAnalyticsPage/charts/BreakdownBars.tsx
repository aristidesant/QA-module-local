import { Box } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import { SERIES, SERIES_OTHER } from './seriesColors';
import classes from './charts.module.css';

export interface BreakdownRow {
	key: string;
	label: string;
	value: number;
	/** A second, gray bar next to the first (e.g. the agent side next to the customer side). */
	secondary?: number;
}

interface BreakdownBarsProps {
	rows: BreakdownRow[];
	unit: 'PERCENT' | 'COUNT';
	valueLabel: string;
	secondaryLabel?: string;
}

/** Horizontal bars for a ranked breakdown: one hue, rounded ends, values at the end of each bar. */
export default function BreakdownBars({
	rows,
	unit,
	valueLabel,
	secondaryLabel,
}: BreakdownBarsProps) {
	const ready = useChartReady();
	const hasSecondary = rows.some((r) => r.secondary !== undefined);
	const perRow = hasSecondary ? 52 : 34;
	const height = rows.length * perRow + 32;
	const format = (value: number) =>
		unit === 'PERCENT' ? `${Math.round(value)}%` : String(Math.round(value));

	if (!ready) return <Box h={height} className={classes.chartPlaceholder} />;

	return (
		<BarChart
			h={height}
			data={rows.map((r) => ({
				label: r.label,
				value: r.value,
				secondary: r.secondary ?? 0,
			}))}
			dataKey='label'
			orientation='vertical'
			series={[
				{ name: 'value', label: valueLabel, color: SERIES[0] },
				...(hasSecondary
					? [
							{
								name: 'secondary',
								label: secondaryLabel ?? '',
								color: SERIES_OTHER,
							},
						]
					: []),
			]}
			withLegend={hasSecondary}
			legendProps={{ verticalAlign: 'top', height: 28 }}
			withBarValueLabel
			valueFormatter={format}
			barProps={{ radius: 4 }}
			gridAxis='x'
			tickLine='none'
			yAxisProps={{ width: 132 }}
			xAxisProps={{ domain: unit === 'PERCENT' ? [0, 100] : [0, 'auto'] }}
		/>
	);
}
