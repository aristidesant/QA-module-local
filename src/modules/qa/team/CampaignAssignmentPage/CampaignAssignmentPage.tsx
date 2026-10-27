import { useMemo } from 'react';
import { Avatar, Group, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { ContentContainer } from '~/components/ContentContainer';
import { SectionCard } from '~/components/SectionCard';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl/AppSegmentedControl';
import {
	selectProfiles,
	selectSupervisors,
	useTeamStore,
} from '~/stores/qa/teamStore';
import { campaignAssignmentDetailPath } from '../helpers';
import {
	supervisorAssignmentRows,
	unassignedCampaigns,
	type SupervisorAssignmentRow,
} from './helpers';
import { StatusBadge } from './StatusBadge';
import { UnassignedCampaignsTable } from './UnassignedCampaignsTable';

const helper = createColumnHelper<SupervisorAssignmentRow>();
const VISIBLE_CAMPAIGNS = 2;

type View = 'supervisors' | 'unassigned';

/** The Operation Manager's list of supervisors and the campaigns each one can see, or the campaigns no one can see yet. */
export default function CampaignAssignmentPage() {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const supervisors = useTeamStore(selectSupervisors);
	const teamCampaignIds = useTeamStore((s) => s.teamCampaignIds);
	const profiles = useTeamStore(selectProfiles);

	// The view lives in the URL, so "Unassigned campaigns" can be linked to.
	const view: View =
		searchParams.get('view') === 'unassigned' ? 'unassigned' : 'supervisors';
	const setView = (value: View) =>
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (value === 'unassigned') next.set('view', value);
				else next.delete('view');
				return next;
			},
			{ replace: true }
		);

	const rows = useMemo(
		() => supervisorAssignmentRows(supervisors, teamCampaignIds, profiles),
		[supervisors, teamCampaignIds, profiles]
	);
	const orphans = useMemo(
		() => unassignedCampaigns(teamCampaignIds),
		[teamCampaignIds]
	);

	const columns: BaseTableColumnDef<SupervisorAssignmentRow>[] = [
		helper.accessor((r) => r.supervisor.name, {
			id: 'supervisor',
			header: t('campaignAssignment.list.columns.supervisor'),
			cell: (info) => {
				const { supervisor } = info.row.original;
				return (
					<Group gap='sm' wrap='nowrap'>
						<Avatar name={supervisor.name} color='gray' radius='xl' size='sm' />
						<Stack gap={0}>
							<Text size='sm' fw={600}>
								{supervisor.name}
							</Text>
							<Text size='xs' c='dimmed'>
								{supervisor.email}
							</Text>
						</Stack>
					</Group>
				);
			},
		}) as BaseTableColumnDef<SupervisorAssignmentRow>,
		helper.accessor((r) => r.supervisor.team, {
			id: 'team',
			header: t('campaignAssignment.list.columns.team'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<SupervisorAssignmentRow>,
		helper.accessor((r) => r.supervisor.status ?? 'active', {
			id: 'status',
			header: t('campaignAssignment.list.columns.status'),
			cell: (info) => <StatusBadge status={info.getValue()} />,
		}) as BaseTableColumnDef<SupervisorAssignmentRow>,
		helper.accessor((r) => r.campaigns.map((c) => c.name), {
			id: 'campaigns',
			header: t('campaignAssignment.list.columns.campaigns'),
			enableSorting: false,
			cell: (info) => {
				const names = info.getValue();
				if (names.length === 0) {
					return (
						<Text size='sm' c='dimmed'>
							{t('campaignAssignment.list.noCampaigns')}
						</Text>
					);
				}
				const overflow = names.length - VISIBLE_CAMPAIGNS;
				return (
					<Text size='sm'>
						{names.slice(0, VISIBLE_CAMPAIGNS).join(', ')}
						{overflow > 0 && (
							<Text span size='sm' c='dimmed'>
								{' '}
								{t('campaignAssignment.list.more', { count: overflow })}
							</Text>
						)}
					</Text>
				);
			},
		}) as BaseTableColumnDef<SupervisorAssignmentRow>,
		helper.accessor('agentCount', {
			header: t('campaignAssignment.list.columns.agents'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<SupervisorAssignmentRow>,
	];

	return (
		<ContentContainer
			contentWidth='full'
			title={t('campaignAssignment.title')}
			description={t('campaignAssignment.description')}
		>
			<Stack gap='lg'>
				<Text size='sm' c='dimmed'>
					{t('campaignAssignment.managedElsewhere')}
				</Text>

				<Group>
					<AppSegmentedControl
						value={view}
						onChange={(value) => setView(value as View)}
						data={[
							{
								value: 'supervisors',
								label: t('campaignAssignment.list.viewSupervisors', {
									count: rows.length,
								}),
							},
							{
								value: 'unassigned',
								label: t('campaignAssignment.list.viewUnassigned', {
									count: orphans.length,
								}),
							},
						]}
					/>
				</Group>

				{view === 'supervisors' ? (
					<SectionCard
						headerActions={
							<Text size='sm' c='dimmed'>
								{t('campaignAssignment.list.rowsCount', { count: rows.length })}
							</Text>
						}
					>
						<BaseTable<SupervisorAssignmentRow>
							data={rows}
							columns={columns}
							getRowId={(r) => r.id}
							initialSort={[{ id: 'supervisor', desc: false }]}
							density='compact'
							emptyMessage={t('campaignAssignment.list.empty')}
							onRowClick={(r) => navigate(campaignAssignmentDetailPath(r.id))}
						/>
					</SectionCard>
				) : (
					<SectionCard
						description={t('campaignAssignment.list.unassignedHint')}
						headerActions={
							<Text size='sm' c='dimmed'>
								{t('campaignAssignment.detail.campaigns', {
									count: orphans.length,
								})}
							</Text>
						}
					>
						<UnassignedCampaignsTable campaigns={orphans} />
					</SectionCard>
				)}
			</Stack>
		</ContentContainer>
	);
}
