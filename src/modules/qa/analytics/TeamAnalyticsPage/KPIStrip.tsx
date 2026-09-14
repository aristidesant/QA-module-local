import { useTranslation } from 'react-i18next';
import { Group, Stack, ThemeIcon, Text, Tooltip } from '@mantine/core';
import {
	IconTrendingUp,
	IconTrendingDown,
	IconMinus,
} from '@tabler/icons-react';
import type { MetricComparison } from '~/models/AnalyticsDashboard';
import { comparison, isImprovement } from '../helpers';
import { useTeamAnalyticsData } from './TeamAnalyticsContext';
import styles from './TeamAnalyticsPage.module.css';

interface KPIMetricProps {
	label: string;
	value: string;
	cmp: MetricComparison;
	/** Drives the trend colour: a rising error count is not an improvement. */
	higherIsBetter: boolean;
	/** Volume has no good/bad direction — show the arrow without a verdict colour. */
	neutral?: boolean;
	vsPreviousLabel: string;
}

function KPIMetric({
	label,
	value,
	cmp,
	higherIsBetter,
	neutral,
	vsPreviousLabel,
}: KPIMetricProps) {
	const improved = neutral ? null : isImprovement(cmp, higherIsBetter);
	const color = improved === null ? 'gray' : improved ? 'green' : 'red';
	const Icon =
		cmp.trend === 'UP'
			? IconTrendingUp
			: cmp.trend === 'DOWN'
				? IconTrendingDown
				: IconMinus;

	return (
		<Stack gap={2} flex={1}>
			<Text size='xs' fw={500} c='dimmed'>
				{label}
			</Text>
			<Group gap='xs' align='center'>
				<Text size='lg' fw={700}>
					{value}
				</Text>
				{cmp.trend !== 'UNAVAILABLE' && cmp.percentageChange !== null && (
					<Tooltip
						label={`${cmp.percentageChange > 0 ? '+' : ''}${cmp.percentageChange}% ${vsPreviousLabel}`}
						withArrow
					>
						<ThemeIcon size='xs' variant='light' color={color}>
							<Icon size={12} />
						</ThemeIcon>
					</Tooltip>
				)}
			</Group>
		</Stack>
	);
}

export default function KPIStrip() {
	const { t } = useTranslation('qa.teamAnalytics');
	const { kpis, previousKpis } = useTeamAnalyticsData();

	const na = t('common.na');
	const pct = (v: number | null) => (v === null ? na : `${Math.round(v)}%`);
	const score = (v: number | null) => (v === null ? na : v.toFixed(1));
	const vsPrevious = t('kpis.vsPrevious');

	const metrics: {
		label: string;
		value: string;
		cmp: MetricComparison;
		higherIsBetter: boolean;
		neutral?: boolean;
	}[] = [
		{
			label: t('kpis.qaScore'),
			value: pct(kpis.qaScore),
			cmp: comparison(kpis.qaScore, previousKpis.qaScore),
			higherIsBetter: true,
		},
		{
			label: t('kpis.compliance'),
			value: pct(kpis.compliance),
			cmp: comparison(kpis.compliance, previousKpis.compliance),
			higherIsBetter: true,
		},
		{
			label: t('kpis.customerSentiment'),
			value: score(kpis.customerSentiment),
			cmp: comparison(kpis.customerSentiment, previousKpis.customerSentiment),
			higherIsBetter: true,
		},
		{
			label: t('kpis.conversionRate'),
			value: pct(kpis.conversionRate),
			cmp: comparison(kpis.conversionRate, previousKpis.conversionRate),
			higherIsBetter: true,
		},
		{
			label: t('kpis.calls'),
			value: kpis.calls.toLocaleString(),
			cmp: comparison(kpis.calls, previousKpis.calls),
			higherIsBetter: true,
			neutral: true,
		},
	];

	return (
		<div className={styles.kpiStrip}>
			<Group gap='xl' grow>
				{metrics.map((m) => (
					<KPIMetric
						key={m.label}
						label={m.label}
						value={m.value}
						cmp={m.cmp}
						higherIsBetter={m.higherIsBetter}
						neutral={m.neutral}
						vsPreviousLabel={vsPrevious}
					/>
				))}
			</Group>
		</div>
	);
}
