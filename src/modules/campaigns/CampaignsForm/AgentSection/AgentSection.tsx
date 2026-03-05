import type { ReactNode } from 'react';
import { Stack } from '@mantine/core';
import CampaignConfigurationBasic from './CampaignConfigurationBasic/CampaignConfigurationBasic';
import CampaignConfigurationPrompt from './CampaignConfigurationPrompt/CampaignConfigurationPrompt';
import CampaignConfigurationPredefinedParams from './CampaignConfigurationPredefinedParams';

interface AgentSectionProps {
	headerActions?: ReactNode;
}

const AgentSection: React.FC<AgentSectionProps> = ({ headerActions }) => {
	return (
		<Stack>
			<CampaignConfigurationPrompt headerActions={headerActions} />
			<CampaignConfigurationBasic />
			<CampaignConfigurationPredefinedParams />
			{/* <CampaignConfigurationTemperatureControl /> */}
		</Stack>
	);
};

export default AgentSection;
