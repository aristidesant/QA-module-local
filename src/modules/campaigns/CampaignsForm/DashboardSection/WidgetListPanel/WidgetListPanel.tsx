import { useCallback, useMemo } from 'react';
import { ActionIcon, Group, Stack, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
	IconPencil,
	IconSquarePlus,
	IconTrash,
	IconVersions,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import type { DashboardWidget } from '~/models/AnalyticsDashboard';
import { compareWidgetLayouts } from '~/modules/campaigns/dashboardLayout';
import {
	useDashboards,
	useDashboardWidgets,
	useDeleteDashboardWidget,
} from '~/queries/analyticsDashboardsQueries';
import { getErrorMessage } from '~/utils/httpClient';
import { getWidgetTypeLabel } from '../DashboardSection.helpers';
import {
	useDashboardSectionModals,
	useDashboardSectionSelection,
} from '../DashboardSection.context';
import styles from './WidgetListPanel.module.css';

const WidgetListPanel = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const { campaignId, selectedDashboardId } = useDashboardSectionSelection();
	const { openCreateWidget, openEditWidget } = useDashboardSectionModals();
	const { data: dashboards = [] } = useDashboards({ campaignId });
	const { data: widgets = [], isLoading } = useDashboardWidgets(
		selectedDashboardId ?? undefined
	);
	const deleteDashboardWidget = useDeleteDashboardWidget();

	const selectedDashboard =
		dashboards.find((dashboard) => dashboard.id === selectedDashboardId) ??
		null;

	const orderedWidgets = useMemo(
		() => [...widgets].sort(compareWidgetLayouts),
		[widgets]
	);

	const handleDeleteWidget = useCallback(
		(widget: DashboardWidget) => {
			modals.openConfirmModal({
				title: t('dashboardBuilder.deleteWidget.title'),
				children: t('dashboardBuilder.deleteWidget.message', {
					name: widget.title,
				}),
				labels: {
					confirm: t('dashboardBuilder.deleteWidget.confirm'),
					cancel: t('dashboardBuilder.deleteWidget.cancel'),
				},
				confirmProps: { color: 'red' },
				onConfirm: async () => {
					try {
						await deleteDashboardWidget.mutateAsync({
							id: widget.id,
							dashboardId: widget.dashboardId,
						});
						notifications.show({
							title: t('dashboardBuilder.notifications.widgetDeletedTitle'),
							message: t('dashboardBuilder.notifications.widgetDeletedMessage'),
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
		[deleteDashboardWidget, t]
	);

	const columns = useMemo<BaseTableColumnDef<DashboardWidget>[]>(
		() => [
			{
				accessorKey: 'title',
				header: t('dashboardBuilder.widget.name'),
				cell: ({ row }) => (
					<Stack gap={2}>
						<Text size='sm' fw={600} c='gray.9' truncate>
							{row.original.title}
						</Text>
						<Text size='xs' c='dimmed' truncate>
							{row.original.description || t('dashboardBuilder.noDescription')}
						</Text>
					</Stack>
				),
			},
			{
				id: 'type',
				header: t('dashboardBuilder.widget.type'),
				cell: ({ row }) => (
					<Text size='sm' c='gray.8'>
						{getWidgetTypeLabel(t, row.original.widgetType)}
					</Text>
				),
			},
			{
				id: 'status',
				header: t('dashboardBuilder.widget.status'),
				cell: ({ row }) => (
					<Text size='sm' c={row.original.enabled ? 'gray.8' : 'dimmed'}>
						{row.original.enabled
							? t('dashboardBuilder.enabled')
							: t('dashboardBuilder.disabled')}
					</Text>
				),
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
						<Tooltip label={t('dashboardBuilder.actions.editWidget')}>
							<ActionIcon
								variant='subtle'
								size='sm'
								color='gray'
								onClick={(event) => {
									event.stopPropagation();
									openEditWidget(row.original);
								}}
							>
								<IconPencil size={14} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('dashboardBuilder.actions.deleteWidget')}>
							<ActionIcon
								variant='subtle'
								size='sm'
								color='gray'
								onClick={(event) => {
									event.stopPropagation();
									handleDeleteWidget(row.original);
								}}
							>
								<IconTrash size={14} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
			},
		],
		[handleDeleteWidget, openEditWidget, t]
	);

	return (
		<div className={styles.panel}>
			<div className={styles.panelHeader}>
				<div className={styles.panelHeading}>
					<Text className={styles.panelTitle}>
						{t('dashboardBuilder.widgetsTitle')}
					</Text>
					<Text className={styles.panelDescription}>
						{selectedDashboard
							? t('dashboardBuilder.widgetsDescription', {
									dashboard: selectedDashboard.name,
								})
							: t('dashboardBuilder.widgetsPlaceholderDescription')}
					</Text>
					{selectedDashboard && (
						<Text className={styles.panelSubtitle}>
							{selectedDashboard.name}
						</Text>
					)}
				</div>
				{selectedDashboard && (
					<Tooltip label={t('dashboardBuilder.actions.newWidget')}>
						<ActionIcon
							variant='default'
							size='md'
							onClick={openCreateWidget}
							aria-label={t('dashboardBuilder.actions.newWidget')}
						>
							<IconSquarePlus size={16} />
						</ActionIcon>
					</Tooltip>
				)}
			</div>

			{selectedDashboard ? (
				<>
					{!isLoading && orderedWidgets.length === 0 ? (
						<div className={styles.emptyState}>
							<IconSquarePlus
								size={20}
								className={styles.emptyStateIcon}
								strokeWidth={1.75}
							/>
							<Stack gap={2} align='center'>
								<Text size='sm' fw={600} c='gray.9'>
									{t('dashboardBuilder.emptyWidgetTitle')}
								</Text>
								<Text size='xs' c='dimmed' ta='center'>
									{t('dashboardBuilder.emptyWidgetDescription')}
								</Text>
							</Stack>
							<Tooltip label={t('dashboardBuilder.actions.newWidget')}>
								<ActionIcon
									variant='default'
									size='md'
									onClick={openCreateWidget}
									aria-label={t('dashboardBuilder.actions.newWidget')}
								>
									<IconSquarePlus size={16} />
								</ActionIcon>
							</Tooltip>
						</div>
					) : (
						<BaseTable
							className={styles.table}
							data={orderedWidgets}
							columns={columns}
							density='compact'
							isLoading={isLoading}
							skeletonRowsCount={5}
							getRowId={(widget) => widget.id}
						/>
					)}
				</>
			) : (
				<div className={styles.emptyState}>
					<IconVersions
						size={20}
						className={styles.emptyStateIcon}
						strokeWidth={1.75}
					/>
					<Stack gap={2} align='center'>
						<Text size='sm' fw={600} c='gray.9'>
							{t('dashboardBuilder.selectDashboardTitle')}
						</Text>
						<Text size='xs' c='dimmed' ta='center'>
							{t('dashboardBuilder.selectDashboardDescription')}
						</Text>
					</Stack>
				</div>
			)}
		</div>
	);
};

export default WidgetListPanel;
