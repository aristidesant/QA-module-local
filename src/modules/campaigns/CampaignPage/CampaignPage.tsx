import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';
import { Alert, Flex, Loader } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import AccessDenied from '~/components/AccessDenied';
import { useGetCampaign } from '~/queries/campaignsQueries';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { useCampaignsStore } from '~/stores/campaignsStore';

const CampaignPage = () => {
	const { t } = useTranslation('campaign.detail');
	const { campaignId } = useParams<{ campaignId: string }>();
	const navigate = useNavigate();

	const selectCampaign = useCampaignsStore((state) => state.selectCampaign);
	const resetView = useCampaignsStore((state) => state.resetView);

	const { canPerformAction } = usePermissions();
	const canEditCampaign = canPerformAction(
		ModuleEnum.CAMPAIGNS,
		PermissionEnum.UPDATE
	);

	const {
		data: campaign,
		isLoading,
		isError,
		error,
	} = useGetCampaign(campaignId ?? '');

	useEffect(() => {
		if (campaign) {
			selectCampaign(campaign);
		}
	}, [campaign, selectCampaign]);

	useEffect(() => {
		return () => {
			resetView();
		};
	}, [resetView]);

	if (!canEditCampaign) {
		return <AccessDenied onBackClick={() => navigate('/campaigns')} />;
	}

	if (!campaignId) {
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
					{t('page.notFound')}
				</Alert>
			</ContentContainer>
		);
	}

	if (isLoading) {
		return (
			<ContentContainer
				title={t('page.loadingTitle')}
				description={t('page.loadingDescription')}
				showBackButton
				onBackClick={() => navigate('/campaigns')}
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

	return <Outlet context={campaign} />;
};

export default CampaignPage;
