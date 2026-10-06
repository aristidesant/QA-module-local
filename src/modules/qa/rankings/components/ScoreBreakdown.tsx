import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Stack, Text } from '@mantine/core';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { formatRankingValue } from '../metrics';
import { useMetricLabel } from '../useMetricLabel';

interface ScoreBreakdownProps {
	program: RankingProgram;
	standing: RankingStanding;
}

/** How a combined score is built: each metric's value, its weight and the points it adds. */
export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
	program,
	standing,
}) => {
	const { t } = useTranslation('qa.rankings');
	const label = useMetricLabel();

	return (
		<Stack gap={4}>
			{standing.breakdown.map((row) => {
				const weight =
					program.metrics.find((m) => m.metricId === row.metricId)?.weight ?? 0;
				return (
					<Group
						key={row.metricId}
						justify='space-between'
						wrap='nowrap'
						gap='md'
					>
						<Text size='xs'>
							{label(row.metricId)} · {weight}%
						</Text>
						<Text size='xs' fw={600}>
							{row.value === null
								? '—'
								: formatRankingValue(row.metricId, row.value)}
							{row.weighted === null
								? ''
								: ` → ${t('score.pointsAdded', { value: row.weighted })}`}
						</Text>
					</Group>
				);
			})}
		</Stack>
	);
};

export default ScoreBreakdown;
