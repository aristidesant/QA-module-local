import {
	ActionIcon,
	Button,
	Group,
	Menu,
	Stack,
	Switch,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconPencil,
	IconSettings,
	IconTrash,
	IconPuzzle,
} from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTools, useToolsByCategory } from '~/queries/toolQueries';
import { useToolCategories } from '~/queries/toolCategoryQueries';
import { useClientConfigByName } from '~/queries/useClientConfigs';
import type { SystemToolModel } from '~/models/AgentListObject';
import type { ToolModel } from '~/models/ToolModel';
import { snakeToCamel } from '~/utils/stringUtils';
import ToolConfigModal from '~/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationSystemTools/ToolConfigModal/ToolConfigModal';
import toolStyles from '~/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationTools/CampaignConfigurationTools.module.css';
import { useAgentForm } from '../../context';
import { useBuiltInTools } from '../../hooks';
import mainStyles from '../../AgentForm.module.css';
import {
	updateWorkflowNode,
	updateWorkflowNodeSubagent,
} from '../../../nodeFormUtils';

type ToolConfigModel = {
	name: string;
	nameCode: string;
	description?: string;
	value: SystemToolModel;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const BuiltInTools = () => {
	const { t } = useTranslation('campaigns');
	const {
		builtInToolsState,
		setBuiltInToolsState,
		workflow,
		nodeId,
		onWorkflowChange,
	} = useAgentForm();
	const builtInTools = useBuiltInTools();
	const { data: systemToolsConfig } = useClientConfigByName('system_tools');
	const [editingTool, setEditingTool] = useState<{
		id: string;
		label: string;
		config: SystemToolModel;
	} | null>(null);
	const [modalOpened, setModalOpened] = useState(false);

	const currentNode = workflow?.nodes[nodeId];
	const subagent =
		currentNode && 'subagent' in currentNode ? currentNode.subagent : undefined;
	const legacyToolIds =
		currentNode && 'additionalToolIds' in currentNode
			? (currentNode.additionalToolIds ?? [])
			: [];
	const toolIds = subagent?.toolIds ?? legacyToolIds;
	const endConversationIdentifier = 'end_conversation';
	const conversationConfig =
		(currentNode as { conversationConfig?: Record<string, unknown> })
			?.conversationConfig ?? {};
	const agentConfig =
		(conversationConfig as Record<string, unknown>).agent ?? {};
	const promptConfig = (agentConfig as Record<string, unknown>).prompt ?? {};
	const builtInToolsConfig = ((promptConfig as Record<string, unknown>)
		.builtInTools ?? {}) as Record<string, SystemToolModel | null>;

	const systemToolsList = useMemo<ToolConfigModel[]>(() => {
		if (!systemToolsConfig?.value) return [];
		try {
			const parsed = JSON.parse(systemToolsConfig.value);
			if (!Array.isArray(parsed)) return [];
			return parsed.map((entry, index) => {
				const entryRecord = isRecord(entry) ? entry : {};
				const entryValue = isRecord(entryRecord.value)
					? entryRecord.value
					: entryRecord;
				const name =
					typeof entryRecord.name === 'string' && entryRecord.name.trim()
						? entryRecord.name
						: 'Unnamed Tool';
				const rawNameCode =
					(typeof entryRecord.nameCode === 'string'
						? entryRecord.nameCode
						: undefined) ??
					(typeof entryValue.name === 'string' ? entryValue.name : undefined) ??
					(typeof entryValue.type === 'string' ? entryValue.type : undefined) ??
					`${name.toLowerCase().replace(/\s+/g, '_')}_${index}`;
				const nameCode = snakeToCamel(rawNameCode);
				const description =
					typeof entryRecord.description === 'string'
						? entryRecord.description
						: typeof entryValue.description === 'string'
							? entryValue.description
							: undefined;
				const toolValue = {
					...(entryValue as unknown as SystemToolModel),
					name: rawNameCode,
				};
				return {
					name,
					nameCode,
					description,
					value: toolValue,
				};
			});
		} catch (error) {
			console.error('Error parsing system tools config:', error);
			return [];
		}
	}, [systemToolsConfig]);

	const systemToolsMap = useMemo(() => {
		const mapped = new Map<string, ToolConfigModel>();
		systemToolsList.forEach((tool) => {
			mapped.set(tool.nameCode, tool);
		});
		return mapped;
	}, [systemToolsList]);

	const handleConversationConfigChange = useCallback(
		(updates: Partial<Record<string, unknown>>) => {
			const nextWorkflow = updateWorkflowNode(workflow, nodeId, {
				conversationConfig: {
					...conversationConfig,
					...updates,
				},
			} as Record<string, unknown>);
			if (nextWorkflow) {
				onWorkflowChange(nextWorkflow);
			}
		},
		[conversationConfig, nodeId, onWorkflowChange, workflow]
	);

	const handleBuiltInToolsChange = useCallback(
		(nextBuiltInTools: Record<string, SystemToolModel | null>) => {
			handleConversationConfigChange({
				agent: {
					...(agentConfig as Record<string, unknown>),
					prompt: {
						...(promptConfig as Record<string, unknown>),
						builtInTools: nextBuiltInTools,
					},
				},
			});
		},
		[agentConfig, handleConversationConfigChange, promptConfig]
	);

	const resolveToolConfig = useCallback(
		(toolId: string) => {
			const storedConfig = builtInToolsConfig[toolId];
			if (storedConfig && isRecord(storedConfig)) {
				return storedConfig as SystemToolModel;
			}
			const fallbackConfig = systemToolsMap.get(toolId)?.value;
			return fallbackConfig ?? null;
		},
		[builtInToolsConfig, systemToolsMap]
	);

	const handleOpenConfig = useCallback(
		(toolId: string, label: string) => {
			const toolDefinition = systemToolsMap.get(toolId);
			const resolvedConfig = resolveToolConfig(toolId);
			if (!resolvedConfig) return;
			const normalizedConfig = toolDefinition?.value?.name
				? {
						...resolvedConfig,
						name: toolDefinition.value.name,
					}
				: resolvedConfig;
			setEditingTool({
				id: toolId,
				label,
				config: normalizedConfig,
			});
			setModalOpened(true);
		},
		[resolveToolConfig, systemToolsMap]
	);

	const handleCloseConfig = useCallback(() => {
		setModalOpened(false);
		setEditingTool(null);
	}, []);

	const handleSaveToolConfig = useCallback(
		(updatedConfig: SystemToolModel) => {
			if (!editingTool) return;
			const toolDefinition = systemToolsMap.get(editingTool.id);
			const normalizedConfig = toolDefinition?.value?.name
				? {
						...updatedConfig,
						name: toolDefinition.value.name,
					}
				: updatedConfig;
			const nextBuiltInTools = {
				...builtInToolsConfig,
				[editingTool.id]: normalizedConfig,
			};
			handleBuiltInToolsChange(nextBuiltInTools);
			handleCloseConfig();
		},
		[
			builtInToolsConfig,
			editingTool,
			handleBuiltInToolsChange,
			handleCloseConfig,
			systemToolsMap,
		]
	);

	const handleBuiltInToggle = useCallback(
		(toolId: string, checked: boolean) => {
			setBuiltInToolsState((current) => ({
				...current,
				[toolId as keyof typeof current]: checked,
			}));

			const nextBuiltInTools = {
				...builtInToolsConfig,
			};

			if (!checked) {
				nextBuiltInTools[toolId] = null;
				handleBuiltInToolsChange(nextBuiltInTools);
				return;
			}

			const resolvedConfig = resolveToolConfig(toolId);
			if (!resolvedConfig) return;
			nextBuiltInTools[toolId] = resolvedConfig;
			handleBuiltInToolsChange(nextBuiltInTools);
		},
		[
			builtInToolsConfig,
			handleBuiltInToolsChange,
			resolveToolConfig,
			setBuiltInToolsState,
		]
	);

	const handleEndConversationToggle = useCallback(
		(checked: boolean) => {
			const nextToolIds = checked
				? Array.from(new Set([...toolIds, endConversationIdentifier]))
				: toolIds.filter((id) => id !== endConversationIdentifier);
			const nextWorkflow = updateWorkflowNodeSubagent(workflow, nodeId, {
				toolIds: nextToolIds,
			});
			if (nextWorkflow) {
				onWorkflowChange(nextWorkflow);
			}
			setBuiltInToolsState((current) => ({
				...current,
				endConversation: checked,
			}));
		},
		[
			endConversationIdentifier,
			nodeId,
			onWorkflowChange,
			setBuiltInToolsState,
			toolIds,
			workflow,
		]
	);

	return (
		<>
			<div className={mainStyles.toolsSection}>
				<Text size='sm' className={mainStyles.sectionLabel}>
					{t('form.workflow.forms.agent.toolsTab.builtIn.title')}
				</Text>
				<div className={mainStyles.toolList}>
					{builtInTools.map((tool) => {
						const isEndConversation = tool.id === 'endConversation';
						const hasStoredConfig = Object.prototype.hasOwnProperty.call(
							builtInToolsConfig,
							tool.id
						);
						const storedConfig = builtInToolsConfig[tool.id];
						const isEnabled = isEndConversation
							? toolIds.includes(endConversationIdentifier)
							: hasStoredConfig
								? storedConfig !== null && storedConfig !== undefined
								: builtInToolsState[tool.id as keyof typeof builtInToolsState];

						return (
							<div
								key={tool.id}
								className={`${mainStyles.toolRow} ${
									tool.switchDisabled ? mainStyles.toolRowDisabled : ''
								}`}
							>
								<div className={mainStyles.toolIcon}>
									<IconPencil size={14} />
								</div>
								<div className={mainStyles.toolInfo}>
									<Text size='sm' className={mainStyles.toolLabel}>
										<span className={mainStyles.toolLabelText}>
											{tool.label}
										</span>
									</Text>
								</div>
								{tool.showSettings && !isEndConversation ? (
									<Tooltip
										label={
											isEnabled
												? t('form.agent.systemTools.configure')
												: t('form.agent.systemTools.enableToConfigure')
										}
										withArrow
									>
										<ActionIcon
											variant='subtle'
											color='gray'
											size='sm'
											disabled={!isEnabled}
											aria-label={t(
												'form.workflow.forms.agent.toolsTab.builtIn.configure',
												{ name: tool.label }
											)}
											onClick={() => handleOpenConfig(tool.id, tool.label)}
										>
											<IconSettings size={14} />
										</ActionIcon>
									</Tooltip>
								) : (
									<div className={mainStyles.toolConfigSpacer} />
								)}
								<Switch
									size='sm'
									disabled={tool.switchDisabled}
									checked={isEnabled}
									onChange={(event) => {
										const checked = event.currentTarget?.checked ?? false;
										if (isEndConversation) {
											handleEndConversationToggle(checked);
											return;
										}
										handleBuiltInToggle(tool.id, checked);
									}}
									aria-label={t(
										'form.workflow.forms.agent.toolsTab.builtIn.toggle',
										{ name: tool.label }
									)}
								/>
							</div>
						);
					})}
				</div>
			</div>
			{editingTool && (
				<ToolConfigModal
					opened={modalOpened}
					onClose={handleCloseConfig}
					toolName={editingTool.label}
					toolConfig={editingTool.config}
					onSave={handleSaveToolConfig}
				/>
			)}
		</>
	);
};

const CustomTools = () => {
	const { t } = useTranslation('campaigns');
	const {
		inheritCustomTools,
		setInheritCustomTools,
		isToolMenuOpen,
		setIsToolMenuOpen,
		workflow,
		nodeId,
		onWorkflowChange,
	} = useAgentForm();
	const { data: toolCategories } = useToolCategories();
	const { data: webhookTools } = useToolsByCategory(
		toolCategories?.find((cat) => cat.name === 'webhook')?.id
	);

	const currentNode = workflow?.nodes[nodeId];
	const subagent =
		currentNode && 'subagent' in currentNode ? currentNode.subagent : undefined;
	const legacyToolIds =
		currentNode && 'additionalToolIds' in currentNode
			? (currentNode.additionalToolIds ?? [])
			: [];
	const toolIds = subagent?.toolIds ?? legacyToolIds;

	const {
		data: tools,
		isLoading: isToolsLoading,
		isError: isToolsError,
		refetch: refetchTools,
	} = useTools({ enabled: false });

	const selectedTools = useMemo(() => {
		return toolIds.map((toolId) => {
			const matched = (tools ?? []).find((tool) => tool.identifier === toolId);
			return {
				id: toolId,
				name: matched?.name,
			};
		});
	}, [toolIds, tools]);

	const availableTools = useMemo(() => {
		const selectedSet = new Set(toolIds);
		return (tools ?? []).filter((tool) => !selectedSet.has(tool.identifier));
	}, [toolIds, tools]);

	const handleSubagentChange = (updates: Record<string, unknown>) => {
		const nextWorkflow = updateWorkflowNodeSubagent(workflow, nodeId, updates);
		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	const handleAddToolClick = async () => {
		setIsToolMenuOpen(true);
		await refetchTools();
	};

	const handleSelectTool = (tool: ToolModel) => {
		const nextToolIds = Array.from(new Set([...toolIds, tool.identifier]));
		handleSubagentChange({ toolIds: nextToolIds });
		setIsToolMenuOpen(false);
	};

	const handleRemoveTool = (toolId: string) => {
		const nextToolIds = toolIds.filter((id) => id !== toolId);
		handleSubagentChange({ toolIds: nextToolIds });
	};

	const isWebhookToolSelected = useCallback(
		(toolIdentifier: string) => toolIds.includes(toolIdentifier),
		[toolIds]
	);

	const handleWebhookToolToggle = useCallback(
		(tool: ToolModel, isCurrentlySelected: boolean) => {
			const nextToolIds = isCurrentlySelected
				? toolIds.filter((id) => id !== tool.identifier)
				: Array.from(new Set([...toolIds, tool.identifier]));
			handleSubagentChange({ toolIds: nextToolIds });
		},
		[handleSubagentChange, toolIds]
	);

	return (
		<>
			<div className={mainStyles.toolsDivider} />
			<Group justify='space-between' align='center'>
				<Text size='sm' className={mainStyles.sectionLabel}>
					{t('form.workflow.forms.agent.toolsTab.inheritCustomTools')}
				</Text>
				<Switch
					size='sm'
					checked={inheritCustomTools}
					onChange={(event) => {
						const checked = event.currentTarget?.checked ?? false;
						setInheritCustomTools(checked);
					}}
					aria-label={t(
						'form.workflow.forms.agent.toolsTab.inheritCustomTools'
					)}
				/>
			</Group>
			<Group justify='space-between' align='center'>
				<Text size='sm' className={mainStyles.sectionLabel}>
					{t('form.workflow.forms.agent.toolsTab.additionalCustomTools')}
				</Text>
				<Menu
					width={280}
					position='bottom-end'
					withinPortal
					opened={isToolMenuOpen}
					onChange={setIsToolMenuOpen}
				>
					<Menu.Target>
						<Button size='xs' variant='default' onClick={handleAddToolClick}>
							{t('form.workflow.forms.agent.toolsTab.addTool')}
						</Button>
					</Menu.Target>
					<Menu.Dropdown>
						{isToolsLoading && (
							<Text size='xs' c='dimmed' px='sm' py='xs'>
								{t('form.workflow.forms.agent.toolsTab.loading')}
							</Text>
						)}
						{isToolsError && (
							<Text size='xs' c='dimmed' px='sm' py='xs'>
								{t('form.workflow.forms.agent.toolsTab.error')}
							</Text>
						)}
						{!isToolsLoading &&
							!isToolsError &&
							(!tools || tools.length === 0) && (
								<Text size='xs' c='dimmed' px='sm' py='xs'>
									{t('form.workflow.forms.agent.toolsTab.empty')}
								</Text>
							)}
						{availableTools.map((tool) => (
							<Menu.Item key={tool.id} onClick={() => handleSelectTool(tool)}>
								{tool.name}
							</Menu.Item>
						))}
					</Menu.Dropdown>
				</Menu>
			</Group>
			{selectedTools.length === 0 ? (
				<div className={mainStyles.customToolsEmpty}>
					<Text size='xs' c='dimmed'>
						{t('form.workflow.forms.agent.toolsTab.emptyCustomTools')}
					</Text>
				</div>
			) : (
				selectedTools.map((tool) => (
					<div key={tool.id} className={mainStyles.customToolRow}>
						<Text size='sm' className={mainStyles.customToolName}>
							{tool.name || tool.id}
						</Text>
						<ActionIcon
							variant='subtle'
							color='gray'
							size='sm'
							onClick={() => handleRemoveTool(tool.id)}
							aria-label={t(
								'form.workflow.forms.agent.toolsTab.removeCustomTool',
								{ name: tool.name || tool.id }
							)}
						>
							<IconTrash size={14} />
						</ActionIcon>
					</div>
				))
			)}
			<div className={mainStyles.toolsDivider} />
			<Text size='sm' className={mainStyles.sectionLabel}>
				{t('form.agent.tools.title')}
			</Text>
			<Text size='xs' c='dimmed'>
				{t('form.agent.tools.description')}
			</Text>
			<Stack gap='xs'>
				{!webhookTools || webhookTools.length === 0 ? (
					<Text size='sm' c='dimmed'>
						{t('form.agent.tools.noTools')}
					</Text>
				) : (
					webhookTools.map((tool) => {
						const isSelected = isWebhookToolSelected(tool.identifier);
						return (
							<div
								key={tool.identifier}
								className={`${toolStyles.toolRow} ${
									isSelected ? toolStyles.toolRowActive : ''
								}`}
							>
								<Group
									align='flex-start'
									justify='space-between'
									gap='sm'
									className={toolStyles.rowHeader}
								>
									<Group
										gap='xs'
										align='center'
										className={toolStyles.toolTitle}
									>
										<div className={toolStyles.iconBadge}>
											<IconPuzzle size={14} />
										</div>
										<div>
											<Text fw={600} className={toolStyles.toolName}>
												{tool.name}
											</Text>
											<Text size='xs' className={toolStyles.toolMeta}>
												{t('form.agent.tools.customIntegration')}
											</Text>
										</div>
									</Group>

									<Switch
										aria-label={t('form.agent.tools.toggleAria', {
											name: tool.name,
										})}
										checked={isSelected}
										onChange={() => {
											handleWebhookToolToggle(tool, isSelected);
										}}
										size='sm'
										className={toolStyles.toolSwitch}
									/>
								</Group>
								<Text
									size='sm'
									c='dimmed'
									className={toolStyles.toolDescription}
								>
									{tool.description || t('form.agent.tools.noDescription')}
								</Text>
							</div>
						);
					})
				)}
			</Stack>
		</>
	);
};

const ToolsTab = () => {
	return (
		<Stack gap='sm'>
			<BuiltInTools />
			<CustomTools />
		</Stack>
	);
};

export default ToolsTab;
