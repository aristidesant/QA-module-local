import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Group,
	Button,
	Badge,
	CloseButton,
	Switch,
	Tooltip,
} from '@mantine/core';
import { IconAdjustments, IconX } from '@tabler/icons-react';
import type { SentimentCauseSegmentKey } from '~/modules/qa/sentimentCauses/types';
import { isStrengthKey } from '~/modules/qa/surveys/constants';
import type { SurveyThemeKey } from '~/modules/qa/surveys/types';
import { useCauseLabel } from '~/modules/qa/sentimentCauses/useCauseSettings';
import { TEAM_CAMPAIGNS, TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import { useTeamAnalyticsStore } from '~/stores/qa/teamAnalyticsStore';
import { filterChips, activeFilterCount } from '../helpers';
import type { FilterChipKey } from '../types';
import { useTeamAnalyticsData } from './TeamAnalyticsContext';
import FilterDrawer from './FilterDrawer';
import styles from './TeamAnalyticsPage.module.css';

/** Chips whose raw values are enum ids with a label list in `filters.*`. */
const VALUE_LABEL_NAMESPACE: Partial<Record<FilterChipKey, string>> = {
	granularity: 'filters.granularityOptions',
	campaignTypes: 'filters.campaignTypeLabels',
	directions: 'filters.directionLabels',
	shifts: 'filters.shiftLabels',
	statuses: 'filters.statusLabels',
	tenureBands: 'filters.tenureLabels',
	weekdays: 'filters.weekdayLabels',
	emotions: 'filters.emotionLabels',
	agentTypes: 'filters.agentTypeLabels',
};

interface FilterBarProps {
	/** The active tab ignores filters (Burnout), so the bar is shown dimmed and inert. */
	disabled?: boolean;
}

export default function FilterBar({ disabled = false }: FilterBarProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const causeLabel = useCauseLabel();
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const { filters, resetFilters, commitFilters, setFilters } =
		useTeamAnalyticsStore();
	const { scopedAgents, compareAvailable } = useTeamAnalyticsData();

	const chips = filterChips(filters);
	const activeCount = activeFilterCount(filters);

	const chipLabels: Record<string, string> = {
		period: t('filters.chips.period'),
		granularity: t('filters.granularity'),
		supervisorIds: t('filters.supervisors'),
		agentIds: t('filters.agents'),
		campaignIds: t('filters.campaigns'),
		linesOfBusiness: t('filters.linesOfBusiness'),
		campaignTypes: t('filters.campaignTypes'),
		directions: t('filters.directions'),
		shifts: t('filters.shifts'),
		statuses: t('filters.statuses'),
		tenureBands: t('filters.tenureBands'),
		timeSlots: t('filters.timeSlots'),
		weekdays: t('filters.weekdays'),
		emotions: t('filters.emotions'),
		sentimentCauses: t('filters.sentimentCauses'),
		surveyThemes: t('filters.surveyThemes'),
		agentTypes: t('filters.agentTypes'),
		autoFailOnly: t('filters.flags.autoFailOnly'),
		recoveredOnly: t('filters.flags.recoveredOnly'),
		offeredOnly: t('filters.flags.offeredOnly'),
		convertedOnly: t('filters.flags.convertedOnly'),
		scoreRange: t('filters.scoreRange.label'),
		minCalls: t('filters.minCalls'),
	};

	const nameOf = (key: FilterChipKey, value: string): string => {
		switch (key) {
			case 'supervisorIds':
				return TEAM_SUPERVISORS.find((s) => s.id === value)?.name ?? value;
			case 'agentIds':
				return scopedAgents.find((a) => a.id === value)?.name ?? value;
			case 'campaignIds':
				return TEAM_CAMPAIGNS.find((c) => c.id === value)?.name ?? value;
			case 'surveyThemes':
				// A strength has its own label; a root cause is renamable in Settings.
				return isStrengthKey(value as SurveyThemeKey)
					? t(`surveysView.strengths.${value}`)
					: causeLabel(value as SentimentCauseSegmentKey);
			case 'sentimentCauses':
				// Renamable in Settings, so it does not come from a locale prefix.
				return causeLabel(value as SentimentCauseSegmentKey);
			default: {
				const ns = VALUE_LABEL_NAMESPACE[key];
				return ns ? t(`${ns}.${value}`, { defaultValue: value }) : value;
			}
		}
	};

	/** Score range reads "Metric: min – max"; other chips list their first values. */
	const chipText = (key: FilterChipKey, values: string[]): string => {
		if (key === 'scoreRange') {
			const [metricId, min, max] = values;
			const bounds = [min || '…', max || '…'].join(' – ');
			return `${chipLabels.scoreRange}: ${t(`metrics.${metricId}`)} ${bounds}`;
		}
		if (values.length === 0) return chipLabels[key] || key;
		const shown = values.slice(0, 2).map((v) => nameOf(key, v));
		const more =
			values.length > 2
				? ` ${t('filters.chips.more', { count: values.length - 2 })}`
				: '';
		return `${chipLabels[key] || key}: ${shown.join(', ')}${more}`;
	};

	return (
		<>
			<div className={`${styles.filterBar} ${disabled ? styles.dimmed : ''}`}>
				<Group gap='xs' wrap='wrap'>
					<Tooltip label={t('filters.moreFilters')} withArrow>
						<Button
							leftSection={<IconAdjustments size={16} />}
							variant='light'
							size='sm'
							disabled={disabled}
							onClick={() => setFilterDrawerOpen(true)}
						>
							{t('filters.title')}
							{activeCount > 0 && (
								<Badge size='xs' variant='filled' ml='xs'>
									{activeCount}
								</Badge>
							)}
						</Button>
					</Tooltip>

					{chips.length > 0 && (
						<>
							<Group gap={4}>
								{chips.map((chip) => (
									<Badge
										key={chip.key}
										variant='dot'
										size='lg'
										tt='none'
										rightSection={
											<CloseButton
												size='xs'
												variant='transparent'
												disabled={disabled}
												aria-label={t('filters.chips.remove', {
													filter: chipLabels[chip.key] || chip.key,
												})}
												onClick={() => commitFilters(chip.remove(filters))}
											/>
										}
									>
										{chipText(chip.key, chip.values)}
									</Badge>
								))}
							</Group>

							<Tooltip label={t('filters.chips.clearAll')} withArrow>
								<Button
									variant='subtle'
									size='xs'
									disabled={disabled}
									rightSection={<IconX size={14} />}
									onClick={() => resetFilters()}
								>
									{t('filters.chips.clearAll')}
								</Button>
							</Tooltip>
						</>
					)}
					<Tooltip
						label={t('filters.compareUnavailable')}
						withArrow
						disabled={compareAvailable}
					>
						<span>
							<Switch
								size='sm'
								ml='auto'
								label={t('filters.compare')}
								checked={filters.compareWithPrevious && compareAvailable}
								disabled={disabled || !compareAvailable}
								onChange={(event) =>
									setFilters({
										compareWithPrevious: event.currentTarget.checked,
									})
								}
							/>
						</span>
					</Tooltip>
				</Group>
			</div>

			<FilterDrawer
				open={filterDrawerOpen}
				onClose={() => setFilterDrawerOpen(false)}
			/>
		</>
	);
}
