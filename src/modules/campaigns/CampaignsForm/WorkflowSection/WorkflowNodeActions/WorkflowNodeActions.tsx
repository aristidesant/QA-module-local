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
		nodeData.uiMeta?.variant === 'transfer' || !!nodeData.agentId;
	const isPhoneTransfer = nodeType === WORKFLOW_NODE_TYPES.PHONE_NUMBER;
	const showActions = nodeType !== WORKFLOW_NODE_TYPES.START;
	const canEdit =
		nodeType !== WORKFLOW_NODE_TYPES.START &&
		nodeType !== WORKFLOW_NODE_TYPES.END;
	const position = nodeData.position;
	const isStartNode = nodeType === WORKFLOW_NODE_TYPES.START;
	const edgeOrder = (nodeData.edgeOrder as string[] | undefined) ?? [];
	const isStartConnected = isStartNode && edgeOrder.length > 0;
	const showAddButton =
		(config?.hasAddButton ?? false) &&
		!isTransferAgent &&
		!isPhoneTransfer &&
		!isStartConnected;

	const handleAddClick = () => {
		if (position) {
			addNode(nodeId, position);
		}
	};

	const handleAddNodeWithType = (type: WorkflowNodeType) => {
		if (position) {
			addNodeWithType(nodeId, position, type);
		}
	};

	const handleAddNodeWithVariant = (
		type: WorkflowNodeType,
		variant: 'transfer' | 'subagent'
	) => {
		if (position) {
			addNodeWithVariant(nodeId, position, { type, variant });
		}
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
						<Tooltip label={t('form.workflow.actions.add')} withArrow>
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
										handleAddNodeWithType(item.type);
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
				<Tooltip label={t('form.workflow.actions.add')} withArrow>
					<ActionIcon
						size='sm'
						variant='light'
						color='blue'
						radius='sm'
						title={t('form.workflow.actions.add')}
						onClick={
							isStartNode
								? () =>
										handleAddNodeWithType(WORKFLOW_NODE_TYPES.STANDALONE_AGENT)
								: handleAddClick
						}
						className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
					>
						<IconPlus size={13} />
					</ActionIcon>
				</Tooltip>
			)}
			{canEdit && (
				<Tooltip label={t('form.workflow.actions.edit')} withArrow>
					<ActionIcon
						size='sm'
						variant='light'
						color='gray'
						radius='sm'
						onClick={() => {
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
				<Tooltip label={t('form.workflow.actions.clone')} withArrow>
					<ActionIcon
						size='sm'
						variant='light'
						color='gray'
						radius='sm'
						onClick={() => copyNode(nodeId)}
						className={styles.actionButton}
					>
						<IconCopy size={13} />
					</ActionIcon>
				</Tooltip>
			)}
			{showActions && (
				<Tooltip label={t('form.workflow.actions.delete')} withArrow>
					<ActionIcon
						size='sm'
						variant='light'
						color='red'
						radius='sm'
						onClick={() => deleteNode(nodeId)}
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
