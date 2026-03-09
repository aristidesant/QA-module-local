import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Breadcrumbs, Anchor, Flex, Loader, Text } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import { useGetCampaign } from '~/queries/campaignsQueries';
import ConversationsList from '~/modules/conversations/ConversationsList';
import { Button } from '@mantine/core';

const HIDDEN_COLUMNS = ['contactName', 'phoneNumber'];

const CampaignConversationsPage = () => {
	const { t } = useTranslation('campaign.conversations');
	const navigate = useNavigate();
	const { campaignId } = useParams<{ campaignId: string }>();

	const {
		data: campaign,
		isLoading,
		isError,
	} = useGetCampaign(`${campaignId}`);

	const commonContainerProps = {
		showBackButton: true,
		onBackClick: () => navigate('/campaigns'),
	};

	if (isLoading) {
		return (
			<ContentContainer
				{...commonContainerProps}
				title={t('loading.title')}
				description={t('loading.description')}
			>
				<Flex justify='center' align='center' style={{ minHeight: '320px' }}>
					<Loader size='lg' />
				</Flex>
			</ContentContainer>
		);
	}

	if (isError || !campaign) {
		return (
			<ContentContainer
				{...commonContainerProps}
				title={t('unavailable.title')}
				description={t('unavailable.description')}
			>
				<EmptyState
					icon={<IconAlertCircle size={48} />}
					message={t('unavailable.title')}
					description={
						<Text size='sm' c='dimmed' ta='center'>
							{t('unavailable.description')}
						</Text>
					}
					action={
						<Button
							variant='light'
							leftSection={<IconArrowLeft size={16} />}
							onClick={() => navigate('/campaigns')}
						>
							{t('unavailable.backToCampaigns')}
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	const breadcrumbTitle = (
		<Breadcrumbs>
			<Anchor
				size='sm'
				fw={500}
				onClick={() => navigate('/campaigns')}
				style={{ cursor: 'pointer' }}
			>
				{t('breadcrumb.campaigns')}
			</Anchor>
			<Text size='sm' fw={500}>
				{campaign.name}
			</Text>
		</Breadcrumbs>
	);

	return (
		<ContentContainer
			{...commonContainerProps}
			title={breadcrumbTitle}
			description={t('page.description')}
		>
			<ConversationsList
				campaignId={campaignId}
				hiddenColumns={HIDDEN_COLUMNS}
			/>
		</ContentContainer>
	);
};

export default CampaignConversationsPage;
