import { Modal } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import DashboardDefinitionForm from '../DashboardDefinitionForm';
import DashboardModalHeader from '../DashboardModalHeader';
import {
	useDashboardSectionModals,
	useDashboardSectionSelection,
} from '../DashboardSection.context';
import DashboardWidgetForm from '../DashboardWidgetForm';

const DashboardModals = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const { campaignId, selectedDashboardId, setSelectedDashboardId } =
		useDashboardSectionSelection();
	const {
		dashboardModalOpened,
		widgetModalOpened,
		editingDashboard,
		editingWidget,
		closeDashboardModal,
		closeWidgetModal,
	} = useDashboardSectionModals();

	const dashboardModalTitle = editingDashboard
		? t('dashboardBuilder.drawer.editDashboardTitle')
		: t('dashboardBuilder.drawer.createDashboardTitle');

	const widgetModalTitle = editingWidget
		? t('dashboardBuilder.drawer.editWidgetTitle')
		: t('dashboardBuilder.drawer.createWidgetTitle');

	return (
		<>
			<Modal
				opened={dashboardModalOpened}
				onClose={closeDashboardModal}
				centered
				size='lg'
				radius='md'
				padding='xl'
				overlayProps={{ backgroundOpacity: 0.35 }}
				title={
					<DashboardModalHeader
						title={dashboardModalTitle}
						description={t('dashboardBuilder.drawer.dashboardDescription')}
					/>
				}
			>
				<DashboardDefinitionForm
					campaignId={campaignId}
					dashboard={editingDashboard}
					onCancel={closeDashboardModal}
					onSuccess={(dashboardId) => {
						closeDashboardModal();
						if (dashboardId) {
							setSelectedDashboardId(dashboardId);
						}
					}}
				/>
			</Modal>

			<Modal
				opened={widgetModalOpened}
				onClose={closeWidgetModal}
				centered
				size='xl'
				radius='md'
				padding='xl'
				overlayProps={{ backgroundOpacity: 0.35 }}
				title={<DashboardModalHeader title={widgetModalTitle} />}
			>
				{selectedDashboardId && (
					<DashboardWidgetForm
						campaignId={campaignId}
						dashboardId={selectedDashboardId}
						widget={editingWidget}
						onCancel={closeWidgetModal}
						onSuccess={closeWidgetModal}
					/>
				)}
			</Modal>
		</>
	);
};

export default DashboardModals;
