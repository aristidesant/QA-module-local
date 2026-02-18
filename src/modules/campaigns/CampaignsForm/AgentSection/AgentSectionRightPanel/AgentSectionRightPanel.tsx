import { Stack } from '@mantine/core';
import AgentCampaignList from '../AgentCampaignList';
import CampaignConfigurationSystemTools from '../CampaignConfigurationSystemTools';
import CampaignConfigurationTools from '../CampaignConfigurationTools';
import CampaignConfigurationKnowledgeBase from '../CampaignConfigurationKnowledgeBase';

const AgentSectionRightPanel: React.FC = () => {
	return (
		<Stack gap='xs'>
			<AgentCampaignList />
			<CampaignConfigurationSystemTools />
			<CampaignConfigurationTools />
			<CampaignConfigurationKnowledgeBase />
		</Stack>
	);
};

export default AgentSectionRightPanel;
