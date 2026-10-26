import { Stack, Text } from '@mantine/core';
import { Sparkline } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { LmsArea } from '~/models/qa';
import { TrendDelta } from '~/modules/qa/team/components/TrendDelta';
import {
	alertScoreColor,
	dimensionPercent,
	formatDimensionScore,
} from '~/modules/qa/team/helpers';
import type { AgentProfile } from '~/modules/qa/team/types';
import { LMS_AREA_META } from '../constants';
import { areaDimension, areaSeries } from '../helpers';
import { AreaMark } from './AreaMark';
import areaClasses from './area.module.css';
import classes from './AreaScoreTile.module.css';

interface AreaScoreTileProps {
	area: LmsArea;
	profile: AgentProfile | undefined;
	/** Ledger version: area label on top, smaller figure. */
	compact?: boolean;
	/** Compact only: set false when the area is already named in the neighbouring cell. */
	showLabel?: boolean;
}

/** The agent's current score for one evaluation area: figure, 12-month sparkline and change. */
export function AreaScoreTile({
	area,
	profile,
	compact = false,
	showLabel = true,
}: AreaScoreTileProps) {
	const { t } = useTranslation('qa.lms');
	const dimension = areaDimension(area, profile);
	const series = areaSeries(area, profile);
	const alert = dimension
		? alertScoreColor(dimensionPercent(dimension))
		: undefined;

	return (
		<div
			className={`${areaClasses.area} ${classes.tile} ${compact ? classes.compact : ''}`}
			data-area={area}
		>
			{compact ? (
				showLabel && <AreaMark area={area} size='sm' />
			) : (
				<Text size='xs' c='dimmed'>
					{t('agent.nextUp.yourScore', {
						area: t(LMS_AREA_META[area].labelKey),
					})}
				</Text>
			)}
			{dimension ? (
				<Stack gap={2}>
					<Text fw={700} size={compact ? 'xl' : '28px'} lh={1.1} c={alert}>
						{formatDimensionScore(dimension)}
					</Text>
					{series.length > 1 && (
						<Sparkline
							h={compact ? 20 : 28}
							data={series}
							color='var(--lms-area)'
							fillOpacity={0.1}
							strokeWidth={1.5}
							curveType='monotone'
						/>
					)}
					<TrendDelta
						delta={dimension.delta}
						trend={dimension.trend}
						unit={dimension.key === 'sentiment' ? '/5' : '%'}
						suffix={t('agent.areas.vsPrevious')}
					/>
				</Stack>
			) : (
				<Text size='sm' c='dimmed'>
					{t('agent.nextUp.notScored')}
				</Text>
			)}
		</div>
	);
}
