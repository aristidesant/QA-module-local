import { Stack, Switch } from '@mantine/core';
import { IconMicrophoneOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import AgentCampaignList from '../AgentCampaignList';
import CampaignDictionarySelector from '../CampaignDictionarySelector';
import CampaignConfigurationAsrKeywords from '../CampaignConfigurationAsrKeywords';
import CampaignConfigurationSystemTools from '../CampaignConfigurationSystemTools';
import CampaignConfigurationTools from '../CampaignConfigurationTools';
import CampaignConfigurationKnowledgeBase from '../CampaignConfigurationKnowledgeBase';
import CampaignConfigurationDynamicVariables from '../CampaignConfigurationDynamicVariables';
import RightSectionCard from '~/components/RightSectionCard';
import {
	useCampaignFormContext,
	useCampaignId,
} from '../../../campaignFormFunctions';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';

const AgentSectionRightPanel: React.FC = () => {
	const { t } = useTranslation(['campaigns', 'campaign.form.agents']);
	const form = useCampaignFormContext();
	const campaignId = useCampaignId();
	const { data: campaignAgents } = useGetCampaignAgents(campaignId || 0);

	// Get the first assigned agent's ID for the dictionary selector
	const firstAgentId = campaignAgents?.[0]?.agentId ?? null;

	return (
		<Stack gap='xs'>
			<AgentCampaignList />
			{firstAgentId && <CampaignDictionarySelector agentId={firstAgentId} />}
			<RightSectionCard
				title={t('general.noiseCancellationLabel')}
				description={t('general.noiseCancellationDesc')}
				icon={IconMicrophoneOff}
				iconColor='indigo'
			>
				<Switch
					label={t('general.noiseCancellationLabel')}
					size='sm'
					checked={form.values.noiseCancellation ?? false}
					onChange={(event) =>
						form.setFieldValue('noiseCancellation', event.currentTarget.checked)
					}
				/>
			</RightSectionCard>
			<CampaignConfigurationSystemTools />
			<CampaignConfigurationTools />
			<CampaignConfigurationKnowledgeBase />
			<CampaignConfigurationAsrKeywords />
			<CampaignConfigurationDynamicVariables />
		</Stack>
	);
};

export default AgentSectionRightPanel;
