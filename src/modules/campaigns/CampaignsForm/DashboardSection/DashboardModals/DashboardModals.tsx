import { Modal } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import DashboardDefinitionForm from '../DashboardDefinitionForm';
import DashboardModalHeader from '../DashboardModalHeader';
import {
	useDashboardSectionModals,
	useDashboardSectionSelection,
} from '../DashboardSection.context';

const DashboardModals = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const {
		campaignId,
		selectedDashboardId: _selectedDashboardId,
		setSelectedDashboardId,
	} = useDashboardSectionSelection();
	const { dashboardModalOpened, editingDashboard, closeDashboardModal } =
		useDashboardSectionModals();

	const dashboardModalTitle = editingDashboard
		? t('dashboardBuilder.drawer.editDashboardTitle')
		: t('dashboardBuilder.drawer.createDashboardTitle');

	return (
		<>
			<Modal
				opened={dashboardModalOpened}
				onClose={closeDashboardModal}
				centered
				size='lg'
				radius='md'
				padding='md'
				overlayProps={{ backgroundOpacity: 0.35 }}
				title={
					<DashboardModalHeader
						kicker={t('dashboardBuilder.drawer.dashboardKicker')}
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
		</>
	);
};

export default DashboardModals;
