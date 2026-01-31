import React, { useMemo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ActionIcon, Group, Menu, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconCopy,
	IconPhone,
	IconPlugConnected,
	IconPlus,
	IconSquareRoundedCheck,
	IconTool,
	IconTrash,
	IconUserCircle,
} from '@tabler/icons-react';
import {
	NODE_TYPE_CONFIG,
	WORKFLOW_NODE_TYPES,
	type WorkflowNodeType,
} from '../nodeTypes';
import styles from './WorkflowNode.module.css';

interface NodeData {
	type: string;
	position: { x: number; y: number };
	label?: string;
	onAddNode?: (
		parentNodeId: string,
		parentPosition: { x: number; y: number }
	) => void;
	onAddNodeWithType?: (
		parentNodeId: string,
		parentPosition: { x: number; y: number },
		nodeType: WorkflowNodeType
	) => void;
	onDeleteNode?: (nodeId: string) => void;
	onCopyNode?: (nodeId: string) => void;
	showActions?: boolean;
	allowMultipleEdges?: boolean;
	[key: string]: unknown;
}

interface WorkflowNodeWrapperProps extends NodeProps {
	children?: React.ReactNode;
}

export const WorkflowNodeWrapper: React.FC<WorkflowNodeWrapperProps> = ({
	children,
	data,
	id,
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const { t } = useTranslation('campaigns');

	const nodeData = data as unknown as NodeData;
	const nodeType = nodeData.type as WorkflowNodeType;
	const config = NODE_TYPE_CONFIG[nodeType];
	const onAddNode = nodeData.onAddNode;
	const onAddNodeWithType = nodeData.onAddNodeWithType;
	const showActions =
		nodeData.showActions ?? nodeType !== WORKFLOW_NODE_TYPES.START;
	const onDeleteNode = nodeData.onDeleteNode;
	const onCopyNode = nodeData.onCopyNode;
	const showAddButton =
		(config?.hasAddButton ?? false) && (!!onAddNode || !!onAddNodeWithType);
	const position = nodeData.position;
	const fallbackLabel =
		nodeData.label ??
		t(`form.workflow.nodes.${nodeData.type}`, {
			defaultValue: nodeData.type as string,
		});

	const handleAddClick = () => {
		if (onAddNode && position) {
			onAddNode(id, position);
		}
	};

	const handleAddNodeWithType = (type: WorkflowNodeType) => {
		if (onAddNodeWithType && position) {
			onAddNodeWithType(id, position, type);
			return;
		}
		handleAddClick();
	};

	const menuItems = useMemo(() => {
		const items = [
			{
				type: WORKFLOW_NODE_TYPES.STANDALONE_AGENT,
				label: t('form.workflow.nodeMenu.subagent'),
				icon: IconUserCircle,
			},
			{
				type: WORKFLOW_NODE_TYPES.OVERRIDE_AGENT,
				label: t('form.workflow.nodeMenu.overrideAgent'),
				icon: IconPlugConnected,
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

	const canShowMenu = !!onAddNodeWithType;
	const canShowSingleAdd = !!onAddNode && !canShowMenu;

	return (
		<div
			className={styles.nodeContainer}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{showActions && isHovered && (
				<div className={styles.actionsContainer}>
					<Group gap='xs' align='center'>
						{onCopyNode && (
							<Tooltip label={t('form.workflow.actions.copy')} withArrow>
								<ActionIcon
									size='sm'
									variant='outline'
									color='gray'
									onClick={() => onCopyNode(id)}
									className={styles.actionButton}
								>
									<IconCopy size={14} />
								</ActionIcon>
							</Tooltip>
						)}
						{onDeleteNode && (
							<Tooltip label={t('form.workflow.actions.delete')} withArrow>
								<ActionIcon
									size='sm'
									variant='outline'
									color='red'
									onClick={() => onDeleteNode(id)}
									className={styles.actionButton}
								>
									<IconTrash size={14} />
								</ActionIcon>
							</Tooltip>
						)}
					</Group>
				</div>
			)}
			<Handle
				type='target'
				position={Position.Top}
				className={`${styles.handle} ${styles.handleTarget}`}
			/>
			{children ?? (
				<div className={styles.defaultNode}>
					<Text size='sm' fw={500}>
						{fallbackLabel}
					</Text>
				</div>
			)}
			<Handle
				type='source'
				position={Position.Bottom}
				className={`${styles.handle} ${styles.handleSource}`}
			/>
			{showAddButton && isHovered && canShowMenu && (
				<div className={styles.addButtonContainer}>
					<Menu position='bottom' withinPortal>
						<Menu.Target>
							<ActionIcon
								size='md'
								variant='filled'
								color='dark'
								radius='md'
								className={styles.addButton}
							>
								<IconPlus size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown className={styles.menuDropdown}>
							{menuItems.map((item) => (
								<Menu.Item
									key={item.type}
									leftSection={<item.icon size={16} />}
									onClick={() => handleAddNodeWithType(item.type)}
								>
									{item.label}
								</Menu.Item>
							))}
						</Menu.Dropdown>
					</Menu>
				</div>
			)}
			{showAddButton && isHovered && canShowSingleAdd && (
				<div className={styles.addButtonContainer}>
					<ActionIcon
						size='md'
						variant='filled'
						color='dark'
						radius='md'
						onClick={handleAddClick}
						className={styles.addButton}
					>
						<IconPlus size={16} />
					</ActionIcon>
				</div>
			)}
		</div>
	);
};

export default WorkflowNodeWrapper;
