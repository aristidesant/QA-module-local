import { useEffect, useMemo, useRef, useState } from 'react';
import {
	Alert,
	Badge,
	Button,
	Group,
	Loader,
	Menu,
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
	IconClockHour4,
	IconDots,
	IconEye,
	IconFilterX,
	IconInbox,
	IconInfoCircle,
	IconRefresh,
	IconUserCheck,
	IconUserMinus,
	IconUserPlus,
	IconUserQuestion,
	IconUsers,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import EmptyState from '~/components/EmptyState';
import SmallMetricCard from '~/components/SmallMetricCard';
import SectionCard from '~/components/SectionCard';
import AppDrawer from '~/components/AppDrawer';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { useChartReady } from '~/hooks/useChartReady';
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
} from '~/queries/backoffice/backofficeCaseQueries';
import { useGetAllCampaigns } from '~/queries/campaignsQueries';
import { useGetCampaignContactLists } from '~/queries/contactGroupQueries';
import type {
	BackofficeCase,
	BackofficeCaseStatus,
	BackofficeSupervisorDashboardParams,
} from '~/models/backoffice/BackofficeCaseModel';
import BackofficeSlaIndicator from '~/modules/backoffice/components/BackofficeSlaIndicator';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './BackofficeSupervisorPage.module.css';

const PAGE_SIZE = 50;
const ALL_STATUS = 'ALL';
const PERIODS = ['7d', '30d'] as const;
type DashboardPeriod = (typeof PERIODS)[number];
const ACTIVE_CONTACT_LIST_PARAMS = { isActive: true as const };

const isStatus = (value: string): value is BackofficeCaseStatus =>
	value === 'UNASSIGNED' || value === 'ASSIGNED' || value === 'MANAGED';

const STATUS_COLOR: Record<BackofficeCaseStatus, string> = {
	MANAGED: 'green',
	ASSIGNED: 'blue',
	UNASSIGNED: 'gray',
};

type KpiKey =
	| 'total'
	| 'pending'
	| 'unassigned'
	| 'assigned'
	| 'managed'
	| 'eligibleAgents';

const KPI_CARDS: Array<{
	key: KpiKey;
	icon: typeof IconInbox;
	color: 'gray' | 'orange' | 'red' | 'blue' | 'green' | 'teal';
}> = [
	{ key: 'total', icon: IconInbox, color: 'gray' },
	{ key: 'pending', icon: IconClockHour4, color: 'orange' },
	{ key: 'unassigned', icon: IconUserQuestion, color: 'red' },
	{ key: 'assigned', icon: IconUserCheck, color: 'blue' },
	{ key: 'managed', icon: IconCircleCheck, color: 'green' },
	{ key: 'eligibleAgents', icon: IconUsers, color: 'teal' },
];

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

const formatNumber = (value: number, locale: string) =>
	new Intl.NumberFormat(locale).format(value);

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
	const campaignsQuery = useGetAllCampaigns();
	const contactListsQuery = useGetCampaignContactLists(
		campaignId,
		ACTIVE_CONTACT_LIST_PARAMS
	);
	const distributeMutation = useDistributeBackofficeCases();
	const assignmentMutation = useUpdateBackofficeAssignment();
	const managedMutation = useMarkBackofficeCaseManaged();
	const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
	const [assignmentCase, setAssignmentCase] = useState<BackofficeCase | null>(
		null
	);
	const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
	const queueRef = useRef<HTMLDivElement>(null);
	const workloadRef = useRef<HTMLDivElement>(null);

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

	const campaignOptions = useMemo(
		() =>
			(campaignsQuery.data ?? [])
				.filter((campaign) => campaign.showExternal === true)
				.map((campaign) => ({
					value: String(campaign.id),
					label: campaign.name,
				})),
		[campaignsQuery.data]
	);
	const contactListOptions = useMemo(
		() =>
			(contactListsQuery.data ?? []).map((contactList) => ({
				value: String(contactList.id),
				label: contactList.name,
			})),
		[contactListsQuery.data]
	);
	const selectedCampaignName =
		campaignOptions.find((campaign) => campaign.value === String(campaignId))
			?.label ?? (campaignId ? `#${campaignId}` : '');
	const selectedContactListName =
		contactListOptions.find(
			(contactList) => contactList.value === String(contactGroupId)
		)?.label ?? (contactGroupId ? `#${contactGroupId}` : '');

	useEffect(() => {
		if (
			campaignId &&
			campaignsQuery.data &&
			!campaignsQuery.data.some(
				(campaign) =>
					campaign.id === campaignId && campaign.showExternal === true
			)
		) {
			updateFilters({ campaignId: null, contactGroupId: null });
		}
	}, [campaignId, campaignsQuery.data]);

	const hasActiveFilters =
		statusFilter !== ALL_STATUS ||
		Boolean(campaignId) ||
		Boolean(contactGroupId) ||
		Boolean(assignedUserId);

	const clearFilters = () => {
		updateFilters({
			status: ALL_STATUS,
			campaignId: null,
			contactGroupId: null,
			assignedUserId: null,
		});
	};

	const scrollToSection = (element: HTMLElement | null) => {
		if (!element) return;
		const behavior = window.matchMedia('(prefers-reduced-motion: reduce)')
			.matches
			? 'auto'
			: 'smooth';
		element.scrollIntoView({ behavior, block: 'start' });
	};

	const focusQueue = () => scrollToSection(queueRef.current);
	const focusWorkload = () => scrollToSection(workloadRef.current);

	const applyStatusFilter = (status: BackofficeCaseStatus | null) => {
		updateFilters({ status: status ?? ALL_STATUS });
		focusQueue();
	};

	const applyAgentFilter = (agentId: number) => {
		updateFilters({
			assignedUserId: assignedUserId === agentId ? null : agentId,
		});
		focusQueue();
	};

	const isKpiSelected = (key: KpiKey) => {
		if (key === 'total') return statusFilter === ALL_STATUS;
		if (key === 'unassigned') return statusFilter === 'UNASSIGNED';
		if (key === 'assigned') return statusFilter === 'ASSIGNED';
		if (key === 'managed') return statusFilter === 'MANAGED';
		if (key === 'eligibleAgents') return Boolean(assignedUserId);
		return statusFilter === 'UNASSIGNED' || statusFilter === 'ASSIGNED';
	};

	const handleKpiClick = (key: KpiKey) => {
		switch (key) {
			case 'total':
				applyStatusFilter(null);
				break;
			case 'unassigned':
				applyStatusFilter('UNASSIGNED');
				break;
			case 'assigned':
				applyStatusFilter('ASSIGNED');
				break;
			case 'managed':
				applyStatusFilter('MANAGED');
				break;
			case 'eligibleAgents':
				focusWorkload();
				break;
		}
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
						color={STATUS_COLOR[row.original.status]}
						variant='light'
						size='sm'
					>
						{t(`statuses.${row.original.status}`)}
					</Badge>
				),
			},
			{
				id: 'sla',
				header: t('table.sla'),
				cell: ({ row }) => (
					<BackofficeSlaIndicator
						caseData={row.original}
						namespace='backoffice-supervisor'
						compact
					/>
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
		status: item.status,
		name: t(`statuses.${item.status}`),
		value: item.count,
		color: `${STATUS_COLOR[item.status]}.6`,
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
		agentId: item.agentId,
		agentName: item.agentName,
		assigned: item.assigned,
		managed: item.managed,
	}));

	return (
		<ContentContainer
			title={t('page.title')}
			description={t('page.description')}
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
					{KPI_CARDS.map(({ key, icon: Icon, color }) => {
						if (dashboardQuery.isLoading || !summary) {
							return <Skeleton key={key} className={classes.kpiSkeleton} />;
						}

						const card = (
							<SmallMetricCard
								key={key}
								icon={<Icon size={18} />}
								color={color}
								label={t(`kpis.${key}`)}
								value={summary.kpis[key]}
								tooltip={t(`kpis.${key}Hint`)}
								onClick={() => handleKpiClick(key)}
								selected={isKpiSelected(key)}
								ariaLabel={t('kpis.actionLabel', {
									label: t(`kpis.${key}`),
								})}
							/>
						);

						if (key !== 'pending') return card;

						return (
							<Menu key={key} position='bottom-start' withinPortal>
								<Menu.Target>
									<div
										className={classes.kpiMenuTarget}
										role='button'
										tabIndex={0}
										aria-label={t('kpis.pendingMenuLabel')}
									>
										<SmallMetricCard
											icon={<Icon size={18} />}
											color={color}
											label={t(`kpis.${key}`)}
											value={summary.kpis[key]}
											tooltip={t(`kpis.${key}Hint`)}
											selected={isKpiSelected(key)}
										/>
									</div>
								</Menu.Target>
								<Menu.Dropdown>
									<Menu.Label>{t('kpis.pendingMenuLabel')}</Menu.Label>
									<Menu.Item onClick={() => applyStatusFilter('UNASSIGNED')}>
										{t('kpis.pendingUnassignedAction')}
									</Menu.Item>
									<Menu.Item onClick={() => applyStatusFilter('ASSIGNED')}>
										{t('kpis.pendingAssignedAction')}
									</Menu.Item>
								</Menu.Dropdown>
							</Menu>
						);
					})}
				</SimpleGrid>

				<div className={classes.filterBar} aria-label={t('filters.title')}>
					<div className={classes.filterHeader}>
						<div>
							<Text size='sm' fw={600}>
								{t('filters.title')}
							</Text>
							<Text size='xs' c='dimmed'>
								{t('filters.scope', {
									period: t(`periods.${period}`),
								})}
							</Text>
						</div>
						{casesQuery.isFetching && !casesQuery.isLoading && (
							<Loader size='xs' aria-label={t('filters.updating')} />
						)}
					</div>
					<div className={classes.filterControls}>
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
								applyStatusFilter(
									value && value !== ALL_STATUS
										? (value as BackofficeCaseStatus)
										: null
								)
							}
							size='sm'
							allowDeselect={false}
							className={classes.filterControl}
						/>
						<Select
							label={t('filters.campaign')}
							placeholder={t('filters.campaignPlaceholder')}
							data={campaignOptions}
							value={campaignId ? String(campaignId) : null}
							onChange={(value) =>
								updateFilters({
									campaignId: value ? Number(value) : null,
									contactGroupId: null,
								})
							}
							searchable
							clearable
							loading={campaignsQuery.isLoading}
							nothingFoundMessage={t('filters.campaignEmpty')}
							error={
								campaignsQuery.isError
									? t('filters.campaignLoadError')
									: undefined
							}
							size='sm'
							className={classes.filterControl}
						/>
						<Select
							label={t('filters.contactList')}
							placeholder={t('filters.contactListPlaceholder')}
							data={contactListOptions}
							value={contactGroupId ? String(contactGroupId) : null}
							onChange={(value) =>
								updateFilters({
									contactGroupId: value ? Number(value) : null,
								})
							}
							searchable
							clearable
							disabled={!campaignId}
							loading={contactListsQuery.isLoading}
							nothingFoundMessage={t('filters.contactListEmpty')}
							error={
								contactListsQuery.isError
									? t('filters.contactListLoadError')
									: undefined
							}
							size='sm'
							className={classes.filterControl}
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
							className={classes.filterControl}
						/>
					</div>
					<div className={classes.filterFooter}>
						<Group gap='xs' className={classes.activeFilters}>
							<Badge variant='light' color='blue'>
								{t('filters.scopePeriod', {
									period: t(`periods.${period}`),
								})}
							</Badge>
							{statusFilter !== ALL_STATUS && (
								<Badge variant='light' color={STATUS_COLOR[statusFilter]}>
									{t(`statuses.${statusFilter}`)}
								</Badge>
							)}
							{campaignId && (
								<Badge variant='light'>
									{t('filters.campaign')}: {selectedCampaignName}
								</Badge>
							)}
							{contactGroupId && (
								<Badge variant='light'>
									{t('filters.contactList')}: {selectedContactListName}
								</Badge>
							)}
							{assignedUserId && (
								<Badge variant='light'>
									{t('filters.assignedUser')}:{' '}
									{agentOptions.find(
										(agent) => agent.value === String(assignedUserId)
									)?.label ?? assignedUserId}
								</Badge>
							)}
						</Group>
						{hasActiveFilters && (
							<Button
								variant='subtle'
								color='gray'
								size='sm'
								leftSection={<IconFilterX size={16} />}
								onClick={clearFilters}
							>
								{t('filters.clear')}
							</Button>
						)}
					</div>
				</div>

				<div className={classes.chartsGrid}>
					<SectionCard
						title={t('charts.trend.title')}
						description={t('charts.trend.description')}
						icon={IconChartLine}
						headerAccent='blue'
						className={classes.chartCard}
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
								withTooltip
								valueFormatter={(value) => formatNumber(value, i18n.language)}
							/>
						)}
					</SectionCard>

					<SectionCard
						title={t('charts.status.title')}
						description={t('charts.status.description')}
						icon={IconChartDonut}
						headerAccent='green'
						className={classes.chartCard}
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
								labelsType='percent'
								tooltipDataSource='segment'
								valueFormatter={(value) => formatNumber(value, i18n.language)}
								chartLabel={String(summary?.kpis.total ?? 0)}
								cellProps={(item) => {
									const status = statusChartData.find(
										(entry) => entry.name === item.name
									)?.status;
									if (!status) return {};

									return {
										role: 'button',
										tabIndex: 0,
										'aria-label': t('charts.status.segmentAction', {
											status: item.name,
										}),
										style: { cursor: 'pointer' },
										onClick: () => applyStatusFilter(status),
										onKeyDown: (event) => {
											if (event.key !== 'Enter' && event.key !== ' ') return;
											event.preventDefault();
											applyStatusFilter(status);
										},
									};
								}}
							/>
						)}
						{statusChartData.length > 0 && (
							<Group gap='xs' className={classes.chartActions}>
								{statusChartData.map((item) => (
									<Button
										key={item.status}
										variant={statusFilter === item.status ? 'light' : 'subtle'}
										color={STATUS_COLOR[item.status]}
										size='compact-sm'
										onClick={() => applyStatusFilter(item.status)}
										aria-pressed={statusFilter === item.status}
									>
										{item.name}
									</Button>
								))}
							</Group>
						)}
					</SectionCard>
				</div>

				<div ref={workloadRef} id='supervisor-workload'>
					<SectionCard
						title={t('charts.workload.title')}
						description={t('charts.workload.description')}
						icon={IconUsers}
						headerAccent='blue'
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
								valueFormatter={(value) => formatNumber(value, i18n.language)}
								barProps={{
									style: { cursor: 'pointer' },
									onClick: (data) => {
										const agentId = data.payload?.agentId;
										if (typeof agentId === 'number') applyAgentFilter(agentId);
									},
								}}
							/>
						)}
						{workloadData.length > 0 && (
							<Group gap='xs' className={classes.chartActions}>
								{workloadData.map((item) => (
									<Button
										key={item.agentId}
										variant={
											assignedUserId === item.agentId ? 'light' : 'subtle'
										}
										color='blue'
										size='compact-sm'
										onClick={() => applyAgentFilter(item.agentId)}
										aria-pressed={assignedUserId === item.agentId}
									>
										{item.agentName}
									</Button>
								))}
							</Group>
						)}
					</SectionCard>
				</div>

				{casesQuery.isError && (
					<Alert color='red' icon={<IconInfoCircle size={18} />}>
						{getErrorMessage(casesQuery.error)}
					</Alert>
				)}

				<div ref={queueRef} id='supervisor-case-queue'>
					<SectionCard
						title={t('table.title')}
						description={t('table.description')}
						headerAccent='blue'
						headerActions={
							<Group gap='xs'>
								<Badge variant='light' color='blue'>
									{t('table.resultCount', {
										count: formatNumber(
											casesQuery.data?.total ?? 0,
											i18n.language
										),
									})}
								</Badge>
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
							onPaginationChange={(nextPage) =>
								updateFilters({ page: nextPage })
							}
							enableRowSelection={statusFilter === 'UNASSIGNED'}
							selectedRowIds={selectedRowIds}
							onSelectedRowIdsChange={setSelectedRowIds}
							rootProps={{ className: classes.tableRoot }}
						/>
					</SectionCard>
				</div>
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
