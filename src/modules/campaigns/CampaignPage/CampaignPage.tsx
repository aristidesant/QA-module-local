import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert, Flex, Loader } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { CampaignsForm } from '../CampaignsForm/CampaignsForm';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';

const CampaignPage = () => {
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
		if (campaign && selectedCampaign?.id !== campaign.id) {
			selectCampaign(campaign);
		}
	}, [campaign, selectedCampaign?.id, selectCampaign]);

	if (isLoading) {
		return (
			<ContentContainer
				title='Loading Campaign...'
				description='Please wait while we fetch the campaign details.'
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
				title='Campaign Unavailable'
				description='We could not find the campaign you are looking for.'
				showBackButton
				onBackClick={() => navigate('/campaigns')}
			>
				<Alert
					icon={<IconAlertCircle size={16} />}
					title='Error'
					color='red'
					variant='light'
				>
					{error instanceof Error
						? error.message
						: 'Campaign not found or failed to load.'}
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
