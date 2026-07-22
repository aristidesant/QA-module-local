import { useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Badge,
	Button,
	NumberInput,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconArrowsShuffle,
	IconInfoCircle,
	IconRefresh,
	IconUsers,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { usePermissions } from '~/hooks/usePermissions';
import { useBackofficeRole } from '~/hooks/useBackofficeRole';
import {
	useEligibleBackofficeAgents,
	useBackofficeCases,
	useDistributeBackofficeCases,
} from '~/queries/backofficeCaseQueries';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import type {
	BackofficeCase,
	BackofficeCaseStatus,
} from '~/models/BackofficeCaseModel';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './BackofficeCasesPage.module.css';

const PAGE_SIZE = 50;
const ALL_STATUS = 'ALL';

const isBackofficeCaseStatus = (value: string): value is BackofficeCaseStatus =>
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
	const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
	return fullName || user.username || fallback;
};

const formatDate = (value: string | null | undefined, locale: string) => {
	if (!value) return '—';
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'short',
		timeStyle: 'short',
	}).format(new Date(value));
};

const BackofficeCaseStatusBadge = ({
	status,
	label,
}: {
	status: BackofficeCaseStatus;
	label: string;
}) => {
	const color =
		status === 'MANAGED' ? 'green' : status === 'ASSIGNED' ? 'blue' : 'gray';
	return (
		<Badge color={color} variant='light' size='sm'>
			{label}
		</Badge>
	);
};

const BackofficeCasesPage = () => {
	const { t, i18n } = useTranslation('backoffice-cases');
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const { isAdmin } = useBackofficeRole();
	const { canPerformAction } = usePermissions();
	const canManageDistribution = canPerformAction(
		ModuleEnum.BACKOFFICE_CASES,
		PermissionEnum.MANAGE
	);

	const rawStatus = searchParams.get('status') ?? ALL_STATUS;
	const requestedStatus =
		rawStatus === ALL_STATUS || isBackofficeCaseStatus(rawStatus)
			? rawStatus
			: ALL_STATUS;
	const status: BackofficeCaseStatus | undefined = isAdmin
		? requestedStatus === ALL_STATUS
			? undefined
			: (requestedStatus as BackofficeCaseStatus)
		: requestedStatus === 'MANAGED'
			? 'MANAGED'
			: 'ASSIGNED';
	const campaignId = parsePositiveNumber(searchParams.get('campaignId'));
	const contactGroupId = parsePositiveNumber(
		searchParams.get('contactGroupId')
	);
	const assignedUserId = parsePositiveNumber(
		searchParams.get('assignedUserId')
	);
	const pageIndex = Math.max(0, Number(searchParams.get('page') ?? 0) || 0);

	const queryParams = useMemo(
		() => ({
			...(status ? { status } : {}),
			...(campaignId ? { campaignId } : {}),
			...(contactGroupId ? { contactGroupId } : {}),
			...(isAdmin && assignedUserId ? { assignedUserId } : {}),
			limit: PAGE_SIZE,
			offset: pageIndex * PAGE_SIZE,
		}),
		[assignedUserId, campaignId, contactGroupId, isAdmin, pageIndex, status]
	);

	const casesQuery = useBackofficeCases(queryParams);
	const agentsQuery = useEligibleBackofficeAgents(isAdmin);
	const distributeMutation = useDistributeBackofficeCases();
	const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

	useEffect(() => {
		setSelectedRowIds([]);
	}, [assignedUserId, campaignId, contactGroupId, pageIndex, status]);

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

	const openDistributionConfirmation = (caseIds?: number[]) => {
		const isSelectedDistribution = Boolean(caseIds?.length);
		modals.openConfirmModal({
			title: t(
				isSelectedDistribution
					? 'distribution.selectedTitle'
					: 'distribution.allTitle'
			),
			children: (
				<Text size='sm'>
					{t(
						isSelectedDistribution
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
					modals.closeAll();
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

	const columns = useMemo<BaseTableColumnDef<BackofficeCase>[]>(
		() => [
			{
				accessorKey: 'id',
				header: t('table.id'),
				size: 90,
				cell: ({ row }) => (
					<Text size='sm' ff='monospace' fw={600}>
						#{row.original.id}
					</Text>
				),
			},
			{
				id: 'contact',
				header: t('table.contact'),
				cell: ({ row }) => (
					<div>
						<Text size='sm' fw={600}>
							{row.original.contact
								? `${row.original.contact.firstName} ${row.original.contact.lastName}`.trim()
								: t('common.notAvailable')}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('table.contactId', { id: row.original.contactId })}
						</Text>
					</div>
				),
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
					<BackofficeCaseStatusBadge
						status={row.original.status}
						label={t(`statuses.${row.original.status}`)}
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
				id: 'disposition',
				header: t('table.disposition'),
				cell: ({ row }) =>
					row.original.latestDisposition?.dispositionName ??
					t('common.notAvailable'),
			},
			{
				accessorKey: 'updatedAt',
				header: t('table.updatedAt'),
				cell: ({ row }) => formatDate(row.original.updatedAt, i18n.language),
			},
		],
		[i18n.language, t]
	);

	const distributionError = distributeMutation.isError
		? getErrorMessage(distributeMutation.error)
		: null;

	return (
		<ContentContainer
			title={t('list.title')}
			description={t(
				isAdmin ? 'list.adminDescription' : 'list.agentDescription'
			)}
			contentWidth='full'
			titleRight={
				isAdmin && canManageDistribution ? (
					<Button
						size='sm'
						leftSection={<IconArrowsShuffle size={16} />}
						onClick={() => openDistributionConfirmation()}
						loading={distributeMutation.isPending}
					>
						{t('distribution.allAction')}
					</Button>
				) : null
			}
		>
			<Stack gap='md' className={classes.root}>
				{distributionError && (
					<Alert color='red' icon={<IconInfoCircle size={18} />}>
						{distributionError}
					</Alert>
				)}

				<SectionCard
					title={t('filters.title')}
					description={t('filters.description')}
					icon={IconUsers}
				>
					<div className={classes.filtersGrid}>
						<Select
							label={t('filters.status.label')}
							data={[
								{ value: ALL_STATUS, label: t('filters.status.all') },
								{ value: 'UNASSIGNED', label: t('statuses.UNASSIGNED') },
								{ value: 'ASSIGNED', label: t('statuses.ASSIGNED') },
								{ value: 'MANAGED', label: t('statuses.MANAGED') },
							].filter((option) => isAdmin || option.value !== 'UNASSIGNED')}
							value={isAdmin ? requestedStatus : status}
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
						{isAdmin && (
							<Select
								label={t('filters.assignedUser')}
								placeholder={t('filters.assignedUserPlaceholder')}
								data={
									agentsQuery.data?.map((agent) => ({
										value: String(agent.id),
										label:
											[agent.firstName, agent.lastName]
												.filter(Boolean)
												.join(' ') || agent.username,
									})) ?? []
								}
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
						)}
					</div>
				</SectionCard>

				<SectionCard
					title={t('table.title')}
					description={t('table.description')}
					headerActions={
						isAdmin && selectedRowIds.length > 0 && status === 'UNASSIGNED' ? (
							<Button
								variant='light'
								size='sm'
								leftSection={<IconRefresh size={16} />}
								onClick={() =>
									openDistributionConfirmation(selectedRowIds.map(Number))
								}
								loading={distributeMutation.isPending}
							>
								{t('distribution.selectedAction', {
									count: selectedRowIds.length,
								})}
							</Button>
						) : null
					}
				>
					{casesQuery.isError && (
						<Alert color='red' icon={<IconInfoCircle size={18} />} mb='md'>
							{getErrorMessage(casesQuery.error)}
						</Alert>
					)}
					<BaseTable
						data={casesQuery.data?.data ?? []}
						columns={columns}
						getRowId={(row) => row.id}
						onRowClick={(row) =>
							navigate(`/backoffice/cases/${row.id}`, {
								state: {
									from: `${location.pathname}${location.search}`,
								},
							})
						}
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
						enableRowSelection={Boolean(isAdmin && status === 'UNASSIGNED')}
						selectedRowIds={selectedRowIds}
						onSelectedRowIdsChange={setSelectedRowIds}
						rootProps={{ className: classes.tableRoot }}
					/>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default BackofficeCasesPage;
