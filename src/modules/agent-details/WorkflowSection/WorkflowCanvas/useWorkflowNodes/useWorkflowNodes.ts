import {
	useCallback,
	type Dispatch,
	type MutableRefObject,
	type SetStateAction,
} from 'react';
import type { Edge, Node } from '@xyflow/react';
import type { TFunction } from 'i18next';
import { WORKFLOW_NODE_TYPES } from '../../nodeTypes';
import { WORKFLOW_NODE_DRAG_HANDLE_SELECTOR } from '../WorkflowCanvas.helpers';
import type { WorkflowNode } from '~/models/AgentWorkflowModel';
import { generateUUIDv4 } from '~/utils/uuidUtils';

interface UseWorkflowNodesOptions {
	nodesRef: MutableRefObject<Node[]>;
	edgesRef: MutableRefObject<Edge[]>;
	setNodes: Dispatch<SetStateAction<Node[]>>;
	setEdges: Dispatch<SetStateAction<Edge[]>>;
	t: TFunction;
}

interface AddNodeVariantPayload {
	type: string;
	variant?: 'transfer' | 'subagent';
	initialData?: Partial<WorkflowNode>;
}

const buildEdgeLabel = (_t: TFunction) => null;

const appendEdgeOrder = (node: Node, edgeId: string): Node => {
	const data = node.data as { edge_order?: string[] };
	const edgeOrder = data.edge_order ?? [];

	if (edgeOrder.includes(edgeId)) {
		return node;
	}

	return {
		...node,
		data: {
			...data,
			edge_order: [...edgeOrder, edgeId],
		},
	};
};

const removeNodeEdgesFromOrder = (
	node: Node,
	removedEdgeIds: Set<string>
): Node => {
	const data = node.data as { edge_order?: string[] };
	const edgeOrder = data.edge_order ?? [];
	const cleanedEdgeOrder = edgeOrder.filter(
		(edgeId) => !removedEdgeIds.has(edgeId)
	);

	if (cleanedEdgeOrder.length === edgeOrder.length) {
		return node;
	}

	return {
		...node,
		data: {
			...data,
			edge_order: cleanedEdgeOrder,
		},
	};
};

/**
 * Pure factory for building default node data by type.
 * Exported so that WorkflowCanvas handlers can create nodes inside groups
 * without duplicating the switch-case.
 */
export const createNodeDataByType = (
	nodeType: string,
	position: { x: number; y: number },
	initialData?: Partial<WorkflowNode>
) => {
	const withInitialData = <T extends Record<string, unknown>>(data: T) => ({
		...data,
		...initialData,
		type: data.type,
		position,
		edge_order: initialData?.edge_order ?? data.edge_order,
	});

	switch (nodeType) {
		case WORKFLOW_NODE_TYPES.END:
			return withInitialData({
				type: WORKFLOW_NODE_TYPES.END,
				position,
				edge_order: [],
				label: 'End',
			});
		case WORKFLOW_NODE_TYPES.TOOL:
			return withInitialData({
				type: WORKFLOW_NODE_TYPES.TOOL,
				position,
				edge_order: [],
				label: 'Tool',
				tools: [],
			});
		case WORKFLOW_NODE_TYPES.UPDATE_STATE:
			return withInitialData({
				type: WORKFLOW_NODE_TYPES.UPDATE_STATE,
				position,
				edge_order: [],
				label: '',
				updates: [],
			});
		case WORKFLOW_NODE_TYPES.OVERRIDE_AGENT:
			return withInitialData({
				type: WORKFLOW_NODE_TYPES.OVERRIDE_AGENT,
				position,
				edge_order: [],
				label: 'Agent',
				additional_prompt: '',
				additional_tool_ids: [],
				additional_knowledge_base: [],
				subagent: {
					tool_ids: [],
					knowledge_base_ids: [],
				},
				conversation_config: {},
			});
		case WORKFLOW_NODE_TYPES.PHONE_NUMBER:
			return withInitialData({
				type: WORKFLOW_NODE_TYPES.PHONE_NUMBER,
				position,
				edge_order: [],
				label: 'Phone number transfer',
				transfer_type: 'conference',
				transfer_destination: {
					type: 'phone',
					phone_number: '',
				},
			});
		case WORKFLOW_NODE_TYPES.STANDALONE_AGENT:
		default:
			return withInitialData({
				type: WORKFLOW_NODE_TYPES.STANDALONE_AGENT,
				position,
				edge_order: [],
				label: 'Subagent',
				agent_id: '',
				delay_ms: 0,
				transfer_message: null,
				enable_transferred_agent_first_message: false,
				additional_prompt: '',
				additional_tool_ids: [],
				additional_knowledge_base: [],
				conversation_config: {},
			});
	}
};

const useWorkflowNodes = ({
	nodesRef,
	edgesRef,
	setNodes,
	setEdges,
	t,
}: UseWorkflowNodesOptions) => {
	const cloneData = <T>(value: T): T => {
		try {
			if (typeof structuredClone === 'function') {
				return structuredClone(value);
			}
		} catch {
			// Fallback to JSON cloning for non-serializable values.
		}

		return JSON.parse(JSON.stringify(value)) as T;
	};

	const appendNodeAndEdge = useCallback(
		(
			parentNodeId: string,
			parentPosition: { x: number; y: number },
			nodeType: string,
			payload?: AddNodeVariantPayload
		): string => {
			const parentNode = nodesRef.current.find(
				(node) => node.id === parentNodeId
			);
			const timestamp = Date.now();
			const newNodeId = `node-${timestamp}`;
			const newEdgeId = `edge-${timestamp}`;
			const newNodePosition = {
				x: parentPosition.x,
				y: parentPosition.y + 120,
			};
			const baseData = createNodeDataByType(
				nodeType,
				newNodePosition,
				payload?.initialData
			);
			const labelOverride =
				payload?.variant === 'transfer'
					? t('form.workflow.nodes.agent_transfer', {
							defaultValue: 'Agent transfer',
						})
					: undefined;
			const data = payload?.variant
				? {
						...baseData,
						label: labelOverride ?? (baseData as { label?: string }).label,
						uiMeta: {
							variant: payload.variant,
							createdByUi: true,
						},
					}
				: baseData;

			const newNode: Node = {
				id: newNodeId,
				type: nodeType,
				position: newNodePosition,
				dragHandle: WORKFLOW_NODE_DRAG_HANDLE_SELECTOR,
				data,
			};

			const newEdge: Edge = {
				id: newEdgeId,
				source: parentNodeId,
				target: newNodeId,
				type: 'condition',
				data: {
					label:
						parentNode?.type === WORKFLOW_NODE_TYPES.START
							? null
							: buildEdgeLabel(t),
					sourceNodeType: parentNode?.type,
					forwardCondition: { type: 'unconditional' as const },
				},
			};

			setNodes((currentNodes) => [
				...currentNodes.map((node) =>
					node.id === parentNodeId ? appendEdgeOrder(node, newEdgeId) : node
				),
				newNode,
			]);
			setEdges((currentEdges) => [...currentEdges, newEdge]);
			return newNodeId;
		},
		[nodesRef, setEdges, setNodes, t]
	);

	const handleAddNode = useCallback(
		(parentNodeId: string, parentPosition: { x: number; y: number }) => {
			return appendNodeAndEdge(
				parentNodeId,
				parentPosition,
				WORKFLOW_NODE_TYPES.OVERRIDE_AGENT
			);
		},
		[appendNodeAndEdge]
	);

	const handleAddNodeWithType = useCallback(
		(
			parentNodeId: string,
			parentPosition: { x: number; y: number },
			nodeType: string
		) => {
			return appendNodeAndEdge(parentNodeId, parentPosition, nodeType);
		},
		[appendNodeAndEdge]
	);

	const handleAddNodeWithVariant = useCallback(
		(
			parentNodeId: string,
			parentPosition: { x: number; y: number },
			payload: AddNodeVariantPayload
		) => {
			return appendNodeAndEdge(
				parentNodeId,
				parentPosition,
				payload.type,
				payload
			);
		},
		[appendNodeAndEdge]
	);

	const handleDeleteNode = useCallback(
		(nodeId: string) => {
			const currentEdges = edgesRef.current;
			const removedEdgeIds = new Set(
				currentEdges
					.filter((edge) => edge.source === nodeId || edge.target === nodeId)
					.map((edge) => edge.id)
			);

			setEdges(
				currentEdges.filter(
					(edge) => edge.source !== nodeId && edge.target !== nodeId
				)
			);
			setNodes(
				nodesRef.current
					.filter((node) => node.id !== nodeId)
					.map((node) => removeNodeEdgesFromOrder(node, removedEdgeIds))
			);
		},
		[edgesRef, nodesRef, setEdges, setNodes]
	);

	const handleCopyNode = useCallback(
		(nodeId: string) => {
			const sourceNode = nodesRef.current.find((node) => node.id === nodeId);
			if (!sourceNode) return;

			const copyId = `node-${generateUUIDv4()}`;
			const copyPosition = {
				x: sourceNode.position.x + 40,
				y: sourceNode.position.y + 40,
			};
			const data = cloneData(sourceNode.data);

			const copiedNode: Node = {
				id: copyId,
				type: sourceNode.type,
				position: copyPosition,
				dragHandle: sourceNode.dragHandle ?? WORKFLOW_NODE_DRAG_HANDLE_SELECTOR,
				selected: false,
				data: {
					...(data as Record<string, unknown>),
					position: copyPosition,
					edge_order: [],
				},
			};

			setNodes([...nodesRef.current, copiedNode]);
		},
		[nodesRef, setNodes]
	);

	return {
		handleAddNode,
		handleAddNodeWithType,
		handleAddNodeWithVariant,
		handleDeleteNode,
		handleCopyNode,
	};
};

export default useWorkflowNodes;
