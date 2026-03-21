import { useCallback, useMemo, useState } from 'react';
import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Loader,
	Stack,
	Switch,
	Text,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
	IconPencil,
	IconPlus,
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
	useUpdateDashboardWidget,
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
	const updateDashboardWidget = useUpdateDashboardWidget();
	const [pendingWidgetIds, setPendingWidgetIds] = useState<
		Record<number, boolean>
	>({});

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

	const handleToggleEnabled = useCallback(
		async (widget: DashboardWidget, enabled: boolean) => {
			await updateDashboardWidget.mutateAsync({
				id: widget.id,
				data: { enabled },
			});
		},
		[updateDashboardWidget]
	);

	const handleToggleEnabledRequest = useCallback(
		(widget: DashboardWidget, enabled: boolean) => {
			const isEnabling = enabled;
			const modalId = `toggle-widget-status-${widget.id}`;

			modals.openConfirmModal({
				modalId,
				closeOnConfirm: false,
				title: isEnabling
					? t('dashboardBuilder.toggleWidgetStatus.enableTitle')
					: t('dashboardBuilder.toggleWidgetStatus.disableTitle'),
				children: (
					<Text size='sm'>
						{isEnabling
							? t('dashboardBuilder.toggleWidgetStatus.enableMessage', {
									name: widget.title,
								})
							: t('dashboardBuilder.toggleWidgetStatus.disableMessage', {
									name: widget.title,
								})}
					</Text>
				),
				labels: {
					confirm: isEnabling
						? t('dashboardBuilder.toggleWidgetStatus.enableConfirm')
						: t('dashboardBuilder.toggleWidgetStatus.disableConfirm'),
					cancel: t('common:actions.cancel'),
				},
				confirmProps: { color: isEnabling ? 'green' : 'red' },
				onConfirm: async () => {
					let shouldResetModalState = true;

					setPendingWidgetIds((current) => ({
						...current,
						[widget.id]: true,
					}));
					modals.updateModal({
						modalId,
						confirmProps: {
							color: isEnabling ? 'green' : 'red',
							loading: true,
						},
						cancelProps: { disabled: true },
					});

					try {
						await handleToggleEnabled(widget, enabled);
						notifications.show({
							title: t('dashboardBuilder.notifications.widgetUpdatedTitle'),
							message: isEnabling
								? t('dashboardBuilder.notifications.widgetEnabledMessage')
								: t('dashboardBuilder.notifications.widgetDisabledMessage'),
							color: 'green',
						});
						shouldResetModalState = false;
						modals.close(modalId);
					} catch (error) {
						notifications.show({
							title: t('dashboardBuilder.notifications.errorTitle'),
							message: getErrorMessage(error),
							color: 'red',
						});
					} finally {
						setPendingWidgetIds((current) => {
							const { [widget.id]: _removed, ...rest } = current;
							return rest;
						});
						if (shouldResetModalState) {
							modals.updateModal({
								modalId,
								confirmProps: {
									color: isEnabling ? 'green' : 'red',
									loading: false,
								},
								cancelProps: { disabled: false },
							});
						}
					}
				},
			});
		},
		[handleToggleEnabled, t]
	);

	const columns = useMemo<BaseTableColumnDef<DashboardWidget>[]>(
		() => [
			{
				accessorKey: 'title',
				header: t('dashboardBuilder.widget.name'),
				cell: ({ row }) => {
					const isCustom = Boolean(row.original.dataConfig.metric.key);
					return (
						<Stack gap={2}>
							<Group gap={6} align='center' wrap='nowrap'>
								<Text size='sm' fw={600} c='gray.9' truncate>
									{row.original.title}
								</Text>
								<Badge
									variant='light'
									color={isCustom ? 'violet' : 'gray'}
									size='xs'
									radius='sm'
								>
									{isCustom
										? t('dashboardBuilder.widget.customBadge')
										: t('dashboardBuilder.widget.defaultBadge')}
								</Badge>
							</Group>
							<Text size='xs' c='dimmed' truncate>
								{row.original.description ||
									t('dashboardBuilder.noDescription')}
							</Text>
						</Stack>
					);
				},
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
				meta: {
					headerClassName: styles.statusHeader,
					cellClassName: styles.statusHeader,
				},
				cell: ({ row }) => (
					<div className={styles.statusCell}>
						<Badge
							variant='light'
							color={row.original.enabled ? 'green' : 'gray'}
							size='xs'
							radius='sm'
						>
							{row.original.enabled
								? t('dashboardBuilder.widget.activeBadge')
								: t('dashboardBuilder.widget.inactiveBadge')}
						</Badge>
						<Switch
							size='xs'
							checked={row.original.enabled}
							disabled={Boolean(pendingWidgetIds[row.original.id])}
							onChange={(event) =>
								handleToggleEnabledRequest(
									row.original,
									event.currentTarget.checked
								)
							}
							aria-label={t('dashboardBuilder.actions.toggleEnabled')}
						/>
						<span className={styles.statusLoadingSlot}>
							{pendingWidgetIds[row.original.id] ? <Loader size='xs' /> : null}
						</span>
					</div>
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
		[handleDeleteWidget, handleToggleEnabledRequest, openEditWidget, t]
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
				</div>
				{selectedDashboard && (
					<Button
						variant='default'
						size='xs'
						leftSection={<IconPlus size={14} />}
						onClick={openCreateWidget}
					>
						{t('dashboardBuilder.actions.newWidget')}
					</Button>
				)}
			</div>

			{selectedDashboard && (
				<div className={styles.dashboardMeta}>
					<div className={styles.dashboardMetaItem}>
						<span className={styles.dashboardMetaLabel}>
							{t('dashboardBuilder.dashboard.createdAtLabel')}
						</span>
						<span className={styles.dashboardMetaValue}>
							{new Date(selectedDashboard.createdAt).toLocaleDateString()}
						</span>
					</div>
					{selectedDashboard.description && (
						<div className={styles.dashboardMetaItem}>
							<span className={styles.dashboardMetaLabel}>
								{t('dashboardBuilder.dashboard.descriptionLabel')}
							</span>
							<span className={styles.dashboardMetaValue}>
								{selectedDashboard.description}
							</span>
						</div>
					)}
				</div>
			)}

			{selectedDashboard ? (
				<>
					{isLoading && orderedWidgets.length === 0 ? (
						<div className={styles.emptyState}>
							<Loader size='sm' />
							<Stack gap={2} align='center'>
								<Text size='sm' fw={600} c='gray.9'>
									{t('dashboardBuilder.loadingWidgetTitle')}
								</Text>
								<Text size='xs' c='dimmed' ta='center'>
									{t('dashboardBuilder.loadingWidgetDescription')}
								</Text>
							</Stack>
						</div>
					) : !isLoading && orderedWidgets.length === 0 ? (
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
