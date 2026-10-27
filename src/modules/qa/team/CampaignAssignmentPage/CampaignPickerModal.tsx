import { useEffect, useMemo, useState } from 'react';
import {
	Button,
	Group,
	Modal,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch } from '@tabler/icons-react';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import EmptyState from '~/components/EmptyState';
import { formatDay } from '~/modules/qa/lms/helpers';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import {
	selectProfiles,
	selectSupervisors,
	useTeamStore,
} from '~/stores/qa/teamStore';
import {
	ALL_CAMPAIGNS,
	CAMPAIGN_LINES,
	CAMPAIGN_STATES,
	type ClientCampaign,
} from '../campaignCatalog';
import type { RosterSupervisor } from '../types';
import { agentsOnCampaign, otherSupervisorsWithCampaign } from './helpers';
import { CampaignStateBadge } from './StatusBadge';

type DateRange = [string | null, string | null];

interface PickRow {
	id: string;
	campaign: ClientCampaign;
	agents: number;
	/** Other supervisors that already have this campaign. */
	others: RosterSupervisor[];
}

const helper = createColumnHelper<PickRow>();
const CAMPAIGN_TYPES = ['INBOUND', 'OUTBOUND', 'BLENDED'] as const;
const NO_DATES: DateRange = [null, null];

interface CampaignPickerModalProps {
	opened: boolean;
	onClose: () => void;
	supervisor: RosterSupervisor;
	currentCampaignIds: string[];
}

/** Find campaigns of any client by line of business, type, state and start period, and tick the ones a supervisor should see. */
export function CampaignPickerModal({
	opened,
	onClose,
	supervisor,
	currentCampaignIds,
}: CampaignPickerModalProps) {
	const { t } = useTranslation('qa.team');
	const setTeamCampaigns = useTeamStore((s) => s.setTeamCampaigns);
	const teamCampaignIds = useTeamStore((s) => s.teamCampaignIds);
	const supervisors = useTeamStore(selectSupervisors);
	const profiles = useTeamStore(selectProfiles);

	const [selected, setSelected] = useState<string[]>(currentCampaignIds);
	const [search, setSearch] = useState('');
	const [line, setLine] = useState<string | null>(null);
	const [type, setType] = useState<string | null>(null);
	const [state, setState] = useState<string | null>(null);
	const [started, setStarted] = useState<DateRange>(NO_DATES);

	// Every time the modal opens it starts from what the supervisor has now, with no filters.
	useEffect(() => {
		if (!opened) return;
		setSelected(currentCampaignIds);
		setSearch('');
		setLine(null);
		setType(null);
		setState(null);
		setStarted(NO_DATES);
	}, [opened, currentCampaignIds]);

	const added = selected.filter(
		(id) => !currentCampaignIds.includes(id)
	).length;
	const removed = currentCampaignIds.filter(
		(id) => !selected.includes(id)
	).length;
	const dirty = added > 0 || removed > 0;

	const rows = useMemo<PickRow[]>(
		() =>
			ALL_CAMPAIGNS.map((campaign) => ({
				id: campaign.id,
				campaign,
				agents: agentsOnCampaign(profiles, campaign.id).length,
				others: otherSupervisorsWithCampaign(
					teamCampaignIds,
					supervisors,
					campaign.id,
					supervisor.id
				),
			})),
		[profiles, teamCampaignIds, supervisors, supervisor.id]
	);

	const visibleRows = useMemo(() => {
		const q = search.trim().toLowerCase();
		const [from, to] = started;
		return rows.filter(({ campaign }) => {
			if (line && campaign.lineOfBusiness !== line) return false;
			if (type && campaign.campaignType !== type) return false;
			if (state && campaign.state !== state) return false;
			if (from && campaign.startedAt < from) return false;
			if (to && campaign.startedAt > to) return false;
			if (!q) return true;
			return [campaign.name, campaign.clientName]
				.join(' ')
				.toLowerCase()
				.includes(q);
		});
	}, [rows, search, line, type, state, started]);

	const hasFilters = Boolean(
		search || line || type || state || started[0] || started[1]
	);
	const clearFilters = () => {
		setSearch('');
		setLine(null);
		setType(null);
		setState(null);
		setStarted(NO_DATES);
	};

	const toggle = (id: string) =>
		setSelected((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);

	const save = () => {
		setTeamCampaigns(supervisor.id, selected);
		notifySuccess(
			t('campaignAssignment.picker.saved', { name: supervisor.name })
		);
		onClose();
	};

	const columns: BaseTableColumnDef<PickRow>[] = [
		helper.accessor((r) => r.campaign.name, {
			id: 'campaign',
			header: t('campaignAssignment.picker.columns.campaign'),
			cell: (info) => (
				<Stack gap={0}>
					<Text size='sm' fw={600}>
						{info.getValue()}
					</Text>
					<Text size='xs' c='dimmed'>
						{info.row.original.campaign.lineOfBusiness}
					</Text>
				</Stack>
			),
		}) as BaseTableColumnDef<PickRow>,
		helper.accessor((r) => r.campaign.clientName, {
			id: 'client',
			header: t('campaignAssignment.picker.columns.client'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<PickRow>,
		helper.accessor((r) => r.campaign.campaignType, {
			id: 'type',
			header: t('campaignAssignment.picker.columns.type'),
			cell: (info) => (
				<Text size='sm'>
					{t(`campaignAssignment.campaignTypeTitle.${info.getValue()}`)}
				</Text>
			),
		}) as BaseTableColumnDef<PickRow>,
		helper.accessor((r) => r.campaign.state, {
			id: 'state',
			header: t('campaignAssignment.picker.columns.state'),
			cell: (info) => <CampaignStateBadge state={info.getValue()} />,
		}) as BaseTableColumnDef<PickRow>,
		helper.accessor((r) => r.campaign.startedAt, {
			id: 'started',
			header: t('campaignAssignment.picker.columns.started'),
			cell: (info) => <Text size='sm'>{formatDay(info.getValue())}</Text>,
		}) as BaseTableColumnDef<PickRow>,
		helper.accessor('agents', {
			header: t('campaignAssignment.picker.columns.agents'),
			cell: (info) =>
				info.getValue() > 0 ? (
					<Text size='sm'>{info.getValue()}</Text>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				),
		}) as BaseTableColumnDef<PickRow>,
		helper.display({
			id: 'assigned',
			header: t('campaignAssignment.picker.columns.assigned'),
			enableSorting: false,
			cell: (info) => {
				const { others, id } = info.row.original;
				if (others.length > 0) {
					return <Text size='sm'>{others.map((s) => s.name).join(', ')}</Text>;
				}
				return (
					<Text size='sm' c='dimmed'>
						{currentCampaignIds.includes(id)
							? t('campaignAssignment.detail.onlyHere')
							: t('campaignAssignment.picker.noSupervisor')}
					</Text>
				);
			},
		}) as BaseTableColumnDef<PickRow>,
	];

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			size='min(1120px, 95vw)'
			title={
				<Stack gap={2}>
					<Text fw={600}>
						{t('campaignAssignment.picker.title', { name: supervisor.name })}
					</Text>
					<Text size='sm' c='dimmed'>
						{t('campaignAssignment.picker.description', {
							name: supervisor.name,
						})}
					</Text>
				</Stack>
			}
		>
			<Stack gap='md'>
				<Group gap='sm' wrap='wrap' align='flex-end'>
					<TextInput
						size='sm'
						w={240}
						placeholder={t('campaignAssignment.picker.search')}
						aria-label={t('campaignAssignment.picker.search')}
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(e) => setSearch(e.currentTarget.value)}
					/>
					<Select
						size='sm'
						w={200}
						aria-label={t('campaignAssignment.picker.line')}
						placeholder={t('campaignAssignment.picker.allLines')}
						data={CAMPAIGN_LINES}
						value={line}
						onChange={setLine}
						clearable
					/>
					<Select
						size='sm'
						w={150}
						aria-label={t('campaignAssignment.picker.type')}
						placeholder={t('campaignAssignment.picker.allTypes')}
						data={CAMPAIGN_TYPES.map((value) => ({
							value,
							label: t(`campaignAssignment.campaignTypeTitle.${value}`),
						}))}
						value={type}
						onChange={setType}
						clearable
					/>
					<Select
						size='sm'
						w={150}
						aria-label={t('campaignAssignment.picker.state')}
						placeholder={t('campaignAssignment.picker.allStates')}
						data={CAMPAIGN_STATES.map((value) => ({
							value,
							label: t(`campaignAssignment.campaignState.${value}`),
						}))}
						value={state}
						onChange={setState}
						clearable
					/>
					<DatePickerInput
						type='range'
						size='sm'
						w={250}
						aria-label={t('campaignAssignment.picker.started')}
						placeholder={t('campaignAssignment.picker.startedPlaceholder')}
						valueFormat='D MMM YYYY'
						value={started}
						onChange={(value) => setStarted(value as DateRange)}
						clearable
					/>
					{hasFilters && (
						<Button size='sm' variant='subtle' onClick={clearFilters}>
							{t('campaignAssignment.picker.clearFilters')}
						</Button>
					)}
				</Group>

				{visibleRows.length === 0 ? (
					<EmptyState message={t('campaignAssignment.picker.empty')} />
				) : (
					<BaseTable<PickRow>
						data={visibleRows}
						columns={columns}
						getRowId={(r) => r.id}
						initialSort={[{ id: 'campaign', desc: false }]}
						enableRowSelection
						selectedRowIds={selected}
						onSelectedRowIdsChange={setSelected}
						density='compact'
						enablePagination
						showPaginationControls
						pageSize={8}
						onRowClick={(r) => toggle(r.id)}
					/>
				)}

				<Group justify='space-between' gap='sm' wrap='wrap'>
					<Stack gap={0}>
						<Text size='sm' fw={600}>
							{t('campaignAssignment.picker.summary', {
								selected: selected.length,
								total: ALL_CAMPAIGNS.length,
							})}
						</Text>
						<Text size='xs' c='dimmed'>
							{dirty
								? t('campaignAssignment.picker.changes', { added, removed })
								: t('campaignAssignment.picker.noChanges')}
						</Text>
					</Stack>
					<Group gap='xs'>
						<Button variant='default' onClick={onClose}>
							{t('modals.cancel')}
						</Button>
						<Button onClick={save} disabled={!dirty}>
							{t('campaignAssignment.picker.save')}
						</Button>
					</Group>
				</Group>
			</Stack>
		</Modal>
	);
}
