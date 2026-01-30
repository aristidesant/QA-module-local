import { useState } from 'react';
import { ActionIcon, Menu, Text } from '@mantine/core';
import {
	IconArrowsExchange,
	IconCopy,
	IconFlag,
	IconPhoneCall,
	IconPlayerStop,
	IconPlus,
	IconTool,
	IconTrash,
	IconUser,
} from '@tabler/icons-react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { WorkflowNode } from '~/models/AgentWorkflowModel';
import { useWorkflowState } from '../WorkflowStateContext';
import type { WorkflowNodeData } from '../WorkflowSection.types';
import styles from './WorkflowNodeCard.module.css';

type WorkflowNodeCardProps = Pick<
	NodeProps<Node<WorkflowNodeData>>,
	'id' | 'data' | 'selected'
>;

const workflowIcons: Partial<Record<WorkflowNode['type'], typeof IconUser>> = {
	start: IconFlag,
	standalone_agent: IconArrowsExchange,
	override_agent: IconUser,
	phone_number: IconPhoneCall,
	tool: IconTool,
	end: IconPlayerStop,
};

const WorkflowNodeCard = ({ id, data, selected }: WorkflowNodeCardProps) => {
	const { onAddFromStart, onAddBranch, onDeleteNode, onDuplicateNode } =
		useWorkflowState();
	const Icon = data.workflowType ? workflowIcons[data.workflowType] : undefined;
	const [hovered, setHovered] = useState(false);
	const [menuOpened, setMenuOpened] = useState(false);

	const nodeCardClassName = [
		styles.nodeCard,
		selected && styles.nodeCardSelected,
		data.workflowType === 'start' && styles.nodeCardStart,
		data.workflowType === 'standalone_agent' && styles.nodeCardStandalone,
		data.workflowType === 'end' && styles.nodeCardEnd,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div
			className={nodeCardClassName}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			data-testid={`node-card-${id}`}
		>
			{data.canConnectIn && (
				<Handle
					type='target'
					position={Position.Left}
					className={styles.handle}
				/>
			)}
			{data.canConnectOut && (
				<Handle
					type='source'
					position={Position.Right}
					className={styles.handle}
				/>
			)}
			<div className={styles.nodeHeader}>
				{Icon && (
					<span className={styles.nodeIcon}>
						<Icon size={18} />
					</span>
				)}
				<Text size='sm' fw={600} className={styles.nodeLabel}>
					{data.label}
				</Text>
			</div>
			{data.toolLabels && data.toolLabels.length > 0 && (
				<div className={styles.nodeToolList}>
					{data.toolLabels.map((label, index) => (
						<div key={`${label}-${index}`} className={styles.nodeToolItem}>
							{label}
						</div>
					))}
				</div>
			)}
			{selected && data.workflowType !== 'start' && (
				<div className={`${styles.nodeActionsWrapper} nodrag`}>
					<ActionIcon
						size='sm'
						variant='subtle'
						className={styles.nodeActionButton}
						aria-label='Duplicate node'
						onClick={(event) => {
							event.stopPropagation();
							onDuplicateNode(id);
						}}
					>
						<IconCopy size={14} />
					</ActionIcon>
					<ActionIcon
						size='sm'
						variant='subtle'
						className={styles.nodeActionButton}
						aria-label='Delete node'
						onClick={(event) => {
							event.stopPropagation();
							onDeleteNode(id);
						}}
					>
						<IconTrash size={14} />
					</ActionIcon>
				</div>
			)}
			{data.workflowType === 'start' && hovered && (
				<div className={`${styles.nodeAddWrapper} nodrag`}>
					<ActionIcon
						size='sm'
						variant='filled'
						className={styles.nodeAddButton}
						aria-label='Add subagent'
						onClick={(event) => {
							event.stopPropagation();
							onAddFromStart(id);
						}}
					>
						<IconPlus size={14} />
					</ActionIcon>
				</div>
			)}
			{data.workflowType !== 'start' &&
				data.canConnectOut &&
				(hovered || menuOpened) && (
					<div className={`${styles.nodeAddWrapper} nodrag`}>
						<Menu
							position='bottom'
							classNames={{
								dropdown: styles.menuDropdown,
								item: styles.menuItem,
							}}
							onOpen={() => setMenuOpened(true)}
							onClose={() => setMenuOpened(false)}
						>
							<Menu.Target>
								<ActionIcon
									size='sm'
									variant='filled'
									className={styles.nodeAddButton}
									aria-label='Add workflow step'
									onClick={(event) => event.stopPropagation()}
								>
									<IconPlus size={14} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									leftSection={<IconArrowsExchange size={16} />}
									onClick={(event) => {
										event.stopPropagation();
										onAddBranch(id, 'standalone_agent');
									}}
								>
									Agent transfer
								</Menu.Item>
								<Menu.Item
									leftSection={<IconUser size={16} />}
									onClick={(event) => {
										event.stopPropagation();
										onAddBranch(id, 'override_agent');
									}}
								>
									Subagent
								</Menu.Item>
								<Menu.Item
									leftSection={<IconPhoneCall size={16} />}
									onClick={(event) => {
										event.stopPropagation();
										onAddBranch(id, 'phone_number');
									}}
								>
									Phone number transfer
								</Menu.Item>
								<Menu.Item
									leftSection={<IconTool size={16} />}
									onClick={(event) => {
										event.stopPropagation();
										onAddBranch(id, 'tool');
									}}
								>
									Tool
								</Menu.Item>
								<Menu.Item
									leftSection={<IconPlayerStop size={16} />}
									onClick={(event) => {
										event.stopPropagation();
										onAddBranch(id, 'end');
									}}
								>
									End
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</div>
				)}
		</div>
	);
};

export default WorkflowNodeCard;
