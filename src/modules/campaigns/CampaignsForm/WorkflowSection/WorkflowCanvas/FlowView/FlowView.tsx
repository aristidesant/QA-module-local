import { memo, useRef } from 'react';
import {
	Background,
	BackgroundVariant,
	Controls,
	Panel,
	ReactFlow,
	SelectionMode,
} from '@xyflow/react';
import type {
	Connection,
	Edge,
	EdgeTypes,
	HandleType,
	Node,
	NodeTypes,
	OnConnect,
	OnEdgesChange,
	OnNodesChange,
	OnReconnect,
	ReactFlowInstance,
} from '@xyflow/react';
import WorkflowNodeSearch from '../../WorkflowNodeSearch';
import SelectionToolbar from '../SelectionToolbar';

const NON_SELECTABLE_NODE_TYPES = ['start', 'end'];

interface FlowViewProps {
	nodes: Node[];
	edges: Edge[];
	nodeTypes: NodeTypes;
	edgeTypes: EdgeTypes;
	onNodesChange: OnNodesChange<Node>;
	onEdgesChange: OnEdgesChange<Edge>;
	onConnect: OnConnect;
	onReconnect: OnReconnect;
	onReconnectStart: (
		event: React.MouseEvent,
		edge: Edge,
		handleType: HandleType
	) => void;
	onReconnectEnd: (
		evt: MouseEvent | TouchEvent,
		edge: Edge,
		handleType: 'source' | 'target'
	) => void;
	onNodeSelect?: (nodeId: string | null) => void;
	onCanvasClick?: () => void;
	onNodeDragStart?: () => void;
	onNodeDragStop?: () => void;
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
	onConnect,
	onReconnect,
	onReconnectStart,
	onReconnectEnd,
	onNodeSelect,
	onCanvasClick,
	onNodeDragStart,
	onNodeDragStop,
	onInit,
	isValidConnection,
	defaultEdgeOptions,
	flowClassName,
	controlsClassName,
}: FlowViewProps) => {
	const wasDraggedRef = useRef(false);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			nodeTypes={nodeTypes}
			edgeTypes={edgeTypes}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			onReconnect={onReconnect}
			onReconnectStart={onReconnectStart}
			onReconnectEnd={onReconnectEnd}
			reconnectRadius={50}
			onNodeDragStart={() => {
				wasDraggedRef.current = false;
				onNodeDragStart?.();
			}}
			onNodeDrag={() => {
				wasDraggedRef.current = true;
			}}
			onNodeDragStop={() => {
				onNodeDragStop?.();
			}}
			onNodeClick={(_, node) => {
				onCanvasClick?.();
				if (wasDraggedRef.current) {
					wasDraggedRef.current = false;
					return;
				}
				if (NON_SELECTABLE_NODE_TYPES.includes(node.type ?? '')) return;
				onNodeSelect?.(node.id);
			}}
			onPaneClick={() => {
				onCanvasClick?.();
				onNodeSelect?.(null);
			}}
			onInit={onInit}
			isValidConnection={isValidConnection}
			defaultEdgeOptions={defaultEdgeOptions}
			nodeClickDistance={4}
			nodeDragThreshold={2}
			minZoom={0.4}
			maxZoom={1.6}
			snapToGrid
			snapGrid={[16, 16]}
			panOnDrag={[0]}
			selectionOnDrag={false}
			selectionMode={SelectionMode.Partial}
			className={flowClassName}
		>
			<Background
				variant={BackgroundVariant.Dots}
				gap={16}
				size={1}
				color='var(--workflow-shell-grid-color, var(--mantine-color-gray-4))'
			/>
			<Controls className={controlsClassName} />
			<Panel position='top-center'>
				<SelectionToolbar />
			</Panel>
			<Panel position='top-right'>
				<WorkflowNodeSearch />
			</Panel>
		</ReactFlow>
	);
};

export default memo(FlowView);
