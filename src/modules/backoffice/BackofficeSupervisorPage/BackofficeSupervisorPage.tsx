import { useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Badge,
	Button,
	Group,
	Menu,
	NumberInput,
	Select,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
} from '@mantine/core';
import { BarChart, DonutChart, LineChart } from '@mantine/charts';
import { modals } from '@mantine/modals';
import {
	IconArrowsRightLeft,
	IconArrowsShuffle,
	IconChartDonut,
	IconChartLine,
	IconCircleCheck,
	IconDots,
	IconEye,
	IconInfoCircle,
	IconRefresh,
	IconUserMinus,
	IconUserPlus,
	IconUsers,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import EmptyState from '~/components/EmptyState';
import MetricInfoCard from '~/components/MetricInfoCard';
import SectionCard from '~/components/SectionCard';
import AppDrawer from '~/components/AppDrawer';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { useChartReady } from '~/modules/qa/hooks/useChartReady';
import { usePermissions } from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import {
	useBackofficeCases,
	useDistributeBackofficeCases,
	useEligibleBackofficeAgents,
	useMarkBackofficeCaseManaged,
	useUpdateBackofficeAssignment,
	useBackofficeSupervisorDashboard,
} from '~/queries/backofficeCaseQueries';
import type {
	BackofficeCase,
	BackofficeCaseStatus,
	BackofficeSupervisorDashboardParams,
} from '~/models/BackofficeCaseModel';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './BackofficeSupervisorPage.module.css';

const PAGE_SIZE = 50;
const ALL_STATUS = 'ALL';
const PERIODS = ['7d', '30d'] as const;
type DashboardPeriod = (typeof PERIODS)[number];

const isStatus = (value: string): value is BackofficeCaseStatus =>
	value === 'UNASSIGNED' || value === 'ASSIGNED' || value === 'MANAGED';

const parsePositiveNumber = (value: string | number | undefined | null) => {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const getUserName = (
	user: BackofficeCase['assignedUser'],
	fallback: string
) => {
	if (!user) return fallback;
	return (
		[user.firstName, user.lastName].filter(Boolean).join(' ') ||
		user.username ||
		fallback
	);
};

const formatDate = (value: string | null | undefined, locale: string) => {
	if (!value) return '—';
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'short',
		timeStyle: 'short',
	}).format(new Date(value));
};

const getPeriodDates = (period: DashboardPeriod) => {
	const to = new Date();
	const from = new Date(to);
	from.setDate(to.getDate() - (period === '7d' ? 6 : 29));
	from.setHours(0, 0, 0, 0);
	return { from: from.toISOString(), to: to.toISOString() };
};

const BackofficeSupervisorPage = () => {
	const { t, i18n } = useTranslation('backoffice-supervisor');
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const chartReady = useChartReady();
	const { canPerformAction } = usePermissions();
	const canUpdate = canPerformAction(
		ModuleEnum.BACKOFFICE_CASES,
		PermissionEnum.UPDATE
	);
	const canDistribute = canPerformAction(
		ModuleEnum.BACKOFFICE_CASES,
		PermissionEnum.MANAGE
	);

	const period = PERIODS.includes(
		(searchParams.get('period') ?? '7d') as DashboardPeriod
	)
		? ((searchParams.get('period') ?? '7d') as DashboardPeriod)
		: '7d';
	const rawStatus = searchParams.get('status') ?? ALL_STATUS;
	const statusFilter =
		rawStatus === ALL_STATUS || isStatus(rawStatus) ? rawStatus : ALL_STATUS;
	const campaignId = parsePositiveNumber(searchParams.get('campaignId'));
	const contactGroupId = parsePositiveNumber(
		searchParams.get('contactGroupId')
	);
	const assignedUserId = parsePositiveNumber(
		searchParams.get('assignedUserId')
	);
	const pageIndex = Math.max(0, Number(searchParams.get('page') ?? 0) || 0);
	const periodDates = useMemo(() => getPeriodDates(period), [period]);

	const dashboardParams = useMemo<BackofficeSupervisorDashboardParams>(
		() => ({
			...periodDates,
			...(campaignId ? { campaignId } : {}),
			...(contactGroupId ? { contactGroupId } : {}),
			...(assignedUserId ? { assignedUserId } : {}),
		}),
		[assignedUserId, campaignId, contactGroupId, periodDates]
	);
	const listParams = useMemo(
		() => ({
			...(statusFilter !== ALL_STATUS
				? { status: statusFilter as BackofficeCaseStatus }
				: {}),
			...(campaignId ? { campaignId } : {}),
			...(contactGroupId ? { contactGroupId } : {}),
			...(assignedUserId ? { assignedUserId } : {}),
			limit: PAGE_SIZE,
			offset: pageIndex * PAGE_SIZE,
		}),
		[assignedUserId, campaignId, contactGroupId, pageIndex, statusFilter]
	);

	const dashboardQuery = useBackofficeSupervisorDashboard(dashboardParams);
	const casesQuery = useBackofficeCases(listParams);
	const agentsQuery = useEligibleBackofficeAgents();
	const distributeMutation = useDistributeBackofficeCases();
	const assignmentMutation = useUpdateBackofficeAssignment();
	const managedMutation = useMarkBackofficeCaseManaged();
	const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
	const [assignmentCase, setAssignmentCase] = useState<BackofficeCase | null>(
		null
	);
	const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);

	useEffect(() => {
		setSelectedRowIds([]);
	}, [assignedUserId, campaignId, contactGroupId, pageIndex, statusFilter]);

	const currentPath = `${location.pathname}${location.search}`;

	const updateFilters = (updates: Record<string, string | number | null>) => {
		const next = new URLSearchParams(searchParams);
		next.delete('page');
		Object.entries(updates).forEach(([key, value]) => {
			if (value === null || value === '' || value === ALL_STATUS) {
				next.delete(key);
			} else {
				next.set(key, String(value));
			}
		});
		setSearchParams(next);
	};

	const agentOptions = useMemo(
		() =>
			agentsQuery.data?.map((agent) => ({
				value: String(agent.id),
				label:
					[agent.firstName, agent.lastName].filter(Boolean).join(' ') ||
					agent.username,
			})) ?? [],
		[agentsQuery.data]
	);

	const openAssignmentDrawer = (caseData: BackofficeCase) => {
		if (!canUpdate || caseData.status === 'MANAGED') return;
		setAssignmentCase(caseData);
		setSelectedAssignee(
			caseData.assignedUserId ? String(caseData.assignedUserId) : null
		);
	};

	const closeAssignmentDrawer = () => {
		if (assignmentMutation.isPending) return;
		setAssignmentCase(null);
		setSelectedAssignee(null);
	};

	const saveAssignment = () => {
		if (!canUpdate || !assignmentCase || assignmentCase.status === 'MANAGED') {
			return;
		}
		const nextAssigneeId = selectedAssignee ? Number(selectedAssignee) : null;
		if (nextAssigneeId === assignmentCase.assignedUserId) return;

		const isTransfer = Boolean(assignmentCase.assignedUserId && nextAssigneeId);
		modals.openConfirmModal({
			title: t(
				isTransfer
					? 'assignment.transferTitle'
					: nextAssigneeId
						? 'assignment.assignTitle'
						: 'assignment.unassignTitle'
			),
			children: (
				<Text size='sm'>
					{t(
						isTransfer
							? 'assignment.transferDescription'
							: nextAssigneeId
								? 'assignment.assignDescription'
								: 'assignment.unassignDescription'
					)}
				</Text>
			),
			labels: {
				confirm: t('assignment.confirm'),
				cancel: t('assignment.cancel'),
			},
			confirmProps: { color: nextAssigneeId ? 'green' : 'red' },
			onConfirm: async () => {
				try {
					await assignmentMutation.mutateAsync({
						id: assignmentCase.id,
						assignedUserId: nextAssigneeId,
					});
					closeAssignmentDrawer();
					notifications.show({
						title: t('notifications.assignmentSuccessTitle'),
						message: t('notifications.assignmentSuccessMessage'),
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						title: t('notifications.actionFailedTitle'),
						message: getErrorMessage(error),
						color: 'red',
					});
				}
			},
		});
	};

	const confirmManaged = (caseData: BackofficeCase) => {
		if (!canUpdate || caseData.status !== 'ASSIGNED') return;
		modals.openConfirmModal({
			title: t('managed.confirmTitle'),
			children: <Text size='sm'>{t('managed.confirmDescription')}</Text>,
			labels: {
				confirm: t('managed.confirm'),
				cancel: t('managed.cancel'),
			},
			confirmProps: { color: 'green' },
			onConfirm: async () => {
				try {
					await managedMutation.mutateAsync(caseData.id);
					notifications.show({
						title: t('notifications.managedSuccessTitle'),
						message: t('notifications.managedSuccessMessage'),
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						title: t('notifications.actionFailedTitle'),
						message: getErrorMessage(error),
						color: 'red',
					});
				}
			},
		});
	};

	const distribute = (caseIds?: number[]) => {
		if (!canDistribute) return;
		const selected = Boolean(caseIds?.length);
		modals.openConfirmModal({
			title: t(
				selected ? 'distribution.selectedTitle' : 'distribution.allTitle'
			),
			children: (
				<Text size='sm'>
					{t(
						selected
							? 'distribution.selectedDescription'
							: 'distribution.allDescription'
					)}
				</Text>
			),
			labels: {
				confirm: t('distribution.confirm'),
				cancel: t('distribution.cancel'),
			},
			confirmProps: { color: 'green' },
			onConfirm: async () => {
				try {
					const result = await distributeMutation.mutateAsync(caseIds);
					setSelectedRowIds([]);
					notifications.show({
						title: t('notifications.distributionSuccessTitle'),
						message: t('notifications.distributionSuccessMessage', {
							requested: result.requested,
							assigned: result.assigned,
							remaining: result.remainingUnassigned,
						}),
						color: result.remainingUnassigned > 0 ? 'yellow' : 'green',
					});
				} catch (error) {
					notifications.show({
						title: t('notifications.actionFailedTitle'),
						message: getErrorMessage(error),
						color: 'red',
					});
				}
			},
		});
	};

	const openCase = (caseData: BackofficeCase) => {
		navigate(`/backoffice/cases/${caseData.id}`, {
			state: { from: currentPath },
		});
	};

	const columns = useMemo<BaseTableColumnDef<BackofficeCase>[]>(
		() => [
			{
				accessorKey: 'id',
				header: t('table.id'),
				size: 85,
				cell: ({ row }) => (
					<Text size='sm' ff='monospace' fw={600}>
						#{row.original.id}
					</Text>
				),
			},
			{
				id: 'contact',
				header: t('table.contact'),
				cell: ({ row }) =>
					row.original.contact
						? `${row.original.contact.firstName} ${row.original.contact.lastName}`.trim()
						: t('common.notAvailable'),
			},
			{
				id: 'campaign',
				header: t('table.campaign'),
				cell: ({ row }) =>
					row.original.campaign?.name ?? t('common.notAvailable'),
			},
			{
				id: 'contactGroup',
				header: t('table.contactGroup'),
				cell: ({ row }) =>
					row.original.contactGroup?.name ?? t('common.notAvailable'),
			},
			{
				accessorKey: 'status',
				header: t('table.status'),
				cell: ({ row }) => (
					<Badge
						color={
							row.original.status === 'MANAGED'
								? 'green'
								: row.original.status === 'ASSIGNED'
									? 'blue'
									: 'gray'
						}
						variant='light'
						size='sm'
					>
						{t(`statuses.${row.original.status}`)}
					</Badge>
				),
			},
			{
				id: 'assignedUser',
				header: t('table.assignedUser'),
				cell: ({ row }) =>
					getUserName(row.original.assignedUser, t('common.unassigned')),
			},
			{
				accessorKey: 'assignedAt',
				header: t('table.assignedAt'),
				cell: ({ row }) => formatDate(row.original.assignedAt, i18n.language),
			},
			{
				accessorKey: 'updatedAt',
				header: t('table.updatedAt'),
				cell: ({ row }) => formatDate(row.original.updatedAt, i18n.language),
			},
			{
				id: 'disposition',
				header: t('table.disposition'),
				cell: ({ row }) =>
					row.original.latestDisposition?.dispositionName ??
					t('common.notAvailable'),
			},
			{
				id: 'actions',
				header: '',
				size: 64,
				cell: ({ row }) => {
					const caseData = row.original;
					return (
						<div
							className={classes.actionCell}
							onClick={(event) => event.stopPropagation()}
						>
							<Menu position='bottom-end' withinPortal shadow='md'>
								<Menu.Target>
									<Button
										variant='subtle'
										color='gray'
										size='compact-sm'
										aria-label={t('table.actionsLabel')}
									>
										<IconDots size={16} />
									</Button>
								</Menu.Target>
								<Menu.Dropdown>
									<Menu.Item
										leftSection={<IconEye size={16} />}
										onClick={() => openCase(caseData)}
									>
										{t('table.view')}
									</Menu.Item>
									{canUpdate && caseData.status !== 'MANAGED' && (
										<>
											<Menu.Item
												leftSection={
													caseData.assignedUserId ? (
														<IconArrowsRightLeft size={16} />
													) : (
														<IconUserPlus size={16} />
													)
												}
												onClick={() => openAssignmentDrawer(caseData)}
											>
												{t(
													caseData.assignedUserId
														? 'table.transfer'
														: 'table.assign'
												)}
											</Menu.Item>
											{caseData.assignedUserId && (
												<Menu.Item
													leftSection={<IconUserMinus size={16} />}
													onClick={() => {
														setAssignmentCase(caseData);
														setSelectedAssignee(null);
													}}
												>
													{t('table.unassign')}
												</Menu.Item>
											)}
											{caseData.status === 'ASSIGNED' && (
												<Menu.Item
													color='green'
													leftSection={<IconCircleCheck size={16} />}
													onClick={() => confirmManaged(caseData)}
												>
													{t('table.markManaged')}
												</Menu.Item>
											)}
										</>
									)}
								</Menu.Dropdown>
							</Menu>
						</div>
					);
				},
			},
		],
		[canUpdate, i18n.language, t]
	);

	const summary = dashboardQuery.data;
	const statusChartData = (summary?.statusBreakdown ?? []).map((item) => ({
		name: t(`statuses.${item.status}`),
		value: item.count,
		color:
			item.status === 'MANAGED'
				? 'green.6'
				: item.status === 'ASSIGNED'
					? 'blue.6'
					: 'gray.6',
	}));
	const trendData = (summary?.dailyTrend ?? []).map((item) => ({
		label: new Intl.DateTimeFormat(i18n.language, {
			month: 'short',
			day: 'numeric',
		}).format(new Date(item.date)),
		created: item.created,
		managed: item.managed,
	}));
	const workloadData = (summary?.agentWorkload ?? []).map((item) => ({
		agentName: item.agentName,
		assigned: item.assigned,
		managed: item.managed,
	}));

	return (
		<ContentContainer
			title={t('page.title')}
			description={t('page.description')}
			contentWidth='full'
			titleRight={
				<Group gap='xs'>
					<Select
						aria-label={t('filters.period')}
						data={[
							{ value: '7d', label: t('periods.7d') },
							{ value: '30d', label: t('periods.30d') },
						]}
						value={period}
						onChange={(value) => updateFilters({ period: value ?? '7d' })}
						size='sm'
						allowDeselect={false}
					/>
					<Button
						variant='default'
						size='sm'
						leftSection={<IconRefresh size={16} />}
						onClick={() => {
							dashboardQuery.refetch();
							casesQuery.refetch();
						}}
						loading={dashboardQuery.isRefetching || casesQuery.isRefetching}
					>
						{t('actions.refresh')}
					</Button>
				</Group>
			}
		>
			<Stack gap='md' className={classes.root}>
				{dashboardQuery.isError && (
					<Alert color='red' icon={<IconInfoCircle size={18} />}>
						{getErrorMessage(dashboardQuery.error)}
					</Alert>
				)}

				<SimpleGrid className={classes.kpiGrid} spacing='sm'>
					{[
						['total', t('kpis.total')],
						['pending', t('kpis.pending')],
						['unassigned', t('kpis.unassigned')],
						['assigned', t('kpis.assigned')],
						['managed', t('kpis.managed')],
						['eligibleAgents', t('kpis.eligibleAgents')],
					].map(([key, label]) => (
						<MetricInfoCard
							key={key}
							label={label}
							value={
								dashboardQuery.isLoading || !summary
									? '—'
									: summary.kpis[key as keyof typeof summary.kpis]
							}
						/>
					))}
				</SimpleGrid>

				<div className={classes.chartsGrid}>
					<SectionCard
						title={t('charts.trend.title')}
						description={t('charts.trend.description')}
						icon={IconChartLine}
					>
						{dashboardQuery.isLoading || !chartReady ? (
							<Skeleton className={classes.chartArea} />
						) : trendData.length === 0 ? (
							<div className={classes.emptyChart}>
								<EmptyState
									icon={<IconChartLine size={32} />}
									message={t('charts.empty.title')}
									description={t('charts.empty.description')}
								/>
							</div>
						) : (
							<LineChart
								className={classes.chartArea}
								data={trendData}
								dataKey='label'
								curveType='monotone'
								gridAxis='y'
								series={[
									{
										name: 'created',
										label: t('charts.trend.created'),
										color: 'blue.6',
									},
									{
										name: 'managed',
										label: t('charts.trend.managed'),
										color: 'green.6',
									},
								]}
								withLegend
							/>
						)}
					</SectionCard>

					<SectionCard
						title={t('charts.status.title')}
						description={t('charts.status.description')}
						icon={IconChartDonut}
					>
						{dashboardQuery.isLoading || !chartReady ? (
							<Skeleton className={classes.chartArea} />
						) : statusChartData.length === 0 ? (
							<div className={classes.emptyChart}>
								<EmptyState
									icon={<IconChartDonut size={32} />}
									message={t('charts.empty.title')}
									description={t('charts.empty.description')}
								/>
							</div>
						) : (
							<DonutChart
								className={classes.chartArea}
								data={statusChartData}
								withTooltip
								withLabels
								chartLabel={String(summary?.kpis.total ?? 0)}
							/>
						)}
					</SectionCard>
				</div>

				<SectionCard
					title={t('charts.workload.title')}
					description={t('charts.workload.description')}
					icon={IconUsers}
				>
					{dashboardQuery.isLoading || !chartReady ? (
						<Skeleton className={classes.chartArea} />
					) : workloadData.length === 0 ? (
						<div className={classes.emptyChart}>
							<EmptyState
								icon={<IconUsers size={32} />}
								message={t('charts.workload.empty')}
								description={t('charts.workload.emptyDescription')}
							/>
						</div>
					) : (
						<BarChart
							className={classes.chartArea}
							data={workloadData}
							dataKey='agentName'
							orientation='vertical'
							gridAxis='x'
							series={[
								{
									name: 'assigned',
									label: t('charts.workload.assigned'),
									color: 'blue.6',
								},
								{
									name: 'managed',
									label: t('charts.workload.managed'),
									color: 'green.6',
								},
							]}
							yAxisProps={{ width: 120 }}
						/>
					)}
				</SectionCard>

				<SectionCard
					title={t('filters.title')}
					description={t('filters.description')}
					icon={IconUsers}
				>
					<div className={classes.filtersGrid}>
						<Select
							label={t('filters.status')}
							data={[
								{ value: ALL_STATUS, label: t('statuses.all') },
								{ value: 'UNASSIGNED', label: t('statuses.UNASSIGNED') },
								{ value: 'ASSIGNED', label: t('statuses.ASSIGNED') },
								{ value: 'MANAGED', label: t('statuses.MANAGED') },
							]}
							value={statusFilter}
							onChange={(value) =>
								updateFilters({ status: value ?? ALL_STATUS })
							}
							size='sm'
							allowDeselect={false}
						/>
						<NumberInput
							label={t('filters.campaignId')}
							placeholder={t('filters.idPlaceholder')}
							value={campaignId ?? ''}
							onChange={(value) =>
								updateFilters({
									campaignId: parsePositiveNumber(value) ?? null,
								})
							}
							min={1}
							allowDecimal={false}
							size='sm'
						/>
						<NumberInput
							label={t('filters.contactGroupId')}
							placeholder={t('filters.idPlaceholder')}
							value={contactGroupId ?? ''}
							onChange={(value) =>
								updateFilters({
									contactGroupId: parsePositiveNumber(value) ?? null,
								})
							}
							min={1}
							allowDecimal={false}
							size='sm'
						/>
						<Select
							label={t('filters.assignedUser')}
							placeholder={t('filters.assignedUserPlaceholder')}
							data={agentOptions}
							value={assignedUserId ? String(assignedUserId) : null}
							onChange={(value) =>
								updateFilters({
									assignedUserId: value ? Number(value) : null,
								})
							}
							searchable
							clearable
							size='sm'
						/>
						<Select
							label={t('filters.period')}
							data={[
								{ value: '7d', label: t('periods.7d') },
								{ value: '30d', label: t('periods.30d') },
							]}
							value={period}
							onChange={(value) => updateFilters({ period: value ?? '7d' })}
							size='sm'
							allowDeselect={false}
						/>
					</div>
				</SectionCard>

				{casesQuery.isError && (
					<Alert color='red' icon={<IconInfoCircle size={18} />}>
						{getErrorMessage(casesQuery.error)}
					</Alert>
				)}

				<SectionCard
					title={t('table.title')}
					description={t('table.description')}
					headerActions={
						<Group gap='xs'>
							{canDistribute &&
								statusFilter === 'UNASSIGNED' &&
								selectedRowIds.length > 0 && (
									<Button
										variant='light'
										size='sm'
										leftSection={<IconArrowsShuffle size={16} />}
										onClick={() => distribute(selectedRowIds.map(Number))}
										loading={distributeMutation.isPending}
									>
										{t('distribution.selectedAction', {
											count: selectedRowIds.length,
										})}
									</Button>
								)}
							{canDistribute && (
								<Button
									variant='light'
									size='sm'
									leftSection={<IconArrowsShuffle size={16} />}
									onClick={() => distribute()}
									loading={distributeMutation.isPending}
								>
									{t('distribution.allAction')}
								</Button>
							)}
						</Group>
					}
				>
					<BaseTable
						data={casesQuery.data?.data ?? []}
						columns={columns}
						getRowId={(row) => row.id}
						onRowClick={openCase}
						isLoading={casesQuery.isLoading}
						emptyMessage={t('table.empty')}
						filterMode='server'
						pageCount={Math.max(
							1,
							Math.ceil((casesQuery.data?.total ?? 0) / PAGE_SIZE)
						)}
						pageIndex={pageIndex}
						pageSize={PAGE_SIZE}
						enablePagination
						showPaginationControls
						onPaginationChange={(nextPage) => updateFilters({ page: nextPage })}
						enableRowSelection={statusFilter === 'UNASSIGNED'}
						selectedRowIds={selectedRowIds}
						onSelectedRowIdsChange={setSelectedRowIds}
						rootProps={{ className: classes.tableRoot }}
					/>
				</SectionCard>
			</Stack>

			<AppDrawer
				opened={Boolean(assignmentCase)}
				onClose={closeAssignmentDrawer}
				title={t(
					assignmentCase?.assignedUserId
						? 'assignment.transferTitle'
						: 'assignment.assignTitle'
				)}
				description={t('assignment.drawerDescription')}
				icon={<IconUserPlus size={18} />}
			>
				<Stack gap='md'>
					{assignmentCase && (
						<Text size='sm'>
							{t('assignment.caseLabel', { id: assignmentCase.id })}
						</Text>
					)}
					<Select
						label={t('assignment.selectAgent')}
						placeholder={t('assignment.selectAgentPlaceholder')}
						data={agentOptions}
						value={selectedAssignee}
						onChange={setSelectedAssignee}
						searchable
						clearable
						error={
							agentsQuery.isError ? t('assignment.agentsLoadError') : undefined
						}
						size='sm'
					/>
					<Button
						className={classes.drawerActions}
						loading={assignmentMutation.isPending}
						disabled={
							!assignmentCase ||
							(selectedAssignee ? Number(selectedAssignee) : null) ===
								assignmentCase.assignedUserId
						}
						onClick={saveAssignment}
					>
						{t('assignment.save')}
					</Button>
				</Stack>
			</AppDrawer>
		</ContentContainer>
	);
};

export default BackofficeSupervisorPage;
