// CampaignConfigurationTools.tsx
import { Group, Stack, Switch, Text } from '@mantine/core';
import { useCallback } from 'react';
import { IconPuzzle } from '@tabler/icons-react';
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
			<Stack gap='xs'>
				{!tools || tools.length === 0 ? (
					<Text size='sm' c='dimmed'>
						No agent tools configured.
					</Text>
				) : (
					tools.map((tool) => {
						const isSelected = isToolSelected(tool.identifier);
						return (
							<div
								key={tool.identifier}
								className={`${classes.toolRow} ${
									isSelected ? classes.toolRowActive : ''
								}`}
							>
								<Group
									align='flex-start'
									justify='space-between'
									gap='sm'
									className={classes.rowHeader}
								>
									<Group gap='xs' align='center' className={classes.toolTitle}>
										<div className={classes.iconBadge}>
											<IconPuzzle size={14} />
										</div>
										<div>
											<Text fw={600} className={classes.toolName}>
												{tool.name}
											</Text>
											<Text size='xs' className={classes.toolMeta}>
												Custom integration
											</Text>
										</div>
									</Group>

									<Switch
										aria-label={`Toggle ${tool.name}`}
										checked={isSelected}
										onChange={() => {
											handleToolToggle(tool, isSelected);
										}}
										size='sm'
										className={classes.toolSwitch}
									/>
								</Group>
								<Text size='sm' c='dimmed' className={classes.toolDescription}>
									{tool.description || 'No description available'}
								</Text>
							</div>
						);
					})
				)}
			</Stack>
		</SectionCard>
	);
};

export default CampaignConfigurationTools;
