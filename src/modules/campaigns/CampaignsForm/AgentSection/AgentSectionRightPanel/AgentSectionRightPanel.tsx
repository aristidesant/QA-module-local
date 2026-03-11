import { Stack, Switch } from '@mantine/core';
import { IconMicrophoneOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import AgentCampaignList from '../AgentCampaignList';
import CampaignConfigurationAsrKeywords from '../CampaignConfigurationAsrKeywords';
import CampaignConfigurationSystemTools from '../CampaignConfigurationSystemTools';
import CampaignConfigurationTools from '../CampaignConfigurationTools';
import CampaignConfigurationKnowledgeBase from '../CampaignConfigurationKnowledgeBase';
import RightSectionCard from '~/components/RightSectionCard';
import { useCampaignFormContext } from '../../../campaignFormFunctions';

const AgentSectionRightPanel: React.FC = () => {
	const { t } = useTranslation('campaigns');
	const form = useCampaignFormContext();

	return (
		<Stack gap='xs'>
			<AgentCampaignList />
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
		</Stack>
	);
};

export default AgentSectionRightPanel;
