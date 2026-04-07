import { Portal, Transition } from '@mantine/core';
import { useSidebarStore } from '~/stores/sidebarStore';
import DashboardWidgetForm from '../DashboardWidgetForm';
import {
	useDashboardSectionModals,
	useDashboardSectionSelection,
} from '../DashboardSection.context';
import styles from './DashboardWidgetFormOverlay.module.css';

/** Matches `.header { height: 70px }` in Layout.module.css */
const HEADER_HEIGHT = 70;

const DashboardWidgetFormOverlay = () => {
	const { collapsed } = useSidebarStore();
	const { campaignId, attributeMetricKeys, selectedDashboardId } =
		useDashboardSectionSelection();
	const { widgetModalOpened, editingWidget, closeWidgetModal } =
		useDashboardSectionModals();

	const sidebarLeft = collapsed
		? 'var(--sidebar-width-collapsed)'
		: 'var(--sidebar-width)';

	return (
		<Portal>
			<Transition
				mounted={widgetModalOpened}
				transition='fade'
				duration={150}
				timingFunction='ease'
			>
				{(transitionStyles) => (
					<div
						className={styles.overlay}
						style={{
							top: HEADER_HEIGHT,
							left: sidebarLeft,
							...transitionStyles,
						}}
					>
						{selectedDashboardId && (
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
				)}
			</Transition>
		</Portal>
	);
};

export default DashboardWidgetFormOverlay;
