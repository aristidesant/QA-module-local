import { useEffect, useMemo, useRef, useState } from 'react';
import { Group } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { EChart } from '../EChart';
import type { EChartsOption } from '../echarts';
import { InsightsTile } from '../InsightsTile';
import { ParticleField } from '../ParticleField';
import type { Kpi } from '../insightsMetrics';
import {
	useInsightsTheme,
	withAlpha,
	type InsightsTheme,
} from '../useInsightsTheme';
import styles from '../Insights.module.css';

const COUNT_UP_MS = 400;

/** A number that climbs to its value once, then follows changes; it just shows the value with reduced motion. */
const useCountUp = (target: number, decimals: number): string => {
	const reduced = useReducedMotion();
	const [shown, setShown] = useState(reduced ? target : 0);
	const from = useRef(reduced ? target : 0);

	useEffect(() => {
		if (reduced) {
			from.current = target;
			setShown(target);
			return;
		}
		const origin = from.current;
		const start = performance.now();
		let frame = 0;
		const tick = (now: number) => {
			const progress = Math.min(1, (now - start) / COUNT_UP_MS);
			const eased = 1 - Math.pow(1 - progress, 3);
			const value = origin + (target - origin) * eased;
			from.current = value;
			setShown(value);
			if (progress < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [target, reduced]);

	return new Intl.NumberFormat(undefined, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(shown);
};

const sparkOption = (kpi: Kpi, theme: InsightsTheme): EChartsOption => ({
	grid: { left: 0, right: 0, top: 4, bottom: 2 },
	tooltip: {
		...theme.tooltip,
		trigger: 'axis',
		confine: true,
		axisPointer: { type: 'line', lineStyle: { color: theme.border } },
	},
	xAxis: {
		type: 'category',
		show: false,
		boundaryGap: false,
		data: kpi.spark.map((point) => point.label),
	},
	yAxis: { type: 'value', show: false, scale: true },
	series: [
		{
			type: 'line',
			data: kpi.spark.map((point) => point.value),
			smooth: 0.4,
			symbol: 'none',
			lineStyle: { width: 1.5, color: theme.accent },
			areaStyle: {
				color: {
					type: 'linear',
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [
						{ offset: 0, color: withAlpha(theme.accent, '40') },
						{ offset: 1, color: withAlpha(theme.accent, '00') },
					],
				},
			},
		},
	],
});

function KpiBlock({ kpi }: { kpi: Kpi }) {
	const { t } = useTranslation('qa.dashboard');
	const theme = useInsightsTheme();
	const decimals = kpi.key === 'sentiment' ? 1 : 0;
	const value = useCountUp(kpi.value, decimals);
	const option = useMemo(() => sparkOption(kpi, theme), [kpi, theme]);
	const label = t(`operationManager.insights.kpis.${kpi.key}`);
	const up = kpi.delta !== null && kpi.delta > 0;
	const down = kpi.delta !== null && kpi.delta < 0;
	const DeltaIcon = down ? IconArrowDownRight : IconArrowUpRight;

	return (
		<div className={styles.kpi}>
			<div className={styles.kpiLabel}>{label}</div>
			<div className={styles.kpiValue}>
				{value}
				{kpi.unit && <span className={styles.kpiUnit}>{kpi.unit}</span>}
			</div>
			<Group gap={4} wrap='nowrap' mb={4}>
				{kpi.delta === null ? (
					<span className={styles.delta}>—</span>
				) : (
					<span
						className={[
							styles.delta,
							up ? styles.deltaUp : down ? styles.deltaDown : '',
						].join(' ')}
					>
						{(up || down) && <DeltaIcon size={13} aria-hidden />}
						{up ? '+' : ''}
						{kpi.delta}
						{kpi.deltaUnit === 'pts'
							? ` ${t('operationManager.insights.pts')}`
							: kpi.deltaUnit}
					</span>
				)}
				<span className={styles.kpiLabel}>
					{t('operationManager.insights.vsPrevious')}
				</span>
			</Group>
			{kpi.spark.length > 1 && (
				<EChart
					option={option}
					height={40}
					ariaLabel={`${label}: ${kpi.value}`}
				/>
			)}
		</div>
	);
}

interface KpiStripProps {
	kpis: Kpi[];
	index: number;
}

/** The headline numbers of the operation over a field of drifting particles. */
export function KpiStrip({ kpis, index }: KpiStripProps) {
	const { t } = useTranslation('qa.dashboard');

	return (
		<InsightsTile
			hero
			span={12}
			index={index}
			title={t('operationManager.insights.glance.title')}
			subtitle={t('operationManager.insights.glance.subtitle')}
			backdrop={<ParticleField />}
		>
			<div className={styles.kpiGrid}>
				{kpis.map((kpi) => (
					<KpiBlock key={kpi.key} kpi={kpi} />
				))}
			</div>
		</InsightsTile>
	);
}

export default KpiStrip;
