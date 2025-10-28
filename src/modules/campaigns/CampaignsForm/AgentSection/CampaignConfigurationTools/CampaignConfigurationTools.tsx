// CampaignConfigurationTools.tsx
import { Group, Stack, Switch, Text } from '@mantine/core';
import { useCallback } from 'react';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import SectionCard from '~/components/SectionCard';
import { useToolCategories } from '~/queries/toolCategoryQueries';
import { useToolsByCategory } from '~/queries/toolQueries';
import type {
	AgentConfigModel,
	ConversationConfigModel,
} from '~/models/AgentListObject';
import classes from './CampaignConfigurationTools.module.css';

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
			title='Custom Tools'
			description='Tools to enhance agent functionality'
		>
			<Stack>
				{!tools || tools.length === 0 ? (
					<Text size='sm' c='dimmed'>
						No agent tools configured.
					</Text>
				) : (
					tools.map((tool) => {
						const isSelected = isToolSelected(tool.identifier);
						return (
							<Group
								key={tool.identifier}
								justify='space-between'
								wrap='nowrap'
								className={classes.toolRow}
							>
								<Switch
									label={tool.name}
									description={tool.description || 'No description available'}
									checked={isSelected}
									onChange={() => {
										handleToolToggle(tool, isSelected);
									}}
									className={classes.toolSwitch}
								/>
							</Group>
						);
					})
				)}
			</Stack>
		</SectionCard>
	);
};

export default CampaignConfigurationTools;
