import { Alert, Badge, Button, Group, Stack, Text } from '@mantine/core';
import {
	IconAlertTriangle,
	IconGitBranch,
	IconRefresh,
} from '@tabler/icons-react';
import type { SortingState } from '@tanstack/react-table';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useRoleMockStore } from '~/stores/roleMockStore';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { useListPageState } from '~/modules/qa/hooks/useListPageState';
import type {
	EvaluationDisputeListQueryParams,
	EvaluationDisputeSummary,
} from '~/models/qa';
import { useDisputesQuery } from '~/queries/qa/disputesQueries';
import { getErrorMessage } from '~/utils/httpClient';
import DisputesFilters from './DisputesFilters';
import classes from './DisputesListPage.module.css';

export default function DisputesListPage() {
	const { t } = useTranslation('qa.disputes');
	const navigate = useNavigate();
	const { previewRole } = useRoleMockStore();
	const isQAManager = previewRole === 'operationManager';

	const {
		page,
		setPage,
		setPageSize,
		limit,
		sort,
		setSort,
		resetPage,
		getTotalPages,
	} = useListPageState();

	// Filter states - Default: oldest first (ASC)
	const [filters, setFilters] = useState({
		supervisorIds: undefined as number[] | undefined,
		agentIds: undefined as number[] | undefined,
		campaignId: undefined as number | undefined,
		dateRangeStart: undefined as string | undefined,
		dateRangeEnd: undefined as string | undefined,
		sortBy: 'createdAt' as 'createdAt' | 'scoreDelta',
		orderBy: 'ASC' as 'ASC' | 'DESC',
	});

	const isDateRangeInverted =
		Boolean(filters.dateRangeStart && filters.dateRangeEnd) &&
		(filters.dateRangeStart ?? '') > (filters.dateRangeEnd ?? '');

	const queryParams: EvaluationDisputeListQueryParams = {
		page,
		limit,
		supervisorIds: filters.supervisorIds,
		agentIds: filters.agentIds,
		campaignIds: filters.campaignId ? [filters.campaignId] : undefined,
		createdAtFrom: filters.dateRangeStart,
		createdAtTo: filters.dateRangeEnd,
		sortBy: filters.sortBy,
		orderBy: filters.orderBy,
	};

	const disputesQuery = useDisputesQuery(queryParams, !isDateRangeInverted);
	const disputes = disputesQuery.data?.data ?? [];
	const total = disputesQuery.data?.total ?? 0;
	const totalPages = getTotalPages(total);

	const hasActiveFilters =
		(filters.supervisorIds && filters.supervisorIds.length > 0) ||
		(filters.agentIds && filters.agentIds.length > 0) ||
		filters.campaignId ||
		filters.dateRangeStart ||
		filters.dateRangeEnd;

	const dateFormatter = useDateFormatter('dateTime');

	const handleFiltersChange = useCallback(
		(newFilters: Partial<typeof filters>) => {
			setFilters((prev) => ({ ...prev, ...newFilters }));
			resetPage();
		},
		[resetPage]
	);

	const handleSortingChange = (sorting: SortingState) => {
		const first = sorting[0];
		if (first) {
			setSort({ field: first.id, order: first.desc ? 'DESC' : 'ASC' });
		}
	};

	const baseColumns: BaseTableColumnDef<EvaluationDisputeSummary>[] = [
		{
			id: 'id',
			header: 'Dispute ID',
			enableSorting: false,
			cell: ({ row }) => (
				<Text fw={600} size='sm' ff='monospace'>
					#{row.original.id}
				</Text>
			),
		},
		{
			id: 'campaign',
			header: 'Campaign',
			enableSorting: false,
			cell: ({ row }) => (
				<Text size='sm'>
					{row.original.sourceCampaignName ??
						row.original.resultingCampaignName ??
						'—'}
				</Text>
			),
		},
		{
			id: 'callRecording',
			header: 'Call Recording',
			enableSorting: false,
			cell: ({ row }) => (
				<Stack gap='2'>
					<Text fw={500} size='sm'>
						{row.original.sourceInteractionRef ??
							row.original.resultingInteractionRef ??
							'—'}
					</Text>
					<Text c='dimmed' size='xs'>
						{dateFormatter.format(new Date(row.original.createdAt))}
					</Text>
				</Stack>
			),
		},
		{
			id: 'agent',
			header: 'Agent',
			enableSorting: false,
			cell: ({ row }) => (
				<Text size='sm'>
					{row.original.sourceAgentName ??
						row.original.resultingAgentName ??
						'—'}
				</Text>
			),
		},
		{
			id: 'status',
			header: 'Status',
			enableSorting: false,
			cell: ({ row }) => {
				const statusColors: Record<string, string> = {
					open: 'blue',
					approved: 'green',
					rejected: 'red',
				};
				return (
					<Badge color={statusColors[row.original.status]} variant='light'>
						{row.original.status.charAt(0).toUpperCase() +
							row.original.status.slice(1)}
					</Badge>
				);
			},
		},
		{
			id: 'evaluation',
			header: 'Evaluation',
			enableSorting: false,
			cell: ({ row }) => (
				<Text size='sm'>
					{row.original.sourceFormName ?? t('list.chain.unknown')}
				</Text>
			),
		},
	];

	// Add "Reviewed by" column only for QA Manager role
	const columns: BaseTableColumnDef<EvaluationDisputeSummary>[] = isQAManager
		? [
				...baseColumns,
				{
					id: 'reviewedBy',
					header: 'Reviewed by',
					enableSorting: false,
					cell: ({ row }) => (
						<Text size='sm'>
							{row.original.status === 'open'
								? 'N/A'
								: (row.original.resultingEvaluatorUserName ??
									row.original.resultingEvaluatorAgentName ??
									'—')}
						</Text>
					),
				},
			]
		: baseColumns;

	// Hide Agent column for Agent role
	const visibleColumns = !isQAManager
		? columns.filter((col) => col.id !== 'agent')
		: columns;

	return (
		<ContentContainer
			contentWidth='full'
			description={t('list.description')}
			title={t('list.title')}
		>
			<Stack gap='md'>
				<SectionCard>
					<Stack gap='sm'>
						<DisputesFilters
							filters={filters}
							onFiltersChange={handleFiltersChange}
							isLoading={disputesQuery.isLoading}
						/>

						<Group justify='flex-end'>
							<Text c='dimmed' size='sm'>
								{t('list.count', { count: total })}
							</Text>
						</Group>

						{isDateRangeInverted ? (
							<Alert
								color='yellow'
								icon={<IconAlertTriangle size={16} />}
								title={t('list.states.invalidDateRangeTitle')}
								variant='light'
							>
								<Text size='sm'>
									{t('list.states.invalidDateRangeDescription')}
								</Text>
							</Alert>
						) : disputesQuery.isError ? (
							<Alert
								color='red'
								icon={<IconAlertTriangle size={16} />}
								title={t('list.states.errorTitle')}
								variant='light'
							>
								<Group justify='space-between'>
									<Text size='sm'>{getErrorMessage(disputesQuery.error)}</Text>
									<Button
										leftSection={<IconRefresh size={14} />}
										onClick={() => void disputesQuery.refetch()}
										size='xs'
										variant='light'
									>
										{t('list.actions.retry')}
									</Button>
								</Group>
							</Alert>
						) : (
							<>
								{!disputesQuery.isLoading && disputes.length === 0 ? (
									<EmptyState
										description={t(
											hasActiveFilters
												? 'list.states.noMatchesDescription'
												: 'list.states.emptyDescription'
										)}
										icon={<IconGitBranch size={32} />}
										message={t(
											hasActiveFilters
												? 'list.states.noMatchesTitle'
												: 'list.states.emptyTitle'
										)}
									/>
								) : (
									<>
										<BaseTable<EvaluationDisputeSummary>
											columns={visibleColumns}
											data={disputes}
											filterMode='server'
											getRowClassName={() => classes.row}
											getRowId={(dispute) => String(dispute.id)}
											initialSort={[
												{ id: sort.field, desc: sort.order === 'DESC' },
											]}
											isLoading={disputesQuery.isLoading}
											onRowClick={(dispute) =>
												navigate(`/qa/disputes/${dispute.id}`)
											}
											onSortingChange={handleSortingChange}
											skeletonRowsCount={Math.min(limit, 10)}
										/>
										{!disputesQuery.isLoading && total > 0 ? (
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
	);
}
