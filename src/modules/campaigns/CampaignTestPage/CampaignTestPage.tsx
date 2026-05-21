import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconWaveSine } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import ContentContainer from '~/components/ContentContainer';
import ConversationsList from '~/modules/conversations/ConversationsList';
import { ConversationDetailPage } from '~/modules/conversations/ConversationDetailPage/ConversationDetailPage';
import {
	CampaignConvaiProvider,
	ConvaiVoicePanel,
} from '../CampaignConvaiWidget';
import type { Campaign } from '~/models/CampaignsModel';

const HIDDEN_COLUMNS = ['contactName', 'phoneNumber'];

const CampaignTestPage = () => {
	const { t } = useTranslation('campaign.detail.test');
	const navigate = useNavigate();
	const campaign = useOutletContext<Campaign>();
	const isMobile = useMediaQuery('(max-width: 768px)', false);

	const [selectedConversationId, setSelectedConversationId] = useState<
		number | null
	>(null);

	const agentId = campaign.agentConfig?.agentId;

	if (selectedConversationId !== null) {
		return (
			<ConversationDetailPage
				conversationId={String(selectedConversationId)}
				onBack={() => setSelectedConversationId(null)}
			/>
		);
	}

	const conversationsList = (
		<ConversationsList
			campaignId={campaign.id}
			hiddenColumns={HIDDEN_COLUMNS}
			onRowClick={(c) => setSelectedConversationId(c.id)}
		/>
	);

	if (!agentId) {
		return (
			<ContentContainer
				title={t('page.titleWithCampaign', { campaignName: campaign.name })}
				description={t('page.description')}
				showBackButton
				onBackClick={() => navigate(`/campaign/${campaign.id}`)}
			>
				<Stack gap='sm'>
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

					{conversationsList}
				</Stack>
			</ContentContainer>
		);
	}

	return (
		<CampaignConvaiProvider agentId={agentId}>
			<ContentContainer
				title={t('page.titleWithCampaign', { campaignName: campaign.name })}
				description={t('page.description')}
				showBackButton
				onBackClick={() => navigate(`/campaign/${campaign.id}`)}
				rightSection={isMobile ? undefined : <ConvaiVoicePanel />}
				rightSectionTitle={
					isMobile ? undefined : (
						<Group gap='xs' align='center' wrap='nowrap'>
							<IconWaveSine size={16} />
							<Text fz='sm' fw={600}>
								{t('widget.voice.title')}
							</Text>
						</Group>
					)
				}
			>
				<Stack gap='sm'>
					{isMobile && <ConvaiVoicePanel />}
					{conversationsList}
				</Stack>
			</ContentContainer>
		</CampaignConvaiProvider>
	);
};

export default CampaignTestPage;
