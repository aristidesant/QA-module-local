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
import { useTranslation } from 'react-i18next';

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

const getWaveLabels = (t: any) => ({
	wave1: t('scheduler.calculator.results.waves.wave1'),
	wave2: t('scheduler.calculator.results.waves.wave2'),
	wave3: t('scheduler.calculator.results.waves.wave3'),
});

const SchedulerResults: React.FC = () => {
	const { t } = useTranslation(['campaign.form.params', 'common']);
	const { summary, mode, formValues } = useSchedulerCalculatorStore();

	const summaryColumns = useSummaryColumns();
	const waveColumns = useWaveColumns();

	const summaryData = useMemo<MetricRow[]>(() => {
		if (!summary) return [];
		return [
			{
				metric: t('scheduler.calculator.results.metrics.volume'),
				value: `${formatInteger(Number(formValues.totalRecords))} records`,
			},
			{
				metric:
					mode === 'resources'
						? t('scheduler.calculator.results.metrics.agentsRequired')
						: t('scheduler.calculator.results.metrics.agentsAllocated'),
				value: `${formatDecimal(summary.totalAgents)} agents`,
				isPrincipal: mode === 'resources',
			},
			{
				metric:
					mode === 'time'
						? t('scheduler.calculator.results.metrics.daysToComplete')
						: t('scheduler.calculator.results.metrics.daysPlanned'),
				value: `${formatDecimal(summary.daysEstimation)} days`,
				isPrincipal: mode === 'time',
			},
			{
				metric: t('scheduler.calculator.results.metrics.totalTries'),
				value: `${formatInteger(summary.totalTries)} tries`,
			},
			{
				metric: t('scheduler.calculator.results.metrics.operationalHours'),
				value: `${formatDecimal(summary.operationalHours)} hrs`,
			},
			{
				metric: t('scheduler.calculator.results.metrics.teamHoursPerDay'),
				value: `${formatDecimal(summary.totalTeamHoursByDay)} hrs`,
			},
		];
	}, [summary, mode, formValues.totalRecords, t]);

	const waveData = useMemo<WaveRow[]>(() => {
		if (!summary) return [];
		return summary.waves.map((wave) => {
			const waveDistribution = summary.waveDistribution.find(
				(item) => item.wave === wave.wave
			);
			const derivedPercentage = waveDistribution?.derivedPercentage ?? 0;
			const basePercentage =
				SCHEDULER_CALCULATOR_CONFIG.contactabilityByWaves[wave.wave] * 100;
			const labels = getWaveLabels(t);

			return {
				wave: labels[wave.wave as WaveKey],
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
	}, [summary, t]);

	return (
		<section className={styles.summarySection}>
			{summary ? (
				<div className={styles.summaryCard}>
					<div className={styles.summaryHeader}>
						<div className={styles.summaryHeaderContent}>
							<Text className={styles.sectionTitle}>
								{t('scheduler.calculator.results.title')}
							</Text>
							<Text className={styles.sectionHint}>
								{t('scheduler.calculator.results.hint')}
							</Text>
						</div>
						<Badge size='sm' className={styles.modeBadge}>
							{mode === 'resources'
								? t('scheduler.calculator.results.badge.resource')
								: t('scheduler.calculator.results.badge.timeline')}
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
							{t('scheduler.calculator.results.waveBreakdown')}
						</Text>
						<BaseTable<WaveRow>
							data={waveData}
							columns={waveColumns}
							density='compact'
						/>
					</div>

					<div className={styles.assumptions}>
						<Text className={styles.assumptionsLabel}>
							{t('scheduler.calculator.results.assumptions.title')}
						</Text>
						<Text className={styles.assumptionsText}>
							{t('scheduler.calculator.results.assumptions.text', {
								phones: formatDecimal(
									SCHEDULER_CALCULATOR_CONFIG.totalPhonesByAgent
								),
								hours: formatDecimal(SCHEDULER_CALCULATOR_CONFIG.hoursByDay),
								minutesMan: formatDecimal(
									SCHEDULER_CALCULATOR_CONFIG.minutesMan
								),
							})}
						</Text>
					</div>
				</div>
			) : (
				<div className={styles.placeholder}>
					<Text className={styles.placeholderTitle}>
						{t('scheduler.calculator.results.placeholder.title')}
					</Text>
					<Text className={styles.placeholderText}>
						{t('scheduler.calculator.results.placeholder.text')}
					</Text>
				</div>
			)}
		</section>
	);
};
export default SchedulerResults;
