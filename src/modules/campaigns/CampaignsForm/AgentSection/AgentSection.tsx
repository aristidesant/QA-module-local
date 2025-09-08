import { useEffect } from 'react';
import { useCampaignsStore } from '~/stores/campaignsStore';
import AgentConfiguration from '~/modules/agent/AgentConfiguration/AgentConfiguration';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import AgentCampaignList from './AgentCampaignList';
import type { AgentConfigModel } from '~/models/AgentListObject';

const AgentSection: React.FC = () => {
	const { setRightComponent } = useCampaignsStore((state) => state);
	const form = useCampaignFormContext();
	useEffect(() => {
		setRightComponent?.(<AgentCampaignList />); // Clear the right component when this section mounts
	}, []);

	return (
		<AgentConfiguration
			withVoiceSelection={false}
			editableAgent={form.values.agentConfig || {}}
			onUpdateAgent={(updatedAgent: Partial<AgentConfigModel>) => {
				// Merge the updated fields with the existing agent config
				const currentAgent = form.values.agentConfig || {};
				const newAgent = { ...currentAgent, ...updatedAgent };
				form.setFieldValue('agentConfig', newAgent);
			}}
		/>
	);
};

export default AgentSection;
