import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Container,
	Group,
	Modal,
	Select,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconAlertTriangle,
	IconEdit,
	IconPlus,
	IconRobot,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard';
import { PageHeader } from '~/components/ui/PageHeader';
import EvaluatorAgentEditorForm from '~/modules/qa/components/EvaluatorAgentEditorForm';
import {
	getActiveStatusColor,
	PROVIDER_COLORS,
} from '~/modules/qa/constants/badgeColors';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { useListPageState } from '~/modules/qa/hooks/useListPageState';
import type {
	CreateEvaluatorAgentPayload,
	EvaluatorAgent,
	LlmProvider,
} from '~/models/qa';
import ProviderHealthStrip from '~/modules/qa/evaluatorAgents/ProviderHealthStrip';
import {
	useCreateEvaluatorAgentMutation,
	useDeleteEvaluatorAgentMutation,
	useEvaluatorAgentsQuery,
	useUpdateEvaluatorAgentMutation,
} from '~/queries/qa/evaluatorAgentsQueries';
import { getErrorMessage } from '~/utils/httpClient';
import { notifyError, notifySuccess } from '~/modules/qa/utils/notifications';
import classes from './EvaluatorAgentsListPage.module.css';

export default function EvaluatorAgentsListPage() {
	const { t } = useTranslation('qa.evaluatorAgents');
	const {
		page,
		setPage,
		setPageSize,
		limit,
		offset,
		search,
		setSearch,
		debouncedSearch,
		resetPage,
		getTotalPages,
	} = useListPageState();
	const [provider, setProvider] = useState<LlmProvider | null>(null);
	const [activeFilter, setActiveFilter] = useState<string | null>(null);
	const [createOpen, setCreateOpen] = useState(false);
	const [editing, setEditing] = useState<EvaluatorAgent | null>(null);
	const evaluatorAgentsQuery = useEvaluatorAgentsQuery({
		limit,
		offset,
		q: debouncedSearch,
		provider: provider ?? undefined,
		isActive: activeFilter === null ? undefined : activeFilter === 'true',
		sortBy: 'createdAt',
		orderBy: 'DESC',
	});
	const createMutation = useCreateEvaluatorAgentMutation();
	const updateMutation = useUpdateEvaluatorAgentMutation(editing?.id ?? NaN);
	const deleteMutation = useDeleteEvaluatorAgentMutation();
	const evaluatorAgents = evaluatorAgentsQuery.data?.data ?? [];
	const total = evaluatorAgentsQuery.data?.total ?? 0;
	const totalPages = getTotalPages(total);
	const hasActiveFilters = Boolean(search.trim() || provider || activeFilter);
	const dateFormatter = useDateFormatter('date');

	const createEvaluatorAgent = async (payload: CreateEvaluatorAgentPayload) => {
		await createMutation.mutateAsync(payload);
		setCreateOpen(false);
		notifySuccess(t('notifications.created'));
	};

	const updateEvaluatorAgent = async (payload: CreateEvaluatorAgentPayload) => {
		await updateMutation.mutateAsync(payload);
		setEditing(null);
		notifySuccess(t('notifications.updated'));
	};

	const confirmDelete = (agent: EvaluatorAgent) => {
		modals.openConfirmModal({
			title: t('delete.title'),
			centered: true,
			labels: {
				confirm: t('actions.delete'),
				cancel: t('actions.cancel'),
			},
			confirmProps: { color: 'red', loading: deleteMutation.isPending },
			children: (
				<Text size='sm'>{t('delete.description', { name: agent.name })}</Text>
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

	const columns: BaseTableColumnDef<EvaluatorAgent>[] = [
		{
			id: 'name',
			header: t('table.name'),
			cell: ({ row }) => (
				<Text fw={700} size='sm'>
					{row.original.name}
				</Text>
			),
		},
		{
			id: 'provider',
			header: t('table.provider'),
			cell: ({ row }) => (
				<Badge color={PROVIDER_COLORS[row.original.provider]} variant='light'>
					{t(`providers.${row.original.provider.toLowerCase()}`)}
				</Badge>
			),
		},
		{
			id: 'model',
			header: t('table.model'),
			cell: ({ row }) => (
				<Text ff='monospace' size='sm'>
					{row.original.model}
				</Text>
			),
		},
		{
			id: 'active',
			header: t('table.active'),
			cell: ({ row }) => (
				<Badge
					color={getActiveStatusColor(row.original.isActive)}
					variant='light'
				>
					{t(row.original.isActive ? 'states.active' : 'states.inactive')}
				</Badge>
			),
		},
		{
			id: 'updatedAt',
			header: t('table.updatedAt'),
			cell: ({ row }) => (
				<Text c='dimmed' size='sm'>
					{row.original.updatedAt
						? dateFormatter.format(new Date(row.original.updatedAt))
						: t('common.notAvailable')}
				</Text>
			),
		},
		{
			id: 'actions',
			header: t('table.actions'),
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
							onClick={() => setEditing(row.original)}
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
							onClick={() => confirmDelete(row.original)}
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
				size='lg'
				title={t('form.createTitle')}
			>
				<EvaluatorAgentEditorForm
					loading={createMutation.isPending}
					onCancel={() => setCreateOpen(false)}
					onSubmit={createEvaluatorAgent}
				/>
			</Modal>

			<Modal
				onClose={() => setEditing(null)}
				opened={Boolean(editing)}
				size='lg'
				title={t('form.editTitle')}
			>
				<EvaluatorAgentEditorForm
					evaluatorAgent={editing}
					loading={updateMutation.isPending}
					onCancel={() => setEditing(null)}
					onSubmit={updateEvaluatorAgent}
				/>
			</Modal>

			<Container className={classes.page} fluid>
				<Stack gap='md'>
					<PageHeader
						actions={
							<Button
								leftSection={<IconPlus size={16} />}
								onClick={() => setCreateOpen(true)}
								size='sm'
							>
								{t('actions.new')}
							</Button>
						}
						description={t('description')}
						title={t('title')}
					/>

					<ProviderHealthStrip />

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
										className={classes.filter}
										clearable
										data={[
											{ label: t('providers.openai'), value: 'OPENAI' },
											{ label: t('providers.gemini'), value: 'GEMINI' },
											{ label: t('providers.bedrock'), value: 'BEDROCK' },
										]}
										onChange={(value) => {
											setProvider(value as LlmProvider | null);
											resetPage();
										}}
										placeholder={t('filters.provider')}
										size='sm'
										value={provider}
									/>
									<Select
										className={classes.filter}
										clearable
										data={[
											{ label: t('states.active'), value: 'true' },
											{ label: t('states.inactive'), value: 'false' },
										]}
										onChange={(value) => {
											setActiveFilter(value);
											resetPage();
										}}
										placeholder={t('filters.status')}
										size='sm'
										value={activeFilter}
									/>
								</Group>
								<Text c='dimmed' size='sm'>
									{t('filters.count', { count: total })}
								</Text>
							</Group>

							{evaluatorAgentsQuery.isError ? (
								<Alert
									color='red'
									icon={<IconAlertTriangle size={16} />}
									title={t('states.errorTitle')}
									variant='light'
								>
									{getErrorMessage(evaluatorAgentsQuery.error)}
								</Alert>
							) : null}

							{!evaluatorAgentsQuery.isLoading &&
							!evaluatorAgentsQuery.isError &&
							evaluatorAgents.length === 0 ? (
								<EmptyState
									action={
										<Button
											leftSection={<IconRobot size={16} />}
											onClick={() => setCreateOpen(true)}
											size='sm'
											variant='light'
										>
											{t('actions.new')}
										</Button>
									}
									description={t(
										hasActiveFilters
											? 'states.noMatchesDescription'
											: 'states.emptyDescription'
									)}
									icon={<IconRobot size={32} />}
									message={t(
										hasActiveFilters
											? 'states.noMatchesTitle'
											: 'states.emptyTitle'
									)}
								/>
							) : null}

							{evaluatorAgentsQuery.isLoading || evaluatorAgents.length > 0 ? (
								<>
									<BaseTable<EvaluatorAgent>
										columns={columns}
										data={evaluatorAgents}
										getRowId={(agent) => String(agent.id)}
										isLoading={evaluatorAgentsQuery.isLoading}
									/>
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
								</>
							) : null}
						</Stack>
					</SectionCard>
				</Stack>
			</Container>
		</>
	);
}
