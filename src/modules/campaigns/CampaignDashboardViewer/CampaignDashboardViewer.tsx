import { Box, Loader, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { useContainerWidth } from 'react-grid-layout/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { usePermissions } from '~/hooks/usePermissions';
import { useSessionStore } from '~/stores/sessionStore';
import {
	applyWidgetMinimumDimensions,
	autoOrganizeWidgetLayouts,
	compareWidgetLayouts,
	hasOverlappingWidgetLayouts,
	normalizeWidgetLayoutForType,
} from '~/modules/campaigns/dashboardLayout';
import type { AnalyticsTimeRange } from '~/models/AnalyticsDashboard';
import {
	useDashboardRenderUnified,
	useDashboards,
	useDashboardWidgets,
	useUpdateDashboardWidgetLayouts,
} from '~/queries/analyticsDashboardsQueries';
import { getErrorMessage } from '~/utils/httpClient';
import {
	areLayoutsEqual,
	createLayoutMap,
	createWidgetTypeMap,
	EMPTY_DASHBOARDS,
	EMPTY_WIDGETS,
	formatDashboardPeriod,
	getWidgetRenderLayout,
	getVisibleDashboardWidgets,
} from './CampaignDashboardViewer.helpers';
import CampaignDashboardViewerContent from './CampaignDashboardViewerContent';
import CampaignDashboardViewerToolbar from './CampaignDashboardViewerToolbar';
import useCampaignDashboardViewerStore from './store/useCampaignDashboardViewerStore';
import type { ViewerWidgetLayout, WidgetComparisonData } from './types';
import styles from './CampaignDashboardViewer.module.css';

const CampaignDashboardViewer = ({
	campaignId,
	contactGroupId,
	initialDashboardId,
	allowLayoutEditing = true,
	onBackClick,
}: {
	campaignId?: number | null;
	contactGroupId?: number | null;
	initialDashboardId?: number;
	allowLayoutEditing?: boolean;
	onBackClick?: () => void;
}) => {
	const [isSavingLayoutTransition, setIsSavingLayoutTransition] =
		useState(false);
	const { t } = useTranslation('campaign.form.dashboards');
	const isMobile = useMediaQuery('(max-width: 48rem)');
	const { containerRef: editorContainerRef, width: editorWidth } =
		useContainerWidth({ initialWidth: 1200 });
	const { user } = useSessionStore();
	const { activeClientId, canPerformAction } = usePermissions();
	const currentUserId = user?.id ?? null;
	const canViewPrivateWidgets = canPerformAction(
		ModuleEnum.CAMPAIGNS,
		PermissionEnum.MANAGE
	);
	const visibilityContext = useMemo(
		() => ({
			activeClientId,
			currentUserId,
			canViewPrivateWidgets,
		}),
		[activeClientId, canViewPrivateWidgets, currentUserId]
	);

	const selectedDashboardId = useCampaignDashboardViewerStore(
		(state) => state.selectedDashboardId
	);
	const isEditingLayout = useCampaignDashboardViewerStore(
		(state) => state.isEditingLayout
	);
	const draftLayouts = useCampaignDashboardViewerStore(
		(state) => state.draftLayouts
	);
	const selectedTimeRange = useCampaignDashboardViewerStore(
		(state) => state.selectedTimeRange
	);
	const comparisonEnabled = useCampaignDashboardViewerStore(
		(state) => state.comparisonEnabled
	);
	const resetStore = useCampaignDashboardViewerStore((state) => state.reset);
	const setSelectedDashboardId = useCampaignDashboardViewerStore(
		(state) => state.setSelectedDashboardId
	);
	const startEditing = useCampaignDashboardViewerStore(
		(state) => state.startEditing
	);
	const cancelEditing = useCampaignDashboardViewerStore(
		(state) => state.cancelEditing
	);
	const stopEditing = useCampaignDashboardViewerStore(
		(state) => state.stopEditing
	);
	const syncDraftLayouts = useCampaignDashboardViewerStore(
		(state) => state.syncDraftLayouts
	);
	const setDraftLayouts = useCampaignDashboardViewerStore(
		(state) => state.setDraftLayouts
	);
	const setSelectedTimeRange = useCampaignDashboardViewerStore(
		(state) => state.setSelectedTimeRange
	);
	const setComparisonEnabled = useCampaignDashboardViewerStore(
		(state) => state.setComparisonEnabled
	);

	const updateDashboardWidgetLayouts = useUpdateDashboardWidgetLayouts();

	useEffect(() => {
		resetStore(initialDashboardId ? String(initialDashboardId) : null);
	}, [campaignId, contactGroupId, initialDashboardId, resetStore]);

	const {
		data: dashboardsData,
		isLoading: dashboardsLoading,
		error: dashboardsErrorObj,
	} = useDashboards({
		campaignId,
	});
	const dashboards = dashboardsData ?? EMPTY_DASHBOARDS;
	const isForbidden = (dashboardsErrorObj as any)?.response?.status === 403;

	const dashboardOptions = useMemo(
		() =>
			dashboards.map((dashboard) => ({
				value: String(dashboard.id),
				label: dashboard.name,
			})),
		[dashboards]
	);

	useEffect(() => {
		if (!dashboards.length) {
			setSelectedDashboardId(null);
			return;
		}

		const preferredDashboard = dashboards.find(
			(dashboard) => dashboard.isDefault
		);
		const hasCurrentSelection = dashboards.some(
			(dashboard) => String(dashboard.id) === selectedDashboardId
		);

		if (!hasCurrentSelection) {
			setSelectedDashboardId(
				String(preferredDashboard?.id ?? dashboards[0].id)
			);
		}
	}, [dashboards, selectedDashboardId, setSelectedDashboardId]);

	const numericDashboardId = selectedDashboardId
		? Number(selectedDashboardId)
		: undefined;

	const renderPayload = useMemo(
		() => ({
			...(selectedTimeRange
				? { timeRange: selectedTimeRange }
				: { timeRange: 'ALL' as AnalyticsTimeRange }),
			...(contactGroupId != null ? { contactGroupId } : {}),
		}),
		[selectedTimeRange, contactGroupId]
	);
	const isComparisonActive = Boolean(comparisonEnabled && selectedTimeRange);

	const {
		data: unifiedRenderResult,
		isLoading: renderLoading,
		isError,
		error,
		refetch: refetchRenderResult,
		isFetching,
	} = useDashboardRenderUnified(
		numericDashboardId,
		renderPayload,
		isComparisonActive
	);
	const renderResult = unifiedRenderResult?.renderResult;

	const comparisonMap = useMemo((): Map<number, WidgetComparisonData> => {
		return unifiedRenderResult?.comparisonMap ?? new Map();
	}, [unifiedRenderResult]);
	const comparisonPeriodLabel = useMemo(() => {
		if (!unifiedRenderResult?.comparisonPeriod) {
			return undefined;
		}

		return t('dashboard.comparisonPeriod', {
			currentPeriod: formatDashboardPeriod(
				unifiedRenderResult.comparisonPeriod.current
			),
			previousPeriod: formatDashboardPeriod(
				unifiedRenderResult.comparisonPeriod.previous
			),
		});
	}, [t, unifiedRenderResult]);
	const { data: widgetsData, refetch: refetchWidgets } =
		useDashboardWidgets(numericDashboardId);
	const widgets = widgetsData ?? EMPTY_WIDGETS;
	const renderedWidgetIdSet = useMemo(
		() => new Set(renderResult?.widgets.map((widget) => widget.widgetId) ?? []),
		[renderResult]
	);
	const visibleRenderedWidgets = useMemo(
		() =>
			getVisibleDashboardWidgets(
				widgets.filter((widget) => renderedWidgetIdSet.has(widget.id)),
				visibilityContext
			),
		[renderedWidgetIdSet, visibilityContext, widgets]
	);
	const widgetComparisonDataMap = useMemo<Map<number, WidgetComparisonData>>(
		() =>
			new Map(
				visibleRenderedWidgets.map((widget) => [
					widget.id,
					{
						...(comparisonMap.get(widget.id) ?? {}),
						compareWith: widget.dataConfig.metric.compareWith ?? null,
					},
				])
			),
		[comparisonMap, visibleRenderedWidgets]
	);

	const widgetTypeMap = useMemo(
		() => createWidgetTypeMap(visibleRenderedWidgets),
		[visibleRenderedWidgets]
	);
	const persistedLayouts = useMemo(
		() =>
			[...visibleRenderedWidgets]
				.sort(compareWidgetLayouts)
				.map(getWidgetRenderLayout),
		[visibleRenderedWidgets]
	);
	const persistedLayoutMap = useMemo(
		() => createLayoutMap(persistedLayouts),
		[persistedLayouts]
	);
	const visibleWidgetIdSet = useMemo(
		() => new Set(visibleRenderedWidgets.map((widget) => widget.id)),
		[visibleRenderedWidgets]
	);

	useEffect(() => {
		if (!isEditingLayout) {
			syncDraftLayouts(persistedLayouts);
		}
	}, [isEditingLayout, persistedLayouts, syncDraftLayouts]);

	useEffect(() => {
		setIsSavingLayoutTransition(false);
		stopEditing();
	}, [numericDashboardId, stopEditing]);

	useEffect(() => {
		if (isMobile && isEditingLayout) {
			cancelEditing(persistedLayouts);
		}
	}, [cancelEditing, isEditingLayout, isMobile, persistedLayouts]);

	const activeLayoutMap = useMemo(
		() =>
			isEditingLayout || isSavingLayoutTransition
				? createLayoutMap(draftLayouts)
				: persistedLayoutMap,
		[
			draftLayouts,
			isEditingLayout,
			isSavingLayoutTransition,
			persistedLayoutMap,
		]
	);

	const sortedRenderWidgets = useMemo(() => {
		if (!renderResult) {
			return [];
		}

		return renderResult.widgets
			.filter((widget) => visibleWidgetIdSet.has(widget.widgetId))
			.sort((left, right) => {
				const leftLayout = activeLayoutMap.get(left.widgetId);
				const rightLayout = activeLayoutMap.get(right.widgetId);

				if (leftLayout && rightLayout) {
					return compareWidgetLayouts(leftLayout, rightLayout);
				}

				if (leftLayout) {
					return -1;
				}

				if (rightLayout) {
					return 1;
				}

				return left.widgetId - right.widgetId;
			});
	}, [activeLayoutMap, renderResult, visibleWidgetIdSet]);

	const isSavingLayout =
		updateDashboardWidgetLayouts.isPending || isSavingLayoutTransition;
	const isLayoutEditingAvailable =
		allowLayoutEditing && !isMobile && visibleRenderedWidgets.length > 0;

	const handleStartEditing = () => {
		if (!allowLayoutEditing) {
			return;
		}

		startEditing(persistedLayouts);
	};

	const handleCancelEditing = () => {
		cancelEditing(persistedLayouts);
	};

	const handleAutoOrganize = () => {
		const organized = autoOrganizeWidgetLayouts(draftLayouts, widgetTypeMap);
		setDraftLayouts(organized);
	};

	const handleLayoutChange = (nextLayout: ViewerWidgetLayout[]) => {
		setDraftLayouts(nextLayout);
	};

	const handleSaveLayout = async () => {
		if (!numericDashboardId) {
			return;
		}

		if (hasOverlappingWidgetLayouts(draftLayouts)) {
			notifications.show({
				title: t('dashboard.layoutEditor.notifications.errorTitle'),
				message: t('dashboard.layoutEditor.notifications.overlapMessage'),
				color: 'red',
			});
			return;
		}

		const changedLayouts = draftLayouts.filter(
			(layout) =>
				!areLayoutsEqual(layout, persistedLayoutMap.get(layout.widgetId))
		);

		if (!changedLayouts.length) {
			stopEditing();
			return;
		}

		setIsSavingLayoutTransition(true);

		const submittedLayouts = changedLayouts.map((layout) => ({
			...layout,
			...normalizeWidgetLayoutForType(
				applyWidgetMinimumDimensions(
					{
						positionX: layout.positionX,
						positionY: layout.positionY,
						width: layout.width,
						height: layout.height,
					},
					widgetTypeMap.get(layout.widgetId) ?? 'KPI'
				),
				widgetTypeMap.get(layout.widgetId) ?? 'KPI'
			),
		}));

		try {
			await updateDashboardWidgetLayouts.mutateAsync({
				dashboardId: numericDashboardId,
				items: submittedLayouts.map((layout) => ({
					id: layout.widgetId,
					data: {
						positionX: layout.positionX,
						positionY: layout.positionY,
						width: layout.width,
						height: layout.height,
					},
				})),
			});

			let refreshedLayouts = persistedLayouts;
			let matchedSubmittedLayouts = false;

			for (let attempt = 0; attempt < 5; attempt += 1) {
				const widgetsResponse = await refetchWidgets();
				refreshedLayouts = getVisibleDashboardWidgets(
					(widgetsResponse.data ?? EMPTY_WIDGETS).filter((widget) =>
						renderedWidgetIdSet.has(widget.id)
					),
					visibilityContext
				)
					.sort(compareWidgetLayouts)
					.map(getWidgetRenderLayout);

				const refreshedLayoutMap = createLayoutMap(refreshedLayouts);
				matchedSubmittedLayouts = submittedLayouts.every((layout) =>
					areLayoutsEqual(layout, refreshedLayoutMap.get(layout.widgetId))
				);

				if (matchedSubmittedLayouts) {
					break;
				}

				await new Promise((resolve) => window.setTimeout(resolve, 200));
			}

			await refetchRenderResult();
			syncDraftLayouts(refreshedLayouts);

			if (!matchedSubmittedLayouts) {
				throw new Error('Saved layout could not be confirmed from the server');
			}

			stopEditing();
			setIsSavingLayoutTransition(false);

			notifications.show({
				title: t('dashboard.layoutEditor.notifications.savedTitle'),
				message: t('dashboard.layoutEditor.notifications.savedMessage'),
				color: 'green',
			});
		} catch (mutationError) {
			const widgetsResponse = await refetchWidgets();
			await refetchRenderResult();
			syncDraftLayouts(
				getVisibleDashboardWidgets(
					(widgetsResponse.data ?? EMPTY_WIDGETS).filter((widget) =>
						renderedWidgetIdSet.has(widget.id)
					),
					visibilityContext
				)
					.sort(compareWidgetLayouts)
					.map(getWidgetRenderLayout)
			);
			stopEditing();
			setIsSavingLayoutTransition(false);

			notifications.show({
				title: t('dashboard.layoutEditor.notifications.errorTitle'),
				message: getErrorMessage(mutationError),
				color: 'red',
			});
		}
	};

	if (dashboardsLoading) {
		return (
			<Stack align='center' gap='sm' py='xl'>
				<Loader size='sm' />
				<Text size='sm' c='dimmed'>
					{t('dashboard.title')}
				</Text>
			</Stack>
		);
	}

	if (!dashboards.length || isForbidden) {
		const emptyTitle = isForbidden
			? campaignId
				? t('dashboard.unauthorizedTitle')
				: t('dashboard.unassignedTitle')
			: t('dashboard.emptyTitle');
		const emptyDescription = isForbidden
			? null
			: t('dashboard.emptyDescription');

		return (
			<Stack align='center' gap='sm' py='xl'>
				<Box className={styles.emptyStateIcon}>
					<IconLayoutDashboard size={28} stroke={1.5} />
				</Box>
				<Stack gap={4} align='center'>
					<Text fw={600} size='sm'>
						{emptyTitle}
					</Text>
					{emptyDescription && (
						<Text size='sm' c='dimmed' ta='center' maw={320}>
							{emptyDescription}
						</Text>
					)}
				</Stack>
			</Stack>
		);
	}

	return (
		<div className={styles.root}>
			<div className={styles.toolbarShell}>
				<CampaignDashboardViewerToolbar
					dashboardOptions={dashboardOptions}
					isFetching={isFetching}
					isLayoutEditingAvailable={isLayoutEditingAvailable}
					isMobile={Boolean(isMobile)}
					isSavingLayout={isSavingLayout}
					renderLoading={renderLoading}
					selectedTimeRange={selectedTimeRange}
					period={renderResult?.period}
					comparisonPeriod={unifiedRenderResult?.comparisonPeriod}
					comparisonEnabled={comparisonEnabled}
					allowLayoutEditing={allowLayoutEditing}
					showBackButton={Boolean(onBackClick)}
					onBackClick={onBackClick}
					onAutoOrganize={handleAutoOrganize}
					onCancelEditing={handleCancelEditing}
					onRefresh={() => void refetchRenderResult()}
					onSaveLayout={() => void handleSaveLayout()}
					onStartEditing={handleStartEditing}
					onTimeRangeChange={(v: AnalyticsTimeRange | null) =>
						setSelectedTimeRange(v)
					}
					onComparisonChange={setComparisonEnabled}
				/>
			</div>

			<div className={styles.canvasShell} ref={editorContainerRef}>
				<CampaignDashboardViewerContent
					activeLayoutMap={activeLayoutMap}
					editorWidth={editorWidth}
					errorMessage={error instanceof Error ? error.message : undefined}
					isError={isError}
					isMobile={Boolean(isMobile)}
					isSavingLayout={isSavingLayout}
					renderLoading={renderLoading}
					renderResult={
						renderResult
							? {
									...renderResult,
									widgets: sortedRenderWidgets,
								}
							: undefined
					}
					comparisonMap={widgetComparisonDataMap}
					comparisonPeriodLabel={comparisonPeriodLabel}
					selectedTimeRange={selectedTimeRange}
					widgetsCount={visibleRenderedWidgets.length}
					onLayoutChange={handleLayoutChange}
				/>
			</div>
		</div>
	);
};

export default CampaignDashboardViewer;
