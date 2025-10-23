import React from 'react';
import type { AgentConfigModel } from '~/models/AgentListObject';
import BasicConfiguration from './BasicConfiguration/BasicConfiguration';
import AIPersonality from './AIPersonality/AIPersonality';
import { AgentBasicDetails } from '~/modules/agents/AgentBasicDetails';
import type AgentListObject from '~/models/AgentListObject';

// Define the props for AgentSettings
interface AgentSettingsProps {
	agent?: AgentListObject;
	agentData?: Partial<AgentConfigModel>; // TODO: Define a more specific type for agentData
	campaignId?: number;
	onUpdateAgentData: (updatedFields: any) => void; // TODO: Define a more specific type for updatedFields
	onSetRightSection?: (rightSection: React.ReactNode) => void;
}

const AgentSettings: React.FC<AgentSettingsProps> = ({
	agent,
	agentData,
	campaignId,
	onUpdateAgentData,
	onSetRightSection,
}) => {
	if (!agentData) {
		return null;
	}

	const handleClick = () => {
		onSetRightSection?.(
			<AgentBasicDetails
				agent={agent}
				agentData={agentData as AgentConfigModel}
			/>
		);
	};

	return (
		<div onClick={handleClick} style={{ height: '100%' }}>
			<BasicConfiguration
				agentData={agentData}
				onUpdateAgentData={onUpdateAgentData}
			/>
			<AIPersonality
				agentData={agentData}
				campaignId={campaignId}
				onUpdateAgentData={onUpdateAgentData}
			/>
		</div>
	);
};

export default AgentSettings;
