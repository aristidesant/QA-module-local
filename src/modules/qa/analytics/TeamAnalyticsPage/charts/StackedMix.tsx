import { Box } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import { formatPeriod } from './format';
import classes from './charts.module.css';

export interface MixKey {
	name: string;
	label: string;
	color: string;
}

interface StackedMixProps {
	data: Record<string, string | number>[];
	keys: MixKey[];
	h?: number;
}

/** 100% stacked columns per period: how a total splits into a few named parts. */
export default function StackedMix({ data, keys, h = 260 }: StackedMixProps) {
	const ready = useChartReady();
	if (!ready) return <Box h={h} className={classes.chartPlaceholder} />;
	return (
		<BarChart
			h={h}
			data={data}
			dataKey='period'
			type='percent'
			series={keys.map((k) => ({
				name: k.name,
				label: k.label,
				color: k.color,
			}))}
			withLegend
			legendProps={{ verticalAlign: 'top', height: 28 }}
			gridAxis='y'
			tickLine='none'
			barProps={{ radius: 2 }}
			xAxisProps={{ tickFormatter: formatPeriod, minTickGap: 16 }}
		/>
	);
}
