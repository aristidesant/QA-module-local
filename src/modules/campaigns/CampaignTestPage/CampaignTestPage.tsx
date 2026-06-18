import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { Alert, Button, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import ContentContainer from '~/components/ContentContainer';
import ConversationsList from '~/modules/conversations/ConversationsList';
import { ConversationDetailPage } from '~/modules/conversations/ConversationDetailPage/ConversationDetailPage';
import {
	CampaignConvaiProvider,
	ConvaiVoicePanel,
} from '../CampaignConvaiWidget';
import { useGetAgent } from '~/queries/agentQueries';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';

const HIDDEN_COLUMNS = ['contactName', 'phoneNumber'];

const CampaignTestPage = () => {
	const { t } = useTranslation('campaign.detail.test');
	const navigate = useNavigate();
	const {
		campaignId = '',
		campaignAgentId,
		agentId: routeAgentId,
	} = useParams<{
		campaignId?: string;
		campaignAgentId?: string;
		agentId?: string;
	}>();
	const isMobile = useMediaQuery('(max-width: 768px)', false);

	const campaignBasePath = campaignId
		? `/campaign/${campaignId}`
		: '/campaigns';
	const {
		data: campaign,
		isLoading: isCampaignLoading,
		isError,
	} = useGetCampaign(campaignId);
	const campaignIdNumber = campaign?.id ?? Number(campaignId || 0);
	const shouldLoadCampaignAgents = !routeAgentId;
	const { data: campaignAgents = [], isLoading: isCampaignAgentsLoading } =
		useGetCampaignAgents(campaignIdNumber, shouldLoadCampaignAgents);

	const [selectedConversationId, setSelectedConversationId] = useState<
		number | null
	>(null);

	const legacyAgentId = campaign?.agents?.[0]?.agentId;
	const legacyCampaignAgent = campaignAgents.find(
		(agent) => agent.agentId === legacyAgentId
	);
	const testAgentId = routeAgentId ?? legacyAgentId ?? '';
	const { data: routeAgent } = useGetAgent(testAgentId);
	const returnTo = campaignAgentId
		? `/campaign/${campaignId}/agent/${campaignAgentId}`
		: campaignBasePath;
	const handleBack = useCallback(() => {
		navigate(returnTo);
	}, [navigate, returnTo]);
	const handleBackToCampaign = useCallback(() => {
		navigate(campaignBasePath);
	}, [campaignBasePath, navigate]);
	const handleBackToCampaigns = useCallback(() => {
		navigate('/campaigns');
	}, [navigate]);
	const handleConversationSelect = useCallback(
		(conversation: { id: number }) => {
			setSelectedConversationId(conversation.id);
		},
		[]
	);
	const conversationsList = useMemo(() => {
		if (!campaign) return null;

		return (
			<ConversationsList
				campaignId={campaign.id}
				hiddenColumns={HIDDEN_COLUMNS}
				onRowClick={handleConversationSelect}
			/>
		);
	}, [campaign, handleConversationSelect]);

	const voices = useMemo(
		() =>
			(campaign?.voices ?? []).map((v) => ({
				voiceId: v.voiceId,
				voiceName: v.voiceName,
			})),
		[campaign?.voices]
	);
	const dynamicVariablesStorageKey = useMemo(
		() =>
			[
				'campaign-test-dynamic-variables',
				campaignId || 'no-campaign',
				campaignAgentId || 'no-campaign-agent',
				testAgentId || 'no-agent',
			].join(':'),
		[campaignAgentId, campaignId, testAgentId]
	);

	if (isCampaignLoading && !campaign) {
		return (
			<ContentContainer
				title={t('page.loadingTitle')}
				description={t('page.description')}
				showBackButton
				onBackClick={handleBackToCampaign}
			>
				<Stack gap='sm'>
					<Alert
						icon={<IconAlertCircle size={16} />}
						title={t('agent.empty.title')}
						color='yellow'
						variant='light'
					>
						<Text size='sm'>{t('agent.empty.description')}</Text>
					</Alert>
				</Stack>
			</ContentContainer>
		);
	}

	if (isError || !campaign) {
		return (
			<ContentContainer
				title={t('page.errorTitle')}
				description={t('page.description')}
				showBackButton
				onBackClick={handleBackToCampaigns}
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

	if (selectedConversationId !== null) {
		return (
			<ConversationDetailPage
				conversationId={String(selectedConversationId)}
				onBack={() => setSelectedConversationId(null)}
			/>
		);
	}

	if (!routeAgentId && isCampaignAgentsLoading) {
		return (
			<ContentContainer
				title={t('page.titleWithCampaign', { campaignName: campaign.name })}
				description={t('page.description')}
				showBackButton
				onBackClick={handleBack}
			>
				<Stack gap='sm'>
					<Alert
						icon={<IconAlertCircle size={16} />}
						title={t('agent.empty.title')}
						color='yellow'
						variant='light'
					>
						<Text size='sm'>{t('agent.empty.description')}</Text>
					</Alert>
				</Stack>
			</ContentContainer>
		);
	}

	if (!routeAgentId && legacyCampaignAgent) {
		return (
			<Navigate
				to={`/campaign/${campaign.id}/agent/${legacyCampaignAgent.id}/test/${legacyCampaignAgent.agentId}`}
				replace
			/>
		);
	}

	if (!testAgentId) {
		return (
			<ContentContainer
				title={t('page.titleWithCampaign', { campaignName: campaign.name })}
				description={t('page.description')}
				showBackButton
				onBackClick={handleBack}
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
									onClick={handleBackToCampaign}
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
		<CampaignConvaiProvider
			agentId={testAgentId}
			voices={voices}
			agentConfig={routeAgent?.config}
			storageKey={dynamicVariablesStorageKey}
		>
			<ContentContainer
				title={t('page.titleWithCampaign', { campaignName: campaign.name })}
				description={t('page.description')}
				showBackButton
				onBackClick={handleBack}
				rightSection={isMobile ? undefined : <ConvaiVoicePanel />}
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
