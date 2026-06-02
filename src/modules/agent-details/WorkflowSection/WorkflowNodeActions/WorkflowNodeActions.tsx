import { useMemo, useState } from 'react';
import { ActionIcon, Group, Menu, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconCopy,
	IconPencil,
	IconPhone,
	IconPlus,
	IconSquareRoundedCheck,
	IconTool,
	IconTrash,
	IconUserCircle,
	IconUserCog,
} from '@tabler/icons-react';
import {
	NODE_TYPE_CONFIG,
	WORKFLOW_NODE_TYPES,
	type WorkflowNodeType,
} from '../nodeTypes';
import { useWorkflowNodeEditor } from '../WorkflowNodeEditorContext';
import { useWorkflowCanvasActions } from '../WorkflowCanvas/WorkflowCanvasActionsContext';
import type { WorkflowNodeData } from '../WorkflowNode/WorkflowNodeTypes';
import NodeStylePopover from '../NodeStylePopover';
import { isWorkflowMultiSelectClick } from '../utils/workflowSelectionUtils';
import styles from './WorkflowNodeActions.module.css';

interface WorkflowNodeActionsProps {
	nodeId: string;
	nodeData: WorkflowNodeData;
	nodeType: WorkflowNodeType;
}

const WorkflowNodeActions = ({
	nodeId,
	nodeData,
	nodeType,
}: WorkflowNodeActionsProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const {
		addNode,
		addNodeWithType,
		addNodeWithVariant,
		deleteNode,
		copyNode,
		clearEdgeActions,
	} = useWorkflowCanvasActions();
	const { openNodeDrawer } = useWorkflowNodeEditor();
	const config = NODE_TYPE_CONFIG[nodeType];
	const isTransferAgent =
		nodeData.uiMeta?.variant === 'transfer' || !!nodeData.agent_id;
	const isPhoneTransfer = nodeType === WORKFLOW_NODE_TYPES.PHONE_NUMBER;
	const showActions = nodeType !== WORKFLOW_NODE_TYPES.START;
	const canEdit =
		nodeType !== WORKFLOW_NODE_TYPES.START &&
		nodeType !== WORKFLOW_NODE_TYPES.END;
	const position = nodeData.position;
	const isStartNode = nodeType === WORKFLOW_NODE_TYPES.START;
	const isEndNode = nodeType === WORKFLOW_NODE_TYPES.END;
	const canCustomizeStyle = !isStartNode && !isEndNode;
	const edge_order = (nodeData.edge_order as string[] | undefined) ?? [];
	const isStartConnected = isStartNode && edge_order.length > 0;
	const showAddButton =
		(config?.hasAddButton ?? false) &&
		!isTransferAgent &&
		!isPhoneTransfer &&
		!isStartConnected;

	const handleAddClick = () => {
		if (position) {
			return addNode(nodeId, position);
		}
		return undefined;
	};

	const handleAddNodeWithType = (type: WorkflowNodeType) => {
		if (position) {
			return addNodeWithType(nodeId, position, type);
		}
		return undefined;
	};

	const handleAddNodeWithVariant = (
		type: WorkflowNodeType,
		variant: 'transfer' | 'subagent'
	) => {
		if (position) {
			return addNodeWithVariant(nodeId, position, { type, variant });
		}
		return undefined;
	};

	const menuItems = useMemo(() => {
		const items = [
			{
				type: WORKFLOW_NODE_TYPES.STANDALONE_AGENT,
				label: t('form.workflow.nodeMenu.subagent'),
				icon: IconUserCircle,
			},
			{
				type: WORKFLOW_NODE_TYPES.STANDALONE_AGENT,
				variant: 'transfer' as const,
				label: t('form.workflow.nodeMenu.agentTransfer'),
				icon: IconUserCog,
			},
			{
				type: WORKFLOW_NODE_TYPES.UPDATE_STATE,
				label: t('form.workflow.nodeMenu.updateState'),
				icon: IconPencil,
			},
			{
				type: WORKFLOW_NODE_TYPES.PHONE_NUMBER,
				label: t('form.workflow.nodeMenu.phoneNumber'),
				icon: IconPhone,
			},
			{
				type: WORKFLOW_NODE_TYPES.TOOL,
				label: t('form.workflow.nodeMenu.tool'),
				icon: IconTool,
			},
			{
				type: WORKFLOW_NODE_TYPES.END,
				label: t('form.workflow.nodeMenu.end'),
				icon: IconSquareRoundedCheck,
			},
		];

		if (nodeType === WORKFLOW_NODE_TYPES.START) {
			return items.slice(0, 1);
		}

		return items;
	}, [nodeType, t]);

	const canShowMenu = !isStartNode;
	const canShowSingleAdd = isStartNode;

	return (
		<Group
			gap='xs'
			align='center'
			wrap='nowrap'
			className={`${styles.actions} nodrag nopan`}
		>
			{showAddButton && canShowMenu && (
				<Menu
					position='bottom'
					withinPortal
					opened={isMenuOpen}
					onOpen={() => setIsMenuOpen(true)}
					onClose={() => setIsMenuOpen(false)}
				>
					<Menu.Target>
						<Tooltip
							label={t('form.workflow.actions.add')}
							withArrow
							withinPortal
						>
							<ActionIcon
								size='sm'
								variant='light'
								color='blue'
								radius='sm'
								title={t('form.workflow.actions.add')}
								className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
							>
								<IconPlus size={13} />
							</ActionIcon>
						</Tooltip>
					</Menu.Target>
					<Menu.Dropdown className={styles.menuDropdown}>
						<Menu.Label>{t('form.workflow.actions.add')}</Menu.Label>
						{menuItems.map((item) => (
							<Menu.Item
								key={`${item.type}-${item.label}`}
								leftSection={<item.icon size={16} />}
								onClick={() => {
									if ('variant' in item && item.variant) {
										handleAddNodeWithVariant(item.type, item.variant);
									} else {
										const newNodeId = handleAddNodeWithType(item.type);
										if (
											item.type === WORKFLOW_NODE_TYPES.UPDATE_STATE &&
											newNodeId
										) {
											openNodeDrawer(newNodeId);
										}
									}
									setIsMenuOpen(false);
								}}
							>
								{item.label}
							</Menu.Item>
						))}
					</Menu.Dropdown>
				</Menu>
			)}
			{showAddButton && canShowSingleAdd && (
				<Tooltip label={t('form.workflow.actions.add')} withArrow withinPortal>
					<ActionIcon
						size='sm'
						variant='light'
						color='blue'
						radius='sm'
						title={t('form.workflow.actions.add')}
						onClick={
							isStartNode
								? (event) => {
										if (isWorkflowMultiSelectClick(event)) return;
										handleAddNodeWithType(WORKFLOW_NODE_TYPES.STANDALONE_AGENT);
									}
								: (event) => {
										if (isWorkflowMultiSelectClick(event)) return;
										handleAddClick();
									}
						}
						className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
					>
						<IconPlus size={13} />
					</ActionIcon>
				</Tooltip>
			)}
			{canCustomizeStyle && (
				<NodeStylePopover nodeId={nodeId} nodeLabel={nodeData.label ?? ''} />
			)}
			{canEdit && (
				<Tooltip label={t('form.workflow.actions.edit')} withArrow withinPortal>
					<ActionIcon
						size='sm'
						variant='light'
						color='gray'
						radius='sm'
						onClick={(event) => {
							if (isWorkflowMultiSelectClick(event)) return;
							clearEdgeActions();
							openNodeDrawer(nodeId);
						}}
						className={styles.actionButton}
					>
						<IconPencil size={13} />
					</ActionIcon>
				</Tooltip>
			)}
			{showActions && (
				<Tooltip
					label={t('form.workflow.actions.clone')}
					withArrow
					withinPortal
				>
					<ActionIcon
						size='sm'
						variant='light'
						color='gray'
						radius='sm'
						onClick={(event) => {
							if (isWorkflowMultiSelectClick(event)) return;
							copyNode(nodeId);
						}}
						className={styles.actionButton}
					>
						<IconCopy size={13} />
					</ActionIcon>
				</Tooltip>
			)}
			{showActions && (
				<Tooltip
					label={t('form.workflow.actions.delete')}
					withArrow
					withinPortal
				>
					<ActionIcon
						size='sm'
						variant='light'
						color='red'
						radius='sm'
						onClick={(event) => {
							if (isWorkflowMultiSelectClick(event)) return;
							deleteNode(nodeId);
						}}
						className={`${styles.actionButton} ${styles.actionButtonDanger}`}
					>
						<IconTrash size={13} />
					</ActionIcon>
				</Tooltip>
			)}
		</Group>
	);
};

export default WorkflowNodeActions;
