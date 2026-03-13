import ReactGridLayout, { type Layout } from 'react-grid-layout/legacy';
import type { DashboardRenderWidget } from '~/models/AnalyticsDashboard';
import {
	DASHBOARD_LAYOUT_COLUMNS,
	DASHBOARD_LAYOUT_ROW_HEIGHT,
} from '~/modules/campaigns/dashboardLayout';
import {
	getEditorCanvasMinHeight,
	GRID_MARGIN,
} from '../CampaignDashboardViewer.helpers';
import type { ViewerWidgetLayout } from '../types';
import CampaignDashboardViewerWidget from '../CampaignDashboardViewerWidget';
import widgetStyles from '../CampaignDashboardViewerWidget/CampaignDashboardViewerWidget.module.css';
import styles from './CampaignDashboardViewerLayoutEditor.module.css';

const EDITOR_CONTAINER_PADDING: [number, number] = [8, 8];

interface CampaignDashboardViewerLayoutEditorProps {
	widgets: DashboardRenderWidget[];
	activeLayoutMap: Map<number, ViewerWidgetLayout>;
	editableGridLayout: Layout;
	editorWidth: number;
	isInteractionDisabled?: boolean;
	onLayoutChange: (layout: Layout) => void;
}

const CampaignDashboardViewerLayoutEditor = ({
	widgets,
	activeLayoutMap,
	editableGridLayout,
	editorWidth,
	isInteractionDisabled = false,
	onLayoutChange,
}: CampaignDashboardViewerLayoutEditorProps) => {
	const editorCanvasMinHeight = getEditorCanvasMinHeight(
		Array.from(activeLayoutMap.values())
	);

	return (
		<div
			className={styles.surface}
			style={{ minHeight: `${editorCanvasMinHeight}px` }}
		>
			<ReactGridLayout
				width={editorWidth}
				layout={editableGridLayout}
				cols={DASHBOARD_LAYOUT_COLUMNS}
				rowHeight={DASHBOARD_LAYOUT_ROW_HEIGHT}
				margin={GRID_MARGIN}
				containerPadding={EDITOR_CONTAINER_PADDING}
				compactType={null}
				allowOverlap={false}
				draggableCancel={`.${widgetStyles.widgetNoDrag}, .mantine-Table-root, button, input, select, textarea, a, [role="button"]`}
				isResizable={!isInteractionDisabled}
				isDraggable={!isInteractionDisabled}
				useCSSTransforms
				onLayoutChange={onLayoutChange}
			>
				{widgets.map((widget, index) => (
					<div key={String(widget.widgetId)} className={styles.gridCell}>
						<CampaignDashboardViewerWidget
							widget={widget}
							index={index}
							layout={activeLayoutMap.get(widget.widgetId)}
							isEditing
						/>
					</div>
				))}
			</ReactGridLayout>
		</div>
	);
};

export default CampaignDashboardViewerLayoutEditor;
