import { Stack } from '@mantine/core';
import CampaignConfigurationBasic from './CampaignConfigurationBasic/CampaignConfigurationBasic';
import CampaignConfigurationPrompt from './CampaignConfigurationPrompt/CampaignConfigurationPrompt';
import CampaignConfigurationPredefinedParams from './CampaignConfigurationPredefinedParams';

const AgentSection: React.FC = () => {
	return (
		<Stack>
			<CampaignConfigurationPrompt />
			<CampaignConfigurationBasic />
			<CampaignConfigurationPredefinedParams />
			{/* <CampaignConfigurationTemperatureControl /> */}
		</Stack>
	);
};

export default AgentSection;
