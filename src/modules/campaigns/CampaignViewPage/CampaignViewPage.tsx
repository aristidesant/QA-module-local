import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert, Flex, Loader, Stack, ActionIcon, Tooltip } from '@mantine/core';
import { IconAlertCircle, IconEdit } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { ContactSection } from '../CampaignsForm/ContactSection';

const CampaignViewPage = () => {
	const { campaignId } = useParams<{ campaignId: string }>();
	const navigate = useNavigate();

	const { selectCampaign, resetView, rightComponent } = useCampaignsStore(
		(state) => state
	);

	const {
		data: campaign,
		isLoading,
		isError,
		error,
	} = useGetCampaign(campaignId ?? '');

	useEffect(() => {
		return () => {
			resetView();
		};
	}, [resetView]);

	useEffect(() => {
		if (campaign) {
			selectCampaign(campaign);
		}
	}, [campaign, selectCampaign]);

	if (!campaignId) {
		return (
			<ContentContainer
				title='Campaign overview'
				description='Review the latest performance and configuration details.'
				showBackButton
				onBackClick={() => navigate('/campaigns')}
			>
				<Alert
					icon={<IconAlertCircle size={16} />}
					title='Missing campaign'
					color='red'
					variant='light'
				>
					The campaign identifier is required to display this page.
				</Alert>
			</ContentContainer>
		);
	}

	if (isLoading) {
		return (
			<ContentContainer
				title='Loading campaign...'
				description='Please wait while we fetch the campaign overview.'
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
				title='Campaign unavailable'
				description='We could not load the requested campaign.'
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
		<ContentContainer
			title={campaign.name}
			description='Review the latest performance and configuration details.'
			showBackButton
			onBackClick={() => navigate('/campaigns')}
			titleRight={
				<Tooltip label='Edit Campaign' withArrow>
					<ActionIcon
						variant='light'
						size='lg'
						onClick={() => navigate(`/campaign/${campaign.id}`)}
					>
						<IconEdit size={20} />
					</ActionIcon>
				</Tooltip>
			}
			rightSection={rightComponent || <></>}
		>
			<Stack gap='md'>
				<ContactSection />
			</Stack>
		</ContentContainer>
	);
};

export default CampaignViewPage;
