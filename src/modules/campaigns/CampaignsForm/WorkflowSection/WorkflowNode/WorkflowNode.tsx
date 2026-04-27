import React, { useRef } from 'react';
import { Handle, Position, type NodeProps, useStore } from '@xyflow/react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { WorkflowNodeData } from './WorkflowNodeTypes';
import SideActionsPortal from './SideActionsPortal';
import styles from './WorkflowNode.module.css';

interface WorkflowNodeWrapperProps extends NodeProps {
	children?: React.ReactNode;
	sideActions?: React.ReactNode;
}

export const WorkflowNodeWrapper: React.FC<WorkflowNodeWrapperProps> = ({
	children,
	data,
	selected,
	sideActions,
}) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);

	const nodeData = data as unknown as WorkflowNodeData;
	const fallbackLabel =
		nodeData.label ??
		t(`form.workflow.nodes.${nodeData.type}`, {
			defaultValue: nodeData.type as string,
		});

	const containerRef = useRef<HTMLDivElement>(null);

	// Count how many nodes are currently selected. When > 1 (multi-select),
	// suppress individual side-action menus to avoid clutter and blocking the
	// group button in the toolbar.
	const selectedCount = useStore(
		(s) => s.nodes.filter((n) => n.selected).length
	);

	const edgeOrder = (nodeData.edgeOrder as string[] | undefined) ?? [];
	const isStartWithNoEdges =
		nodeData.type === 'start' && edgeOrder.length === 0;
	const isSourceConnectable = true;
	const showSideActions =
		((selected && selectedCount === 1) || isStartWithNoEdges) && !!sideActions;

	return (
		<div ref={containerRef} className={styles.nodeContainer}>
			<SideActionsPortal anchorRef={containerRef} visible={showSideActions}>
				{sideActions}
			</SideActionsPortal>
			<Handle
				type='target'
				position={Position.Top}
				id='target-top'
				className={`${styles.handle} ${styles.handleTarget}`}
			/>
			<Handle
				type='target'
				position={Position.Right}
				id='target-right'
				className={`${styles.handle} ${styles.handleTarget} ${styles.handleHidden}`}
			/>
			<Handle
				type='target'
				position={Position.Bottom}
				id='target-bottom'
				className={`${styles.handle} ${styles.handleTarget}`}
			/>
			<Handle
				type='target'
				position={Position.Left}
				id='target-left'
				className={`${styles.handle} ${styles.handleTarget} ${styles.handleHidden}`}
			/>
			{children ?? (
				<div className={`${styles.nodeSurface} ${styles.defaultNode} nopan`}>
					<Text size='sm' fw={500}>
						{fallbackLabel}
					</Text>
				</div>
			)}
			<Handle
				type='source'
				position={Position.Top}
				id='source-top'
				isConnectable={isSourceConnectable}
				className={`${styles.handle} ${styles.handleSource} ${styles.handleHidden}`}
			/>
			<Handle
				type='source'
				position={Position.Right}
				id='source-right'
				isConnectable={isSourceConnectable}
				className={`${styles.handle} ${styles.handleSource} ${styles.handleHidden}`}
			/>
			<Handle
				type='source'
				position={Position.Bottom}
				id='source-bottom'
				isConnectable={isSourceConnectable}
				className={`${styles.handle} ${styles.handleSource}`}
			/>
			<Handle
				type='source'
				position={Position.Left}
				id='source-left'
				isConnectable={isSourceConnectable}
				className={`${styles.handle} ${styles.handleSource} ${styles.handleHidden}`}
			/>
		</div>
	);
};

export default WorkflowNodeWrapper;
