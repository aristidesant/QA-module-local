import React, { useMemo } from 'react';
import { Group, Paper, Stack, Text } from '@mantine/core';
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconMinus,
} from '@tabler/icons-react';
import {
	getRankingMetricsComparison,
	type AgentRankingEntry,
	type RankingMetricsSnapshot,
} from '~/modules/qa/dashboard/mockData';
import styles from './MetricsTab.module.css';

type MetricTone = 'green' | 'orange' | 'red';

/** Threshold buckets defined by the rankings spec, one per metric. */
const getQaTone = (value: number): MetricTone =>
	value >= 85 ? 'green' : value >= 70 ? 'orange' : 'red';

const getSentimentTone = (value: number): MetricTone =>
	value >= 4.2 ? 'green' : value >= 3 ? 'orange' : 'red';

const getComplianceTone = (value: number): MetricTone =>
	value >= 90 ? 'green' : value >= 80 ? 'orange' : 'red';

interface MetricRowConfig {
	key: string;
	label: string;
	current: number;
	previous: number;
	tone: MetricTone;
	/** Decimals used when rendering value and delta. */
	precision: number;
	suffix?: string;
	/** Delta unit label, e.g. "%" or "pts". */
	deltaUnit: string;
}

const formatValue = (value: number, precision: number, suffix = ''): string =>
	`${value.toFixed(precision)}${suffix}`;

interface DeltaProps {
	delta: number;
	precision: number;
	unit: string;
}

const Delta: React.FC<DeltaProps> = ({ delta, precision, unit }) => {
	const rounded = Number(delta.toFixed(precision));

	if (rounded === 0) {
		return (
			<Group gap={2} wrap='nowrap' className={styles.deltaFlat}>
				<IconMinus size={14} />
				<Text size='xs' fw={600} inherit>
					0{unit}
				</Text>
			</Group>
		);
	}

	const isUp = rounded > 0;

	return (
		<Group
			gap={2}
			wrap='nowrap'
			className={isUp ? styles.deltaUp : styles.deltaDown}
		>
			{isUp ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
			<Text size='xs' fw={600} inherit>
				{isUp ? '+' : '−'}
				{Math.abs(rounded).toFixed(precision)}
				{unit}
			</Text>
		</Group>
	);
};

interface MetricRowProps {
	config: MetricRowConfig;
}

const MetricRow: React.FC<MetricRowProps> = ({ config }) => (
	<Paper withBorder radius='md' p='sm' className={styles.card}>
		<Stack gap='xs'>
			<Group justify='space-between' wrap='nowrap'>
				<Text size='sm' fw={600}>
					{config.label}
				</Text>
				<Delta
					delta={config.current - config.previous}
					precision={config.precision}
					unit={config.deltaUnit}
				/>
			</Group>

			<div className={styles.columns}>
				<div className={styles.column}>
					<Text
						size='xl'
						fw={700}
						c={config.tone}
						className={styles.currentValue}
					>
						{formatValue(config.current, config.precision, config.suffix)}
					</Text>
				</div>
				<div className={styles.column}>
					<Text size='lg' fw={600} c='dimmed'>
						{formatValue(config.previous, config.precision, config.suffix)}
					</Text>
				</div>
			</div>
		</Stack>
	</Paper>
);

export interface MetricsTabProps {
	entry: AgentRankingEntry;
}

/** QA / sentiment / compliance for the current period against the previous one. */
export const MetricsTab: React.FC<MetricsTabProps> = ({ entry }) => {
	const { current, previous } = useMemo(
		() => getRankingMetricsComparison(entry),
		[entry]
	);

	const rows = useMemo<MetricRowConfig[]>(
		() => buildRows(current, previous),
		[current, previous]
	);

	return (
		<Stack gap='sm'>
			<div className={styles.columns}>
				<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
					{current.period}
				</Text>
				<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
					{previous.period}
				</Text>
			</div>

			{rows.map((config) => (
				<MetricRow key={config.key} config={config} />
			))}

			<Paper withBorder radius='md' p='sm' className={styles.card}>
				<Group justify='space-between' wrap='nowrap'>
					<Text size='sm' fw={600}>
						Calls evaluated
					</Text>
					<Group gap='sm' wrap='nowrap'>
						<Text size='lg' fw={700}>
							{current.callsCount}
						</Text>
						<Text size='sm' c='dimmed'>
							vs. {previous.callsCount}
						</Text>
					</Group>
				</Group>
			</Paper>

			<Text size='xs' c='dimmed' ta='center'>
				Trend sparklines arrive in a later phase.
			</Text>
		</Stack>
	);
};

const buildRows = (
	current: RankingMetricsSnapshot,
	previous: RankingMetricsSnapshot
): MetricRowConfig[] => [
	{
		key: 'qa',
		label: 'QA Score',
		current: current.qaScore,
		previous: previous.qaScore,
		tone: getQaTone(current.qaScore),
		precision: 0,
		suffix: '%',
		deltaUnit: '%',
	},
	{
		key: 'sentiment',
		label: 'Sentiment Score',
		current: current.sentimentScore,
		previous: previous.sentimentScore,
		tone: getSentimentTone(current.sentimentScore),
		precision: 1,
		suffix: ' / 5',
		deltaUnit: '',
	},
	{
		key: 'compliance',
		label: 'Compliance Score',
		current: current.complianceScore,
		previous: previous.complianceScore,
		tone: getComplianceTone(current.complianceScore),
		precision: 0,
		suffix: '%',
		deltaUnit: '%',
	},
];

export default MetricsTab;
