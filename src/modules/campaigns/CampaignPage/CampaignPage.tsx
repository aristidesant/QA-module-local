import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert, Flex, Loader } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { CampaignsForm } from '../CampaignsForm/CampaignsForm';
import { useGetCampaign } from '~/queries/campaignsQueries';
import usePermissions from '~/hooks/usePermissions';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { ModuleEnum } from '~/constants/ModuleEnum';
import AccessDenied from '~/components/AccessDenied';
import { useCampaignsStore } from '~/stores/campaignsStore';

const CampaignPage = () => {
	const { t } = useTranslation(['campaign.detail', 'common']);
	const { campaignId } = useParams<{ campaignId: string }>();
	const navigate = useNavigate();

	const selectCampaign = useCampaignsStore((state) => state.selectCampaign);
	const resetView = useCampaignsStore((state) => state.resetView);
	const setEditCampaign = useCampaignsStore((state) => state.setEditCampaign);
	const setSelectedTab = useCampaignsStore((state) => state.setSelectedTab);
	const setRightComponent = useCampaignsStore(
		(state) => state.setRightComponent
	);
	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);

	const {
		data: campaign,
		isLoading,
		isError,
		error,
	} = useGetCampaign(campaignId ?? '');

	const { canPerformAction } = usePermissions();

	// If a user doesn't have edit access to campaigns, show a generic access denied.
	if (!canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.UPDATE)) {
		return <AccessDenied onBackClick={() => navigate('/campaigns')} />;
	}

	useEffect(() => {
		setEditCampaign(true);
		setSelectedTab('general');
		setRightComponent(null);

		return () => {
			resetView();
		};
		// We deliberately run this effect only on mount/unmount to avoid resetting state during tab activity.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		// When we receive the campaign from the API, always make sure the
		// full campaign object is selected in the store. This helps avoid
		// placeholder state where only an ID is selected and prevents UI
		// flicker when data finishes loading.
		if (
			campaign &&
			(!selectedCampaign ||
				selectedCampaign.id !== campaign.id ||
				// If the store holds a partial/stub campaign (no name), prefer
				// the freshly fetched complete campaign object.
				(selectedCampaign as any).name !== campaign.name ||
				// If the store has not been refreshed after an update (no updatedAt or stale),
				// replace it with the freshly fetched version to keep state in sync.
				!(selectedCampaign as any).updatedAt ||
				(selectedCampaign as any).updatedAt !== (campaign as any).updatedAt)
		) {
			selectCampaign(campaign);
		}
	}, [campaign, selectedCampaign, selectCampaign]);

	if (isLoading) {
		return (
			<ContentContainer
				title={t('page.loadingTitle')}
				description={t('page.loadingDescription')}
			>
				<Flex justify='center' align='center' style={{ minHeight: '400px' }}>
					<Loader size='lg' />
				</Flex>
			</ContentContainer>
		);
	}

	if (isError || !campaign) {
		return (
			<ContentContainer
				title={t('page.errorTitle')}
				description={t('page.errorDescription')}
				showBackButton
				onBackClick={() => navigate('/campaigns')}
			>
				<Alert
					icon={<IconAlertCircle size={16} />}
					title={t('status.error', { ns: 'common' })}
					color='red'
					variant='light'
				>
					{error instanceof Error ? error.message : t('page.notFound')}
				</Alert>
			</ContentContainer>
		);
	}

	return (
		<CampaignsForm
			campaign={campaign}
			onBack={() => {
				navigate('/campaigns');
			}}
		/>
	);
};

export default CampaignPage;
