import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useStore } from '@xyflow/react';
import type { Edge, Node, ReactFlowInstance } from '@xyflow/react';
import { calculateHandlePositionsFromPoints } from '../../utils/handlePositionCalculator';
import type { Point } from '../../utils/handlePositionCalculator';
import { WORKFLOW_NODE_TYPES } from '../../nodeTypes';
import {
	HANDLE_ID_MAP,
	NodeInternalsMap,
	serializeWorkflow,
} from '../WorkflowCanvas.helpers';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';

interface UseWorkflowSyncOptions {
	workflow?: AgentWorkflow;
	allowDefaultInit: boolean;
	onWorkflowChange?: (workflow: AgentWorkflow) => void;
	reactFlowInstance: ReactFlowInstance | null;
	nodes: Node[];
	edges: Edge[];
	setNodes: Dispatch<SetStateAction<Node[]>>;
	setEdges: Dispatch<SetStateAction<Edge[]>>;
	buildDefaultWorkflow: () => AgentWorkflow;
	mapWorkflowToNodes: (workflow: AgentWorkflow) => {
		nodes: Node[];
		edges: Edge[];
	};
	buildWorkflowFromState: (nodes: Node[], edges: Edge[]) => AgentWorkflow;
	handleAddNode: (
		parentNodeId: string,
		parentPosition: { x: number; y: number }
	) => void;
	handleAddNodeWithType: (
		parentNodeId: string,
		parentPosition: { x: number; y: number },
		nodeType: string
	) => void;
	handleAddNodeWithVariant: (
		parentNodeId: string,
		parentPosition: { x: number; y: number },
		payload: { type: string; variant?: 'transfer' | 'subagent' }
	) => void;
	handleDeleteNode: (nodeId: string) => void;
	handleCopyNode: (nodeId: string) => void;
}

const useWorkflowSync = ({
	workflow,
	allowDefaultInit,
	onWorkflowChange,
	reactFlowInstance,
	nodes,
	edges,
	setNodes,
	setEdges,
	buildDefaultWorkflow,
	mapWorkflowToNodes,
	buildWorkflowFromState,
	handleAddNode,
	handleAddNodeWithType,
	handleAddNodeWithVariant,
	handleDeleteNode,
	handleCopyNode,
}: UseWorkflowSyncOptions) => {
	const isApplyingWorkflowRef = useRef(false);
	const lastAppliedWorkflowRef = useRef<string | null>(null);
	const lastEmittedWorkflowRef = useRef<string | null>(null);
	const lastWorkflowNodeCountRef = useRef<number>(0);
	const hasAppliedInitialWorkflowRef = useRef(false);
	const edgesRef = useRef<Edge[]>(edges);
	const nodeInternals = useStore((state) => {
		const internals = (state as unknown as { nodeInternals?: NodeInternalsMap })
			.nodeInternals;
		return internals ?? new Map();
	});

	const edgeSignature = useMemo(() => {
		if (edges.length === 0) return '';
		return edges
			.map(({ id, source, target }) => `${id}:${source}:${target}`)
			.sort()
			.join('|');
	}, [edges]);

	useEffect(() => {
		edgesRef.current = edges;
	}, [edges]);

	const getNodeCenter = useCallback(
		(nodeId: string, node: Node | undefined): Point | null => {
			if (!node) return null;
			const internal = nodeInternals.get(nodeId);
			if (
				internal?.positionAbsolute &&
				typeof internal.width === 'number' &&
				typeof internal.height === 'number'
			) {
				return {
					x: internal.positionAbsolute.x + internal.width / 2,
					y: internal.positionAbsolute.y + internal.height / 2,
				};
			}
			return {
				x: node.position.x,
				y: node.position.y,
			};
		},
		[nodeInternals]
	);

	const updateEdgeHandles = useCallback(
		(currentEdges: Edge[], currentNodes: Node[]) => {
			const nodeMap = new Map(currentNodes.map((node) => [node.id, node]));
			let hasChanges = false;
			const nextEdges = currentEdges.map((edge) => {
				const sourceNode = nodeMap.get(edge.source);
				const targetNode = nodeMap.get(edge.target);
				if (!sourceNode || !targetNode) return edge;

				const sourceCenter = getNodeCenter(edge.source, sourceNode);
				const targetCenter = getNodeCenter(edge.target, targetNode);
				if (!sourceCenter || !targetCenter) return edge;

				const { sourcePosition, targetPosition } =
					calculateHandlePositionsFromPoints(sourceCenter, targetCenter);
				const sourceHandle = HANDLE_ID_MAP.source[sourcePosition];
				const targetHandle = HANDLE_ID_MAP.target[targetPosition];

				if (
					edge.sourceHandle === sourceHandle &&
					edge.targetHandle === targetHandle
				) {
					return edge;
				}

				hasChanges = true;
				return {
					...edge,
					sourceHandle,
					targetHandle,
				};
			});

			return hasChanges ? nextEdges : currentEdges;
		},
		[getNodeCenter]
	);

	useEffect(() => {
		if (workflow && workflow.nodes) {
			const currentNodeCount = Object.keys(workflow.nodes).length;
			const previousNodeCount = lastWorkflowNodeCountRef.current;

			if (
				previousNodeCount > 0 &&
				Math.abs(currentNodeCount - previousNodeCount) > 1
			) {
				lastAppliedWorkflowRef.current = null;
				lastEmittedWorkflowRef.current = null;
			}

			lastWorkflowNodeCountRef.current = currentNodeCount;
		}
	}, [workflow]);

	useEffect(() => {
		const hasWorkflow = !!workflow;
		const hasNodes = workflow && Object.keys(workflow.nodes || {}).length > 0;
		if (!hasWorkflow && !allowDefaultInit) {
			return;
		}
		const shouldInitDefault = !hasNodes;
		const nextWorkflow = shouldInitDefault ? buildDefaultWorkflow() : workflow;
		const nextSignature = serializeWorkflow(nextWorkflow);
		if (lastAppliedWorkflowRef.current === nextSignature) {
			return;
		}
		hasAppliedInitialWorkflowRef.current = false;
		lastAppliedWorkflowRef.current = nextSignature;
		const { nodes: mappedNodes, edges: mappedEdges } =
			mapWorkflowToNodes(nextWorkflow);
		isApplyingWorkflowRef.current = true;
		setNodes(mappedNodes);
		setEdges(mappedEdges);
		hasAppliedInitialWorkflowRef.current = true;
		if (reactFlowInstance) {
			setTimeout(() => {
				try {
					reactFlowInstance.fitView({
						padding: 0.2,
						includeHiddenNodes: true,
					});
				} catch {
					// noop
				}
			}, 0);
		}
		if (shouldInitDefault && onWorkflowChange) {
			if (lastEmittedWorkflowRef.current !== nextSignature) {
				lastEmittedWorkflowRef.current = nextSignature;
				onWorkflowChange(nextWorkflow);
			}
		}
	}, [
		allowDefaultInit,
		buildDefaultWorkflow,
		mapWorkflowToNodes,
		onWorkflowChange,
		reactFlowInstance,
		setEdges,
		setNodes,
		workflow,
	]);

	useEffect(() => {
		if (isApplyingWorkflowRef.current) {
			isApplyingWorkflowRef.current = false;
			return;
		}
		if (!hasAppliedInitialWorkflowRef.current) {
			return;
		}
		const workflowNodeCount = workflow?.nodes
			? Object.keys(workflow.nodes).length
			: 0;
		if (workflowNodeCount > 0 && nodes.length === 0 && edges.length === 0) {
			return;
		}
		if (!onWorkflowChange) return;
		const nextWorkflow = buildWorkflowFromState(nodes, edges);
		const nextSignature = serializeWorkflow(nextWorkflow);
		if (lastEmittedWorkflowRef.current === nextSignature) return;
		lastEmittedWorkflowRef.current = nextSignature;
		lastAppliedWorkflowRef.current = nextSignature;
		onWorkflowChange(nextWorkflow);
	}, [buildWorkflowFromState, edges, nodes, onWorkflowChange, workflow]);

	useEffect(() => {
		setNodes((prev) => {
			const startNodeIds = new Set(
				prev
					.filter((node) => node.type === WORKFLOW_NODE_TYPES.START)
					.map((node) => node.id)
			);
			const startNodesWithEdges = new Set(
				edgesRef.current
					.filter((edge) => startNodeIds.has(edge.source))
					.map((edge) => edge.source)
			);

			let hasChanges = false;
			const nextNodes = prev.map((node) => {
				const isStartNode = node.type === WORKFLOW_NODE_TYPES.START;
				const hasStartEdge = isStartNode && startNodesWithEdges.has(node.id);
				const allowMultipleEdges = !isStartNode;
				const onAddNodeValue =
					isStartNode && !hasStartEdge ? handleAddNode : undefined;
				const onAddNodeWithTypeValue = isStartNode
					? hasStartEdge
						? undefined
						: handleAddNodeWithType
					: handleAddNodeWithType;
				const data = node.data as Record<string, unknown>;
				const position = node.position;
				const dataPosition = data.position as { x?: number; y?: number } | null;
				const needsUpdate =
					data.allowMultipleEdges !== allowMultipleEdges ||
					data.showActions !== !isStartNode ||
					data.onAddNode !== onAddNodeValue ||
					data.onAddNodeWithType !== onAddNodeWithTypeValue ||
					data.onAddNodeWithVariant !== handleAddNodeWithVariant ||
					data.onDeleteNode !== handleDeleteNode ||
					data.onCopyNode !== handleCopyNode ||
					data.type !== node.type ||
					!dataPosition ||
					dataPosition.x !== position.x ||
					dataPosition.y !== position.y;

				if (!needsUpdate) return node;
				hasChanges = true;
				return {
					...node,
					data: {
						...data,
						type: node.type,
						position: node.position,
						allowMultipleEdges,
						showActions: !isStartNode,
						onAddNode: onAddNodeValue,
						onAddNodeWithType: onAddNodeWithTypeValue,
						onAddNodeWithVariant: handleAddNodeWithVariant,
						onDeleteNode: handleDeleteNode,
						onCopyNode: handleCopyNode,
					},
				};
			});

			return hasChanges ? nextNodes : prev;
		});
	}, [
		edgeSignature,
		handleAddNode,
		handleAddNodeWithType,
		handleAddNodeWithVariant,
		handleCopyNode,
		handleDeleteNode,
		nodes,
		setNodes,
	]);

	useEffect(() => {
		if (nodes.length === 0) return;
		const currentEdges = edgesRef.current;
		const nextEdges = updateEdgeHandles(currentEdges, nodes);
		if (nextEdges !== currentEdges) {
			setEdges(nextEdges);
		}
	}, [nodes, setEdges, updateEdgeHandles]);
};

export default useWorkflowSync;
