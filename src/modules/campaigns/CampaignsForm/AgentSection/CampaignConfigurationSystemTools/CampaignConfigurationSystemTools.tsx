import React, { useCallback, useMemo, useState } from 'react';
import { Stack, Switch, Text, Group, ActionIcon } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import { useClientConfigByName } from '~/queries/useClientConfigs';
import type {
	AgentConfigModel,
	ConversationConfigModel,
	SystemToolModel,
} from '~/models/AgentListObject';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import ToolConfigModal from './ToolConfigModal';
import classes from './CampaignConfigurationSystemTools.module.css';
import { snakeToCamel } from '~/utils/stringUtils';

type ToolConfigModel = {
	name: string;
	nameCode: string;
	description?: string;
	value: SystemToolModel;
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
					const rawNameCode =
						tool?.nameCode ||
						tool?.value?.name ||
						tool?.value?.type ||
						`${name?.toLowerCase().replace(/\s+/g, '_')}_${index}`;
					const nameCode = snakeToCamel(rawNameCode);
					const toolValue = (tool?.value || tool) as SystemToolModel;
					const description = tool?.description || toolValue?.description;
					return {
						name,
						nameCode,
						description,
						value: {
							...toolValue,
							name: rawNameCode,
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
		form.values.agentConfig?.conversationConfig?.agent?.prompt?.builtInTools ??
		{};

	const isToolSelected = useCallback(
		(nameCodeToCheck: string) => {
			const camelCaseKey = snakeToCamel(nameCodeToCheck);
			return (
				selectedTools[camelCaseKey] !== null &&
				selectedTools[camelCaseKey] !== undefined
			);
		},
		[selectedTools]
	);

	const handleToggle = useCallback(
		(toolConfig: ToolConfigModel, currentlySelected: boolean) => {
			const currentAgentConfig = form.values.agentConfig || {};
			const currentConversationConfig = currentAgentConfig.conversationConfig;
			const currentAgent = currentConversationConfig?.agent;
			const currentPrompt = currentAgent?.prompt;
			const currentBuiltInTools = currentPrompt?.builtInTools || {};

			const nameCode = toolConfig.nameCode; // Already camelCase from configList

			// Always include all tools, set to null when disabled
			const updatedBuiltInTools = {
				...currentBuiltInTools,
				[nameCode]: currentlySelected ? null : toolConfig.value,
			};

			const updatedAgentConfig: Partial<AgentConfigModel> = {
				...currentAgentConfig,
				conversationConfig: currentConversationConfig
					? ({
							...currentConversationConfig,
							agent: {
								...currentAgent,
								prompt: {
									...currentPrompt,
									builtInTools: updatedBuiltInTools,
								},
							},
						} as ConversationConfigModel)
					: undefined,
			};

			form.setFieldValue('agentConfig', updatedAgentConfig);
		},
		[form, configList]
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
		(updatedConfig: SystemToolModel) => {
			const currentAgentConfig = form.values.agentConfig || {};
			const currentConversationConfig = currentAgentConfig.conversationConfig;
			const currentAgent = currentConversationConfig?.agent;
			const currentPrompt = currentAgent?.prompt;
			const currentBuiltInTools = currentPrompt?.builtInTools || {};

			// Use camelCase for key, but keep original name in value
			const nameCode = snakeToCamel(updatedConfig.name);
			const updatedBuiltInTools = {
				...currentBuiltInTools,
				[nameCode]: updatedConfig,
			};

			const updatedAgentConfig: Partial<AgentConfigModel> = {
				...currentAgentConfig,
				conversationConfig: currentConversationConfig
					? ({
							...currentConversationConfig,
							agent: {
								...currentAgent,
								prompt: {
									...currentPrompt,
									builtInTools: updatedBuiltInTools,
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
						selectedTools[editingTool.nameCode]
							? {
									...selectedTools[editingTool.nameCode],
									name: editingTool.value.name,
								}
							: editingTool.value
					}
					onSave={handleSaveToolConfig}
				/>
			)}
		</>
	);
};

export default CampaignConfigurationSystemTools;
