import { memo } from 'react';
import {
	Background,
	BackgroundVariant,
	Controls,
	ReactFlow,
} from '@xyflow/react';
import type {
	Connection,
	Edge,
	EdgeTypes,
	Node,
	NodeTypes,
	OnEdgesChange,
	OnNodesChange,
	ReactFlowInstance,
} from '@xyflow/react';

interface FlowViewProps {
	nodes: Node[];
	edges: Edge[];
	nodeTypes: NodeTypes;
	edgeTypes: EdgeTypes;
	onNodesChange: OnNodesChange<Node>;
	onEdgesChange: OnEdgesChange<Edge>;
	onNodeSelect?: (nodeId: string | null) => void;
	onInit: (instance: ReactFlowInstance) => void;
	isValidConnection: (connection: Connection | Edge) => boolean;
	defaultEdgeOptions: Record<string, unknown>;
	flowClassName?: string;
	controlsClassName?: string;
}

const FlowView = ({
	nodes,
	edges,
	nodeTypes,
	edgeTypes,
	onNodesChange,
	onEdgesChange,
	onNodeSelect,
	onInit,
	isValidConnection,
	defaultEdgeOptions,
	flowClassName,
	controlsClassName,
}: FlowViewProps) => (
	<ReactFlow
		nodes={nodes}
		edges={edges}
		nodeTypes={nodeTypes}
		edgeTypes={edgeTypes}
		onNodesChange={onNodesChange}
		onEdgesChange={onEdgesChange}
		onNodeClick={(_, node) => onNodeSelect?.(node.id)}
		onPaneClick={() => onNodeSelect?.(null)}
		onInit={onInit}
		isValidConnection={isValidConnection}
		defaultEdgeOptions={defaultEdgeOptions}
		fitView
		className={flowClassName}
	>
		<Background variant={BackgroundVariant.Dots} gap={16} size={1} />
		<Controls className={controlsClassName} />
	</ReactFlow>
);

export default memo(FlowView);
