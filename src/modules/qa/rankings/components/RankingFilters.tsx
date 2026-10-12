import { Button, Chip, Group, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { RankingStatus } from '~/models/qa/rankingPrograms';
import type { TeamRole } from '~/modules/qa/team/types';
import {
	RANKING_PERIODS,
	RANKING_STATUS_ORDER,
	TEAMS,
	type RankingPeriod,
} from '../constants';
import type { RankingFilters as RankingFiltersState } from '../helpers';
import {
	DEFAULT_RANKING_FILTERS,
	isDefaultRankingFilters,
} from '../hooks/useRankingFilters';
import { RANKING_METRIC_AREAS, type RankingMetricArea } from '../metrics';

interface RankingFiltersProps {
	role: TeamRole;
	value: RankingFiltersState;
	onChange: (value: RankingFiltersState) => void;
	/** How many rankings each status would show with the other filters applied. */
	counts: Record<RankingStatus, number>;
}

/** Search, status chips with counts, metric area, period and (for the QA manager) team. */
export function RankingFilters({
	role,
	value,
	onChange,
	counts,
}: RankingFiltersProps) {
	const { t } = useTranslation('qa.rankings');

	return (
		<Group gap='sm' wrap='wrap' align='center'>
			<TextInput
				size='sm'
				w={240}
				aria-label={t('filters.search')}
				placeholder={t('filters.search')}
				leftSection={<IconSearch size={16} />}
				value={value.q}
				onChange={(e) => onChange({ ...value, q: e.currentTarget.value })}
			/>
			<Chip.Group
				multiple
				value={value.status}
				onChange={(status) =>
					onChange({ ...value, status: status as RankingStatus[] })
				}
			>
				<Group gap={6} wrap='wrap' aria-label={t('filters.status')}>
					{RANKING_STATUS_ORDER.map((status) => (
						<Chip key={status} value={status} size='sm' variant='light'>
							{t(`status.${status}`)} · {counts[status]}
						</Chip>
					))}
				</Group>
			</Chip.Group>
			<Select
				size='sm'
				w={190}
				placeholder={t('filters.area')}
				data={RANKING_METRIC_AREAS.map((area) => ({
					value: area,
					label: t(`areas.${area}`),
				}))}
				value={value.area}
				onChange={(area) =>
					onChange({ ...value, area: (area as RankingMetricArea) ?? null })
				}
				clearable
			/>
			<Select
				size='sm'
				w={150}
				placeholder={t('filters.period')}
				data={RANKING_PERIODS.map((period) => ({
					value: period,
					label: t(`filters.periods.${period}`),
				}))}
				value={value.period}
				onChange={(period) =>
					onChange({ ...value, period: (period as RankingPeriod) ?? null })
				}
				clearable
			/>
			{role === 'qa-manager' && (
				<Select
					size='sm'
					w={140}
					placeholder={t('filters.team')}
					data={TEAMS}
					value={value.team}
					onChange={(team) => onChange({ ...value, team })}
					clearable
				/>
			)}
			{!isDefaultRankingFilters(value) && (
				<Button
					variant='subtle'
					size='xs'
					onClick={() => onChange(DEFAULT_RANKING_FILTERS)}
				>
					{t('filters.clear')}
				</Button>
			)}
		</Group>
	);
}

export default RankingFilters;
