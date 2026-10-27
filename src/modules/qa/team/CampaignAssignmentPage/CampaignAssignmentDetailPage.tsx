import { useMemo, useState } from 'react';
import {
	ActionIcon,
	Anchor,
	Avatar,
	Breadcrumbs,
	Button,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconSpeakerphone, IconX } from '@tabler/icons-react';
import { createColumnHelper } from '@tanstack/react-table';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { ContentContainer } from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import { SectionCard } from '~/components/SectionCard';
import { formatDay } from '~/modules/qa/lms/helpers';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import {
	selectProfiles,
	selectSupervisor,
	selectSupervisors,
	selectTeamCampaignIds,
	useTeamStore,
} from '~/stores/qa/teamStore';
import { UNASSIGNED_SUPERVISOR_ID } from '../constants';
import type { ClientCampaign } from '../campaignCatalog';
import { agentProfilePath, campaignAssignmentPath } from '../helpers';
import type { RosterSupervisor } from '../types';
import {
	agentsOnCampaign,
	agentsOnCampaigns,
	campaignAgentRows,
	campaignById,
	otherSupervisorsWithCampaign,
} from './helpers';
import { CampaignAgentsTable } from './CampaignAgentsTable';
import { CampaignPickerModal } from './CampaignPickerModal';
import { CampaignStateBadge, StatusBadge } from './StatusBadge';

interface AssignedRow {
	id: string;
	campaign: ClientCampaign;
	agents: number;
	/** Other supervisors that also have this campaign. */
	others: RosterSupervisor[];
}

const helper = createColumnHelper<AssignedRow>();

/** One supervisor: a table of the campaigns they can see. Open a row to see the agents working on it. */
export default function CampaignAssignmentDetailPage() {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const { supervisorId = '' } = useParams<{ supervisorId: string }>();
	const supervisor = useTeamStore(selectSupervisor(supervisorId));
	const campaignIds = useTeamStore(selectTeamCampaignIds(supervisorId));
	const supervisors = useTeamStore(selectSupervisors);
	const teamCampaignIds = useTeamStore((s) => s.teamCampaignIds);
	const profiles = useTeamStore(selectProfiles);
	const setTeamCampaigns = useTeamStore((s) => s.setTeamCampaigns);
	const [pickerOpen, setPickerOpen] = useState(false);

	const rows = useMemo<AssignedRow[]>(
		() =>
			campaignIds
				.map(campaignById)
				.filter((c): c is ClientCampaign => Boolean(c))
				.map((campaign) => ({
					id: campaign.id,
					campaign,
					agents: agentsOnCampaign(profiles, campaign.id).length,
					others: otherSupervisorsWithCampaign(
						teamCampaignIds,
						supervisors,
						campaign.id,
						supervisorId
					),
				})),
		[campaignIds, profiles, teamCampaignIds, supervisors, supervisorId]
	);
	const agentTotal = useMemo(
		() => agentsOnCampaigns(profiles, campaignIds).length,
		[profiles, campaignIds]
	);

	if (!supervisor || supervisorId === UNASSIGNED_SUPERVISOR_ID) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState
					message={t('campaignAssignment.detail.notFound')}
					action={
						<Button onClick={() => navigate(campaignAssignmentPath)}>
							{t('campaignAssignment.detail.back')}
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	const confirmRemove = (campaign: ClientCampaign) => {
		modals.openConfirmModal({
			title: t('campaignAssignment.detail.removeTitle', {
				campaign: campaign.name,
			}),
			children: (
				<Text size='sm'>
					{t('campaignAssignment.detail.removeBody', { name: supervisor.name })}
				</Text>
			),
			labels: {
				confirm: t('campaignAssignment.detail.removeConfirm'),
				cancel: t('modals.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: () => {
				setTeamCampaigns(
					supervisor.id,
					campaignIds.filter((id) => id !== campaign.id)
				);
				notifySuccess(
					t('campaignAssignment.detail.removed', {
						campaign: campaign.name,
						name: supervisor.name,
					})
				);
			},
		});
	};

	const assignButton = (
		<Button
			leftSection={<IconPlus size={16} />}
			onClick={() => setPickerOpen(true)}
		>
			{t('campaignAssignment.detail.assign')}
		</Button>
	);

	const columns: BaseTableColumnDef<AssignedRow>[] = [
		helper.accessor((r) => r.campaign.name, {
			id: 'campaign',
			header: t('campaignAssignment.detail.campaignColumns.campaign'),
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
		}) as BaseTableColumnDef<AssignedRow>,
		helper.accessor((r) => r.campaign.clientName, {
			id: 'client',
			header: t('campaignAssignment.detail.campaignColumns.client'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<AssignedRow>,
		helper.accessor((r) => r.campaign.campaignType, {
			id: 'type',
			header: t('campaignAssignment.detail.campaignColumns.type'),
			cell: (info) => (
				<Text size='sm'>
					{t(`campaignAssignment.campaignTypeTitle.${info.getValue()}`)}
				</Text>
			),
		}) as BaseTableColumnDef<AssignedRow>,
		helper.accessor((r) => r.campaign.state, {
			id: 'state',
			header: t('campaignAssignment.detail.campaignColumns.state'),
			cell: (info) => <CampaignStateBadge state={info.getValue()} />,
		}) as BaseTableColumnDef<AssignedRow>,
		helper.accessor((r) => r.campaign.startedAt, {
			id: 'started',
			header: t('campaignAssignment.detail.campaignColumns.started'),
			cell: (info) => <Text size='sm'>{formatDay(info.getValue())}</Text>,
		}) as BaseTableColumnDef<AssignedRow>,
		helper.accessor('agents', {
			header: t('campaignAssignment.detail.campaignColumns.agents'),
			cell: (info) =>
				info.getValue() > 0 ? (
					<Text size='sm'>{info.getValue()}</Text>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				),
		}) as BaseTableColumnDef<AssignedRow>,
		helper.display({
			id: 'assignedTo',
			header: t('campaignAssignment.detail.campaignColumns.assignedTo'),
			enableSorting: false,
			cell: (info) => {
				const { others } = info.row.original;
				return others.length > 0 ? (
					<Text size='sm'>{others.map((s) => s.name).join(', ')}</Text>
				) : (
					<Text size='sm' c='dimmed'>
						{t('campaignAssignment.detail.onlyHere')}
					</Text>
				);
			},
		}) as BaseTableColumnDef<AssignedRow>,
		helper.display({
			id: 'remove',
			header: '',
			enableSorting: false,
			cell: (info) => (
				<ActionIcon
					variant='subtle'
					color='gray'
					aria-label={t('campaignAssignment.detail.remove')}
					onClick={(event) => {
						// The row toggles its agents; removing must not.
						event.stopPropagation();
						confirmRemove(info.row.original.campaign);
					}}
				>
					<IconX size={16} />
				</ActionIcon>
			),
		}) as BaseTableColumnDef<AssignedRow>,
	];

	return (
		<ContentContainer
			contentWidth='full'
			showBackButton
			onBackClick={() => navigate(campaignAssignmentPath)}
		>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={() => navigate(campaignAssignmentPath)}>
						{t('campaignAssignment.title')}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{supervisor.name}
					</Text>
				</Breadcrumbs>

				<SectionCard padding='lg'>
					<Group gap='md'>
						<Avatar size={56} radius='md' name={supervisor.name} />
						<Stack gap={4}>
							<Title order={3}>{supervisor.name}</Title>
							<Text size='sm' c='dimmed'>
								{supervisor.team}, {supervisor.email}
							</Text>
							<Group gap='xs'>
								<StatusBadge status={supervisor.status ?? 'active'} />
							</Group>
						</Stack>
					</Group>
				</SectionCard>

				{rows.length === 0 ? (
					<EmptyState
						icon={<IconSpeakerphone size={28} />}
						message={t('campaignAssignment.detail.emptyTitle')}
						description={t('campaignAssignment.detail.emptyDescription', {
							name: supervisor.name,
						})}
						action={assignButton}
					/>
				) : (
					<SectionCard
						icon={IconSpeakerphone}
						title={t('campaignAssignment.detail.tableTitle')}
						description={t('campaignAssignment.detail.summary', {
							campaigns: t('campaignAssignment.detail.campaigns', {
								count: rows.length,
							}),
							agents: t('campaignAssignment.detail.agents', {
								count: agentTotal,
							}),
						})}
						headerActions={assignButton}
					>
						<Stack gap='xs'>
							<Text size='xs' c='dimmed'>
								{t('campaignAssignment.detail.expandHint')}
							</Text>
							<BaseTable<AssignedRow>
								data={rows}
								columns={columns}
								getRowId={(r) => r.id}
								initialSort={[{ id: 'campaign', desc: false }]}
								density='compact'
								enableExpanding
								renderExpandedRow={(row) => (
									<Stack gap='xs' p='sm'>
										<Text size='sm' fw={600}>
											{t('campaignAssignment.detail.agentsHeading', {
												campaign: row.campaign.name,
											})}
										</Text>
										<CampaignAgentsTable
											rows={campaignAgentRows(
												agentsOnCampaign(profiles, row.id),
												row.id
											)}
											onOpenAgent={(agent) =>
												navigate(agentProfilePath('qa-manager', agent), {
													state: { from: 'campaign-assignment' },
												})
											}
										/>
									</Stack>
								)}
							/>
						</Stack>
					</SectionCard>
				)}
			</Stack>

			<CampaignPickerModal
				opened={pickerOpen}
				onClose={() => setPickerOpen(false)}
				supervisor={supervisor}
				currentCampaignIds={campaignIds}
			/>
		</ContentContainer>
	);
}
