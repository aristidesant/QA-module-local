import React, { useMemo } from 'react';
import { Badge, Text } from '@mantine/core';
import { useSchedulerCalculatorStore } from '~/stores/schedulerCalculatorStore';
import {
	SCHEDULER_CALCULATOR_CONFIG,
	WaveKey,
} from '../calculateSchedulerMetrics';
import BaseTable from '~/components/BaseTable';
import { useSummaryColumns } from './useSummaryColumns';
import { useWaveColumns } from './useWaveColumns';
import type { MetricRow, WaveRow } from './types';
import styles from '../SchedulerCalculator.module.css';

const integerFormatter = new Intl.NumberFormat('en-US', {
	maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat('en-US', {
	maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
	maximumFractionDigits: 1,
});

const formatInteger = (value: number): string =>
	integerFormatter.format(Math.max(value, 0));

const formatDecimal = (value: number): string =>
	decimalFormatter.format(Math.max(value, 0));

const formatPercent = (value: number): string =>
	`${percentFormatter.format(Math.max(value, 0))}%`;

const waveLabels: Record<WaveKey, string> = {
	wave1: 'Wave 1',
	wave2: 'Wave 2',
	wave3: 'Wave 3',
};

const SchedulerResults: React.FC = () => {
	const { summary, mode, formValues } = useSchedulerCalculatorStore();

	const summaryColumns = useSummaryColumns();
	const waveColumns = useWaveColumns();

	const summaryData = useMemo<MetricRow[]>(() => {
		if (!summary) return [];
		return [
			{
				metric: 'Campaign volume',
				value: `${formatInteger(Number(formValues.totalRecords))} records`,
			},
			{
				metric: mode === 'resources' ? 'Agents required' : 'Agents allocated',
				value: `${formatDecimal(summary.totalAgents)} agents`,
				isPrincipal: mode === 'resources',
			},
			{
				metric: mode === 'time' ? 'Days to complete' : 'Days planned',
				value: `${formatDecimal(summary.daysEstimation)} days`,
				isPrincipal: mode === 'time',
			},
			{
				metric: 'Total tries',
				value: `${formatInteger(summary.totalTries)} tries`,
			},
			{
				metric: 'Operational hours',
				value: `${formatDecimal(summary.operationalHours)} hrs`,
			},
			{
				metric: 'Team hours per day',
				value: `${formatDecimal(summary.totalTeamHoursByDay)} hrs`,
			},
		];
	}, [summary, mode, formValues.totalRecords]);

	const waveData = useMemo<WaveRow[]>(() => {
		if (!summary) return [];
		return summary.waves.map((wave) => {
			const waveDistribution = summary.waveDistribution.find(
				(item) => item.wave === wave.wave
			);
			const derivedPercentage = waveDistribution?.derivedPercentage ?? 0;
			const basePercentage =
				SCHEDULER_CALCULATOR_CONFIG.contactabilityByWaves[wave.wave] * 100;

			return {
				wave: waveLabels[wave.wave],
				projected: `${formatPercent(derivedPercentage)} (base: ${formatPercent(basePercentage)})`,
				progressValue: Math.min(Math.max(derivedPercentage, 0), 100),
				totalContacted: formatInteger(wave.totalContacted),
				effectiveContact: formatInteger(wave.totalEffectiveContact),
				noEffectiveContact: formatInteger(wave.totalNoEffectiveContact),
				noContact: formatInteger(wave.totalNoContact),
				triesOverNoContact: formatInteger(wave.triesOverNoContact),
				totalTime: `${formatInteger(wave.totalTime)} min`,
			};
		});
	}, [summary]);

	return (
		<section className={styles.summarySection}>
			{summary ? (
				<div className={styles.summaryCard}>
					<div className={styles.summaryHeader}>
						<div className={styles.summaryHeaderContent}>
							<Text className={styles.sectionTitle}>Projection summary</Text>
							<Text className={styles.sectionHint}>
								Compare campaign volume, effort, and daily capacity at a glance.
							</Text>
						</div>
						<Badge size='sm' className={styles.modeBadge}>
							{mode === 'resources'
								? 'Resource projection'
								: 'Timeline projection'}
						</Badge>
					</div>

					<div style={{ marginBottom: '12px' }}>
						<BaseTable<MetricRow>
							data={summaryData}
							columns={summaryColumns}
							density='compact'
						/>
					</div>

					<div style={{ marginBottom: '12px' }}>
						<Text size='xs' fw={600} c='gray.7' mb={6}>
							WAVE BREAKDOWN
						</Text>
						<BaseTable<WaveRow>
							data={waveData}
							columns={waveColumns}
							density='compact'
						/>
					</div>

					<div className={styles.assumptions}>
						<Text className={styles.assumptionsLabel}>Model assumptions</Text>
						<Text className={styles.assumptionsText}>
							{formatDecimal(SCHEDULER_CALCULATOR_CONFIG.totalPhonesByAgent)}{' '}
							phones per record ·{' '}
							{formatDecimal(SCHEDULER_CALCULATOR_CONFIG.hoursByDay)} hours per
							agent day ·{' '}
							{formatDecimal(SCHEDULER_CALCULATOR_CONFIG.minutesMan)} minutes
							per contact attempt.
						</Text>
					</div>
				</div>
			) : (
				<div className={styles.placeholder}>
					<Text className={styles.placeholderTitle}>
						Ready to run a projection
					</Text>
					<Text className={styles.placeholderText}>
						Enter the campaign inputs above and select "Calculate projection" to
						review staffing and time estimates.
					</Text>
				</div>
			)}
		</section>
	);
};
export default SchedulerResults;
