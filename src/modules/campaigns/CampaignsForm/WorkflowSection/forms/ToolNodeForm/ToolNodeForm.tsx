import {
	ActionIcon,
	Button,
	Group,
	Menu,
	ScrollArea,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { IconPlus, IconSearch, IconTool, IconTrash } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AgentWorkflow, ToolNode } from '~/models/AgentWorkflowModel';
import type { ToolModel } from '~/models/ToolModel';
import { useTools } from '~/queries/toolQueries';
import WorkflowNodeForm from '../WorkflowNodeForm';
import { resolveNodeLabel, updateWorkflowNode } from '../nodeFormUtils';
import styles from './ToolNodeForm.module.css';

interface ToolNodeFormProps {
	nodeId: string;
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
}

const ToolNodeForm = ({
	nodeId,
	workflow,
	onWorkflowChange,
}: ToolNodeFormProps) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const node = workflow?.nodes[nodeId] as ToolNode | undefined;
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [searchValue, setSearchValue] = useState('');
	const {
		data: tools,
		isLoading: isToolsLoading,
		isError: isToolsError,
		refetch: refetchTools,
	} = useTools({ enabled: false });

	if (!node) {
		return (
			<WorkflowNodeForm
				title={t('form.workflow.forms.tool.title')}
				description={t('form.workflow.forms.tool.missingNode')}
			>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.forms.tool.missingNodeHint')}
				</Text>
			</WorkflowNodeForm>
		);
	}

	const selectedToolIds = node.tools?.map((tool) => tool.tool_id) ?? [];
	const availableTools = useMemo(() => tools ?? [], [tools]);

	const selectedTools = useMemo(() => {
		return selectedToolIds.map((tool_id) => {
			const matched = availableTools.find(
				(tool) => tool.identifier === tool_id
			);
			return {
				id: tool_id,
				name: matched?.name,
				description: matched?.description,
			};
		});
	}, [availableTools, selectedToolIds]);

	const filteredTools = useMemo(() => {
		const trimmedSearch = searchValue.trim().toLowerCase();
		const selectedSet = new Set(selectedToolIds);
		const candidates = availableTools.filter(
			(tool) => !selectedSet.has(tool.identifier)
		);
		if (!trimmedSearch) return candidates;
		return candidates.filter((tool) => {
			const name = tool.name?.toLowerCase() ?? '';
			const identifier = tool.identifier?.toLowerCase() ?? '';
			const description = tool.description?.toLowerCase() ?? '';
			return (
				name.includes(trimmedSearch) ||
				identifier.includes(trimmedSearch) ||
				description.includes(trimmedSearch)
			);
		});
	}, [availableTools, searchValue, selectedToolIds]);

	const handleUpdateTools = (nextTools: Array<{ tool_id: string }>) => {
		const nextWorkflow = updateWorkflowNode(workflow, nodeId, {
			tools: nextTools,
		});
		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	const handleAddToolClick = async () => {
		setIsMenuOpen(true);
		await refetchTools();
	};

	const handleSelectTool = (tool: ToolModel) => {
		const nextToolIds = Array.from(
			new Set([...selectedToolIds, tool.identifier])
		);
		const nextTools = nextToolIds.map((tool_id) => ({ tool_id }));
		handleUpdateTools(nextTools);
		setIsMenuOpen(false);
	};

	const handleRemoveTool = (tool_id: string) => {
		const nextTools = selectedToolIds
			.filter((id) => id !== tool_id)
			.map((id) => ({ tool_id: id }));
		handleUpdateTools(nextTools);
	};

	return (
		<WorkflowNodeForm
			title={t('form.workflow.forms.tool.title')}
			description={t('form.workflow.forms.tool.description')}
		>
			<Stack gap='xs'>
				<Menu
					width={360}
					position='bottom-start'
					withinPortal
					opened={isMenuOpen}
					onChange={setIsMenuOpen}
					closeOnItemClick={false}
				>
					<Menu.Target>
						<Button
							size='xs'
							variant='default'
							leftSection={<IconPlus size={14} />}
							fullWidth
							onClick={handleAddToolClick}
						>
							{t('form.workflow.forms.tool.addTool')}
						</Button>
					</Menu.Target>
					<Menu.Dropdown className={styles.menuDropdown}>
						<div className={styles.menuHeader}>
							<TextInput
								value={searchValue}
								onChange={(event) => setSearchValue(event.currentTarget.value)}
								placeholder={t('form.workflow.forms.tool.searchPlaceholder')}
								leftSection={<IconSearch size={14} />}
								size='xs'
								className={styles.menuSearch}
							/>
						</div>
						{isToolsLoading && (
							<Text size='xs' c='dimmed' px='sm' py='xs'>
								{t('form.workflow.forms.tool.loading')}
							</Text>
						)}
						{isToolsError && (
							<Text size='xs' c='dimmed' px='sm' py='xs'>
								{t('form.workflow.forms.tool.error')}
							</Text>
						)}
						{!isToolsLoading && !isToolsError && filteredTools.length === 0 && (
							<Text size='xs' c='dimmed' px='sm' py='xs'>
								{searchValue.trim()
									? t('form.workflow.forms.tool.emptySearch')
									: t('form.workflow.forms.tool.emptyAvailable')}
							</Text>
						)}
						{filteredTools.length > 0 && (
							<ScrollArea className={styles.menuList} scrollbarSize={4}>
								{filteredTools.map((tool) => (
									<Menu.Item
										key={tool.identifier}
										className={styles.menuItem}
										onClick={() => handleSelectTool(tool)}
									>
										<Group gap='xs' align='flex-start' wrap='nowrap'>
											<div className={styles.toolIcon}>
												<IconTool size={14} />
											</div>
											<div className={styles.toolDetails}>
												<Text size='sm' fw={500}>
													{tool.name ||
														resolveNodeLabel(
															tool.identifier,
															t('form.workflow.forms.tool.unknown')
														)}
												</Text>
												<Text size='xs' c='dimmed' lineClamp={2}>
													{tool.description ||
														t('form.workflow.forms.tool.noDescription')}
												</Text>
											</div>
										</Group>
									</Menu.Item>
								))}
							</ScrollArea>
						)}
					</Menu.Dropdown>
				</Menu>
				{selectedTools.length === 0 ? (
					<div className={styles.empty}>
						<Text size='xs' c='dimmed'>
							{t('form.workflow.forms.tool.empty')}
						</Text>
					</div>
				) : (
					<div className={styles.list}>
						{selectedTools.map((tool, index) => {
							const toolLabel = resolveNodeLabel(
								tool.name ?? tool.id,
								t('form.workflow.forms.tool.unknown')
							);
							const toolDescription =
								tool.description || t('form.workflow.forms.tool.noDescription');
							return (
								<div
									key={`${toolLabel || 'tool'}-${index}`}
									className={styles.toolItem}
								>
									<Group gap='xs' align='flex-start' wrap='nowrap'>
										<div className={styles.toolIcon}>
											<IconTool size={14} />
										</div>
										<div className={styles.toolDetails}>
											<Text size='sm' fw={500}>
												{toolLabel}
											</Text>
											<Text size='xs' c='dimmed' lineClamp={2}>
												{toolDescription}
											</Text>
										</div>
									</Group>
									<ActionIcon
										variant='subtle'
										color='gray'
										size='sm'
										onClick={() => handleRemoveTool(tool.id)}
										aria-label={t('form.workflow.forms.tool.removeTool', {
											name: toolLabel,
										})}
									>
										<IconTrash size={14} />
									</ActionIcon>
								</div>
							);
						})}
					</div>
				)}
			</Stack>
		</WorkflowNodeForm>
	);
};

export default ToolNodeForm;
