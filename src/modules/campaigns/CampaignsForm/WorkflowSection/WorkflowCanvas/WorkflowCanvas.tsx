import { useCallback, useMemo, useRef, useState } from 'react';
import {
	ReactFlowProvider,
	applyEdgeChanges,
	reconnectEdge,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import type { Connection, Edge, Node, ReactFlowInstance } from '@xyflow/react';
import type { EdgeChange } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import StartNodeComponent from '../nodes/StartNode';
import EndNodeComponent from '../nodes/EndNode';
import StandaloneAgentNodeComponent from '../nodes/StandaloneAgentNode';
import SubagentNodeComponent from '../nodes/SubagentNode';
import ToolNodeComponent from '../nodes/ToolNode';
import PhoneNumberNodeComponent from '../nodes/PhoneNumberNode/PhoneNumberNode';
import {
	WORKFLOW_NODE_TYPES,
	createNodeTypes,
	type WorkflowNodeType,
} from '../nodeTypes';
import ConditionEdge from '../edges/ConditionEdge';
import { updateWorkflowEdge } from '../forms/nodeFormUtils';
import type { AgentWorkflow, WorkflowEdge } from '~/models/AgentWorkflowModel';
import FlowView from './FlowView';
import EdgeConditionModalWrapper from './EdgeConditionModalWrapper';
import { WorkflowCanvasActionsProvider } from './WorkflowCanvasActionsContext';
import useWorkflowNodes from './useWorkflowNodes';
import useWorkflowSync from './useWorkflowSync';
import {
	buildDefaultWorkflow,
	buildWorkflowFromState,
	defaultEdgeOptions,
	mapWorkflowToNodes,
} from './WorkflowCanvas.helpers';
import { generateUUIDv4 } from '~/utils/uuidUtils';
import styles from './WorkflowCanvas.module.css';

interface WorkflowCanvasProps {
	workflow?: AgentWorkflow;
	onWorkflowChange?: (workflow: AgentWorkflow) => void;
	preventSubagentLoops?: boolean;
	allowDefaultInit?: boolean;
	onNodeSelect?: (nodeId: string | null) => void;
	layoutMode?: 'compact' | 'fullscreen';
}

interface AddNodeVariantPayload {
	type: WorkflowNodeType;
	variant?: 'transfer' | 'subagent';
}

interface ValidateConnectionOptions {
	ignoreEdgeId?: string;
	allowStartEdgeReplacement?: boolean;
}

const WorkflowCanvasInner = ({
	workflow,
	onWorkflowChange,
	preventSubagentLoops = false,
	allowDefaultInit = true,
	onNodeSelect,
	layoutMode = 'compact',
}: WorkflowCanvasProps) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
	const [edges, setEdges] = useEdgesState<Edge>([]);
	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	const [modalOpened, setModalOpened] = useState(false);
	const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
	const [selectedEdgeActionId, setSelectedEdgeActionId] = useState<
		string | null
	>(null);
	const nodesRef = useRef<Node[]>(nodes);
	const edgesRef = useRef<Edge[]>(edges);

	nodesRef.current = nodes;
	edgesRef.current = edges;

	const closeEdgeActions = useCallback(() => {
		setSelectedEdgeActionId(null);
	}, []);

	const removeEdgeFromSourceNode = useCallback(
		(currentNodes: Node[], edgeToRemove: Pick<Edge, 'id' | 'source'>): Node[] =>
			currentNodes.map((node) => {
				if (node.id !== edgeToRemove.source) {
					return node;
				}

				const data = node.data as { edgeOrder?: string[] };
				const edgeOrder = data.edgeOrder ?? [];
				const nextEdgeOrder = edgeOrder.filter((id) => id !== edgeToRemove.id);

				if (nextEdgeOrder.length === edgeOrder.length) {
					return node;
				}

				return {
					...node,
					data: {
						...data,
						edgeOrder: nextEdgeOrder,
					},
				};
			}),
		[]
	);

	const handleOpenEdgeModal = useCallback(
		(edgeId: string) => {
			closeEdgeActions();
			setSelectedEdgeId(edgeId);
			setModalOpened(true);
		},
		[closeEdgeActions]
	);

	const handleCloseModal = useCallback(() => {
		setModalOpened(false);
		setSelectedEdgeId(null);
	}, []);

	const validateConnection = useCallback(
		(
			connection: Edge | { source: string | null; target: string | null },
			options: ValidateConnectionOptions = {}
		) => {
			if (!connection.source || !connection.target) return false;

			const sourceNode = nodesRef.current.find(
				(node) => node.id === connection.source
			);
			const targetNode = nodesRef.current.find(
				(node) => node.id === connection.target
			);

			if (!sourceNode || !targetNode) return false;
			if (sourceNode.type !== WORKFLOW_NODE_TYPES.START) return true;

			const { ignoreEdgeId, allowStartEdgeReplacement = false } = options;

			const hasOutgoingEdge = edgesRef.current.some(
				(edge) =>
					edge.source === sourceNode.id &&
					(ignoreEdgeId === undefined || edge.id !== ignoreEdgeId)
			);

			if (hasOutgoingEdge && !allowStartEdgeReplacement) return false;

			return (
				targetNode.type === WORKFLOW_NODE_TYPES.STANDALONE_AGENT ||
				targetNode.type === WORKFLOW_NODE_TYPES.OVERRIDE_AGENT
			);
		},
		[]
	);

	const handleSaveEdgeCondition = useCallback(
		(
			edgeId: string,
			forwardCondition?: WorkflowEdge['forwardCondition'],
			backwardCondition?: WorkflowEdge['backwardCondition']
		) => {
			if (!workflow) return;

			const nextWorkflow = updateWorkflowEdge(workflow, edgeId, {
				forwardCondition,
				backwardCondition,
			});

			if (nextWorkflow) {
				onWorkflowChange?.(nextWorkflow);
			}
		},
		[onWorkflowChange, workflow]
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
		nodesRef,
		edgesRef,
		setNodes,
		setEdges,
		t,
	});

	const buildDefaultWorkflowCallback = useCallback(
		() => buildDefaultWorkflow(preventSubagentLoops),
		[preventSubagentLoops]
	);

	const mapWorkflowToNodesCallback = useCallback(
		(workflowData: AgentWorkflow) => mapWorkflowToNodes(workflowData, t),
		[t]
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
	});

	const isValidConnection = useCallback(
		(connection: Edge | { source: string | null; target: string | null }) =>
			validateConnection(connection, { allowStartEdgeReplacement: true }),
		[validateConnection]
	);

	const edgeReconnectSuccessful = useRef(true);

	const handleReconnectStart = useCallback(() => {
		edgeReconnectSuccessful.current = false;
	}, []);

	const handleReconnect = useCallback(
		(oldEdge: Edge, newConnection: Connection) => {
			if (!newConnection.source || !newConnection.target) return;
			if (
				!validateConnection(newConnection, {
					ignoreEdgeId: oldEdge.id,
					allowStartEdgeReplacement: true,
				})
			)
				return;

			edgeReconnectSuccessful.current = true;

			closeEdgeActions();
			setNodes((currentNodes) => {
				if (oldEdge.source === newConnection.source) {
					return currentNodes;
				}

				return currentNodes.map((node) => {
					if (node.id === oldEdge.source) {
						const [updatedNode] = removeEdgeFromSourceNode([node], oldEdge);
						return updatedNode ?? node;
					}

					if (node.id !== newConnection.source) {
						return node;
					}

					const data = node.data as { edgeOrder?: string[] };
					const edgeOrder = data.edgeOrder ?? [];

					if (edgeOrder.includes(oldEdge.id)) {
						return node;
					}

					return {
						...node,
						data: {
							...data,
							edgeOrder: [...edgeOrder, oldEdge.id],
						},
					};
				});
			});
			setEdges((currentEdges) =>
				reconnectEdge(oldEdge, newConnection, currentEdges, {
					shouldReplaceId: false,
				})
			);
		},
		[
			closeEdgeActions,
			removeEdgeFromSourceNode,
			setEdges,
			setNodes,
			validateConnection,
		]
	);

	const handleReconnectEnd = useCallback(
		(_: MouseEvent | TouchEvent, _edge: Edge) => {
			edgeReconnectSuccessful.current = true;
		},
		[]
	);

	const handleEdgesChange = useCallback(
		(changes: EdgeChange<Edge>[]) => {
			const removedEdgeIds = new Set(
				changes
					.filter((change) => change.type === 'remove')
					.map((change) => change.id)
			);

			if (removedEdgeIds.size > 0) {
				closeEdgeActions();
				setNodes((currentNodes) =>
					currentNodes.map((node) => {
						const data = node.data as { edgeOrder?: string[] };
						const edgeOrder = data.edgeOrder ?? [];
						const nextEdgeOrder = edgeOrder.filter(
							(edgeId) => !removedEdgeIds.has(edgeId)
						);

						if (nextEdgeOrder.length === edgeOrder.length) {
							return node;
						}

						return {
							...node,
							data: {
								...data,
								edgeOrder: nextEdgeOrder,
							},
						};
					})
				);
			}

			setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges));
		},
		[closeEdgeActions, setEdges, setNodes]
	);

	const handleDeleteEdge = useCallback(
		(edgeId: string) => {
			closeEdgeActions();
			setModalOpened(false);
			setSelectedEdgeId((currentEdgeId) =>
				currentEdgeId === edgeId ? null : currentEdgeId
			);

			const edgeToDelete = edgesRef.current.find((edge) => edge.id === edgeId);
			if (!edgeToDelete) return;

			setNodes((currentNodes) =>
				removeEdgeFromSourceNode(currentNodes, edgeToDelete)
			);
			setEdges((currentEdges) =>
				currentEdges.filter((edge) => edge.id !== edgeId)
			);
		},
		[closeEdgeActions, removeEdgeFromSourceNode, setEdges, setNodes]
	);

	const handleConnect = useCallback(
		(connection: Connection) => {
			if (!connection.source || !connection.target) return;
			if (
				!validateConnection(connection, {
					allowStartEdgeReplacement: true,
				})
			)
				return;

			closeEdgeActions();

			const sourceNode = nodesRef.current.find(
				(node) => node.id === connection.source
			);
			const isStartSource = sourceNode?.type === WORKFLOW_NODE_TYPES.START;
			const existingStartEdge = isStartSource
				? edgesRef.current.find((edge) => edge.source === connection.source)
				: undefined;
			const edgeId = existingStartEdge?.id ?? `edge-${generateUUIDv4()}`;
			const defaultEdgeData = isStartSource
				? {
						label: null,
						sourceNodeType: WORKFLOW_NODE_TYPES.START,
					}
				: {
						label: t('form.workflow.edge.notConfigured', {
							defaultValue: 'Not configured',
						}),
						sourceNodeType: sourceNode?.type,
					};
			const nextEdge: Edge = {
				...(existingStartEdge ?? {}),
				id: edgeId,
				source: connection.source,
				target: connection.target,
				sourceHandle: connection.sourceHandle,
				targetHandle: connection.targetHandle,
				type: 'condition',
				data: isStartSource
					? {
							...(existingStartEdge?.data ?? {}),
							...defaultEdgeData,
							...(!existingStartEdge?.data?.forwardCondition
								? { forwardCondition: { type: 'unconditional' as const } }
								: {}),
						}
					: (existingStartEdge?.data ?? defaultEdgeData),
			};

			setNodes((currentNodes) =>
				currentNodes.map((node) => {
					if (node.id !== connection.source) return node;

					const data = node.data as { edgeOrder?: string[] };
					const edgeOrder = data.edgeOrder ?? [];

					if (edgeOrder.includes(edgeId)) return node;

					return {
						...node,
						data: {
							...data,
							edgeOrder: [...edgeOrder, edgeId],
						},
					};
				})
			);
			setEdges((currentEdges) => {
				if (existingStartEdge) {
					const isSameConnection =
						existingStartEdge.target === nextEdge.target &&
						existingStartEdge.sourceHandle === nextEdge.sourceHandle &&
						existingStartEdge.targetHandle === nextEdge.targetHandle;

					if (isSameConnection) return currentEdges;
				}

				const edgeAlreadyExists = currentEdges.some(
					(edge) =>
						edge.id !== edgeId &&
						edge.source === nextEdge.source &&
						edge.target === nextEdge.target &&
						edge.sourceHandle === nextEdge.sourceHandle &&
						edge.targetHandle === nextEdge.targetHandle
				);

				if (edgeAlreadyExists) return currentEdges;
				if (existingStartEdge) {
					return currentEdges.map((edge) =>
						edge.id === edgeId ? { ...edge, ...nextEdge } : edge
					);
				}

				return [...currentEdges, nextEdge];
			});
		},
		[closeEdgeActions, setEdges, setNodes, t, validateConnection]
	);

	const actions = useMemo(
		() => ({
			addNode: (
				parentNodeId: string,
				parentPosition: { x: number; y: number }
			) => {
				closeEdgeActions();
				handleAddNode(parentNodeId, parentPosition);
			},
			addNodeWithType: (
				parentNodeId: string,
				parentPosition: { x: number; y: number },
				nodeType: WorkflowNodeType
			) => {
				closeEdgeActions();
				handleAddNodeWithType(parentNodeId, parentPosition, nodeType);
			},
			addNodeWithVariant: (
				parentNodeId: string,
				parentPosition: { x: number; y: number },
				payload: AddNodeVariantPayload
			) => {
				closeEdgeActions();
				handleAddNodeWithVariant(parentNodeId, parentPosition, payload);
			},
			deleteNode: (nodeId: string) => {
				closeEdgeActions();
				setModalOpened(false);
				setSelectedEdgeId(null);
				handleDeleteNode(nodeId);
			},
			copyNode: (nodeId: string) => {
				closeEdgeActions();
				handleCopyNode(nodeId);
			},
			openEdge: handleOpenEdgeModal,
			deleteEdge: handleDeleteEdge,
			toggleEdgeActions: (edgeId: string) =>
				setSelectedEdgeActionId((currentEdgeId) =>
					currentEdgeId === edgeId ? null : edgeId
				),
			clearEdgeActions: closeEdgeActions,
		}),
		[
			closeEdgeActions,
			handleAddNode,
			handleAddNodeWithType,
			handleAddNodeWithVariant,
			handleCopyNode,
			handleDeleteEdge,
			handleDeleteNode,
			handleOpenEdgeModal,
		]
	);

	return (
		<WorkflowCanvasActionsProvider
			actions={actions}
			selectedEdgeActionId={selectedEdgeActionId}
			onSelectedEdgeActionChange={setSelectedEdgeActionId}
		>
			<div
				className={`${styles.canvas} ${
					layoutMode === 'fullscreen'
						? styles.canvasFullscreen
						: styles.canvasCompact
				}`}
			>
				<FlowView
					nodes={nodes}
					edges={edges}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					onNodesChange={onNodesChange}
					onEdgesChange={handleEdgesChange}
					onConnect={handleConnect}
					onReconnect={handleReconnect}
					onReconnectStart={handleReconnectStart}
					onReconnectEnd={handleReconnectEnd}
					onNodeSelect={onNodeSelect}
					onCanvasClick={closeEdgeActions}
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
		</WorkflowCanvasActionsProvider>
	);
};

const WorkflowCanvas = (props: WorkflowCanvasProps) => (
	<ReactFlowProvider>
		<WorkflowCanvasInner {...props} />
	</ReactFlowProvider>
);

export default WorkflowCanvas;
