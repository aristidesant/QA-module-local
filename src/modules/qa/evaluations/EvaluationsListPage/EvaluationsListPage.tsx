import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Container,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconAlertTriangle,
	IconArrowRight,
	IconClipboardCheck,
	IconPlus,
	IconRefresh,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';
import type { SortingState } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Link as RouterLink,
	useLocation,
	useNavigate,
	useSearchParams,
} from 'react-router';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PageHeader from '~/components/ui/PageHeader';
import SectionCard from '~/components/SectionCard';
import PaginationControls from '~/components/PaginationControls';
import {
	AI_EVALUATION_STATUS_COLORS,
	EVALUATION_STATUS_COLORS,
	EVALUATOR_TYPE_COLORS,
} from '~/modules/qa/constants/badgeColors';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { useListPageState } from '~/modules/qa/hooks/useListPageState';
import type {
	AiEvaluationStatus,
	Evaluation,
	EvaluationListQueryParams,
	EvaluationStatus,
	EvaluatorType,
} from '~/models/qa';
import NewEvaluationModal from '~/modules/qa/evaluations/NewEvaluationModal';
import {
	useDeleteEvaluationMutation,
	useEvaluationsQuery,
} from '~/queries/qa/evaluationsQueries';
import { getAgentDisplayName } from '~/modules/qa/utils/agent';
import { formatScorePct } from '~/modules/qa/utils/format';
import { getErrorMessage } from '~/utils/httpClient';
import { notifyError, notifySuccess } from '~/modules/qa/utils/notifications';
import classes from './EvaluationsListPage.module.css';

export default function EvaluationsListPage() {
	const { t } = useTranslation('qa.evaluations');
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const isNewRoute = location.pathname === '/qa/evaluations/new';
	const {
		page,
		setPage,
		setPageSize,
		limit,
		offset,
		search: interactionRef,
		setSearch: setInteractionRef,
		debouncedSearch: debouncedInteractionRef,
		sort,
		setSort,
		resetPage,
		getTotalPages,
	} = useListPageState();
	const [status, setStatus] = useState<EvaluationStatus | null>(null);
	const [evaluatorType, setEvaluatorType] = useState<EvaluatorType | null>(
		null
	);
	const [aiEvaluationStatus, setAiEvaluationStatus] =
		useState<AiEvaluationStatus | null>(null);
	const evaluationsQuery = useEvaluationsQuery({
		limit,
		offset,
		interactionRef: debouncedInteractionRef.trim() || undefined,
		status: status ?? undefined,
		evaluatorType: evaluatorType ?? undefined,
		aiEvaluationStatus: aiEvaluationStatus ?? undefined,
		sortBy: sort.field as EvaluationListQueryParams['sortBy'],
		orderBy: sort.order,
	});
	const evaluations = evaluationsQuery.data?.data ?? [];
	const total = evaluationsQuery.data?.total ?? 0;
	const totalPages = getTotalPages(total);
	const hasActiveFilters = Boolean(
		interactionRef.trim() || status || evaluatorType || aiEvaluationStatus
	);
	const deleteMutation = useDeleteEvaluationMutation();
	const dateFormatter = useDateFormatter('dateTime');

	const confirmDelete = (evaluation: Evaluation) => {
		modals.openConfirmModal({
			title: t('delete.title'),
			centered: true,
			labels: { confirm: t('delete.confirm'), cancel: t('delete.cancel') },
			confirmProps: { color: 'red' },
			children: (
				<Text size='sm'>
					{t('delete.description', {
						ref: evaluation.interactionRef || t('list.notAvailable'),
					})}
				</Text>
			),
			onConfirm: async () => {
				try {
					await deleteMutation.mutateAsync(evaluation.id);
					notifySuccess(t('delete.notification'));
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

	const columns: BaseTableColumnDef<Evaluation>[] = [
		{
			accessorKey: 'status',
			header: t('list.table.status'),
			cell: ({ row: { original: evaluation } }) => (
				<Badge
					color={EVALUATION_STATUS_COLORS[evaluation.status]}
					variant='light'
				>
					{t(`status.${evaluation.status.toLowerCase()}`)}
				</Badge>
			),
		},
		{
			accessorKey: 'agentId',
			header: t('list.table.agent'),
			cell: ({ row: { original: evaluation } }) => (
				<Text fw={600} size='sm'>
					{evaluation.agent
						? getAgentDisplayName(evaluation.agent)
						: t('list.agentFallback', { id: evaluation.agentId })}
				</Text>
			),
		},
		{
			accessorKey: 'formName',
			header: t('list.table.form'),
			cell: ({ row: { original: evaluation } }) => (
				<Stack gap={2}>
					<Text fw={600} size='sm'>
						{evaluation.formName}
					</Text>
					{evaluation.formCategory ? (
						<Text c='dimmed' size='xs'>
							{evaluation.formCategory}
						</Text>
					) : null}
				</Stack>
			),
		},
		{
			id: 'interaction',
			header: t('list.table.interaction'),
			enableSorting: false,
			cell: ({ row: { original: evaluation } }) => (
				<Text c={evaluation.interactionRef ? undefined : 'dimmed'} size='sm'>
					{evaluation.interactionRef || t('list.notAvailable')}
				</Text>
			),
		},
		{
			accessorKey: 'evaluatorType',
			header: t('list.table.evaluator'),
			cell: ({ row: { original: evaluation } }) => (
				<Stack gap={4}>
					<Badge
						color={EVALUATOR_TYPE_COLORS[evaluation.evaluatorType]}
						variant='light'
						w='fit-content'
					>
						{t(`list.evaluatorTypes.${evaluation.evaluatorType.toLowerCase()}`)}
					</Badge>
					{evaluation.evaluatorType === 'AI' &&
					evaluation.aiEvaluationStatus ? (
						<Badge
							color={AI_EVALUATION_STATUS_COLORS[evaluation.aiEvaluationStatus]}
							size='xs'
							variant='light'
							w='fit-content'
						>
							{t(`aiStatus.${evaluation.aiEvaluationStatus.toLowerCase()}`)}
						</Badge>
					) : null}
				</Stack>
			),
		},
		{
			accessorKey: 'overallScorePct',
			header: t('list.table.score'),
			cell: ({ row: { original: evaluation } }) => (
				<Text
					c={evaluation.overallScorePct == null ? 'dimmed' : undefined}
					fw={evaluation.overallScorePct == null ? 400 : 700}
					size='sm'
				>
					{evaluation.overallScorePct == null
						? t('list.notAvailable')
						: t('list.scoreValue', {
								score: formatScorePct(evaluation.overallScorePct),
							})}
				</Text>
			),
		},
		{
			accessorKey: 'createdAt',
			id: 'createdAt',
			header: t('list.table.date'),
			cell: ({ row: { original: evaluation } }) => {
				const date = evaluation.evaluatedAt ?? evaluation.createdAt;

				return (
					<Text c='dimmed' size='sm'>
						{date
							? dateFormatter.format(new Date(date))
							: t('list.notAvailable')}
					</Text>
				);
			},
		},
		{
			id: 'actions',
			header: t('list.table.actions'),
			enableSorting: false,
			cell: ({ row: { original: evaluation } }) => (
				<Group
					className={classes.actions}
					gap='xs'
					justify='flex-end'
					wrap='nowrap'
				>
					<Tooltip label={t('list.actions.open')}>
						<ActionIcon
							aria-label={t('list.actions.open')}
							onClick={(event) => {
								event.stopPropagation();
								navigate(`/qa/evaluations/${evaluation.id}`);
							}}
							radius='md'
							variant='light'
						>
							<IconArrowRight size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('list.actions.delete')}>
						<ActionIcon
							aria-label={t('list.actions.delete')}
							color='red'
							onClick={(event) => {
								event.stopPropagation();
								confirmDelete(evaluation);
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
			{isNewRoute ? (
				<NewEvaluationModal
					initialAgentId={searchParams.get('agentId')}
					initialCampaignId={searchParams.get('campaignId')}
					onClose={() => navigate('/qa/evaluations')}
					opened
				/>
			) : null}

			<Container className={classes.page} fluid>
				<Stack gap='md'>
					<PageHeader
						actions={
							<Button
								component={RouterLink}
								leftSection={<IconPlus size={16} />}
								size='sm'
								to='/qa/evaluations/new'
							>
								{t('list.actions.new')}
							</Button>
						}
						description={t('list.description')}
						title={t('list.title')}
					/>

					<SectionCard>
						<Stack gap='sm'>
							<Group className={classes.toolbar} justify='space-between'>
								<Group className={classes.filters} gap='xs'>
									<TextInput
										className={classes.search}
										leftSection={<IconSearch size={16} />}
										onChange={(event) =>
											setInteractionRef(event.currentTarget.value)
										}
										placeholder={t('list.filters.interaction')}
										size='sm'
										value={interactionRef}
									/>
									<Select
										className={classes.filter}
										clearable
										data={[
											{ label: t('status.draft'), value: 'DRAFT' },
											{ label: t('status.completed'), value: 'COMPLETED' },
										]}
										onChange={(value) => {
											setStatus(value as EvaluationStatus | null);
											resetPage();
										}}
										placeholder={t('list.filters.status')}
										size='sm'
										value={status}
									/>
									<Select
										className={classes.filter}
										clearable
										data={[
											{
												label: t('list.evaluatorTypes.human'),
												value: 'HUMAN',
											},
											{ label: t('list.evaluatorTypes.ai'), value: 'AI' },
										]}
										onChange={(value) => {
											setEvaluatorType(value as EvaluatorType | null);
											resetPage();
										}}
										placeholder={t('list.filters.evaluator')}
										size='sm'
										value={evaluatorType}
									/>
									<Select
										className={classes.filter}
										clearable
										data={[
											{ label: t('aiStatus.pending'), value: 'PENDING' },
											{ label: t('aiStatus.processing'), value: 'PROCESSING' },
											{ label: t('aiStatus.completed'), value: 'COMPLETED' },
											{ label: t('aiStatus.failed'), value: 'FAILED' },
										]}
										onChange={(value) => {
											setAiEvaluationStatus(value as AiEvaluationStatus | null);
											resetPage();
										}}
										placeholder={t('list.filters.aiStatus')}
										size='sm'
										value={aiEvaluationStatus}
									/>
								</Group>
								<Text c='dimmed' size='sm'>
									{t('list.count', { count: total })}
								</Text>
							</Group>

							{evaluationsQuery.isError ? (
								<Alert
									color='red'
									icon={<IconAlertTriangle size={16} />}
									title={t('list.states.errorTitle')}
									variant='light'
								>
									<Group align='center' justify='space-between'>
										<Text size='sm'>
											{getErrorMessage(evaluationsQuery.error)}
										</Text>
										<Button
											leftSection={<IconRefresh size={14} />}
											onClick={() => void evaluationsQuery.refetch()}
											size='xs'
											variant='light'
										>
											{t('list.actions.retry')}
										</Button>
									</Group>
								</Alert>
							) : (
								<>
									{!evaluationsQuery.isLoading && evaluations.length === 0 ? (
										<EmptyState
											action={
												<Button
													component={RouterLink}
													leftSection={<IconPlus size={16} />}
													size='sm'
													to='/qa/evaluations/new'
													variant='light'
												>
													{t('list.actions.new')}
												</Button>
											}
											description={t(
												hasActiveFilters
													? 'list.states.noMatchesDescription'
													: 'list.states.emptyDescription'
											)}
											icon={<IconClipboardCheck size={32} />}
											message={t(
												hasActiveFilters
													? 'list.states.noMatchesTitle'
													: 'list.states.emptyTitle'
											)}
										/>
									) : (
										<>
											<BaseTable<Evaluation>
												columns={columns}
												data={evaluations}
												filterMode='server'
												getRowClassName={() => classes.row}
												getRowId={(evaluation) => String(evaluation.id)}
												initialSort={[
													{ id: sort.field, desc: sort.order === 'DESC' },
												]}
												isLoading={evaluationsQuery.isLoading}
												onRowClick={(evaluation) =>
													navigate(`/qa/evaluations/${evaluation.id}`)
												}
												onSortingChange={handleSortingChange}
												skeletonRowsCount={Math.min(limit, 10)}
											/>
											{!evaluationsQuery.isLoading && total > 0 ? (
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
			</Container>
		</>
	);
}
