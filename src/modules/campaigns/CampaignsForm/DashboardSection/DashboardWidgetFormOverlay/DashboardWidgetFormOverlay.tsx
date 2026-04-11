import { Portal } from '@mantine/core';
import { useSidebarStore } from '~/stores/sidebarStore';
import DashboardWidgetForm from '../DashboardWidgetForm';
import {
	useDashboardSectionModals,
	useDashboardSectionSelection,
} from '../DashboardSection.context';
import styles from './DashboardWidgetFormOverlay.module.css';

const DashboardWidgetFormOverlay = () => {
	const { collapsed } = useSidebarStore();
	const { campaignId, attributeMetricKeys, selectedDashboardId } =
		useDashboardSectionSelection();
	const { widgetModalOpened, editingWidget, closeWidgetModal } =
		useDashboardSectionModals();

	return (
		<Portal>
			<div
				className={styles.overlay}
				data-open={widgetModalOpened}
				data-sidebar={collapsed ? 'collapsed' : 'expanded'}
			>
				{widgetModalOpened && selectedDashboardId && (
					<DashboardWidgetForm
						campaignId={campaignId}
						attributeMetricKeys={attributeMetricKeys}
						dashboardId={selectedDashboardId}
						widget={editingWidget}
						onCancel={closeWidgetModal}
						onSuccess={closeWidgetModal}
					/>
				)}
			</div>
		</Portal>
	);
};

export default DashboardWidgetFormOverlay;
