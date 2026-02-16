import { useMemo, useState } from 'react';
import { ActionIcon, Group, Menu, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconCopy,
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
	const { t } = useTranslation('campaigns');
	const config = NODE_TYPE_CONFIG[nodeType];
	const isTransferAgent =
		nodeData.uiMeta?.variant === 'transfer' || !!nodeData.agentId;
	const isPhoneTransfer = nodeType === WORKFLOW_NODE_TYPES.PHONE_NUMBER;
	const onAddNode = nodeData.onAddNode;
	const onAddNodeWithType = nodeData.onAddNodeWithType;
	const onAddNodeWithVariant = nodeData.onAddNodeWithVariant;
	const showActions =
		nodeData.showActions ?? nodeType !== WORKFLOW_NODE_TYPES.START;
	const onDeleteNode = nodeData.onDeleteNode;
	const onCopyNode = nodeData.onCopyNode;
	const showAddButton =
		(config?.hasAddButton ?? false) &&
		!isTransferAgent &&
		!isPhoneTransfer &&
		(!!onAddNode || !!onAddNodeWithType);
	const position = nodeData.position;
	const isStartNode = nodeType === WORKFLOW_NODE_TYPES.START;

	const handleAddClick = () => {
		if (onAddNode && position) {
			onAddNode(nodeId, position);
		}
	};

	const handleAddNodeWithType = (type: WorkflowNodeType) => {
		if (onAddNodeWithType && position) {
			onAddNodeWithType(nodeId, position, type);
			return;
		}
		handleAddClick();
	};

	const handleAddNodeWithVariant = (
		type: WorkflowNodeType,
		variant: 'transfer' | 'subagent'
	) => {
		if (onAddNodeWithVariant && position) {
			onAddNodeWithVariant(nodeId, position, { type, variant });
			return;
		}
		handleAddNodeWithType(type);
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

	const canShowMenu = !!onAddNodeWithType && !isStartNode;
	const canShowSingleAdd =
		(!!onAddNode && !canShowMenu) || (isStartNode && !!onAddNodeWithType);

	return (
		<Group gap='xs' align='center' wrap='nowrap' className={styles.actions}>
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
							isStartNode && onAddNodeWithType
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
			{showActions && onCopyNode && (
				<Tooltip label={t('form.workflow.actions.clone')} withArrow>
					<ActionIcon
						size='sm'
						variant='light'
						color='gray'
						radius='sm'
						onClick={() => onCopyNode(nodeId)}
						className={styles.actionButton}
					>
						<IconCopy size={13} />
					</ActionIcon>
				</Tooltip>
			)}
			{showActions && onDeleteNode && (
				<Tooltip label={t('form.workflow.actions.delete')} withArrow>
					<ActionIcon
						size='sm'
						variant='light'
						color='red'
						radius='sm'
						onClick={() => onDeleteNode(nodeId)}
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
