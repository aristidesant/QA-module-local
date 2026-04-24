import { useEffect } from 'react';
import { Portal } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import rolesApi from '~/api/rolesApi';
import { useSidebarStore } from '~/stores/sidebarStore';
import DashboardWidgetForm from '../DashboardWidgetForm';
import {
	useDashboardSectionModals,
	useDashboardSectionSelection,
} from '../DashboardSection.context';
import styles from './DashboardWidgetFormOverlay.module.css';

const DashboardWidgetFormOverlay = () => {
	const { collapsed } = useSidebarStore();
	const queryClient = useQueryClient();
	const {
		campaignId,
		attributeMetricKeys,
		selectedDashboardId,
		overlayTopOffset,
	} = useDashboardSectionSelection();
	const { widgetModalOpened, editingWidget, closeWidgetModal } =
		useDashboardSectionModals();

	useEffect(() => {
		if (!widgetModalOpened) {
			return;
		}

		void queryClient.prefetchQuery({
			queryKey: ['roles'],
			queryFn: async () => rolesApi().getAllRoles(),
		});
	}, [queryClient, widgetModalOpened]);

	return (
		<Portal>
			<div
				className={styles.overlay}
				data-open={widgetModalOpened}
				data-sidebar={collapsed ? 'collapsed' : 'expanded'}
				/* inline-style-allow: Dynamically calculated based on sidebar width state */
				style={{ top: overlayTopOffset }}
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
