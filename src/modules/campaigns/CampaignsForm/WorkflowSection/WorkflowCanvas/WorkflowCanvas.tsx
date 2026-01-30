import { useMemo } from 'react';
import {
	Background,
	BackgroundVariant,
	ConnectionLineType,
	Controls,
	ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import WorkflowNodeCard from '../WorkflowNodeCard';
import WorkflowEdge from '../WorkflowEdge';
import { useWorkflowState } from '../WorkflowStateContext';
import styles from './WorkflowCanvas.module.css';

const WorkflowCanvas = () => {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		isValidConnection,
		onNodeClick,
		onEdgeClick,
	} = useWorkflowState();
	const nodeTypes = useMemo(
		() => ({
			workflowNode: WorkflowNodeCard,
		}),
		[]
	);

	const edgeTypes = useMemo(
		() => ({
			workflowEdge: WorkflowEdge,
		}),
		[]
	);

	return (
		<div className={styles.flowWrapper}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				isValidConnection={isValidConnection}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				className={styles.flowCanvas}
				onNodeClick={onNodeClick}
				onEdgeClick={onEdgeClick}
				connectionLineType={ConnectionLineType.Bezier}
				fitView
				fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
			>
				<Background gap={16} size={1} variant={BackgroundVariant.Dots} />
				<Controls />
			</ReactFlow>
		</div>
	);
};

export default WorkflowCanvas;
