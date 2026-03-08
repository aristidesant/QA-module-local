import { Stack } from '@mantine/core';
import CampaignConfigurationBasic from './CampaignConfigurationBasic/CampaignConfigurationBasic';
import CampaignConfigurationPrompt from './CampaignConfigurationPrompt/CampaignConfigurationPrompt';
import CampaignConfigurationPredefinedParams from './CampaignConfigurationPredefinedParams';

interface AgentSectionProps {
	onOpenSettings?: () => void;
}

const AgentSection: React.FC<AgentSectionProps> = ({ onOpenSettings }) => {
	return (
		<Stack>
			<CampaignConfigurationPrompt onOpenSettings={onOpenSettings} />
			<CampaignConfigurationBasic />
			<CampaignConfigurationPredefinedParams />
			{/* <CampaignConfigurationTemperatureControl /> */}
		</Stack>
	);
};

export default AgentSection;
