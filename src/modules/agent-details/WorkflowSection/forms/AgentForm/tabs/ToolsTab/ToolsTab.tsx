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
import { IconSettings, IconTrash } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTools } from '~/queries/toolQueries';
import { useClientConfigByName } from '~/queries/useClientConfigs';
import type { SystemToolModel } from '~/models/AgentListObject';
import type { ToolModel } from '~/models/ToolModel';
import { snakeToCamel } from '~/utils/stringUtils';
import ToolConfigModal from '~/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationSystemTools/ToolConfigModal/ToolConfigModal';
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
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
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
		currentNode && 'additional_tool_ids' in currentNode
			? (currentNode.additional_tool_ids ?? [])
			: [];
	const tool_ids = subagent?.tool_ids ?? legacyToolIds;
	const endConversationIdentifier = 'end_conversation';
	const conversation_config =
		(currentNode as { conversation_config?: Record<string, unknown> })
			?.conversation_config ?? {};
	const agentConfig =
		(conversation_config as Record<string, unknown>).agent ?? {};
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
			void error;
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
				conversation_config: {
					...conversation_config,
					...updates,
				},
			} as Record<string, unknown>);
			if (nextWorkflow) {
				onWorkflowChange(nextWorkflow);
			}
		},
		[conversation_config, nodeId, onWorkflowChange, workflow]
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
		(tool_id: string) => {
			const storedConfig = builtInToolsConfig[tool_id];
			if (storedConfig && isRecord(storedConfig)) {
				return storedConfig as SystemToolModel;
			}
			const fallbackConfig = systemToolsMap.get(tool_id)?.value;
			return fallbackConfig ?? null;
		},
		[builtInToolsConfig, systemToolsMap]
	);

	const handleOpenConfig = useCallback(
		(tool_id: string, label: string) => {
			const toolDefinition = systemToolsMap.get(tool_id);
			const resolvedConfig = resolveToolConfig(tool_id);
			if (!resolvedConfig) return;
			const normalizedConfig = toolDefinition?.value?.name
				? {
						...resolvedConfig,
						name: toolDefinition.value.name,
					}
				: resolvedConfig;
			setEditingTool({
				id: tool_id,
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
		(tool_id: string, checked: boolean) => {
			setBuiltInToolsState((current) => ({
				...current,
				[tool_id as keyof typeof current]: checked,
			}));

			const nextBuiltInTools = {
				...builtInToolsConfig,
			};

			if (!checked) {
				nextBuiltInTools[tool_id] = null;
				handleBuiltInToolsChange(nextBuiltInTools);
				return;
			}

			const resolvedConfig = resolveToolConfig(tool_id);
			if (!resolvedConfig) return;
			nextBuiltInTools[tool_id] = resolvedConfig;
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
				? Array.from(new Set([...tool_ids, endConversationIdentifier]))
				: tool_ids.filter((id) => id !== endConversationIdentifier);
			const nextWorkflow = updateWorkflowNodeSubagent(workflow, nodeId, {
				tool_ids: nextToolIds,
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
			tool_ids,
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
							? tool_ids.includes(endConversationIdentifier)
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
								<div className={mainStyles.toolInfo}>
									<Text size='sm' className={mainStyles.toolLabel}>
										{tool.label}
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
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const {
		inheritCustomTools,
		setInheritCustomTools,
		isToolMenuOpen,
		setIsToolMenuOpen,
		workflow,
		nodeId,
		onWorkflowChange,
	} = useAgentForm();

	const currentNode = workflow?.nodes[nodeId];
	const subagent =
		currentNode && 'subagent' in currentNode ? currentNode.subagent : undefined;
	const legacyToolIds =
		currentNode && 'additional_tool_ids' in currentNode
			? (currentNode.additional_tool_ids ?? [])
			: [];
	const tool_ids = subagent?.tool_ids ?? legacyToolIds;

	const {
		data: tools,
		isLoading: isToolsLoading,
		isError: isToolsError,
		refetch: refetchTools,
	} = useTools({ enabled: false });

	const selectedTools = useMemo(() => {
		return tool_ids.map((tool_id) => {
			const matched = (tools ?? []).find((tool) => tool.identifier === tool_id);
			return {
				id: tool_id,
				name: matched?.name,
			};
		});
	}, [tool_ids, tools]);

	const availableTools = useMemo(() => {
		const selectedSet = new Set(tool_ids);
		return (tools ?? []).filter((tool) => !selectedSet.has(tool.identifier));
	}, [tool_ids, tools]);

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
		const nextToolIds = Array.from(new Set([...tool_ids, tool.identifier]));
		handleSubagentChange({ tool_ids: nextToolIds });
		setIsToolMenuOpen(false);
	};

	const handleRemoveTool = (tool_id: string) => {
		const nextToolIds = tool_ids.filter((id) => id !== tool_id);
		handleSubagentChange({ tool_ids: nextToolIds });
	};

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
