import { ActionIcon, Group, Stack, Text, Tooltip } from '@mantine/core';
import { Sparkline } from '@mantine/charts';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Caption } from '~/modules/qa/coaching/components/SessionBrief';
import { weakestDimension } from '~/modules/qa/coaching/helpers';
import type { AgentProfile, DimensionScore } from '../types';
import { DIMENSION_META, DIMENSION_ORDER } from '../constants';
import {
	alertScoreColor,
	dimensionPercent,
	formatDimensionScore,
	trendDelta,
} from '../helpers';
import { ScoreRing } from '../components/ScoreRing';
import { TrendDelta } from '../components/TrendDelta';
import styles from './ScorecardStrip.module.css';

interface DimensionTileProps {
	dimension: DimensionScore;
	series: number[];
	showEvaluations: boolean;
}

function DimensionTile({
	dimension,
	series,
	showEvaluations,
}: DimensionTileProps) {
	const { t } = useTranslation('qa.team');
	const meta = DIMENSION_META[dimension.key];
	const Icon = meta.icon;
	const alert = alertScoreColor(dimensionPercent(dimension));
	return (
		<div className={styles.tile}>
			<Group gap={6} wrap='nowrap'>
				<Icon size={14} color='var(--mantine-color-dimmed)' aria-hidden />
				<Caption>{t(meta.labelKey)}</Caption>
			</Group>
			<Text fw={700} size='xl' lh={1.1} c={alert}>
				{formatDimensionScore(dimension)}
			</Text>
			<Sparkline
				h={24}
				data={series}
				color={alert ? `${alert}.6` : 'gray.6'}
				fillOpacity={0.12}
				strokeWidth={1.5}
				curveType='monotone'
			/>
			<TrendDelta
				delta={dimension.delta}
				trend={dimension.trend}
				unit={dimension.key === 'sentiment' ? '/5' : '%'}
				suffix={t('common.vsPrevious')}
			/>
			{showEvaluations && (
				<Text size='xs' c='dimmed'>
					{t('header.scorecard.evaluations', { count: dimension.evaluations })}
				</Text>
			)}
		</div>
	);
}

interface ScorecardStripProps {
	profile: AgentProfile;
}

/** Overall score on the left, the four dimensions beside it, and one line saying which is lowest. */
export function ScorecardStrip({ profile }: ScorecardStripProps) {
	const { t } = useTranslation('qa.team');
	const { overall, dimensions } = profile;
	const last12 = profile.performance.slice(-12);

	// The most common evaluation count is stated once; a tile repeats it only when it differs.
	const counts = dimensions.map((d) => d.evaluations);
	const base = [...counts].sort(
		(a, b) =>
			counts.filter((c) => c === b).length -
			counts.filter((c) => c === a).length
	)[0];

	const weakest = weakestDimension(profile);
	const weights = t('header.weights', {
		qa: overall.weights.qa,
		sentiment: overall.weights.sentiment,
		compliance: overall.weights.compliance,
		business: overall.weights.business,
	});

	return (
		<Stack gap='sm'>
			<div className={styles.strip}>
				<Group gap='md' wrap='nowrap' className={styles.overall}>
					<ScoreRing
						value={overall.score}
						size={88}
						thickness={9}
						color={alertScoreColor(overall.score) ?? 'gray.6'}
					/>
					<Stack gap={4}>
						<Caption>{t('header.overall')}</Caption>
						<Group gap={4} wrap='nowrap'>
							<Tooltip
								label={t('header.scorecard.percentileHint', {
									value: overall.percentile,
								})}
							>
								<Text fw={700} size='lg'>
									{t('header.rank', {
										rank: overall.rankInTeam,
										size: overall.teamSize,
									})}
								</Text>
							</Tooltip>
							<Tooltip label={weights} multiline maw={260}>
								<ActionIcon
									variant='transparent'
									color='gray'
									size='xs'
									aria-label={weights}
								>
									<IconInfoCircle size={14} />
								</ActionIcon>
							</Tooltip>
						</Group>
						<TrendDelta
							delta={overall.delta}
							trend={overall.trend}
							unit=''
							suffix={t('header.vsPrevious')}
						/>
					</Stack>
				</Group>

				<div className={styles.tiles}>
					{DIMENSION_ORDER.map((key) => {
						const dimension = dimensions.find((d) => d.key === key);
						if (!dimension) return null;
						return (
							<DimensionTile
								key={key}
								dimension={dimension}
								series={last12.map((p) => p[key])}
								showEvaluations={dimension.evaluations !== base}
							/>
						);
					})}
				</div>
			</div>

			<Group justify='space-between' gap='sm' wrap='wrap'>
				{weakest && (
					<Text size='sm'>
						{t('header.verdict', {
							dimension: t(DIMENSION_META[weakest.key].labelKey),
							value: formatDimensionScore(weakest),
							delta: trendDelta(
								weakest.delta,
								weakest.key === 'sentiment' ? '/5' : '%'
							),
						})}
					</Text>
				)}
				<Text size='xs' c='dimmed'>
					{t('header.scorecard.basedOn', { count: base })}
				</Text>
			</Group>
		</Stack>
	);
}
