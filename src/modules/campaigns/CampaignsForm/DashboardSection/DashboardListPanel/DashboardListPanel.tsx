import { useCallback, useEffect, useMemo } from 'react';
import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
	IconEye,
	IconLayoutDashboard,
	IconPencil,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import type { Row } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import type { DashboardDefinition } from '~/models/AnalyticsDashboard';
import {
	useDashboards,
	useDeleteDashboard,
} from '~/queries/analyticsDashboardsQueries';
import { getErrorMessage } from '~/utils/httpClient';
import {
	useDashboardSectionModals,
	useDashboardSectionSelection,
} from '../DashboardSection.context';
import styles from './DashboardListPanel.module.css';

const DashboardListPanel = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const { campaignId, selectedDashboardId, setSelectedDashboardId } =
		useDashboardSectionSelection();
	const { openCreateDashboard, openEditDashboard, openPreviewDashboard } =
		useDashboardSectionModals();
	const { data: dashboards = [], isLoading } = useDashboards({ campaignId });
	const deleteDashboard = useDeleteDashboard();

	useEffect(() => {
		if (!dashboards.length) {
			setSelectedDashboardId(null);
			return;
		}

		const currentSelectionExists = dashboards.some(
			(dashboard) => dashboard.id === selectedDashboardId
		);

		if (!currentSelectionExists) {
			setSelectedDashboardId(dashboards[0].id);
		}
	}, [dashboards, selectedDashboardId, setSelectedDashboardId]);

	const handleDeleteDashboard = useCallback(
		(dashboard: DashboardDefinition) => {
			modals.openConfirmModal({
				title: t('dashboardBuilder.deleteDashboard.title'),
				children: t('dashboardBuilder.deleteDashboard.message', {
					name: dashboard.name,
				}),
				labels: {
					confirm: t('dashboardBuilder.deleteDashboard.confirm'),
					cancel: t('dashboardBuilder.deleteDashboard.cancel'),
				},
				confirmProps: { color: 'red' },
				onConfirm: async () => {
					try {
						await deleteDashboard.mutateAsync(dashboard.id);
						notifications.show({
							title: t('dashboardBuilder.notifications.dashboardDeletedTitle'),
							message: t(
								'dashboardBuilder.notifications.dashboardDeletedMessage'
							),
							color: 'green',
						});
					} catch (error) {
						notifications.show({
							title: t('dashboardBuilder.notifications.errorTitle'),
							message: getErrorMessage(error),
							color: 'red',
						});
					}
				},
			});
		},
		[deleteDashboard, t]
	);

	const handleSelectDashboard = useCallback(
		(dashboardId: number) => {
			setSelectedDashboardId(dashboardId);
		},
		[setSelectedDashboardId]
	);

	const columns = useMemo<BaseTableColumnDef<DashboardDefinition>[]>(
		() => [
			{
				accessorKey: 'name',
				header: t('dashboardBuilder.dashboard.name'),
				cell: ({ row }) => {
					const dashboard = row.original;

					return (
						<Stack gap={2}>
							<Text size='sm' fw={600} c='gray.9' truncate>
								{dashboard.name}
							</Text>
							<Text size='xs' c='dimmed' truncate>
								{dashboard.isDefault
									? t('dashboardBuilder.defaultBadge')
									: t('dashboardBuilder.dashboard.standard')}
							</Text>
						</Stack>
					);
				},
			},
			{
				id: 'scope',
				header: t('dashboardBuilder.dashboard.scope'),
				cell: ({ row }) => {
					const isGlobal = row.original.campaignId === null;
					return (
						<Badge
							variant='light'
							color={isGlobal ? 'blue' : 'violet'}
							size='sm'
							radius='sm'
						>
							{isGlobal
								? t('dashboardBuilder.dashboard.scopeGlobal')
								: t('dashboardBuilder.dashboard.scopeCampaign')}
						</Badge>
					);
				},
			},
			{
				id: 'actions',
				header: '',
				meta: {
					headerClassName: styles.actionsHeader,
					cellClassName: styles.actionsCell,
				},
				cell: ({ row }) => (
					<Group gap={4} justify='flex-end' wrap='nowrap'>
						<Tooltip label={t('dashboardBuilder.actions.previewDashboard')}>
							<ActionIcon
								variant='subtle'
								size='sm'
								color='gray'
								onClick={(event) => {
									event.stopPropagation();
									openPreviewDashboard(row.original);
								}}
							>
								<IconEye size={14} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('dashboardBuilder.actions.editDashboard')}>
							<ActionIcon
								variant='subtle'
								size='sm'
								color='gray'
								onClick={(event) => {
									event.stopPropagation();
									openEditDashboard(row.original);
								}}
							>
								<IconPencil size={14} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('dashboardBuilder.actions.deleteDashboard')}>
							<ActionIcon
								variant='subtle'
								size='sm'
								color='gray'
								onClick={(event) => {
									event.stopPropagation();
									handleDeleteDashboard(row.original);
								}}
							>
								<IconTrash size={14} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
			},
		],
		[handleDeleteDashboard, openEditDashboard, openPreviewDashboard, t]
	);

	const getRowClassName = useCallback(
		(row: Row<DashboardDefinition>) =>
			row.original.id === selectedDashboardId
				? styles.selectedDashboardRow
				: '',
		[selectedDashboardId]
	);

	return (
		<section className={styles.panel}>
			<div className={styles.panelHeader}>
				<div className={styles.panelHeading}>
					<Text className={styles.panelTitle}>
						{t('dashboardBuilder.dashboardsTitle')}
					</Text>
					<Text className={styles.panelDescription}>
						{t('dashboardBuilder.dashboardsDescription')}
					</Text>
				</div>
				<Tooltip label={t('dashboardBuilder.actions.newDashboard')}>
					<ActionIcon
						variant='default'
						size='md'
						onClick={openCreateDashboard}
						aria-label={t('dashboardBuilder.actions.newDashboard')}
					>
						<IconPlus size={16} />
					</ActionIcon>
				</Tooltip>
			</div>

			{!isLoading && dashboards.length === 0 ? (
				<div className={styles.emptyState}>
					<IconLayoutDashboard
						size={20}
						className={styles.emptyStateIcon}
						strokeWidth={1.75}
					/>
					<Stack gap={2} align='center'>
						<Text size='sm' fw={600} c='gray.9'>
							{t('dashboardBuilder.emptyDashboardTitle')}
						</Text>
						<Text size='xs' c='dimmed' ta='center'>
							{t('dashboardBuilder.emptyDashboardDescription')}
						</Text>
					</Stack>
					<Tooltip label={t('dashboardBuilder.actions.newDashboard')}>
						<ActionIcon
							variant='default'
							size='md'
							onClick={openCreateDashboard}
							aria-label={t('dashboardBuilder.actions.newDashboard')}
						>
							<IconPlus size={16} />
						</ActionIcon>
					</Tooltip>
				</div>
			) : (
				<BaseTable
					className={styles.table}
					data={dashboards}
					columns={columns}
					density='compact'
					isLoading={isLoading}
					skeletonRowsCount={4}
					selectedRowId={selectedDashboardId}
					getRowId={(dashboard) => dashboard.id}
					getRowClassName={getRowClassName}
					onRowClick={(dashboard) => handleSelectDashboard(dashboard.id)}
				/>
			)}
		</section>
	);
};

export default DashboardListPanel;
