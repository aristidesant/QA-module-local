import { Box, Loader, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { useContainerWidth } from 'react-grid-layout/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Layout } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
	applyWidgetMinimumDimensions,
	compareWidgetLayouts,
	hasOverlappingWidgetLayouts,
	normalizeWidgetLayoutForType,
} from '~/modules/campaigns/dashboardLayout';
import type {
	AnalyticsTimeRange,
	MetricComparison,
} from '~/models/AnalyticsDashboard';
import {
	useDashboardRender,
	useDashboardRenderComparison,
	useDashboards,
	useDashboardWidgets,
	useUpdateDashboardWidgetLayouts,
} from '~/queries/analyticsDashboardsQueries';
import { getErrorMessage } from '~/utils/httpClient';
import {
	areLayoutCollectionsEqual,
	areLayoutsEqual,
	createLayoutMap,
	createWidgetTypeMap,
	EMPTY_DASHBOARDS,
	EMPTY_WIDGETS,
	fromGridLayout,
	getWidgetRenderLayout,
	toGridLayout,
} from './CampaignDashboardViewer.helpers';
import CampaignDashboardViewerContent from './CampaignDashboardViewerContent';
import CampaignDashboardViewerToolbar from './CampaignDashboardViewerToolbar';
import useCampaignDashboardViewerStore from './store/useCampaignDashboardViewerStore';
import styles from './CampaignDashboardViewer.module.css';

const CampaignDashboardViewer = ({
	campaignId,
	initialDashboardId,
	allowLayoutEditing = true,
}: {
	campaignId?: number | null;
	initialDashboardId?: number;
	allowLayoutEditing?: boolean;
}) => {
	const [isSavingLayoutTransition, setIsSavingLayoutTransition] =
		useState(false);
	const { t } = useTranslation('campaign.form.dashboards');
	const isMobile = useMediaQuery('(max-width: 48rem)');
	const { containerRef: editorContainerRef, width: editorWidth } =
		useContainerWidth({ initialWidth: 1200 });

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
	}, [campaignId, initialDashboardId, resetStore]);

	const { data: dashboardsData, isLoading: dashboardsLoading } = useDashboards({
		campaignId,
	});
	const dashboards = dashboardsData ?? EMPTY_DASHBOARDS;

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
		() => (selectedTimeRange ? { timeRange: selectedTimeRange } : {}),
		[selectedTimeRange]
	);

	const {
		data: renderResult,
		isLoading: renderLoading,
		isError,
		error,
		refetch: refetchRenderResult,
		isFetching,
	} = useDashboardRender(numericDashboardId, renderPayload);

	const { data: comparisonResult } = useDashboardRenderComparison(
		numericDashboardId,
		{
			timeRange: selectedTimeRange ?? undefined,
			comparisonMode: 'PREVIOUS_PERIOD',
		},
		Boolean(comparisonEnabled && selectedTimeRange)
	);

	const comparisonMap = useMemo((): Map<number, MetricComparison> => {
		if (!comparisonResult) return new Map();
		return new Map(
			comparisonResult.widgets
				.filter((w) => w.comparison)
				.map((w) => [w.widgetId, w.comparison!])
		);
	}, [comparisonResult]);
	const { data: widgetsData, refetch: refetchWidgets } =
		useDashboardWidgets(numericDashboardId);
	const widgets = widgetsData ?? EMPTY_WIDGETS;

	const widgetTypeMap = useMemo(() => createWidgetTypeMap(widgets), [widgets]);
	const persistedLayouts = useMemo(
		() => [...widgets].sort(compareWidgetLayouts).map(getWidgetRenderLayout),
		[widgets]
	);
	const persistedLayoutMap = useMemo(
		() => createLayoutMap(persistedLayouts),
		[persistedLayouts]
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

		return [...renderResult.widgets].sort((left, right) => {
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
	}, [activeLayoutMap, renderResult]);

	const editableGridLayout = useMemo(
		() =>
			draftLayouts.map((layout) =>
				toGridLayout(layout, widgetTypeMap.get(layout.widgetId) ?? 'KPI')
			),
		[draftLayouts, widgetTypeMap]
	);

	const hasDraftChanges = useMemo(
		() =>
			draftLayouts.some(
				(layout) =>
					!areLayoutsEqual(layout, persistedLayoutMap.get(layout.widgetId))
			),
		[draftLayouts, persistedLayoutMap]
	);

	const isSavingLayout =
		updateDashboardWidgetLayouts.isPending || isSavingLayoutTransition;
	const isLayoutEditingAvailable =
		allowLayoutEditing && !isMobile && widgets.length > 0;

	const handleStartEditing = () => {
		if (!allowLayoutEditing) {
			return;
		}

		startEditing(persistedLayouts);
	};

	const handleCancelEditing = () => {
		cancelEditing(persistedLayouts);
	};

	const handleLayoutChange = (nextLayout: Layout) => {
		const currentLayoutMap = createLayoutMap(draftLayouts);
		const normalizedLayouts = nextLayout
			.map((item) => {
				const normalizedLayout = fromGridLayout(
					item,
					widgetTypeMap.get(Number(item.i)) ?? 'KPI'
				);
				const currentLayout = currentLayoutMap.get(normalizedLayout.widgetId);

				return currentLayout
					? { ...currentLayout, ...normalizedLayout }
					: normalizedLayout;
			})
			.sort(compareWidgetLayouts);

		setDraftLayouts(
			areLayoutCollectionsEqual(draftLayouts, normalizedLayouts)
				? draftLayouts
				: normalizedLayouts
		);
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
				refreshedLayouts = (widgetsResponse.data ?? EMPTY_WIDGETS)
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
				(widgetsResponse.data ?? EMPTY_WIDGETS)
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

	if (!dashboards.length) {
		return (
			<Stack align='center' gap='sm' py='xl'>
				<Box className={styles.emptyStateIcon}>
					<IconLayoutDashboard size={28} stroke={1.5} />
				</Box>
				<Stack gap={4} align='center'>
					<Text fw={600} size='sm'>
						{t('dashboard.emptyTitle')}
					</Text>
					<Text size='sm' c='dimmed' ta='center' maw={320}>
						{t('dashboard.emptyDescription')}
					</Text>
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
					hasDraftChanges={hasDraftChanges}
					renderLoading={renderLoading}
					selectedTimeRange={selectedTimeRange}
					period={renderResult?.period}
					comparisonPeriod={comparisonResult?.period}
					comparisonEnabled={comparisonEnabled}
					allowLayoutEditing={allowLayoutEditing}
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

			<div className={styles.canvasShell}>
				<div className={styles.canvasViewport}>
					<div className={styles.canvasMeasure} ref={editorContainerRef}>
						<CampaignDashboardViewerContent
							activeLayoutMap={activeLayoutMap}
							editableGridLayout={editableGridLayout}
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
							comparisonMap={comparisonMap}
							widgetsCount={widgets.length}
							onLayoutChange={handleLayoutChange}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CampaignDashboardViewer;
