import { useEffect, useRef } from 'react';
import { Box } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { echarts, type EChartsOption } from './echarts';

export interface EChartClick {
	name: string;
	seriesName?: string;
	data?: unknown;
}

interface EChartProps {
	option: EChartsOption;
	height: number;
	/** What the chart says, for screen readers. */
	ariaLabel: string;
	onItemClick?: (params: EChartClick) => void;
}

/** A small ECharts host: it draws the option, follows its container's size and respects reduced motion. */
export function EChart({
	option,
	height,
	ariaLabel,
	onItemClick,
}: EChartProps) {
	const hostRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<ReturnType<typeof echarts.init> | null>(null);
	const clickRef = useRef(onItemClick);
	const reduced = useReducedMotion();

	useEffect(() => {
		clickRef.current = onItemClick;
	}, [onItemClick]);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		const chart = echarts.init(host, undefined, { renderer: 'canvas' });
		chartRef.current = chart;
		chart.on('click', (params) => {
			const p = params as unknown as {
				name?: string;
				seriesName?: string;
				data?: unknown;
			};
			clickRef.current?.({
				name: p.name ?? '',
				seriesName: p.seriesName,
				data: p.data,
			});
		});
		const observer = new ResizeObserver(() => chart.resize());
		observer.observe(host);
		return () => {
			observer.disconnect();
			chart.dispose();
			chartRef.current = null;
		};
	}, []);

	useEffect(() => {
		chartRef.current?.setOption(
			{ ...option, animation: !reduced },
			{ notMerge: true }
		);
	}, [option, reduced]);

	return <Box ref={hostRef} h={height} role='img' aria-label={ariaLabel} />;
}

export default EChart;
