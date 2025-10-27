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
 * Selected tools are stored in the campaign form's agentConfig.conversationConfig.agent.prompt.tools.
 */
const CampaignConfigurationTools: React.FC = () => {
	const form = useCampaignFormContext();
	const { data: toolCategories } = useToolCategories();
	const { data: tools } = useToolsByCategory(
		toolCategories?.find((cat) => cat.name === 'webhook')?.id
	);

	const selectedTools =
		form.values.agentConfig?.conversationConfig?.agent?.prompt?.tools ?? [];

	const isToolSelected = useCallback(
		(toolName: string) =>
			selectedTools.some((selectedTool: any) => selectedTool.name === toolName),
		[selectedTools]
	);

	const handleToolToggle = useCallback(
		(tool: any, isCurrentlySelected: boolean) => {
			const currentAgentConfig = form.values.agentConfig || {};
			const currentConversationConfig = currentAgentConfig.conversationConfig;
			const currentAgent = currentConversationConfig?.agent;
			const currentPrompt = currentAgent?.prompt;
			const currentTools = currentPrompt?.tools || [];

			const toolName = tool.config?.toolConfig?.name;

			const toolToAdd = tool?.config?.toolConfig;

			toolToAdd.id = tool.identifier;

			const updatedTools = isCurrentlySelected
				? currentTools.filter(
						(existingTool: any) => existingTool.name !== toolName
					)
				: [
						...currentTools.filter(
							(existingTool: any) => existingTool.name !== toolName
						),
						toolToAdd,
					];

			// Remove toolIds from the prompt to avoid sending it
			const { toolIds, ...restPrompt } = currentPrompt || {};

			const updatedAgentConfig: Partial<AgentConfigModel> = {
				...currentAgentConfig,
				conversationConfig: currentConversationConfig
					? ({
							...currentConversationConfig,
							agent: {
								...currentAgent,
								prompt: {
									...restPrompt,
									tools: updatedTools,
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
					const isSelected = isToolSelected(tool.config?.toolConfig?.name);
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
