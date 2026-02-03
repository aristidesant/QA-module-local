import { Stack } from '@mantine/core';
import CampaignConfigurationBasic from './CampaignConfigurationBasic/CampaignConfigurationBasic';
import CampaignConfigurationPrompt from './CampaignConfigurationPrompt/CampaignConfigurationPrompt';
import CampaignConfigurationTools from './CampaignConfigurationTools';
import CampaignConfigurationKnowledgeBase from './CampaignConfigurationKnowledgeBase';
import CampaignConfigurationPredefinedParams from './CampaignConfigurationPredefinedParams';
import CampaignConfigurationSystemTools from './CampaignConfigurationSystemTools';
import CampaignConfigurationPhoneNumber from './CampaignConfigurationPhoneNumber/CampaignConfigurationPhoneNumber';

const AgentSection: React.FC = () => {
	return (
		<Stack>
			<CampaignConfigurationBasic />
			<CampaignConfigurationPhoneNumber />
			<CampaignConfigurationPrompt />
			<CampaignConfigurationTools />
			<CampaignConfigurationSystemTools />
			<CampaignConfigurationKnowledgeBase />
			<CampaignConfigurationPredefinedParams />
			{/* <CampaignConfigurationTemperatureControl /> */}
		</Stack>
	);
};

export default AgentSection;
