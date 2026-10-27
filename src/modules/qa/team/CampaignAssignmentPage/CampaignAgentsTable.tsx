import { Avatar, Group, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { UNASSIGNED_SUPERVISOR_ID } from '../constants';
import { formatDateTime } from '../helpers';
import type { RosterAgent } from '../types';
import type { CampaignAgentRow } from './helpers';
import { StatusBadge } from './StatusBadge';

const helper = createColumnHelper<CampaignAgentRow>();

interface CampaignAgentsTableProps {
	rows: CampaignAgentRow[];
	onOpenAgent: (agent: RosterAgent) => void;
}

/** The agents working on one campaign. Read only: a row opens the agent profile. */
export function CampaignAgentsTable({
	rows,
	onOpenAgent,
}: CampaignAgentsTableProps) {
	const { t } = useTranslation('qa.team');

	const columns: BaseTableColumnDef<CampaignAgentRow>[] = [
		helper.accessor((r) => r.agent.name, {
			id: 'agent',
			header: t('campaignAssignment.detail.columns.agent'),
			cell: (info) => {
				const { agent } = info.row.original;
				return (
					<Group gap='sm' wrap='nowrap'>
						<Avatar
							name={agent.name}
							color={agent.avatarColor}
							radius='xl'
							size='sm'
						/>
						<Stack gap={0}>
							<Text size='sm' fw={600}>
								{agent.name}
							</Text>
							<Text size='xs' c='dimmed'>
								{agent.id}
							</Text>
						</Stack>
					</Group>
				);
			},
		}) as BaseTableColumnDef<CampaignAgentRow>,
		helper.accessor((r) => r.agent.team, {
			id: 'team',
			header: t('campaignAssignment.detail.columns.team'),
			cell: (info) => (
				<Text
					size='sm'
					c={
						info.row.original.agent.supervisorId === UNASSIGNED_SUPERVISOR_ID
							? 'dimmed'
							: undefined
					}
				>
					{info.getValue()}
				</Text>
			),
		}) as BaseTableColumnDef<CampaignAgentRow>,
		helper.accessor((r) => r.agent.status, {
			id: 'status',
			header: t('campaignAssignment.detail.columns.status'),
			cell: (info) => <StatusBadge status={info.getValue()} />,
		}) as BaseTableColumnDef<CampaignAgentRow>,
		helper.accessor('calls', {
			header: t('campaignAssignment.detail.columns.calls'),
			cell: (info) =>
				info.getValue() > 0 ? (
					<Text size='sm'>{info.getValue()}</Text>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				),
		}) as BaseTableColumnDef<CampaignAgentRow>,
		helper.accessor('lastCallAt', {
			header: t('campaignAssignment.detail.columns.lastCall'),
			cell: (info) =>
				info.getValue() ? (
					<Text size='sm'>{formatDateTime(info.getValue() as string)}</Text>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				),
		}) as BaseTableColumnDef<CampaignAgentRow>,
	];

	return (
		<BaseTable<CampaignAgentRow>
			data={rows}
			columns={columns}
			getRowId={(r) => r.agent.id}
			initialSort={[{ id: 'calls', desc: true }]}
			enablePagination
			showPaginationControls
			pageSize={10}
			density='compact'
			emptyMessage={t('campaignAssignment.detail.noAgents')}
			onRowClick={(r) => onOpenAgent(r.agent)}
		/>
	);
}
