import { useEffect, useMemo, useState } from 'react';
import {
	Badge,
	Button,
	Chip,
	Grid,
	Group,
	Modal,
	MultiSelect,
	Paper,
	Stack,
	Switch,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { managerScopeAgents } from '~/modules/qa/lms/helpers';
import { useCoachingStore, selectRules } from '~/stores/qa/coachingStore';
import { rulesTriggeredByCall } from '../helpers';
import { NOW_ISO } from '~/modules/qa/team/constants';
import { formatSeconds } from '~/modules/qa/team/helpers';
import { TEAM_CAMPAIGNS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { LINES_OF_BUSINESS } from '~/modules/qa/triggers/constants';

const helper = createColumnHelper<TeamCallMetric>();

type DateRange = [string | null, string | null];

/** Weekly, biweekly and monthly look back 7, 14 and 30 days. */
const PERIOD_PRESETS = [
	{ key: 'weekly', days: 7 },
	{ key: 'biweekly', days: 14 },
	{ key: 'monthly', days: 30 },
] as const;
const DEFAULT_PERIOD = 30;

const rangeOfLastDays = (days: number): DateRange => [
	dayjs(NOW_ISO).subtract(days, 'day').format('YYYY-MM-DD'),
	dayjs(NOW_ISO).format('YYYY-MM-DD'),
];

interface EvidenceCallsModalProps {
	opened: boolean;
	onClose: () => void;
	role: TeamRole;
	/** Calls already chosen; the modal starts with them checked. */
	selectedIds: string[];
	/** Agents the filter starts on: the 1:1 agent, or the group's participants. */
	initialAgentIds: string[];
	onConfirm: (callIds: string[]) => void;
}

/** Browse the team's calls with filters and tick the ones to pin as coaching evidence. */
export function EvidenceCallsModal({
	opened,
	onClose,
	role,
	selectedIds,
	initialAgentIds,
	onConfirm,
}: EvidenceCallsModalProps) {
	const { t } = useTranslation('qa.coaching');
	const scopeAgents = useMemo(() => managerScopeAgents(role), [role]);

	const [range, setRange] = useState<DateRange>(
		rangeOfLastDays(DEFAULT_PERIOD)
	);
	const [campaignIds, setCampaignIds] = useState<string[]>([]);
	const [lines, setLines] = useState<string[]>([]);
	const [agentIds, setAgentIds] = useState<string[]>(initialAgentIds);
	const [search, setSearch] = useState('');
	const [onlyTriggered, setOnlyTriggered] = useState(false);
	const rules = useCoachingStore(selectRules);
	const [draft, setDraft] = useState<string[]>(selectedIds);

	// Every time the modal opens it starts from the pre-filled agents and the calls already chosen.
	useEffect(() => {
		if (!opened) return;
		setRange(rangeOfLastDays(DEFAULT_PERIOD));
		setCampaignIds([]);
		setLines([]);
		setAgentIds(initialAgentIds);
		setSearch('');
		setOnlyTriggered(false);
		setDraft(selectedIds);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened]);

	const campaignOptions = useMemo(
		() =>
			TEAM_CAMPAIGNS.filter(
				(c) => lines.length === 0 || lines.includes(c.lineOfBusiness)
			).map((c) => ({ value: c.id, label: c.name })),
		[lines]
	);

	const activePreset = PERIOD_PRESETS.find(({ days }) => {
		const [from, to] = rangeOfLastDays(days);
		return range[0] === from && range[1] === to;
	})?.days;

	/** Rules each call triggers, so the table can name them and the filter can narrow to them. */
	const triggeredByCall = useMemo(() => {
		const map = new Map<string, string[]>();
		for (const call of TEAM_CALLS) {
			const triggered = rulesTriggeredByCall(call, rules);
			if (triggered.length > 0)
				map.set(
					call.id,
					triggered.map((r) => r.name)
				);
		}
		return map;
	}, [rules]);

	const rows = useMemo(() => {
		const [from, to] = range;
		const scopeIds = new Set(scopeAgents.map((a) => a.id));
		const query = search.trim().toLowerCase();
		return TEAM_CALLS.filter((c) => {
			const day = c.date.slice(0, 10);
			if (from && day < from) return false;
			if (to && day > to) return false;
			// A supervisor never sees calls outside their own team.
			if (!scopeIds.has(c.agentId)) return false;
			if (agentIds.length > 0 && !agentIds.includes(c.agentId)) return false;
			if (campaignIds.length > 0 && !campaignIds.includes(c.campaignId))
				return false;
			if (lines.length > 0 && !lines.includes(c.lineOfBusiness)) return false;
			if (query && !c.id.toLowerCase().includes(query)) return false;
			if (onlyTriggered && !triggeredByCall.has(c.id)) return false;
			return true;
		}).sort((a, b) => b.date.localeCompare(a.date));
	}, [
		range,
		scopeAgents,
		agentIds,
		campaignIds,
		lines,
		search,
		onlyTriggered,
		triggeredByCall,
	]);

	const triggeredRows = rows.filter((c) => triggeredByCall.has(c.id));

	const hasFilters =
		activePreset !== DEFAULT_PERIOD ||
		onlyTriggered ||
		campaignIds.length > 0 ||
		lines.length > 0 ||
		search !== '' ||
		agentIds.length !== initialAgentIds.length ||
		agentIds.some((id) => !initialAgentIds.includes(id));

	const clearFilters = () => {
		setRange(rangeOfLastDays(DEFAULT_PERIOD));
		setCampaignIds([]);
		setLines([]);
		setAgentIds(initialAgentIds);
		setSearch('');
		setOnlyTriggered(false);
	};

	const columns: BaseTableColumnDef<TeamCallMetric>[] = [
		helper.accessor('id', {
			header: t('sessions.editor.evidenceModal.columns.call'),
			cell: (info) => (
				<Text size='sm' fw={500}>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<TeamCallMetric>,
		helper.accessor('date', {
			header: t('sessions.editor.evidenceModal.columns.date'),
			cell: (info) => (
				<Text size='sm'>
					{dayjs(info.getValue()).format('D MMM YYYY HH:mm')}
				</Text>
			),
		}) as BaseTableColumnDef<TeamCallMetric>,
		helper.accessor('agentName', {
			header: t('sessions.editor.evidenceModal.columns.agent'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<TeamCallMetric>,
		helper.accessor('campaignName', {
			header: t('sessions.editor.evidenceModal.columns.campaign'),
			cell: (info) => (
				<Stack gap={0}>
					<Text size='sm'>{info.getValue()}</Text>
					<Text size='xs' c='dimmed'>
						{info.row.original.lineOfBusiness}
					</Text>
				</Stack>
			),
		}) as BaseTableColumnDef<TeamCallMetric>,
		helper.accessor('handleTimeSeconds', {
			header: t('sessions.editor.evidenceModal.columns.duration'),
			cell: (info) => <Text size='sm'>{formatSeconds(info.getValue())}</Text>,
		}) as BaseTableColumnDef<TeamCallMetric>,
		helper.display({
			id: 'rules',
			header: t('sessions.editor.evidenceModal.columns.rules'),
			cell: (info) => {
				const names = triggeredByCall.get(info.row.original.id) ?? [];
				if (names.length === 0)
					return (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					);
				return (
					<Tooltip
						label={names.join(' · ')}
						withArrow
						disabled={names.length < 2}
					>
						<Group gap={4} wrap='nowrap'>
							<Badge size='xs' variant='light' maw={150}>
								{names[0]}
							</Badge>
							{names.length > 1 && (
								<Text size='xs' c='dimmed'>
									+{names.length - 1}
								</Text>
							)}
						</Group>
					</Tooltip>
				);
			},
		}) as BaseTableColumnDef<TeamCallMetric>,
		helper.display({
			id: 'result',
			header: t('sessions.editor.evidenceModal.columns.result'),
			cell: (info) =>
				info.row.original.autoFail ? (
					<Badge size='xs' color='red' variant='light'>
						{t('sessions.editor.evidenceModal.autoFail')}
					</Badge>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				),
		}) as BaseTableColumnDef<TeamCallMetric>,
	];

	const confirm = () => {
		onConfirm(draft);
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('sessions.editor.evidenceModal.title')}
			size='xl'
			centered
		>
			<Stack gap='md'>
				<Grid gap='sm'>
					<Grid.Col span={{ base: 12, sm: 4 }}>
						<DatePickerInput
							type='range'
							label={t('sessions.editor.evidenceModal.period')}
							value={range}
							onChange={(value) => setRange(value as DateRange)}
							valueFormat='D MMM YYYY'
							clearable
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 4 }}>
						<MultiSelect
							label={t('sessions.editor.evidenceModal.lineOfBusiness')}
							placeholder={
								lines.length === 0
									? t('sessions.editor.evidenceModal.all')
									: undefined
							}
							data={LINES_OF_BUSINESS}
							value={lines}
							onChange={(v) => {
								setLines(v);
								// Drop campaigns that no longer belong to the chosen lines.
								setCampaignIds((prev) =>
									prev.filter((id) => {
										const campaign = TEAM_CAMPAIGNS.find((c) => c.id === id);
										return (
											v.length === 0 ||
											(campaign && v.includes(campaign.lineOfBusiness))
										);
									})
								);
							}}
							clearable
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 4 }}>
						<MultiSelect
							label={t('sessions.editor.evidenceModal.campaign')}
							placeholder={
								campaignIds.length === 0
									? t('sessions.editor.evidenceModal.all')
									: undefined
							}
							data={campaignOptions}
							value={campaignIds}
							onChange={setCampaignIds}
							searchable
							clearable
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 8 }}>
						<MultiSelect
							label={t('sessions.editor.evidenceModal.agent')}
							placeholder={
								agentIds.length === 0
									? t('sessions.editor.evidenceModal.allAgents')
									: undefined
							}
							data={scopeAgents.map((a) => ({
								value: a.id,
								label: `${a.name} · ${a.team}`,
							}))}
							value={agentIds}
							onChange={setAgentIds}
							searchable
							clearable
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 4 }}>
						<TextInput
							label={t('sessions.editor.evidenceModal.search')}
							placeholder='TCALL-…'
							value={search}
							onChange={(e) => setSearch(e.currentTarget.value)}
						/>
					</Grid.Col>
				</Grid>

				<Paper withBorder radius='md' p='sm'>
					<Stack gap='xs'>
						<Switch
							label={t('sessions.editor.evidenceModal.onlyTriggered')}
							checked={onlyTriggered}
							onChange={(e) => {
								const on = e.currentTarget.checked;
								setOnlyTriggered(on);
								// Turning it on starts from the weekly window.
								if (on) setRange(rangeOfLastDays(PERIOD_PRESETS[0].days));
							}}
						/>
						<Group justify='space-between' wrap='wrap' pl='xl'>
							<Chip.Group
								value={activePreset ? String(activePreset) : ''}
								onChange={(v) => setRange(rangeOfLastDays(Number(v)))}
							>
								<Group gap={6}>
									{PERIOD_PRESETS.map(({ key, days }) => (
										<Chip
											key={key}
											value={String(days)}
											size='xs'
											variant='outline'
											disabled={!onlyTriggered}
										>
											{t(`sessions.editor.evidenceModal.${key}`)}
										</Chip>
									))}
								</Group>
							</Chip.Group>
							<Button
								size='compact-sm'
								variant='light'
								disabled={!onlyTriggered || triggeredRows.length === 0}
								onClick={() =>
									setDraft((prev) => [
										...new Set([...prev, ...triggeredRows.map((c) => c.id)]),
									])
								}
							>
								{t('sessions.editor.evidenceModal.selectTriggered', {
									count: triggeredRows.length,
								})}
							</Button>
						</Group>
					</Stack>
				</Paper>

				<BaseTable<TeamCallMetric>
					data={rows}
					columns={columns}
					getRowId={(c) => c.id}
					density='compact'
					enablePagination
					pageSize={10}
					showPaginationControls
					enableRowSelection
					selectedRowIds={draft}
					onSelectedRowIdsChange={setDraft}
					emptyMessage={t('sessions.editor.evidenceModal.empty')}
				/>

				<Group justify='space-between'>
					<Group gap='sm'>
						<Text size='sm' c='dimmed'>
							{t('sessions.editor.evidenceModal.found', { count: rows.length })}
						</Text>
						{hasFilters && (
							<Button size='compact-sm' variant='subtle' onClick={clearFilters}>
								{t('sessions.editor.evidenceModal.clear')}
							</Button>
						)}
					</Group>
					<Group gap='sm'>
						<Button variant='default' onClick={onClose}>
							{t('sessions.editor.evidenceModal.cancel')}
						</Button>
						<Button onClick={confirm} disabled={draft.length === 0}>
							{t('sessions.editor.evidenceModal.add', { count: draft.length })}
						</Button>
					</Group>
				</Group>
			</Stack>
		</Modal>
	);
}
