import { Badge, Group, Modal, Text, ThemeIcon } from '@mantine/core';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import CampaignDashboardViewer from '~/modules/campaigns/CampaignDashboardViewer';
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
	const {
		dashboardModalOpened,
		editingDashboard,
		previewDashboard,
		closeDashboardModal,
		closePreviewDashboard,
	} = useDashboardSectionModals();

	const dashboardModalTitle = editingDashboard
		? t('dashboardBuilder.drawer.editDashboardTitle')
		: t('dashboardBuilder.drawer.createDashboardTitle');

	return (
		<>
			{/* Create / edit dashboard definition */}
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

			{/* Full-screen dashboard preview */}
			<Modal
				opened={previewDashboard !== null}
				onClose={closePreviewDashboard}
				fullScreen
				padding='md'
				styles={{ body: { padding: 0 } }}
				title={
					previewDashboard && (
						<Group gap='sm' align='center' wrap='nowrap'>
							<ThemeIcon variant='light' color='blue' size='lg' radius='md'>
								<IconLayoutDashboard size={18} />
							</ThemeIcon>
							<div>
								<Group gap='xs' align='center'>
									<Text fw={600} size='sm' c='gray.9' lh={1.25}>
										{previewDashboard.name}
									</Text>
									{previewDashboard.isDefault && (
										<Badge variant='light' color='blue' size='xs' radius='sm'>
											{t('dashboardBuilder.defaultBadge')}
										</Badge>
									)}
								</Group>
								<Text size='xs' c='dimmed' lh={1.4}>
									{previewDashboard.description ??
										t('dashboardBuilder.actions.previewDashboard')}
								</Text>
							</div>
						</Group>
					)
				}
			>
				{previewDashboard !== null && (
					<CampaignDashboardViewer
						campaignId={campaignId}
						initialDashboardId={previewDashboard.id}
						allowLayoutEditing={false}
					/>
				)}
			</Modal>
		</>
	);
};

export default DashboardModals;
