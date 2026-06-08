import type {
	AgentWorkflow,
	WorkflowEdge,
	WorkflowNode,
} from '~/models/AgentWorkflowModel';
import { WORKFLOW_NODE_TYPES } from '../nodeTypes';

export const updateWorkflowNode = (
	workflow: AgentWorkflow | undefined,
	nodeId: string,
	updates: Partial<WorkflowNode>
): AgentWorkflow | null => {
	if (!workflow) return null;
	const currentNode = workflow.nodes[nodeId];
	if (!currentNode) return null;
	const nextNode = { ...currentNode, ...updates } as WorkflowNode;
	return {
		...workflow,
		nodes: {
			...workflow.nodes,
			[nodeId]: nextNode,
		},
	};
};

export const updateWorkflowEdge = (
	workflow: AgentWorkflow | undefined,
	edgeId: string,
	updates: Partial<WorkflowEdge>
): AgentWorkflow | null => {
	if (!workflow) return null;
	const currentEdge = workflow.edges[edgeId];
	if (!currentEdge) return null;
	const nextEdge = { ...currentEdge, ...updates } as WorkflowEdge;
	return {
		...workflow,
		edges: {
			...workflow.edges,
			[edgeId]: nextEdge,
		},
	};
};

export const updateWorkflowNodeSubagent = (
	workflow: AgentWorkflow | undefined,
	nodeId: string,
	updates: Record<string, unknown>
): AgentWorkflow | null => {
	if (!workflow) return null;
	const currentNode = workflow.nodes[nodeId];
	const canHaveSubagent =
		currentNode?.type === WORKFLOW_NODE_TYPES.OVERRIDE_AGENT ||
		currentNode?.type === WORKFLOW_NODE_TYPES.STANDALONE_AGENT;
	if (!currentNode || !canHaveSubagent) return null;
	const currentSubagent =
		'subagent' in currentNode ? (currentNode.subagent ?? {}) : {};
	return updateWorkflowNode(workflow, nodeId, {
		subagent: {
			...currentSubagent,
			...updates,
		},
	} as Partial<WorkflowNode>);
};

export const updateWorkflowNodeConversationConfig = (
	workflow: AgentWorkflow | undefined,
	nodeId: string,
	updates: Partial<Record<string, unknown>>
): AgentWorkflow | null => {
	if (!workflow) return null;
	const currentNode = workflow.nodes[nodeId];
	if (!currentNode) return null;

	const currentConfig =
		(currentNode as { conversation_config?: Record<string, unknown> })
			.conversation_config ?? {};

	return updateWorkflowNode(workflow, nodeId, {
		conversation_config: {
			...currentConfig,
			...updates,
		},
	} as Partial<WorkflowNode>);
};

export const updateWorkflowEdgeOrder = (
	workflow: AgentWorkflow | undefined,
	nodeId: string,
	edge_order: string[]
): AgentWorkflow | null => {
	if (!workflow) return null;
	const currentNode = workflow.nodes[nodeId];
	if (!currentNode) return null;
	return updateWorkflowNode(workflow, nodeId, {
		edge_order,
	} as Partial<WorkflowNode>);
};

export const removeWorkflowEdge = (
	workflow: AgentWorkflow | undefined,
	edgeId: string
): AgentWorkflow | null => {
	if (!workflow) return null;

	const edge = workflow.edges[edgeId];
	if (!edge) return null;

	// Remove edge from the source node's edge_order
	const sourceNode = workflow.nodes[edge.source];
	const nextNodes = { ...workflow.nodes };

	if (sourceNode) {
		nextNodes[edge.source] = {
			...sourceNode,
			edge_order: (sourceNode.edge_order ?? []).filter((id) => id !== edgeId),
		} as WorkflowNode;
	}

	// Remove the edge itself
	const nextEdges = { ...workflow.edges };
	delete nextEdges[edgeId];

	return {
		...workflow,
		nodes: nextNodes,
		edges: nextEdges,
	};
};

export const getOutgoingEdges = (
	workflow: AgentWorkflow | undefined,
	nodeId: string
): Array<{ id: string; edge: WorkflowEdge }> => {
	if (!workflow) return [];

	const edges = Object.entries(workflow.edges)
		.filter(([, edge]) => edge.source === nodeId)
		.map(([id, edge]) => ({ id, edge }));

	// Sort by edge_order if available
	const node = workflow.nodes[nodeId];
	const edge_order = node?.edge_order ?? [];

	return edges.sort((a, b) => {
		const indexA = edge_order.indexOf(a.id);
		const indexB = edge_order.indexOf(b.id);
		if (indexA === -1 && indexB === -1) return 0;
		if (indexA === -1) return 1;
		if (indexB === -1) return -1;
		return indexA - indexB;
	});
};

export const resolveNodeLabel = (value: unknown, fallback: string): string => {
	if (typeof value === 'string' || typeof value === 'number') {
		return String(value);
	}
	if (!value || typeof value !== 'object') return fallback;
	const record = value as Record<string, unknown>;
	const candidates = ['tool_id', 'id', 'name', 'label'] as const;
	for (const key of candidates) {
		const candidate = record[key];
		if (typeof candidate === 'string' || typeof candidate === 'number') {
			return String(candidate);
		}
	}
	return fallback;
};

export const getEdgeConditionLabel = (
	edge: WorkflowEdge,
	fallback: string
): string => {
	if (edge.forward_condition?.type === 'llm') {
		return (
			edge.forward_condition.condition ||
			edge.forward_condition.label ||
			fallback
		);
	}
	if (edge.forward_condition?.type === 'expression') {
		return edge.forward_condition.label || fallback;
	}
	if (edge.forward_condition?.type === 'unconditional') {
		return 'Unconditional';
	}
	if (edge.forward_condition?.type === 'result') {
		return edge.forward_condition.successful ? 'Success' : 'Failure';
	}
	return fallback;
};
