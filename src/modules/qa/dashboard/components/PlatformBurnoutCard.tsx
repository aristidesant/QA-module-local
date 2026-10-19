import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Divider, Group, Progress, Stack, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { SEGMENT_COLORS } from '~/modules/qa/analytics/constants';
import { BurnoutRiskLevel } from '../types/burnoutRisk';
import type {
	PlatformBurnoutSummary,
	TeamSeriesPoint,
} from '../operationManagerMetrics';

interface PlatformBurnoutCardProps {
	summary: PlatformBurnoutSummary;
	data: TeamSeriesPoint[];
	teams: string[];
}

/** Exceptions only: LOW reads as neutral, MEDIUM / HIGH keep the design-system status hues. */
const LEVEL_COLOR: Record<BurnoutRiskLevel, string> = {
	[BurnoutRiskLevel.LOW]: 'gray',
	[BurnoutRiskLevel.MEDIUM]: 'amber',
	[BurnoutRiskLevel.HIGH]: 'danger',
};

/** Segment colors of the distribution bar, low to high. */
const SEGMENT_TONE: Record<BurnoutRiskLevel, string> = {
	[BurnoutRiskLevel.LOW]: 'gray.4',
	[BurnoutRiskLevel.MEDIUM]: 'amber',
	[BurnoutRiskLevel.HIGH]: 'danger',
};

const LEVELS = [
	BurnoutRiskLevel.LOW,
	BurnoutRiskLevel.MEDIUM,
	BurnoutRiskLevel.HIGH,
];

/** Platform burnout read: headline level, agent distribution and one line per team. */
export const PlatformBurnoutCard: React.FC<PlatformBurnoutCardProps> = ({
	summary,
	data,
	teams,
}) => {
	const { t } = useTranslation('qa.dashboard');
	const { level, counts, total, atRisk } = summary;

	return (
		<Stack gap='md'>
			<Group gap='sm' wrap='nowrap'>
				<Badge size='lg' variant='light' color={LEVEL_COLOR[level]}>
					{t(`burnout.level.${level}`)}
				</Badge>
				<Text size='sm'>
					{t('operationManager.burnout.atRisk', {
						atRisk,
						total,
						high: counts[BurnoutRiskLevel.HIGH],
					})}
				</Text>
			</Group>

			<Progress.Root size='sm'>
				{LEVELS.filter((l) => counts[l] > 0).map((l) => (
					<Progress.Section
						key={l}
						value={total === 0 ? 0 : (counts[l] / total) * 100}
						color={SEGMENT_TONE[l]}
						aria-label={`${t(`burnout.level.${l}`)} ${counts[l]}`}
					/>
				))}
			</Progress.Root>

			<Divider />

			<Text size='xs' c='dimmed'>
				{t('operationManager.burnout.chartCaption')}
			</Text>
			{data.length < 2 ? (
				<Text size='sm' c='dimmed'>
					{t('operationManager.teams.needLongerPeriod')}
				</Text>
			) : (
				<LineChart
					h={200}
					data={data}
					dataKey='label'
					series={teams.map((team, index) => ({
						name: team,
						label: team,
						color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
					}))}
					curveType='monotone'
					withDots
					withLegend
					strokeWidth={2}
					unit='%'
					yAxisProps={{ domain: [0, 100] }}
				/>
			)}
		</Stack>
	);
};

export default PlatformBurnoutCard;
