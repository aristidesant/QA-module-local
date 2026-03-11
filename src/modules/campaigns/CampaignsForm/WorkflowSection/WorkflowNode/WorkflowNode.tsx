import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { WorkflowNodeData } from './WorkflowNodeTypes';
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
	const { t } = useTranslation('campaigns');

	const nodeData = data as unknown as WorkflowNodeData;
	const fallbackLabel =
		nodeData.label ??
		t(`form.workflow.nodes.${nodeData.type}`, {
			defaultValue: nodeData.type as string,
		});

	const edgeOrder = (nodeData.edgeOrder as string[] | undefined) ?? [];
	const isStartWithNoEdges =
		nodeData.type === 'start' && edgeOrder.length === 0;
	const isSourceConnectable = true;

	return (
		<div className={styles.nodeContainer}>
			{(selected || isStartWithNoEdges) && sideActions && (
				<div className={`${styles.sideActions} nodrag nopan`}>
					{sideActions}
				</div>
			)}
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
