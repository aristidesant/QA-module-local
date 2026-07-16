import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import {
	IconAlertTriangle,
	IconArrowRight,
	IconGitBranch,
	IconRefresh,
	IconRobot,
	IconUserCheck,
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
import { EVALUATOR_TYPE_COLORS } from '~/modules/qa/constants/badgeColors';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { useListPageState } from '~/modules/qa/hooks/useListPageState';
import type {
	EvaluationDisputeListQueryParams,
	EvaluationDisputeSummary,
	EvaluatorType,
} from '~/models/qa';
import { useDisputesQuery } from '~/queries/qa/disputesQueries';
import { formatPoints, formatScorePct } from '~/modules/qa/utils/format';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './DisputesListPage.module.css';

function ScoreChange({ dispute }: { dispute: EvaluationDisputeSummary }) {
	const { t } = useTranslation('qa.disputes');

	return (
		<Group gap='xs' wrap='nowrap'>
			<Badge color='gray' variant='light'>
				{t('list.chain.originalScore', {
					score: formatScorePct(dispute.before.overallScorePct),
				})}
			</Badge>
			<IconArrowRight size={16} />
			<Badge color={dispute.scoreDelta >= 0 ? 'green' : 'red'} variant='light'>
				{t('list.chain.correctedScore', {
					score: formatScorePct(dispute.after.overallScorePct),
				})}
			</Badge>
		</Group>
	);
}

function EvaluatorTypeBadge({ type }: { type?: EvaluatorType | null }) {
	const { t } = useTranslation('qa.disputes');
	if (!type) return null;

	const TypeIcon = type === 'AI' ? IconRobot : IconUserCheck;

	return (
		<Badge
			color={EVALUATOR_TYPE_COLORS[type]}
			leftSection={<TypeIcon size={12} />}
			size='xs'
			variant='light'
		>
			{t(`list.evaluatorTypes.${type.toLowerCase()}`)}
		</Badge>
	);
}

export default function DisputesListPage() {
	const { t } = useTranslation('qa.disputes');
	const navigate = useNavigate();
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
	const [createdAtFrom, setCreatedAtFrom] = useState('');
	const [createdAtTo, setCreatedAtTo] = useState('');
	const isDateRangeInverted =
		Boolean(createdAtFrom && createdAtTo) && createdAtFrom > createdAtTo;
	const queryParams: EvaluationDisputeListQueryParams = {
		page,
		limit,
		createdAtFrom: createdAtFrom || undefined,
		createdAtTo: createdAtTo || undefined,
		sortBy: sort.field as EvaluationDisputeListQueryParams['sortBy'],
		orderBy: sort.order,
	};
	const disputesQuery = useDisputesQuery(queryParams, !isDateRangeInverted);
	const disputes = disputesQuery.data?.data ?? [];
	const total = disputesQuery.data?.total ?? 0;
	const totalPages = getTotalPages(total);
	const hasActiveFilters = Boolean(createdAtFrom || createdAtTo);
	const dateFormatter = useDateFormatter('dateTime');

	const handleSortingChange = (sorting: SortingState) => {
		const first = sorting[0];
		if (first) {
			setSort({ field: first.id, order: first.desc ? 'DESC' : 'ASC' });
		}
	};

	const columns: BaseTableColumnDef<EvaluationDisputeSummary>[] = [
		{
			id: 'evaluationChain',
			header: t('list.table.evaluationChain'),
			enableSorting: false,
			cell: ({ row }) => (
				<Stack gap='xs'>
					<ScoreChange dispute={row.original} />
					<Group gap='xs'>
						<Badge color='blue' size='xs' variant='light'>
							{t('list.chain.createdVersion', {
								version: row.original.resultingVersion,
							})}
						</Badge>
						<EvaluatorTypeBadge type={row.original.sourceEvaluatorType} />
					</Group>
					{row.original.sourceFormName || row.original.resultingFormName ? (
						<Text c='dimmed' lineClamp={2} size='xs'>
							{t('list.chain.summary', {
								form:
									row.original.sourceFormName ??
									row.original.resultingFormName ??
									t('list.chain.unknown'),
								agent:
									row.original.sourceAgentName ??
									row.original.resultingAgentName ??
									t('list.chain.unknown'),
							})}
						</Text>
					) : null}
				</Stack>
			),
		},
		{
			id: 'reason',
			header: t('list.table.reason'),
			enableSorting: false,
			cell: ({ row }) => (
				<Text className={classes.reasonCell} lineClamp={2} size='sm'>
					{row.original.reason}
				</Text>
			),
		},
		{
			accessorKey: 'scoreDelta',
			header: t('list.table.scoreDelta'),
			cell: ({ row }) => (
				<Badge
					color={row.original.scoreDelta >= 0 ? 'green' : 'red'}
					variant='light'
				>
					{t('scoreDelta', { delta: formatPoints(row.original.scoreDelta) })}
				</Badge>
			),
		},
		{
			accessorKey: 'createdAt',
			header: t('list.table.createdAt'),
			cell: ({ row }) => (
				<Text c='dimmed' size='sm'>
					{dateFormatter.format(new Date(row.original.createdAt))}
				</Text>
			),
		},
		{
			id: 'actions',
			header: t('list.table.actions'),
			enableSorting: false,
			cell: ({ row }) => (
				<Group justify='flex-end'>
					<Tooltip label={t('list.actions.open')}>
						<ActionIcon
							aria-label={t('list.actions.open')}
							onClick={(event) => {
								event.stopPropagation();
								navigate(`/qa/disputes/${row.original.id}`);
							}}
							radius='md'
							variant='light'
						>
							<IconArrowRight size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			),
		},
	];

	return (
		<ContentContainer
			contentWidth='full'
			description={t('list.description')}
			title={t('list.title')}
		>
			<Stack gap='md'>
				<SectionCard>
					<Stack gap='sm'>
						<Group className={classes.toolbar} justify='space-between'>
							<Group className={classes.filters} gap='xs'>
								<TextInput
									className={classes.dateFilter}
									label={t('list.filters.createdAtFrom')}
									onChange={(event) => {
										setCreatedAtFrom(event.currentTarget.value);
										resetPage();
									}}
									size='sm'
									type='date'
									value={createdAtFrom}
								/>
								<TextInput
									className={classes.dateFilter}
									label={t('list.filters.createdAtTo')}
									onChange={(event) => {
										setCreatedAtTo(event.currentTarget.value);
										resetPage();
									}}
									size='sm'
									type='date'
									value={createdAtTo}
								/>
								<Select
									className={classes.filter}
									data={[
										{ label: t('list.order.desc'), value: 'DESC' },
										{ label: t('list.order.asc'), value: 'ASC' },
									]}
									label={t('list.filters.order')}
									onChange={(value) => {
										setSort({
											...sort,
											order: value === 'ASC' ? 'ASC' : 'DESC',
										});
									}}
									size='sm'
									value={sort.order}
								/>
							</Group>
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
											columns={columns}
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
