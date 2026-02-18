// CampaignConfigurationSystemTools.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
	ThemeIcon,
	Text,
	ActionIcon,
	Tooltip,
	Badge,
	Group,
} from '@mantine/core';
import {
	IconCpu,
	IconTrash,
	IconPlus,
	IconSettings,
} from '@tabler/icons-react';
import RightSectionCard from '~/components/RightSectionCard';
import { useClientConfigByName } from '~/queries/useClientConfigs';
import type {
	AgentConfigModel,
	ConversationConfigModel,
	SystemToolModel,
} from '~/models/AgentListObject';
import { useCampaignFormContext } from '~/modules/campaigns/campaignFormFunctions';
import ToolConfigModal from './ToolConfigModal';
import CampaignConfigurationSystemToolsAddModal from './CampaignConfigurationSystemToolsAddModal';
import classes from './CampaignConfigurationSystemTools.module.css';
import { snakeToCamel } from '~/utils/stringUtils';
import { useTranslation } from 'react-i18next';

type ToolConfigModel = {
	name: string;
	nameCode: string;
	description?: string;
	value: SystemToolModel;
};

const CampaignConfigurationSystemTools: React.FC = () => {
	const { t } = useTranslation('campaigns');
	const form = useCampaignFormContext();
	const { data: systemToolsConfig } = useClientConfigByName('system_tools');
	const [editingTool, setEditingTool] = useState<ToolConfigModel | null>(null);
	const [configModalOpened, setConfigModalOpened] = useState(false);
	const [addModalOpened, setAddModalOpened] = useState(false);

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

	// Active tools: those present in configList that are selected
	const activeTools = configList.filter((tool) =>
		isToolSelected(tool.nameCode)
	);
	const activeNameCodes = activeTools.map((t) => t.nameCode);

	const updateBuiltInTools = useCallback(
		(updatedBuiltInTools: Record<string, SystemToolModel | null>) => {
			const currentAgentConfig = form.values.agentConfig || {};
			const currentConversationConfig = currentAgentConfig.conversationConfig;
			const currentAgent = currentConversationConfig?.agent;
			const currentPrompt = currentAgent?.prompt;

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

	const handleRemoveTool = useCallback(
		(toolConfig: ToolConfigModel) => {
			const currentBuiltInTools =
				form.values.agentConfig?.conversationConfig?.agent?.prompt
					?.builtInTools || {};
			const updated = { ...currentBuiltInTools, [toolConfig.nameCode]: null };
			updateBuiltInTools(updated);
		},
		[form, updateBuiltInTools]
	);

	const handleAddTools = useCallback(
		(selectedNameCodes: string[]) => {
			const currentBuiltInTools =
				form.values.agentConfig?.conversationConfig?.agent?.prompt
					?.builtInTools || {};

			const newEntries = selectedNameCodes.reduce<
				Record<string, SystemToolModel>
			>((acc, nameCode) => {
				const toolConfig = configList.find((t) => t.nameCode === nameCode);
				if (toolConfig) {
					acc[nameCode] = toolConfig.value;
				}
				return acc;
			}, {});

			updateBuiltInTools({ ...currentBuiltInTools, ...newEntries });
			setAddModalOpened(false);
		},
		[configList, form, updateBuiltInTools]
	);

	const handleOpenConfigModal = useCallback((toolConfig: ToolConfigModel) => {
		setEditingTool(toolConfig);
		setConfigModalOpened(true);
	}, []);

	const handleCloseConfigModal = useCallback(() => {
		setConfigModalOpened(false);
		setEditingTool(null);
	}, []);

	const handleSaveToolConfig = useCallback(
		(updatedConfig: SystemToolModel) => {
			const currentBuiltInTools =
				form.values.agentConfig?.conversationConfig?.agent?.prompt
					?.builtInTools || {};
			const nameCode = snakeToCamel(updatedConfig.name);
			updateBuiltInTools({ ...currentBuiltInTools, [nameCode]: updatedConfig });
		},
		[form, updateBuiltInTools]
	);

	return (
		<>
			<RightSectionCard
				icon={IconCpu}
				title={t('form.agent.systemTools.title')}
				description={t('form.agent.systemTools.description')}
			>
				<div className={classes.container}>
					{activeTools.length > 0 ? (
						activeTools.map((toolConfig) => (
							<div key={toolConfig.nameCode} className={classes.item}>
								<ThemeIcon variant='light' color='cyan' size='md'>
									<IconCpu size={16} />
								</ThemeIcon>
								<div className={classes.itemInfo}>
									<Group gap={6} align='center' wrap='nowrap'>
										<div className={classes.itemName}>{toolConfig.name}</div>
										{toolConfig.value?.type && (
											<Badge size='xs' variant='light' color='cyan'>
												{toolConfig.value.type}
											</Badge>
										)}
									</Group>
									<div className={classes.itemMeta}>
										<span className={classes.itemType}>
											{t('form.agent.systemTools.systemUtility')}
										</span>
									</div>
								</div>
								<div className={classes.itemActions}>
									<Tooltip
										label={t('form.agent.systemTools.configure')}
										position='left'
									>
										<ActionIcon
											variant='subtle'
											color='gray'
											size='sm'
											onClick={() => handleOpenConfigModal(toolConfig)}
											aria-label={t('form.agent.systemTools.configure')}
										>
											<IconSettings size={14} />
										</ActionIcon>
									</Tooltip>
									<Tooltip
										label={t('form.agent.systemTools.remove')}
										position='left'
									>
										<ActionIcon
											variant='subtle'
											color='red'
											size='sm'
											onClick={() => handleRemoveTool(toolConfig)}
											aria-label={t('form.agent.systemTools.removeAria', {
												name: toolConfig.name,
											})}
										>
											<IconTrash size={15} />
										</ActionIcon>
									</Tooltip>
								</div>
							</div>
						))
					) : (
						<Text size='xs' c='dimmed'>
							{t('form.agent.systemTools.noSelection')}
						</Text>
					)}

					<button
						type='button'
						className={classes.addButton}
						onClick={() => setAddModalOpened(true)}
					>
						<IconPlus size={14} className={classes.plusIcon} />
						<span>{t('form.agent.systemTools.add')}</span>
					</button>
				</div>
			</RightSectionCard>

			<CampaignConfigurationSystemToolsAddModal
				opened={addModalOpened}
				onClose={() => setAddModalOpened(false)}
				allTools={configList}
				activeNameCodes={activeNameCodes}
				onSave={handleAddTools}
			/>

			{editingTool && (
				<ToolConfigModal
					opened={configModalOpened}
					onClose={handleCloseConfigModal}
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
