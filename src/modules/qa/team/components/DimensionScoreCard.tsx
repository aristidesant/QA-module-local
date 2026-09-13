import { Group, Paper, Progress, Stack, Text, ThemeIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { DimensionScore } from '../types';
import { DIMENSION_META } from '../constants';
import { TrendDelta } from './TrendDelta';

interface DimensionScoreCardProps {
	dimension: DimensionScore;
}

export function DimensionScoreCard({ dimension }: DimensionScoreCardProps) {
	const { t } = useTranslation('qa.team');
	const meta = DIMENSION_META[dimension.key];
	const Icon = meta.icon;
	const pct = dimension.key === 'sentiment' ? ((dimension.score - 1) / 4) * 100 : dimension.score;

	return (
		<Paper withBorder p='md' radius='md'>
			<Stack gap='xs'>
				<Group justify='space-between'>
					<Text size='sm' c='dimmed'>{t(meta.labelKey)}</Text>
					<ThemeIcon variant='light' color={meta.color} size='sm'>
						<Icon size={14} />
					</ThemeIcon>
				</Group>
				<Text fw={700} size='xl'>
					{dimension.key === 'sentiment' ? dimension.score.toFixed(1) : dimension.score}{meta.unit}
				</Text>
				<Progress value={pct} color={meta.color} size='sm' />
				<TrendDelta
					delta={dimension.delta}
					trend={dimension.trend}
					unit={dimension.key === 'sentiment' ? '/5' : '%'}
					suffix={t('common.vsPrevious')}
				/>
				<Text size='xs' c='dimmed'>{dimension.evaluations} {t('qa.kpi.evaluations')}</Text>
			</Stack>
		</Paper>
	);
}
