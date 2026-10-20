import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Button,
	Group,
	MultiSelect,
	NumberInput,
	SegmentedControl,
	Select,
	Stack,
	Switch,
	Text,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { AppDrawer } from '~/components/AppDrawer';
import SectionCard from '~/components/SectionCard';
import { LINES_OF_BUSINESS } from '~/modules/qa/triggers/constants';
import { TEAM_CAMPAIGNS, TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import {
	useTeamAnalyticsStore,
	selectFilters,
} from '~/stores/qa/teamAnalyticsStore';
import {
	DEFAULT_FILTERS,
	DIRECTIONS,
	EMOTIONS,
	QUICK_RANGES,
	QUICK_RANGE_DAYS,
	SHIFTS,
	TENURE_BANDS,
	TIME_SLOTS,
	TODAY,
	VIEW_METRICS,
	WEEKDAYS,
	addDays,
} from '../constants';
import type {
	CampaignType,
	Granularity,
	QuickRange,
	TeamAnalyticsFilters,
} from '../types';
import { autoGranularity } from '../helpers';
import { useTeamAnalyticsData } from './TeamAnalyticsContext';
import styles from './TeamAnalyticsPage.module.css';

interface FilterDrawerProps {
	open: boolean;
	onClose: () => void;
}

const AGENT_TYPES = ['HUMAN', 'AI_BOT'] as const;
const GRANULARITIES: Granularity[] = ['per-call', 'daily', 'weekly', 'monthly'];
const CAMPAIGN_TYPES: CampaignType[] = ['INBOUND', 'OUTBOUND', 'BLENDED'];
const STATUSES = ['active', 'inactive'] as const;
const SCORE_METRICS = Object.values(VIEW_METRICS).flat();

const day = (value: string | Date | null) =>
	value ? dayjs(value).format('YYYY-MM-DD') : null;

/**
 * Every Team Analytics filter, edited as a draft and applied together so the
 * tables and charts only recompute once. Chips in the filter bar clear them one by one.
 */
export default function FilterDrawer({ open, onClose }: FilterDrawerProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const { role, scopedAgents } = useTeamAnalyticsData();
	const filters = useTeamAnalyticsStore(selectFilters);
	const commitFilters = useTeamAnalyticsStore((s) => s.commitFilters);

	const [draft, setDraft] = useState<TeamAnalyticsFilters>(filters);
	useEffect(() => {
		if (open) setDraft(filters);
		// Re-seed only when the drawer opens; later store changes must not wipe unsaved edits.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const patch = (values: Partial<TeamAnalyticsFilters>) =>
		setDraft((current) => ({ ...current, ...values }));

	const isManager = role === 'qa-manager';
	const options = useMemo(
		() => ({
			supervisors: TEAM_SUPERVISORS.map((s) => ({
				value: s.id,
				label: `${s.name} · ${s.team}`,
			})),
			agents: scopedAgents.map((a) => ({ value: a.id, label: a.name })),
			campaigns: TEAM_CAMPAIGNS.map((c) => ({ value: c.id, label: c.name })),
			lines: LINES_OF_BUSINESS.map((l) => ({ value: l, label: l })),
		}),
		[scopedAgents]
	);
	const labelled = <T extends string | number>(values: T[], ns: string) =>
		values.map((value) => ({
			value: String(value),
			label: t(`${ns}.${value}`),
		}));

	const rangeError =
		draft.quickRange === 'custom' && draft.to < draft.from
			? t('filters.validation.range')
			: null;
	const scoreError =
		draft.scoreRange.metricId &&
		draft.scoreRange.min !== null &&
		draft.scoreRange.max !== null &&
		draft.scoreRange.max <= draft.scoreRange.min
			? t('filters.validation.scoreRange')
			: null;

	const setQuickRange = (value: string) => {
		if (value === 'custom') {
			patch({ quickRange: 'custom' });
			return;
		}
		const range = value as Exclude<QuickRange, 'custom'>;
		const from = addDays(TODAY, -(QUICK_RANGE_DAYS[range] - 1));
		patch({
			quickRange: range,
			from,
			to: TODAY,
			granularity: autoGranularity(from, TODAY),
		});
	};

	const apply = () => {
		if (rangeError || scoreError) return;
		commitFilters(draft);
		onClose();
	};

	return (
		<AppDrawer
			opened={open}
			onClose={onClose}
			size='lg'
			title={t('filters.title')}
		>
			<Stack gap='lg'>
				<SectionCard title={t('filters.chips.period')}>
					<Stack gap='sm'>
						<SegmentedControl
							fullWidth
							value={draft.quickRange}
							onChange={setQuickRange}
							data={[...QUICK_RANGES, 'custom'].map((value) => ({
								value,
								label: t(`filters.quickRange.${value}`),
							}))}
						/>
						{draft.quickRange === 'custom' && (
							<Group grow align='flex-start'>
								<DateInput
									label={t('filters.from')}
									value={draft.from}
									maxDate={TODAY}
									valueFormat='DD MMM YYYY'
									onChange={(value) => {
										const next = day(value);
										if (next) patch({ from: next });
									}}
									popoverProps={{ withinPortal: true }}
								/>
								<DateInput
									label={t('filters.to')}
									value={draft.to}
									maxDate={TODAY}
									valueFormat='DD MMM YYYY'
									error={rangeError}
									onChange={(value) => {
										const next = day(value);
										if (next) patch({ to: next });
									}}
									popoverProps={{ withinPortal: true }}
								/>
							</Group>
						)}
						<Select
							label={t('filters.granularity')}
							data={GRANULARITIES.map((value) => ({
								value,
								label: t(`filters.granularityOptions.${value}`),
							}))}
							value={draft.granularity}
							onChange={(value) =>
								value && patch({ granularity: value as Granularity })
							}
							allowDeselect={false}
							comboboxProps={{ withinPortal: true }}
						/>
					</Stack>
				</SectionCard>

				<SectionCard title={t('filters.sections.scope')}>
					<Stack gap='sm'>
						{isManager && (
							<MultiSelect
								label={t('filters.supervisors')}
								placeholder={t('filters.all')}
								data={options.supervisors}
								value={draft.supervisorIds}
								onChange={(supervisorIds) => patch({ supervisorIds })}
								searchable
								clearable
								comboboxProps={{ withinPortal: true }}
							/>
						)}
						<MultiSelect
							label={t('filters.agents')}
							placeholder={t('filters.all')}
							data={options.agents}
							value={draft.agentIds}
							onChange={(agentIds) => patch({ agentIds })}
							searchable
							clearable
							comboboxProps={{ withinPortal: true }}
						/>
						<MultiSelect
							label={t('filters.campaigns')}
							placeholder={t('filters.all')}
							data={options.campaigns}
							value={draft.campaignIds}
							onChange={(campaignIds) => patch({ campaignIds })}
							clearable
							comboboxProps={{ withinPortal: true }}
						/>
						<MultiSelect
							label={t('filters.linesOfBusiness')}
							placeholder={t('filters.all')}
							data={options.lines}
							value={draft.linesOfBusiness}
							onChange={(linesOfBusiness) => patch({ linesOfBusiness })}
							clearable
							comboboxProps={{ withinPortal: true }}
						/>
						<MultiSelect
							label={t('filters.agentTypes')}
							placeholder={t('filters.all')}
							data={labelled([...AGENT_TYPES], 'filters.agentTypeLabels')}
							value={draft.agentTypes}
							onChange={(agentTypes) =>
								patch({ agentTypes: agentTypes as typeof draft.agentTypes })
							}
							clearable
							comboboxProps={{ withinPortal: true }}
						/>
						<MultiSelect
							label={t('filters.statuses')}
							placeholder={t('filters.all')}
							data={labelled([...STATUSES], 'filters.statusLabels')}
							value={draft.statuses}
							onChange={(statuses) =>
								patch({ statuses: statuses as typeof draft.statuses })
							}
							clearable
							comboboxProps={{ withinPortal: true }}
						/>
					</Stack>
				</SectionCard>

				<SectionCard title={t('filters.sections.calls')}>
					<Stack gap='sm'>
						<MultiSelect
							label={t('filters.campaignTypes')}
							placeholder={t('filters.all')}
							data={labelled(CAMPAIGN_TYPES, 'filters.campaignTypeLabels')}
							value={draft.campaignTypes}
							onChange={(campaignTypes) =>
								patch({ campaignTypes: campaignTypes as CampaignType[] })
							}
							clearable
							comboboxProps={{ withinPortal: true }}
						/>
						<MultiSelect
							label={t('filters.directions')}
							placeholder={t('filters.all')}
							data={labelled(DIRECTIONS, 'filters.directionLabels')}
							value={draft.directions}
							onChange={(directions) =>
								patch({
									directions: directions as typeof draft.directions,
								})
							}
							clearable
							comboboxProps={{ withinPortal: true }}
						/>
						<MultiSelect
							label={t('filters.shifts')}
							placeholder={t('filters.all')}
							data={labelled(SHIFTS, 'filters.shiftLabels')}
							value={draft.shifts}
							onChange={(shifts) =>
								patch({ shifts: shifts as typeof draft.shifts })
							}
							clearable
							comboboxProps={{ withinPortal: true }}
						/>
						<MultiSelect
							label={t('filters.tenureBands')}
							placeholder={t('filters.all')}
							data={labelled(TENURE_BANDS, 'filters.tenureLabels')}
							value={draft.tenureBands}
							onChange={(tenureBands) =>
								patch({ tenureBands: tenureBands as typeof draft.tenureBands })
							}
							clearable
							comboboxProps={{ withinPortal: true }}
						/>
						<MultiSelect
							label={t('filters.timeSlots')}
							placeholder={t('filters.all')}
							data={TIME_SLOTS.map((slot) => ({ value: slot, label: slot }))}
							value={draft.timeSlots}
							onChange={(timeSlots) =>
								patch({ timeSlots: timeSlots as typeof draft.timeSlots })
							}
							clearable
							comboboxProps={{ withinPortal: true }}
						/>
						<MultiSelect
							label={t('filters.weekdays')}
							placeholder={t('filters.all')}
							data={labelled(
								WEEKDAYS.map((w) => w.value),
								'filters.weekdayLabels'
							)}
							value={draft.weekdays.map(String)}
							onChange={(weekdays) => patch({ weekdays: weekdays.map(Number) })}
							clearable
							comboboxProps={{ withinPortal: true }}
						/>
						<MultiSelect
							label={t('filters.emotions')}
							placeholder={t('filters.all')}
							data={labelled(EMOTIONS, 'filters.emotionLabels')}
							value={draft.emotions}
							onChange={(emotions) =>
								patch({ emotions: emotions as typeof draft.emotions })
							}
							clearable
							comboboxProps={{ withinPortal: true }}
						/>
					</Stack>
				</SectionCard>

				<SectionCard title={t('filters.sections.evaluation')}>
					<Stack gap='sm'>
						<Switch
							label={t('filters.flags.autoFailOnly')}
							checked={draft.autoFailOnly}
							onChange={(e) => patch({ autoFailOnly: e.currentTarget.checked })}
						/>
						<Switch
							label={t('filters.flags.recoveredOnly')}
							checked={draft.recoveredOnly}
							onChange={(e) =>
								patch({ recoveredOnly: e.currentTarget.checked })
							}
						/>
						<Switch
							label={t('filters.flags.offeredOnly')}
							checked={draft.offeredOnly}
							onChange={(e) => patch({ offeredOnly: e.currentTarget.checked })}
						/>
						<Switch
							label={t('filters.flags.convertedOnly')}
							checked={draft.convertedOnly}
							onChange={(e) =>
								patch({ convertedOnly: e.currentTarget.checked })
							}
						/>

						<Text size='sm' fw={500} mt='xs'>
							{t('filters.scoreRange.label')}
						</Text>
						<Select
							aria-label={t('filters.scoreRange.metric')}
							placeholder={t('filters.scoreRange.any')}
							data={SCORE_METRICS.map((id) => ({
								value: id,
								label: t(`metrics.${id}`),
							}))}
							value={draft.scoreRange.metricId}
							onChange={(value) =>
								patch({
									scoreRange: value
										? {
												...draft.scoreRange,
												metricId: value as typeof draft.scoreRange.metricId,
											}
										: DEFAULT_FILTERS.scoreRange,
								})
							}
							clearable
							searchable
							comboboxProps={{ withinPortal: true }}
						/>
						{draft.scoreRange.metricId && (
							<Group grow align='flex-start'>
								<NumberInput
									label={t('filters.scoreRange.min')}
									value={draft.scoreRange.min ?? ''}
									onChange={(value) =>
										patch({
											scoreRange: {
												...draft.scoreRange,
												min: value === '' ? null : Number(value),
											},
										})
									}
									decimalScale={1}
								/>
								<NumberInput
									label={t('filters.scoreRange.max')}
									value={draft.scoreRange.max ?? ''}
									error={scoreError}
									onChange={(value) =>
										patch({
											scoreRange: {
												...draft.scoreRange,
												max: value === '' ? null : Number(value),
											},
										})
									}
									decimalScale={1}
								/>
							</Group>
						)}

						<NumberInput
							label={t('filters.minCalls')}
							value={draft.minCalls}
							onChange={(value) => patch({ minCalls: Number(value) || 0 })}
							min={0}
							allowDecimal={false}
						/>
					</Stack>
				</SectionCard>

				<div className={styles.drawerFooter}>
					<Group justify='space-between'>
						<Button variant='subtle' onClick={() => setDraft(DEFAULT_FILTERS)}>
							{t('filters.reset')}
						</Button>
						<Group gap='sm'>
							<Button variant='default' onClick={onClose}>
								{t('common.cancel')}
							</Button>
							<Button onClick={apply} disabled={!!rangeError || !!scoreError}>
								{t('filters.apply')}
							</Button>
						</Group>
					</Group>
				</div>
			</Stack>
		</AppDrawer>
	);
}
