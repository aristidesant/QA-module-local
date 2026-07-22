import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Group,
	Modal,
	Select,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
	IconAlertTriangle,
	IconEdit,
	IconPlus,
	IconSearch,
	IconTrash,
	IconUser,
	IconUsers,
} from '@tabler/icons-react';
import type { SortingState } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import AgentEditorForm from '~/modules/qa/components/AgentEditorForm';
import { AGENT_TYPE_COLORS } from '~/modules/qa/constants/badgeColors';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { useListPageState } from '~/modules/qa/hooks/useListPageState';
import type {
	Agent,
	AgentListQueryParams,
	AgentType,
	CreateAgentPayload,
	UpdateAgentPayload,
} from '~/models/qa';
import {
	useCreateAgentMutation,
	useDeleteAgentMutation,
	useAgentsQuery,
	useUpdateAgentMutation,
} from '~/queries/qa/agentsQueries';
import {
	getAgentDisplayName,
	isAutoMigratedAgent,
} from '~/modules/qa/utils/agent';
import { getErrorMessage } from '~/utils/httpClient';
import { notifyError, notifySuccess } from '~/modules/qa/utils/notifications';
import classes from './AgentsListPage.module.css';

export default function AgentsListPage() {
	const { t } = useTranslation('qa.agents');
	const navigate = useNavigate();
	const {
		page,
		setPage,
		setPageSize,
		limit,
		offset,
		search,
		setSearch,
		debouncedSearch,
		sort,
		setSort,
		resetPage,
		getTotalPages,
	} = useListPageState();
	const [agentType, setAgentType] = useState<AgentType | null>(null);
	const [team, setTeam] = useState('');
	const [debouncedTeam] = useDebouncedValue(team, 300);
	const [createOpen, setCreateOpen] = useState(false);
	const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
	const agentsQuery = useAgentsQuery({
		limit,
		offset,
		q: debouncedSearch,
		agentType: agentType ?? undefined,
		team: debouncedTeam,
		sortBy: sort.field as AgentListQueryParams['sortBy'],
		orderBy: sort.order,
	});
	const createMutation = useCreateAgentMutation();
	const updateMutation = useUpdateAgentMutation(editingAgent?.id ?? NaN);
	const deleteMutation = useDeleteAgentMutation();
	const agents = agentsQuery.data?.data ?? [];
	const total = agentsQuery.data?.total ?? 0;
	const totalPages = getTotalPages(total);
	const dateFormatter = useDateFormatter('date');

	const createAgent = async (
		payload: CreateAgentPayload | UpdateAgentPayload
	) => {
		if (!('employeeId' in payload)) return;
		await createMutation.mutateAsync(payload);
		setCreateOpen(false);
		notifySuccess(t('notifications.created'));
	};

	const updateAgent = async (
		payload: CreateAgentPayload | UpdateAgentPayload
	) => {
		if ('employeeId' in payload) return;
		await updateMutation.mutateAsync(payload);
		setEditingAgent(null);
		notifySuccess(t('notifications.updated'));
	};

	const confirmDelete = (agent: Agent) => {
		modals.openConfirmModal({
			title: t('delete.title'),
			centered: true,
			labels: {
				confirm: t('actions.delete'),
				cancel: t('actions.cancel'),
			},
			confirmProps: { color: 'red' },
			children: (
				<Stack gap='xs'>
					<Text size='sm'>
						{t('delete.description', { name: getAgentDisplayName(agent) })}
					</Text>
					<Text c='dimmed' size='xs'>
						{t('delete.referencedHint')}
					</Text>
				</Stack>
			),
			onConfirm: async () => {
				try {
					await deleteMutation.mutateAsync(agent.id);
					notifySuccess(t('notifications.deleted'));
				} catch (error) {
					notifyError(error);
				}
			},
		});
	};

	const handleSortingChange = (sorting: SortingState) => {
		const first = sorting[0];
		if (first) {
			setSort({ field: first.id, order: first.desc ? 'DESC' : 'ASC' });
		}
	};

	const columns: BaseTableColumnDef<Agent>[] = [
		{
			accessorKey: 'employeeId',
			header: t('table.employeeId'),
			cell: ({ row }) => (
				<Group gap='xs' wrap='nowrap'>
					<Text fw={700} size='sm'>
						{row.original.employeeId}
					</Text>
					{isAutoMigratedAgent(row.original) ? (
						<Badge color='yellow' size='xs' variant='light'>
							{t('badges.autoMigrated')}
						</Badge>
					) : null}
				</Group>
			),
		},
		{
			accessorKey: 'firstName',
			header: t('table.name'),
			cell: ({ row }) => (
				<Text size='sm'>{getAgentDisplayName(row.original)}</Text>
			),
		},
		{
			id: 'type',
			header: t('table.type'),
			enableSorting: false,
			cell: ({ row }) => (
				<Badge
					color={AGENT_TYPE_COLORS[row.original.agentType]}
					variant='light'
				>
					{t(
						`types.${row.original.agentType === 'AI_BOT' ? 'aiBot' : 'human'}`
					)}
				</Badge>
			),
		},
		{
			id: 'email',
			header: t('table.email'),
			enableSorting: false,
			cell: ({ row }) => (
				<Text c={row.original.email ? undefined : 'dimmed'} size='sm'>
					{row.original.email || t('common.notProvided')}
				</Text>
			),
		},
		{
			id: 'team',
			header: t('table.team'),
			enableSorting: false,
			cell: ({ row }) => (
				<Text c={row.original.team ? undefined : 'dimmed'} size='sm'>
					{row.original.team || t('common.notProvided')}
				</Text>
			),
		},
		{
			accessorKey: 'createdAt',
			header: t('table.createdAt'),
			cell: ({ row }) => (
				<Text c='dimmed' size='sm'>
					{row.original.createdAt
						? dateFormatter.format(new Date(row.original.createdAt))
						: t('common.notAvailable')}
				</Text>
			),
		},
		{
			id: 'actions',
			header: t('table.actions'),
			enableSorting: false,
			cell: ({ row }) => (
				<Group
					className={classes.actions}
					gap='xs'
					justify='flex-end'
					wrap='nowrap'
				>
					<Tooltip label={t('actions.edit')}>
						<ActionIcon
							aria-label={t('actions.edit')}
							onClick={(event) => {
								event.stopPropagation();
								setEditingAgent(row.original);
							}}
							radius='md'
							variant='light'
						>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('actions.delete')}>
						<ActionIcon
							aria-label={t('actions.delete')}
							color='red'
							onClick={(event) => {
								event.stopPropagation();
								confirmDelete(row.original);
							}}
							radius='md'
							variant='subtle'
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			),
		},
	];

	return (
		<>
			<Modal
				onClose={() => setCreateOpen(false)}
				opened={createOpen}
				size='md'
				title={t('form.createTitle')}
			>
				<AgentEditorForm
					loading={createMutation.isPending}
					onCancel={() => setCreateOpen(false)}
					onSubmit={createAgent}
				/>
			</Modal>

			<Modal
				onClose={() => setEditingAgent(null)}
				opened={Boolean(editingAgent)}
				size='md'
				title={t('form.editTitle')}
			>
				<AgentEditorForm
					agent={editingAgent}
					loading={updateMutation.isPending}
					onCancel={() => setEditingAgent(null)}
					onSubmit={updateAgent}
				/>
			</Modal>

			<ContentContainer
				contentWidth='full'
				description={t('description')}
				title={t('title')}
				titleRight={
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => setCreateOpen(true)}
						size='sm'
					>
						{t('actions.new')}
					</Button>
				}
			>
				<Stack gap='md'>
					<SectionCard>
						<Stack gap='sm'>
							<Group className={classes.toolbar} justify='space-between'>
								<Group className={classes.filters} gap='xs'>
									<TextInput
										className={classes.search}
										leftSection={<IconSearch size={16} />}
										onChange={(event) => setSearch(event.currentTarget.value)}
										placeholder={t('filters.search')}
										size='sm'
										value={search}
									/>
									<Select
										className={classes.typeFilter}
										clearable
										data={[
											{ label: t('types.human'), value: 'HUMAN' },
											{ label: t('types.aiBot'), value: 'AI_BOT' },
										]}
										onChange={(value) => {
											setAgentType(value as AgentType | null);
											resetPage();
										}}
										placeholder={t('filters.type')}
										size='sm'
										value={agentType}
									/>
									<TextInput
										className={classes.teamFilter}
										onChange={(event) => {
											setTeam(event.currentTarget.value);
											resetPage();
										}}
										placeholder={t('filters.team')}
										size='sm'
										value={team}
									/>
								</Group>
								<Text c='dimmed' size='sm'>
									{t('filters.count', { count: total })}
								</Text>
							</Group>

							{agentsQuery.isError ? (
								<Alert
									color='red'
									icon={<IconAlertTriangle size={16} />}
									title={t('states.errorTitle')}
									variant='light'
								>
									{getErrorMessage(agentsQuery.error)}
								</Alert>
							) : (
								<>
									{!agentsQuery.isLoading && agents.length === 0 ? (
										<EmptyState
											action={
												<Button
													leftSection={<IconUser size={16} />}
													onClick={() => setCreateOpen(true)}
													size='sm'
													variant='light'
												>
													{t('actions.new')}
												</Button>
											}
											description={t('states.emptyDescription')}
											icon={<IconUsers size={32} />}
											message={t('states.emptyTitle')}
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
												onRowClick={(agent) =>
													navigate(`/qa/agents/${agent.id}`)
												}
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
