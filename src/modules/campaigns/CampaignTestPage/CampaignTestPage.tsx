import { useNavigate, useOutletContext } from 'react-router';
import { Alert, Button, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import ContentContainer from '~/components/ContentContainer';
import ConversationsList from '~/modules/conversations/ConversationsList';
import ConversationDetailDrawer from '~/modules/conversations/ConversationDetailDrawer';
import { useConversationDrawer } from '~/modules/conversations/ConversationDetailDrawer/useConversationDrawer';
import CampaignConvaiWidget from '../CampaignConvaiWidget';
import type { Campaign } from '~/models/CampaignsModel';

const HIDDEN_COLUMNS = ['contactName', 'phoneNumber'];

const CampaignTestPage = () => {
	const { t } = useTranslation('campaign.detail.test');
	const navigate = useNavigate();
	const campaign = useOutletContext<Campaign>();

	const {
		selectedConversationId,
		drawerOpened,
		openConversation,
		closeDrawer,
	} = useConversationDrawer();

	const agentId = campaign.agentConfig?.agentId;

	return (
		<ContentContainer
			title={t('page.title')}
			description={t('page.description')}
			showBackButton
			onBackClick={() => navigate(`/campaign/${campaign.id}`)}
		>
			<Stack gap='sm'>
				{agentId ? (
					<Text size='sm' c='dimmed'>
						{t('page.helper')}
					</Text>
				) : (
					<Alert
						icon={<IconAlertCircle size={16} />}
						title={t('agent.empty.title')}
						color='yellow'
						variant='light'
					>
						<Stack gap='xs'>
							<Text size='sm'>{t('agent.empty.description')}</Text>
							<div>
								<Button
									size='xs'
									variant='light'
									leftSection={<IconArrowLeft size={16} />}
									onClick={() => navigate(`/campaign/${campaign.id}`)}
								>
									{t('agent.empty.backToEditor')}
								</Button>
							</div>
						</Stack>
					</Alert>
				)}

				<CampaignConvaiWidget agentId={agentId} />

				<ConversationsList
					campaignId={campaign.id}
					hiddenColumns={HIDDEN_COLUMNS}
					onRowClick={openConversation}
				/>

				<ConversationDetailDrawer
					conversationId={selectedConversationId}
					opened={drawerOpened}
					onClose={closeDrawer}
				/>
			</Stack>
		</ContentContainer>
	);
};

export default CampaignTestPage;
