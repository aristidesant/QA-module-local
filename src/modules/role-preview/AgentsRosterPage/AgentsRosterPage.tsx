import {
	ActionIcon,
	Alert,
	Badge,
	Group,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconAlertTriangle, IconKey, IconUsers } from '@tabler/icons-react';
import type { SortingState } from '@tanstack/react-table';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import CreateAgentUserModal from '~/modules/qa/agents/CreateAgentUserModal/CreateAgentUserModal';
import { AGENT_TYPE_COLORS } from '~/modules/qa/constants/badgeColors';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { useListPageState } from '~/modules/qa/hooks/useListPageState';
import type { Agent } from '~/models/qa';
import {
	useAgentsQuery,
	useCreateAgentUserMutation,
} from '~/queries/qa/agentsQueries';
import { getAgentDisplayName } from '~/modules/qa/utils/agent';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './AgentsRosterPage.module.css';

export default function AgentsRosterPage() {
	const { t: tAgents } = useTranslation('qa.agents');
	const { t } = useTranslation('common');
	const {
		page,
		setPage,
		setPageSize,
		limit,
		offset,
		sort,
		setSort,
		getTotalPages,
	} = useListPageState();
	const [agentForUserCreation, setAgentForUserCreation] =
		useState<Agent | null>(null);

	const agentsQuery = useAgentsQuery({
		limit,
		offset,
		sortBy: sort.field as any,
		orderBy: sort.order,
	});

	const createAgentUserMutation = useCreateAgentUserMutation();
	const agents = agentsQuery.data?.data ?? [];
	const total = agentsQuery.data?.total ?? 0;
	const totalPages = getTotalPages(total);
	const dateFormatter = useDateFormatter('date');

	const handleSortingChange = (sorting: SortingState) => {
		const first = sorting[0];
		if (first) {
			setSort({ field: first.id, order: first.desc ? 'DESC' : 'ASC' });
		}
	};

	const columns: BaseTableColumnDef<Agent>[] = useMemo(
		() => [
			{
				accessorKey: 'employeeId',
				header: 'Agent ID',
				cell: ({ row }) => (
					<Text fw={700} size='sm'>
						{row.original.employeeId}
					</Text>
				),
			},
			{
				accessorKey: 'firstName',
				header: tAgents('table.name'),
				cell: ({ row }) => (
					<Text size='sm'>{getAgentDisplayName(row.original)}</Text>
				),
			},
			{
				id: 'type',
				header: tAgents('table.type'),
				enableSorting: false,
				cell: ({ row }) => (
					<Badge
						color={AGENT_TYPE_COLORS[row.original.agentType]}
						variant='light'
					>
						{tAgents(
							`types.${row.original.agentType === 'AI_BOT' ? 'aiBot' : 'human'}`
						)}
					</Badge>
				),
			},
			{
				id: 'email',
				header: tAgents('table.email'),
				enableSorting: false,
				cell: ({ row }) => (
					<Text c={row.original.email ? undefined : 'dimmed'} size='sm'>
						{row.original.email || tAgents('common.notProvided')}
					</Text>
				),
			},
			{
				id: 'supervisor',
				header: t('rolePreview.agentsRoster.supervisor'),
				enableSorting: false,
				cell: () => (
					<Text c='dimmed' size='sm'>
						{t('common.notAvailable')}
					</Text>
				),
			},
			{
				id: 'status',
				header: t('rolePreview.agentsRoster.status'),
				enableSorting: false,
				cell: ({ row }) => (
					<Badge
						color={row.original.hasUserAccount ? 'green' : 'orange'}
						variant='light'
					>
						{row.original.hasUserAccount
							? t('rolePreview.agentsRoster.statusActive')
							: t('rolePreview.agentsRoster.statusPending')}
					</Badge>
				),
			},
			{
				accessorKey: 'createdAt',
				header: tAgents('table.createdAt'),
				cell: ({ row }) => (
					<Text c='dimmed' size='sm'>
						{row.original.createdAt
							? dateFormatter.format(new Date(row.original.createdAt))
							: tAgents('common.notAvailable')}
					</Text>
				),
			},
			{
				id: 'actions',
				header: tAgents('table.actions'),
				enableSorting: false,
				cell: ({ row }) => (
					<Group
						className={classes.actions}
						gap='xs'
						justify='flex-end'
						wrap='nowrap'
					>
						<Tooltip label={tAgents('actions.grantAccess')}>
							<ActionIcon
								aria-label={tAgents('actions.grantAccess')}
								onClick={(event) => {
									event.stopPropagation();
									setAgentForUserCreation(row.original);
								}}
								radius='md'
								variant='light'
							>
								<IconKey size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
			},
		],
		[tAgents, t, dateFormatter]
	);

	return (
		<>
			<CreateAgentUserModal
				agent={agentForUserCreation}
				isOpen={Boolean(agentForUserCreation)}
				isLoading={createAgentUserMutation.isPending}
				onClose={() => setAgentForUserCreation(null)}
				onConfirm={async (agentId) => {
					await createAgentUserMutation.mutateAsync(agentId);
				}}
			/>

			<ContentContainer
				contentWidth='full'
				description={t('rolePreview.agentsRoster.description')}
				title={t('rolePreview.agentsRoster.title')}
			>
				<Stack gap='md'>
					<SectionCard>
						<Stack gap='sm'>
							{agentsQuery.isError ? (
								<Alert
									color='red'
									icon={<IconAlertTriangle size={16} />}
									title={t('rolePreview.agentsRoster.errorTitle')}
									variant='light'
								>
									{getErrorMessage(agentsQuery.error)}
								</Alert>
							) : (
								<>
									{!agentsQuery.isLoading && agents.length === 0 ? (
										<EmptyState
											description={t(
												'rolePreview.agentsRoster.emptyDescription'
											)}
											icon={<IconUsers size={32} />}
											message={t('rolePreview.agentsRoster.emptyTitle')}
										/>
									) : (
										<>
											<BaseTable<Agent>
												columns={columns}
												data={agents}
												filterMode='server'
												getRowClassName={() => classes.row}
												getRowId={(agent) => String(agent.id)}
												initialSort={[
													{ id: sort.field, desc: sort.order === 'DESC' },
												]}
												isLoading={agentsQuery.isLoading}
												onSortingChange={handleSortingChange}
												skeletonRowsCount={Math.min(limit, 10)}
											/>
											{!agentsQuery.isLoading && total > 0 ? (
												<PaginationControls
													currentPage={page}
													itemsPerPage={limit}
													onItemsPerPageChange={(value) => {
														if (value) {
															setPageSize(value);
														}
													}}
													onPageChange={setPage}
													totalItems={total}
													totalPages={totalPages}
												/>
											) : null}
										</>
									)}
								</>
							)}
						</Stack>
					</SectionCard>
				</Stack>
			</ContentContainer>
		</>
	);
}
