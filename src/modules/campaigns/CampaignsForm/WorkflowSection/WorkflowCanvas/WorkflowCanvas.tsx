import { useCallback, useMemo, useState } from 'react';
import { ReactFlowProvider, useEdgesState, useNodesState } from '@xyflow/react';
import type { Edge, Node, ReactFlowInstance } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import StartNodeComponent from '../nodes/StartNode';
import EndNodeComponent from '../nodes/EndNode';
import StandaloneAgentNodeComponent from '../nodes/StandaloneAgentNode';
import SubagentNodeComponent from '../nodes/SubagentNode';
import ToolNodeComponent from '../nodes/ToolNode';
import PhoneNumberNodeComponent from '../nodes/PhoneNumberNode/PhoneNumberNode';
import { WORKFLOW_NODE_TYPES, createNodeTypes } from '../nodeTypes';
import ConditionEdge from '../edges/ConditionEdge';
import { updateWorkflowEdge } from '../forms/nodeFormUtils';
import type { AgentWorkflow, WorkflowEdge } from '~/models/AgentWorkflowModel';
import FlowView from './FlowView';
import EdgeConditionModalWrapper from './EdgeConditionModalWrapper';
import useWorkflowNodes from './useWorkflowNodes';
import useWorkflowSync from './useWorkflowSync';
import {
	buildDefaultWorkflow,
	buildWorkflowFromState,
	defaultEdgeOptions,
	mapWorkflowToNodes,
} from './WorkflowCanvas.helpers';
import styles from './WorkflowCanvas.module.css';

interface WorkflowCanvasProps {
	workflow?: AgentWorkflow;
	onWorkflowChange?: (workflow: AgentWorkflow) => void;
	preventSubagentLoops?: boolean;
	allowDefaultInit?: boolean;
	onNodeSelect?: (nodeId: string | null) => void;
}

const WorkflowCanvasInner = ({
	workflow,
	onWorkflowChange,
	preventSubagentLoops = false,
	allowDefaultInit = true,
	onNodeSelect,
}: WorkflowCanvasProps) => {
	const { t } = useTranslation('campaigns');
	const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	const [modalOpened, setModalOpened] = useState(false);
	const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

	const handleOpenEdgeModal = useCallback((edgeId: string) => {
		setSelectedEdgeId(edgeId);
		setModalOpened(true);
	}, []);

	const handleCloseModal = useCallback(() => {
		setModalOpened(false);
		setSelectedEdgeId(null);
	}, []);

	const handleSaveEdgeCondition = useCallback(
		(
			edgeId: string,
			forwardCondition?: WorkflowEdge['forwardCondition'],
			backwardCondition?: WorkflowEdge['backwardCondition']
		) => {
			if (!workflow) return;

			const updates = {
				forwardCondition,
				backwardCondition,
			};

			const nextWorkflow = updateWorkflowEdge(workflow, edgeId, updates);
			if (nextWorkflow) {
				onWorkflowChange?.(nextWorkflow);
			}
		},
		[workflow, onWorkflowChange]
	);

	const edgeTypes = useMemo(
		() => ({
			condition: ConditionEdge,
		}),
		[]
	);

	const nodeTypes = useMemo(
		() =>
			createNodeTypes({
				[WORKFLOW_NODE_TYPES.START]: StartNodeComponent,
				[WORKFLOW_NODE_TYPES.END]: EndNodeComponent,
				[WORKFLOW_NODE_TYPES.STANDALONE_AGENT]: StandaloneAgentNodeComponent,
				[WORKFLOW_NODE_TYPES.TOOL]: ToolNodeComponent,
				[WORKFLOW_NODE_TYPES.OVERRIDE_AGENT]: SubagentNodeComponent,
				[WORKFLOW_NODE_TYPES.PHONE_NUMBER]: PhoneNumberNodeComponent,
			}),
		[]
	);

	const {
		handleAddNode,
		handleAddNodeWithType,
		handleAddNodeWithVariant,
		handleDeleteNode,
		handleCopyNode,
	} = useWorkflowNodes({
		setNodes,
		setEdges,
		t,
		onOpenEdgeModal: handleOpenEdgeModal,
	});

	const buildDefaultWorkflowCallback = useCallback(
		() => buildDefaultWorkflow(preventSubagentLoops),
		[preventSubagentLoops]
	);

	const mapWorkflowToNodesCallback = useCallback(
		(workflowData: AgentWorkflow) =>
			mapWorkflowToNodes(workflowData, t, handleOpenEdgeModal),
		[t, handleOpenEdgeModal]
	);

	const buildWorkflowFromStateCallback = useCallback(
		(currentNodes: Node[], currentEdges: Edge[]) =>
			buildWorkflowFromState(currentNodes, currentEdges, preventSubagentLoops),
		[preventSubagentLoops]
	);

	useWorkflowSync({
		workflow,
		allowDefaultInit,
		onWorkflowChange,
		reactFlowInstance,
		nodes,
		edges,
		setNodes,
		setEdges,
		buildDefaultWorkflow: buildDefaultWorkflowCallback,
		mapWorkflowToNodes: mapWorkflowToNodesCallback,
		buildWorkflowFromState: buildWorkflowFromStateCallback,
		handleAddNode,
		handleAddNodeWithType,
		handleAddNodeWithVariant,
		handleDeleteNode,
		handleCopyNode,
	});

	const isValidConnection = useCallback(
		(connection: Edge | { source: string | null; target: string | null }) => {
			if (!connection.source || !connection.target) return false;
			const sourceNode = nodes.find((node) => node.id === connection.source);
			const targetNode = nodes.find((node) => node.id === connection.target);
			if (!sourceNode || !targetNode) return false;
			if (sourceNode.type !== WORKFLOW_NODE_TYPES.START) return true;
			return targetNode.type === WORKFLOW_NODE_TYPES.STANDALONE_AGENT;
		},
		[nodes]
	);

	return (
		<>
			<div className={styles.canvas}>
				<FlowView
					nodes={nodes}
					edges={edges}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onNodeSelect={onNodeSelect}
					onInit={setReactFlowInstance}
					isValidConnection={isValidConnection}
					defaultEdgeOptions={defaultEdgeOptions}
					flowClassName={styles.flow}
					controlsClassName={styles.controls}
				/>
			</div>

			<EdgeConditionModalWrapper
				workflow={workflow}
				selectedEdgeId={selectedEdgeId}
				modalOpened={modalOpened}
				onClose={handleCloseModal}
				onSave={handleSaveEdgeCondition}
			/>
		</>
	);
};

const WorkflowCanvas = (props: WorkflowCanvasProps) => (
	<ReactFlowProvider>
		<WorkflowCanvasInner {...props} />
	</ReactFlowProvider>
);

export default WorkflowCanvas;
