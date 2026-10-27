import { useMemo } from 'react';
import { Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { formatDay } from '~/modules/qa/lms/helpers';
import { selectProfiles, useTeamStore } from '~/stores/qa/teamStore';
import type { ClientCampaign } from '../campaignCatalog';
import { agentsOnCampaign } from './helpers';
import { CampaignStateBadge } from './StatusBadge';

interface UnassignedRow {
	id: string;
	campaign: ClientCampaign;
	agents: number;
}

const helper = createColumnHelper<UnassignedRow>();

interface UnassignedCampaignsTableProps {
	campaigns: ClientCampaign[];
}

/** The campaigns no supervisor can see yet. Giving them a supervisor happens from the supervisor detail. */
export function UnassignedCampaignsTable({
	campaigns,
}: UnassignedCampaignsTableProps) {
	const { t } = useTranslation('qa.team');
	const profiles = useTeamStore(selectProfiles);

	const rows = useMemo<UnassignedRow[]>(
		() =>
			campaigns.map((campaign) => ({
				id: campaign.id,
				campaign,
				agents: agentsOnCampaign(profiles, campaign.id).length,
			})),
		[campaigns, profiles]
	);

	const columns: BaseTableColumnDef<UnassignedRow>[] = [
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
		}) as BaseTableColumnDef<UnassignedRow>,
		helper.accessor((r) => r.campaign.clientName, {
			id: 'client',
			header: t('campaignAssignment.detail.campaignColumns.client'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<UnassignedRow>,
		helper.accessor((r) => r.campaign.campaignType, {
			id: 'type',
			header: t('campaignAssignment.detail.campaignColumns.type'),
			cell: (info) => (
				<Text size='sm'>
					{t(`campaignAssignment.campaignTypeTitle.${info.getValue()}`)}
				</Text>
			),
		}) as BaseTableColumnDef<UnassignedRow>,
		helper.accessor((r) => r.campaign.state, {
			id: 'state',
			header: t('campaignAssignment.detail.campaignColumns.state'),
			cell: (info) => <CampaignStateBadge state={info.getValue()} />,
		}) as BaseTableColumnDef<UnassignedRow>,
		helper.accessor((r) => r.campaign.startedAt, {
			id: 'started',
			header: t('campaignAssignment.detail.campaignColumns.started'),
			cell: (info) => <Text size='sm'>{formatDay(info.getValue())}</Text>,
		}) as BaseTableColumnDef<UnassignedRow>,
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
		}) as BaseTableColumnDef<UnassignedRow>,
	];

	return (
		<BaseTable<UnassignedRow>
			data={rows}
			columns={columns}
			getRowId={(r) => r.id}
			initialSort={[{ id: 'client', desc: false }]}
			density='compact'
			emptyMessage={t('campaignAssignment.list.unassignedEmpty')}
		/>
	);
}
