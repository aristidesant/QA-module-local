import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Edge, Node } from '@xyflow/react';
import type { TFunction } from 'i18next';
import { WORKFLOW_NODE_TYPES } from '../../nodeTypes';
import { generateUUIDv4 } from '~/utils/uuidUtils';

interface UseWorkflowNodesOptions {
	setNodes: Dispatch<SetStateAction<Node[]>>;
	setEdges: Dispatch<SetStateAction<Edge[]>>;
	t: TFunction;
	onOpenEdgeModal: (edgeId: string) => void;
}

interface AddNodeVariantPayload {
	type: string;
	variant?: 'transfer' | 'subagent';
}

const useWorkflowNodes = ({
	setNodes,
	setEdges,
	t,
	onOpenEdgeModal,
}: UseWorkflowNodesOptions) => {
	const cloneData = <T>(value: T): T => {
		if (typeof structuredClone === 'function') {
			return structuredClone(value);
		}

		return JSON.parse(JSON.stringify(value)) as T;
	};

	const handleAddNode = useCallback(
		(parentNodeId: string, parentPosition: { x: number; y: number }) => {
			const timestamp = Date.now();
			const newNodeId = `node-${timestamp}`;
			const newEdgeId = `edge-${timestamp}`;
			const newNodePosition = {
				x: parentPosition.x,
				y: parentPosition.y + 120,
			};
			const newNode: Node = {
				id: newNodeId,
				type: WORKFLOW_NODE_TYPES.STANDALONE_AGENT,
				position: newNodePosition,
				data: {
					type: WORKFLOW_NODE_TYPES.STANDALONE_AGENT,
					position: newNodePosition,
					edgeOrder: [],
					label: 'Subagent',
					agentId: '',
					delayMs: 0,
					enableTransferredAgentFirstMessage: false,
				},
			};

			const newEdge: Edge = {
				id: newEdgeId,
				source: parentNodeId,
				target: newNodeId,
				type: 'condition',
				data: {
					label: t('form.workflow.edge.notConfigured', {
						defaultValue: 'Not configured',
					}),
					onEdgeClick: onOpenEdgeModal,
				},
			};

			setNodes((prev) =>
				prev.map((node) => {
					if (node.id !== parentNodeId) return node;
					const data = node.data as { edgeOrder?: string[] };
					const edgeOrder = data.edgeOrder ?? [];
					return {
						...node,
						data: {
							...data,
							edgeOrder: [...edgeOrder, newEdgeId],
						},
					};
				})
			);
			setNodes((prev) => [...prev, newNode]);
			setEdges((prev) => [...prev, newEdge]);
		},
		[onOpenEdgeModal, setNodes, setEdges, t]
	);

	const createNodeDataByType = useCallback(
		(nodeType: string, position: { x: number; y: number }) => {
			switch (nodeType) {
				case WORKFLOW_NODE_TYPES.END:
					return {
						type: WORKFLOW_NODE_TYPES.END,
						position,
						edgeOrder: [],
						label: 'End',
					};
				case WORKFLOW_NODE_TYPES.TOOL:
					return {
						type: WORKFLOW_NODE_TYPES.TOOL,
						position,
						edgeOrder: [],
						label: 'Tool',
						tools: [],
					};
				case WORKFLOW_NODE_TYPES.OVERRIDE_AGENT:
					return {
						type: WORKFLOW_NODE_TYPES.OVERRIDE_AGENT,
						position,
						edgeOrder: [],
						label: 'Agent transfer',
						additionalPrompt: '',
						additionalToolIds: [],
						additionalKnowledgeBase: [],
						conversationConfig: {},
					};
				case WORKFLOW_NODE_TYPES.PHONE_NUMBER:
					return {
						type: WORKFLOW_NODE_TYPES.PHONE_NUMBER,
						position,
						edgeOrder: [],
						label: 'Phone number transfer',
						transferType: 'conference',
						transferDestination: {
							type: 'phone',
							phoneNumber: '',
						},
					};
				case WORKFLOW_NODE_TYPES.STANDALONE_AGENT:
				default:
					return {
						type: WORKFLOW_NODE_TYPES.STANDALONE_AGENT,
						position,
						edgeOrder: [],
						label: 'Subagent',
						agentId: '',
						delayMs: 0,
						enableTransferredAgentFirstMessage: false,
					};
			}
		},
		[]
	);

	const handleAddNodeWithType = useCallback(
		(
			parentNodeId: string,
			parentPosition: { x: number; y: number },
			nodeType: string
		) => {
			const timestamp = Date.now();
			const newNodeId = `node-${timestamp}`;
			const newEdgeId = `edge-${timestamp}`;
			const newNodePosition = {
				x: parentPosition.x,
				y: parentPosition.y + 120,
			};

			const newNode: Node = {
				id: newNodeId,
				type: nodeType,
				position: newNodePosition,
				data: createNodeDataByType(nodeType, newNodePosition),
			};

			const newEdge: Edge = {
				id: newEdgeId,
				source: parentNodeId,
				target: newNodeId,
				type: 'condition',
				data: {
					label: t('form.workflow.edge.notConfigured', {
						defaultValue: 'Not configured',
					}),
					onEdgeClick: onOpenEdgeModal,
				},
			};

			setNodes((prev) =>
				prev.map((node) => {
					if (node.id !== parentNodeId) return node;
					const data = node.data as { edgeOrder?: string[] };
					const edgeOrder = data.edgeOrder ?? [];
					return {
						...node,
						data: {
							...data,
							edgeOrder: [...edgeOrder, newEdgeId],
						},
					};
				})
			);
			setNodes((prev) => [...prev, newNode]);
			setEdges((prev) => [...prev, newEdge]);
		},
		[createNodeDataByType, onOpenEdgeModal, setEdges, setNodes, t]
	);

	const handleAddNodeWithVariant = useCallback(
		(
			parentNodeId: string,
			parentPosition: { x: number; y: number },
			payload: AddNodeVariantPayload
		) => {
			const timestamp = Date.now();
			const newNodeId = `node-${timestamp}`;
			const newEdgeId = `edge-${timestamp}`;
			const newNodePosition = {
				x: parentPosition.x,
				y: parentPosition.y + 120,
			};

			const baseData = createNodeDataByType(payload.type, newNodePosition);
			const labelOverride =
				payload.variant === 'transfer'
					? t('form.workflow.nodes.agent_transfer', {
							defaultValue: 'Agent transfer',
						})
					: undefined;
			const dataWithVariant = payload.variant
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
				type: payload.type,
				position: newNodePosition,
				data: dataWithVariant,
			};

			const newEdge: Edge = {
				id: newEdgeId,
				source: parentNodeId,
				target: newNodeId,
				type: 'condition',
				data: {
					label: t('form.workflow.edge.notConfigured', {
						defaultValue: 'Not configured',
					}),
					onEdgeClick: onOpenEdgeModal,
				},
			};

			setNodes((prev) =>
				prev.map((node) => {
					if (node.id !== parentNodeId) return node;
					const data = node.data as { edgeOrder?: string[] };
					const edgeOrder = data.edgeOrder ?? [];
					return {
						...node,
						data: {
							...data,
							edgeOrder: [...edgeOrder, newEdgeId],
						},
					};
				})
			);
			setNodes((prev) => [...prev, newNode]);
			setEdges((prev) => [...prev, newEdge]);
		},
		[createNodeDataByType, onOpenEdgeModal, setEdges, setNodes, t]
	);

	const handleDeleteNode = useCallback(
		(nodeId: string) => {
			setEdges((prevEdges) => {
				const remainingEdges = prevEdges.filter(
					(edge) => edge.source !== nodeId && edge.target !== nodeId
				);

				setNodes((prevNodes) =>
					prevNodes
						.filter((node) => node.id !== nodeId)
						.map((node) => {
							const data = node.data as { edgeOrder?: string[] };
							const edgeOrder = data.edgeOrder ?? [];
							const cleanedEdgeOrder = edgeOrder.filter(
								(edgeId) =>
									!prevEdges.some(
										(edge) =>
											edge.id === edgeId &&
											(edge.source === nodeId || edge.target === nodeId)
									)
							);
							return {
								...node,
								data: {
									...data,
									edgeOrder: cleanedEdgeOrder,
								},
							};
						})
				);

				return remainingEdges;
			});
		},
		[setEdges, setNodes]
	);

	const handleCopyNode = useCallback(
		(nodeId: string) => {
			setNodes((prev) => {
				const sourceNode = prev.find((node) => node.id === nodeId);
				if (!sourceNode) return prev;
				const copyId = `node-${generateUUIDv4()}`;
				const copyPosition = {
					x: sourceNode.position.x + 40,
					y: sourceNode.position.y + 40,
				};
				const data = cloneData(sourceNode.data as Record<string, unknown>);
				delete data.onAddNode;
				delete data.onAddNodeWithType;
				delete data.onAddNodeWithVariant;
				delete data.onDeleteNode;
				delete data.onCopyNode;

				const copiedNode: Node = {
					id: copyId,
					type: sourceNode.type,
					position: copyPosition,
					selected: false,
					data: {
						...data,
						position: copyPosition,
						edgeOrder: [],
					},
				};
				return [...prev, copiedNode];
			});
		},
		[setNodes]
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
