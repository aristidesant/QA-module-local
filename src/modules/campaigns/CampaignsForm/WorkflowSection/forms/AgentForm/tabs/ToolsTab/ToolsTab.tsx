import {
	ActionIcon,
	Button,
	Group,
	Menu,
	Stack,
	Switch,
	Text,
} from '@mantine/core';
import { IconPencil, IconSettings, IconTrash } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTools } from '~/queries/toolQueries';
import type { ToolModel } from '~/models/ToolModel';
import { useAgentForm } from '../../context';
import { useBuiltInTools } from '../../hooks';
import mainStyles from '../../AgentForm.module.css';
import { updateWorkflowNodeSubagent } from '../../../nodeFormUtils';

const BuiltInTools = () => {
	const { t } = useTranslation('campaigns');
	const { builtInToolsState, setBuiltInToolsState } = useAgentForm();
	const builtInTools = useBuiltInTools();

	return (
		<div className={mainStyles.toolsSection}>
			<Text size='sm' className={mainStyles.sectionLabel}>
				{t('form.workflow.forms.agent.toolsTab.builtIn.title')}
			</Text>
			<div className={mainStyles.toolList}>
				{builtInTools.map((tool) => (
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
								<span className={mainStyles.toolLabelText}>{tool.label}</span>
							</Text>
						</div>
						{tool.showSettings ? (
							<ActionIcon
								variant='subtle'
								color='gray'
								size='sm'
								aria-label={t(
									'form.workflow.forms.agent.toolsTab.builtIn.configure',
									{ name: tool.label }
								)}
							>
								<IconSettings size={14} />
							</ActionIcon>
						) : (
							<div className={mainStyles.toolConfigSpacer} />
						)}
						<Switch
							size='sm'
							disabled={tool.switchDisabled}
							checked={
								builtInToolsState[tool.id as keyof typeof builtInToolsState]
							}
							onChange={(event) => {
								const checked = event.currentTarget?.checked ?? false;
								setBuiltInToolsState((current) => ({
									...current,
									[tool.id]: checked,
								}));
							}}
							aria-label={t(
								'form.workflow.forms.agent.toolsTab.builtIn.toggle',
								{ name: tool.label }
							)}
						/>
					</div>
				))}
			</div>
		</div>
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
