import { useEffect, useState } from 'react';
import { Stack } from '@mantine/core';
import AgentBasicInfo from './AgentBasicInfo';
import AgentPromptDisplay from './AgentPromptDisplay';
import AgentTemperatureDisplay from './AgentTemperatureDisplay';
import AgentToolsDisplay from './AgentToolsDisplay';
import AgentKnowledgeBaseDisplay from './AgentKnowledgeBaseDisplay';
import AgentCampaignDisplay from './AgentCampaignDisplay';
import AgentOverview from './AgentOverview';
import VoiceProfile from './VoiceProfile';
import { useGetAgent } from '~/queries/agentQueries';
import type AgentListObject from '~/models/AgentListObject';
import styles from './AgentSimpleDetails.module.css';

type AgentSimpleDetailsProps = {
	agent: AgentListObject;
};

export const AgentSimpleDetails: React.FC<AgentSimpleDetailsProps> = ({
	agent,
}) => {
	const [isVisible, setIsVisible] = useState(false);

	const { data: fetchedAgent } = useGetAgent(agent.id);
	const mergedAgent = fetchedAgent ?? agent;

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 50);

		return () => {
			clearTimeout(timer);
			setIsVisible(false);
		};
	}, [agent.id]);

	return (
		<Stack
			gap='md'
			className={`${styles.container} ${isVisible ? styles.visible : ''}`.trim()}
		>
			<AgentOverview agent={mergedAgent} />
			<VoiceProfile agent={mergedAgent} />

			<AgentBasicInfo agent={mergedAgent} />
			<AgentPromptDisplay agent={mergedAgent} />
			<AgentTemperatureDisplay agent={mergedAgent} />
			<AgentToolsDisplay agentId={agent.id} />
			<AgentKnowledgeBaseDisplay agentId={agent.id} />
			<AgentCampaignDisplay agentId={agent.id} />
		</Stack>
	);
};

export default AgentSimpleDetails;
