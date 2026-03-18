import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ReactGridLayout, verticalCompactor } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import type { DashboardRenderWidget } from '~/models/AnalyticsDashboard';
import {
	DASHBOARD_LAYOUT_COLUMNS,
	DASHBOARD_LAYOUT_ROW_HEIGHT,
} from '~/modules/campaigns/dashboardLayout';
import {
	areLayoutCollectionsEqual,
	fromGridLayout,
	getEditorCanvasMinHeight,
	GRID_MARGIN,
	toGridLayout,
} from '../CampaignDashboardViewer.helpers';
import type { ViewerWidgetLayout } from '../types';
import CampaignDashboardViewerWidget from '../CampaignDashboardViewerWidget';
import widgetStyles from '../CampaignDashboardViewerWidget/CampaignDashboardViewerWidget.module.css';
import styles from './CampaignDashboardViewerLayoutEditor.module.css';

const EDITOR_CONTAINER_PADDING: [number, number] = [8, 8];

interface CampaignDashboardViewerLayoutEditorProps {
	widgets: DashboardRenderWidget[];
	activeLayoutMap: Map<number, ViewerWidgetLayout>;
	editorWidth: number;
	isInteractionDisabled?: boolean;
	onLayoutChange: (layout: ViewerWidgetLayout[]) => void;
}

const CampaignDashboardViewerLayoutEditor = ({
	widgets,
	activeLayoutMap,
	editorWidth,
	isInteractionDisabled = false,
	onLayoutChange,
}: CampaignDashboardViewerLayoutEditorProps) => {
	const widgetTypeMap = useMemo(
		() =>
			new Map(
				widgets.map((widget) => [widget.widgetId, widget.widgetType] as const)
			),
		[widgets]
	);
	const gridLayouts = useMemo(
		() =>
			widgets.flatMap((widget) => {
				const layout = activeLayoutMap.get(widget.widgetId);

				if (!layout) {
					return [];
				}

				return [toGridLayout(layout, widget.widgetType)];
			}),
		[activeLayoutMap, widgets]
	);
	const editorCanvasMinHeight = getEditorCanvasMinHeight(
		Array.from(activeLayoutMap.values())
	);
	const layoutRef = useRef<ViewerWidgetLayout[]>(
		Array.from(activeLayoutMap.values())
	);

	useEffect(() => {
		layoutRef.current = Array.from(activeLayoutMap.values());
	}, [activeLayoutMap]);

	const commitLayout = (nextLayout: ViewerWidgetLayout[]) => {
		const normalizedLayout = [...nextLayout].sort((left, right) =>
			left.positionY === right.positionY
				? left.positionX - right.positionX
				: left.positionY - right.positionY
		);

		if (areLayoutCollectionsEqual(layoutRef.current, normalizedLayout)) {
			return;
		}

		layoutRef.current = normalizedLayout;
		onLayoutChange(normalizedLayout);
	};

	const handleLayoutChange = useCallback(
		(nextGridLayout: Layout) => {
			const nextViewerLayout = nextGridLayout.map((item) => {
				const widgetType = widgetTypeMap.get(Number(item.i)) ?? 'KPI';
				return fromGridLayout(item, widgetType);
			});
			commitLayout(nextViewerLayout);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[widgetTypeMap]
	);

	return (
		<ReactGridLayout
			className={styles.surface}
			style={{ minHeight: `${editorCanvasMinHeight}px` }}
			width={editorWidth}
			layout={gridLayouts}
			gridConfig={{
				cols: DASHBOARD_LAYOUT_COLUMNS,
				rowHeight: DASHBOARD_LAYOUT_ROW_HEIGHT,
				margin: GRID_MARGIN,
				containerPadding: EDITOR_CONTAINER_PADDING,
			}}
			dragConfig={{
				enabled: !isInteractionDisabled,
				handle: `.${widgetStyles.widgetDragHandle}`,
			}}
			resizeConfig={{
				enabled: !isInteractionDisabled,
			}}
			compactor={verticalCompactor}
			autoSize={false}
			onDragStop={handleLayoutChange}
			onResizeStop={handleLayoutChange}
		>
			{widgets.map((widget, index) => {
				const layout = activeLayoutMap.get(widget.widgetId);

				if (!layout) {
					return null;
				}

				return (
					<div key={String(widget.widgetId)} className={styles.gridCell}>
						<CampaignDashboardViewerWidget
							widget={widget}
							index={index}
							layout={layout}
							isEditing
						/>
					</div>
				);
			})}
		</ReactGridLayout>
	);
};

export default CampaignDashboardViewerLayoutEditor;
