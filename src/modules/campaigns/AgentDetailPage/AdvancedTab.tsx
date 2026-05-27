import { Stack, Switch } from '@mantine/core';
import { IconMicrophoneOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import CampaignConfigurationAsrKeywords from '../CampaignsForm/AgentSection/CampaignConfigurationAsrKeywords';
import CampaignConfigurationDictionarySelector from '../CampaignsForm/AgentSection/CampaignDictionarySelector';
import CampaignConfigurationDynamicVariables from '../CampaignsForm/AgentSection/CampaignConfigurationDynamicVariables';
import CampaignConfigurationKnowledgeBase from '../CampaignsForm/AgentSection/CampaignConfigurationKnowledgeBase';
import CampaignConfigurationSystemTools from '../CampaignsForm/AgentSection/CampaignConfigurationSystemTools';
import CampaignConfigurationTools from '../CampaignsForm/AgentSection/CampaignConfigurationTools';
import { useCampaignFormContext } from '../campaignFormFunctions';

interface AdvancedTabProps {
	agentId: string;
}

const AdvancedTab = ({ agentId }: AdvancedTabProps) => {
	const { t } = useTranslation(['campaign.form.agents', 'campaigns']);
	const form = useCampaignFormContext();

	return (
		<Stack gap='sm'>
			<CampaignConfigurationSystemTools />
			<CampaignConfigurationTools />
			<CampaignConfigurationKnowledgeBase />
			<CampaignConfigurationAsrKeywords />
			<CampaignConfigurationDynamicVariables />
			<CampaignConfigurationDictionarySelector agentId={agentId} />
			<SectionCard
				title={t('general.noiseCancellationLabel', { ns: 'campaigns' })}
				description={t('general.noiseCancellationDesc', { ns: 'campaigns' })}
				icon={IconMicrophoneOff}
			>
				<Switch
					label={t('general.noiseCancellationLabel', { ns: 'campaigns' })}
					size='sm'
					checked={form.values.noiseCancellation ?? false}
					onChange={(event) =>
						form.setFieldValue('noiseCancellation', event.currentTarget.checked)
					}
				/>
			</SectionCard>
		</Stack>
	);
};

export default AdvancedTab;
