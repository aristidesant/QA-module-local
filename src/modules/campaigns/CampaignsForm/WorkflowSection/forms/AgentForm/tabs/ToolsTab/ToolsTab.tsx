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
import { useTranslation } from 'react-i18next';
import { useTools } from '~/queries/toolQueries';
import type { ToolModel } from '~/models/ToolModel';
import { useAgentForm } from '../../context';
import { useBuiltInTools } from '../../hooks';
import mainStyles from '../../AgentForm.module.css';

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
		customTools,
		setCustomTools,
		isToolMenuOpen,
		setIsToolMenuOpen,
	} = useAgentForm();

	const {
		data: tools,
		isLoading: isToolsLoading,
		isError: isToolsError,
		refetch: refetchTools,
	} = useTools({ enabled: false });

	const handleAddToolClick = async () => {
		setIsToolMenuOpen(true);
		await refetchTools();
	};

	const handleSelectTool = (tool: ToolModel) => {
		setCustomTools((current) => {
			if (current.some((item) => item.id === tool.id)) return current;
			return [...current, tool];
		});
		setIsToolMenuOpen(false);
	};

	const handleRemoveTool = (toolId: number) => {
		setCustomTools((current) => current.filter((tool) => tool.id !== toolId));
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
						{(tools || [])
							.filter(
								(tool) => !customTools.some((item) => item.id === tool.id)
							)
							.map((tool) => (
								<Menu.Item key={tool.id} onClick={() => handleSelectTool(tool)}>
									{tool.name}
								</Menu.Item>
							))}
					</Menu.Dropdown>
				</Menu>
			</Group>
			{customTools.length === 0 ? (
				<div className={mainStyles.customToolsEmpty}>
					<Text size='xs' c='dimmed'>
						{t('form.workflow.forms.agent.toolsTab.emptyCustomTools')}
					</Text>
				</div>
			) : (
				customTools.map((tool) => (
					<div key={tool.id} className={mainStyles.customToolRow}>
						<Text size='sm' className={mainStyles.customToolName}>
							{tool.name}
						</Text>
						<ActionIcon
							variant='subtle'
							color='gray'
							size='sm'
							onClick={() => handleRemoveTool(tool.id)}
							aria-label={t(
								'form.workflow.forms.agent.toolsTab.removeCustomTool',
								{ name: tool.name }
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
