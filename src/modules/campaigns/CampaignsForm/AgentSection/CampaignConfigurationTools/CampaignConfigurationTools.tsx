// CampaignConfigurationTools.tsx
import { Stack, Switch } from '@mantine/core';
import { useCallback } from 'react';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import SectionCard from '~/components/SectionCard';
import { useToolCategories } from '~/queries/toolCategoryQueries';
import { useToolsByCategory } from '~/queries/toolQueries';
import type {
	AgentConfigModel,
	ConversationConfigModel,
} from '~/models/AgentListObject';

/**
 * CampaignConfigurationTools Component
 *
 * This component allows users to select tools for the campaign agent.
 * Selected tool identifiers are stored in agentConfig.conversationConfig.agent.prompt.toolIds
 * and full tool objects are stored in agentConfig.conversationConfig.agent.prompt.tools.
 */
const CampaignConfigurationTools: React.FC = () => {
	const form = useCampaignFormContext();
	const { data: toolCategories } = useToolCategories();
	const { data: tools } = useToolsByCategory(
		toolCategories?.find((cat) => cat.name === 'webhook')?.id
	);

	const selectedToolIds =
		form.values.agentConfig?.conversationConfig?.agent?.prompt?.toolIds ?? [];

	const isToolSelected = useCallback(
		(toolIdentifier: string) => selectedToolIds.includes(toolIdentifier),
		[selectedToolIds]
	);

	const handleToolToggle = useCallback(
		(tool: any, isCurrentlySelected: boolean) => {
			const currentAgentConfig = form.values.agentConfig || {};
			const currentConversationConfig = currentAgentConfig.conversationConfig;
			const currentAgent = currentConversationConfig?.agent;
			const currentPrompt = currentAgent?.prompt;
			const currentToolIds = currentPrompt?.toolIds || [];

			const toolIdentifier = tool.identifier;

			const updatedToolIds = isCurrentlySelected
				? currentToolIds.filter((id: string) => id !== toolIdentifier)
				: [...currentToolIds, toolIdentifier];

			const updatedAgentConfig: Partial<AgentConfigModel> = {
				...currentAgentConfig,
				conversationConfig: currentConversationConfig
					? ({
							...currentConversationConfig,
							agent: {
								...currentAgent,
								prompt: {
									...currentPrompt,
									toolIds: updatedToolIds,
								},
							},
						} as ConversationConfigModel)
					: undefined,
			};

			form.setFieldValue('agentConfig', updatedAgentConfig);
		},
		[form]
	);

	return (
		<SectionCard
			title='Agent Tools'
			description='Tools to enhance agent functionality'
		>
			<Stack>
				{tools?.map((tool) => {
					const isSelected = isToolSelected(tool.identifier);
					return (
						<Switch
							key={tool.identifier}
							label={tool.name}
							description={tool.description}
							checked={isSelected}
							onChange={() => {
								handleToolToggle(tool, isSelected);
							}}
						/>
					);
				})}
			</Stack>
		</SectionCard>
	);
};

export default CampaignConfigurationTools;
