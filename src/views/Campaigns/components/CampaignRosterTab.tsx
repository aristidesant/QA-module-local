import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Avatar, Badge, Group, Stack, Text } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import { SectionCard } from '~/components/SectionCard';
import { useRoleMockStore } from '~/stores/roleMockStore';
import { formatDateTime } from '~/modules/qa/team/helpers';
import {
	agentProfilePathFor,
	buildCampaignRoster,
} from '~/modules/qa/calls/helpers';
import type { CampaignRosterRow } from '~/modules/qa/calls/types';

const STATUS_COLOR = {
	active: 'green',
	'on-leave': 'gray',
	training: 'blue',
} as const;
const helper = createColumnHelper<CampaignRosterRow>();

export function CampaignRosterTab({
	campaignId,
}: {
	campaignId: string | undefined;
}) {
	const { t } = useTranslation('qa.calls');
	const { t: tTeam } = useTranslation('qa.team');
	const navigate = useNavigate();
	const previewRole = useRoleMockStore((s) => s.previewRole);
	const rows = useMemo(
		() => buildCampaignRoster(campaignId, previewRole),
		[campaignId, previewRole]
	);
	const isSupervisor = previewRole === 'supervisor';

	const columns: BaseTableColumnDef<CampaignRosterRow>[] = [
		helper.accessor((r) => r.agent.name, {
			id: 'agent',
			header: t('roster.columns.agent'),
			cell: (info) => {
				const a = info.row.original.agent;
				return (
					<Group gap='sm' wrap='nowrap'>
						<Avatar name={a.name} color={a.avatarColor} radius='xl' size='sm' />
						<Stack gap={0}>
							<Text size='sm' fw={600}>
								{a.name}
							</Text>
							<Text size='xs' c='dimmed'>
								{a.id}
							</Text>
						</Stack>
					</Group>
				);
			},
		}) as BaseTableColumnDef<CampaignRosterRow>,
		// A supervisor only sees their own team, so the supervisor column would repeat their own name.
		...(isSupervisor
			? []
			: [
					helper.accessor((r) => r.agent.supervisorName, {
						id: 'supervisor',
						header: t('roster.columns.supervisor'),
						cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
					}) as BaseTableColumnDef<CampaignRosterRow>,
				]),
		helper.accessor((r) => r.agent.status, {
			id: 'status',
			header: t('roster.columns.status'),
			cell: (info) => (
				<Badge variant='light' color={STATUS_COLOR[info.getValue()]}>
					{tTeam(`status.${info.getValue()}`)}
				</Badge>
			),
		}) as BaseTableColumnDef<CampaignRosterRow>,
		helper.accessor('calls', {
			header: t('roster.columns.calls'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<CampaignRosterRow>,
		helper.accessor('autoFails', {
			header: t('roster.columns.autoFails'),
			cell: (info) =>
				info.getValue() ? (
					<Badge color='red' variant='filled'>
						{info.getValue()}
					</Badge>
				) : (
					<Text size='sm' c='dimmed'>
						0
					</Text>
				),
		}) as BaseTableColumnDef<CampaignRosterRow>,
		helper.accessor('lastCallAt', {
			header: t('roster.columns.lastCall'),
			cell: (info) => (
				<Text size='sm'>
					{info.getValue() ? formatDateTime(info.getValue()!) : '—'}
				</Text>
			),
		}) as BaseTableColumnDef<CampaignRosterRow>,
	];

	return (
		<SectionCard
			description={t(
				isSupervisor ? 'roster.descriptionSupervisor' : 'roster.description'
			)}
			headerActions={
				<Text size='sm' c='dimmed'>
					{t('roster.rowsCount', { count: rows.length })}
				</Text>
			}
		>
			<BaseTable<CampaignRosterRow>
				data={rows}
				columns={columns}
				getRowId={(r) => r.agent.id}
				initialSort={[{ id: 'calls', desc: true }]}
				enablePagination
				pageSize={10}
				density='compact'
				emptyMessage={t(isSupervisor ? 'roster.empty' : 'roster.emptyAll')}
				onRowClick={(r) => navigate(agentProfilePathFor(previewRole, r.agent))}
			/>
		</SectionCard>
	);
}
