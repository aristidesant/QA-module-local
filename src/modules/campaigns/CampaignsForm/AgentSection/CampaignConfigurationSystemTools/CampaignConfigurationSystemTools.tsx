import React, { useCallback, useMemo, useState } from 'react';
import { Stack, Switch, Text, Group, ActionIcon } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import { useClientConfigByName } from '~/queries/useClientConfigs';
import type {
	AgentConfigModel,
	ConversationConfigModel,
	ToolModel,
} from '~/models/AgentListObject';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import ToolConfigModal from './ToolConfigModal';
import classes from './CampaignConfigurationSystemTools.module.css';

type ToolConfigModel = {
	name: string;
	nameCode: string;
	description?: string;
	value: ToolModel;
};

const CampaignConfigurationSystemTools: React.FC = () => {
	const form = useCampaignFormContext();
	const { data: systemToolsConfig } = useClientConfigByName('system_tools');
	const [editingTool, setEditingTool] = useState<ToolConfigModel | null>(null);
	const [modalOpened, setModalOpened] = useState(false);

	const configList = useMemo<ToolConfigModel[]>(() => {
		if (!systemToolsConfig || !systemToolsConfig.value) return [];
		try {
			const parsed = JSON.parse(systemToolsConfig.value);
			if (Array.isArray(parsed)) {
				return parsed.map((tool: any, index: number) => {
					const name = tool?.name || 'Unnamed Tool';
					const nameCode =
						tool?.nameCode ||
						tool?.value?.name ||
						tool?.value?.type ||
						`${name?.toLowerCase().replace(/\s+/g, '_')}_${index}`;
					const toolValue = (tool?.value || tool) as ToolModel;
					const description = tool?.description || toolValue?.description;
					return {
						name,
						nameCode,
						description,
						value: {
							...toolValue,
							name: nameCode,
						},
					};
				});
			}
			return [];
		} catch (error) {
			console.error('Error parsing system tools config:', error);
			return [];
		}
	}, [systemToolsConfig]);

	const selectedTools =
		form.values.agentConfig?.conversationConfig?.agent?.prompt?.tools ?? [];

	const isToolSelected = useCallback(
		(nameCodeToCheck: string) =>
			selectedTools.some((tool) => tool.name === nameCodeToCheck),
		[selectedTools]
	);

	const handleToggle = useCallback(
		(toolConfig: ToolConfigModel, currentlySelected: boolean) => {
			const currentAgentConfig = form.values.agentConfig || {};
			const currentConversationConfig = currentAgentConfig.conversationConfig;
			const currentAgent = currentConversationConfig?.agent;
			const currentPrompt = currentAgent?.prompt;
			const currentTools = currentPrompt?.tools || [];

			const nameCode = toolConfig.nameCode;
			const normalizedToolValue: ToolModel = {
				...toolConfig.value,
				name: nameCode,
			};

			const updatedTools = currentlySelected
				? currentTools.filter(
						(existingTool: ToolModel) => existingTool.name !== nameCode
					)
				: [
						...currentTools.filter(
							(existingTool: ToolModel) => existingTool.name !== nameCode
						),
						normalizedToolValue,
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

	const handleOpenModal = useCallback((toolConfig: ToolConfigModel) => {
		setEditingTool(toolConfig);
		setModalOpened(true);
	}, []);

	const handleCloseModal = useCallback(() => {
		setModalOpened(false);
		setEditingTool(null);
	}, []);

	const handleSaveToolConfig = useCallback(
		(updatedConfig: ToolModel) => {
			const currentAgentConfig = form.values.agentConfig || {};
			const currentConversationConfig = currentAgentConfig.conversationConfig;
			const currentAgent = currentConversationConfig?.agent;
			const currentPrompt = currentAgent?.prompt;
			const currentTools = currentPrompt?.tools || [];

			// Update the tool in the array
			const updatedTools = currentTools.map((tool: ToolModel) =>
				tool.name === updatedConfig.name ? updatedConfig : tool
			);

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
		<>
			<SectionCard
				title='System Tools'
				description='Configure system-related settings for the campaign.'
			>
				<Stack>
					{configList.length === 0 ? (
						<Text size='sm' c='dimmed'>
							No system tools configured.
						</Text>
					) : (
						configList.map((toolConfig) => {
							console.log(toolConfig);
							const selected = isToolSelected(toolConfig.nameCode);
							return (
								<Group
									key={toolConfig.nameCode}
									justify='space-between'
									wrap='nowrap'
									className={classes.toolRow}
								>
									<Switch
										label={toolConfig.name}
										description={
											toolConfig.description || 'No description available'
										}
										checked={selected}
										onChange={() => handleToggle(toolConfig, selected)}
										className={classes.toolSwitch}
									/>
									{selected && (
										<ActionIcon
											variant='subtle'
											color='gray'
											size='lg'
											onClick={() => handleOpenModal(toolConfig)}
											className={classes.gearIcon}
										>
											<IconSettings size={18} />
										</ActionIcon>
									)}
								</Group>
							);
						})
					)}
				</Stack>
			</SectionCard>

			{editingTool && (
				<ToolConfigModal
					opened={modalOpened}
					onClose={handleCloseModal}
					toolName={editingTool.name}
					toolConfig={
						selectedTools.find(
							(tool: ToolModel) => tool.name === editingTool.nameCode
						) || editingTool.value
					}
					onSave={handleSaveToolConfig}
				/>
			)}
		</>
	);
};

export default CampaignConfigurationSystemTools;
