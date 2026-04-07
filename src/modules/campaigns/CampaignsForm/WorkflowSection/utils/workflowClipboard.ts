import type {
	AgentWorkflow,
	WorkflowEdge,
	WorkflowNode,
} from '~/models/AgentWorkflowModel';
import { snakeToCamel, toSnakeCase } from '~/utils/stringUtils';

export type WorkflowImportErrorCode =
	| 'invalidJson'
	| 'invalidRoot'
	| 'invalidNodes'
	| 'invalidEdges'
	| 'invalidPreventSubagentLoops'
	| 'invalidNodeShape'
	| 'invalidEdgeShape'
	| 'missingStartNode'
	| 'missingEdgeNodeReference';

export interface WorkflowImportSummary {
	nodeCount: number;
	edgeCount: number;
	preventSubagentLoops: boolean;
}

export interface WorkflowImportResult {
	summary: WorkflowImportSummary;
	workflow: AgentWorkflow;
}

export class WorkflowImportError extends Error {
	code: WorkflowImportErrorCode;

	constructor(code: WorkflowImportErrorCode) {
		super(code);
		this.name = 'WorkflowImportError';
		this.code = code;
	}
}

const cloneValue = <T>(value: T): T => {
	try {
		if (typeof structuredClone === 'function') {
			return structuredClone(value);
		}
	} catch {
		// Fall back to JSON cloning for serializable workflow data.
	}

	return JSON.parse(JSON.stringify(value)) as T;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const PRESERVE_CHILD_KEYS_FOR_PARENTS = new Set([
	'built_in_tools',
	'builtInTools',
]);

const isValidPosition = (
	value: unknown
): value is {
	x: number;
	y: number;
} =>
	isRecord(value) &&
	typeof value.x === 'number' &&
	Number.isFinite(value.x) &&
	typeof value.y === 'number' &&
	Number.isFinite(value.y);

const normalizeEdgeOrderValue = (value: unknown): string[] =>
	Array.isArray(value)
		? value.filter((edgeId): edgeId is string => typeof edgeId === 'string')
		: [];

const camelizeImportedKeys = (value: unknown, parentKey?: string): unknown => {
	if (value === null || value === undefined || typeof value !== 'object') {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map((item) => camelizeImportedKeys(item, parentKey));
	}

	const preserveChildKeys = parentKey
		? PRESERVE_CHILD_KEYS_FOR_PARENTS.has(parentKey)
		: false;

	return Object.entries(value).reduce<Record<string, unknown>>(
		(result, [key, childValue]) => {
			const nextKey = preserveChildKeys ? key : snakeToCamel(key);
			result[nextKey] = camelizeImportedKeys(childValue, nextKey);
			return result;
		},
		{}
	);
};

const normalizeImportedWorkflowRoot = (value: Record<string, unknown>) => ({
	preventSubagentLoops:
		value.preventSubagentLoops ?? value.prevent_subagent_loops,
	nodes: value.nodes,
	edges: value.edges,
});

const normalizeImportedNode = (
	nodeValue: Record<string, unknown>
): WorkflowNode => {
	const normalizedNode = camelizeImportedKeys(nodeValue) as Record<
		string,
		unknown
	>;

	if (
		typeof normalizedNode.type !== 'string' ||
		!isValidPosition(normalizedNode.position)
	) {
		throw new WorkflowImportError('invalidNodeShape');
	}

	const nextNode = cloneValue(normalizedNode) as unknown as WorkflowNode;
	nextNode.edgeOrder = normalizeEdgeOrderValue(normalizedNode.edgeOrder);

	return nextNode;
};

const normalizeImportedEdge = (
	edgeValue: Record<string, unknown>
): WorkflowEdge => {
	const normalizedEdge = camelizeImportedKeys(edgeValue) as Record<
		string,
		unknown
	>;

	if (
		typeof normalizedEdge.source !== 'string' ||
		typeof normalizedEdge.target !== 'string'
	) {
		throw new WorkflowImportError('invalidEdgeShape');
	}

	return cloneValue(normalizedEdge) as unknown as WorkflowEdge;
};

const stripWorkflowUiMeta = (workflow: AgentWorkflow): AgentWorkflow => {
	const nextWorkflow = cloneValue(workflow);

	Object.values(nextWorkflow.nodes).forEach((node) => {
		if ('uiMeta' in node) {
			delete node.uiMeta;
		}
	});

	return nextWorkflow;
};

export const normalizeWorkflowEdgeOrder = (
	workflow: AgentWorkflow
): AgentWorkflow => {
	const nextWorkflow = cloneValue(workflow);
	const outgoingEdgeIdsBySource = new Map<string, string[]>();

	Object.entries(nextWorkflow.edges).forEach(([edgeId, edge]) => {
		const outgoingEdgeIds = outgoingEdgeIdsBySource.get(edge.source) ?? [];
		outgoingEdgeIds.push(edgeId);
		outgoingEdgeIdsBySource.set(edge.source, outgoingEdgeIds);
	});

	Object.entries(nextWorkflow.nodes).forEach(([nodeId, node]) => {
		const configuredOrder = normalizeEdgeOrderValue(node.edgeOrder);
		const validConfiguredOrder = configuredOrder.filter(
			(edgeId) => nextWorkflow.edges[edgeId]?.source === nodeId
		);
		const outgoingEdgeIds = outgoingEdgeIdsBySource.get(nodeId) ?? [];
		const missingOutgoingEdgeIds = outgoingEdgeIds.filter(
			(edgeId) => !validConfiguredOrder.includes(edgeId)
		);

		node.edgeOrder = [...validConfiguredOrder, ...missingOutgoingEdgeIds];
	});

	return nextWorkflow;
};

export const serializeWorkflowForClipboard = (
	workflow: AgentWorkflow
): string => {
	const sanitizedWorkflow = stripWorkflowUiMeta(workflow);
	return JSON.stringify(toSnakeCase(sanitizedWorkflow), null, 2);
};

export const parseImportedWorkflow = (
	rawText: string,
	fallbackPreventSubagentLoops: boolean
): WorkflowImportResult => {
	let parsedValue: unknown;

	try {
		parsedValue = JSON.parse(rawText);
	} catch {
		throw new WorkflowImportError('invalidJson');
	}

	if (!isRecord(parsedValue)) {
		throw new WorkflowImportError('invalidRoot');
	}

	const normalizedValue = normalizeImportedWorkflowRoot(parsedValue);
	const { nodes, edges } = normalizedValue;

	if (!isRecord(nodes)) {
		throw new WorkflowImportError('invalidNodes');
	}

	if (!isRecord(edges)) {
		throw new WorkflowImportError('invalidEdges');
	}

	let preventSubagentLoops = fallbackPreventSubagentLoops;
	if (normalizedValue.preventSubagentLoops !== undefined) {
		if (typeof normalizedValue.preventSubagentLoops !== 'boolean') {
			throw new WorkflowImportError('invalidPreventSubagentLoops');
		}

		preventSubagentLoops = normalizedValue.preventSubagentLoops;
	}

	const normalizedNodes: Record<string, WorkflowNode> = {};

	Object.entries(nodes).forEach(([nodeId, nodeValue]) => {
		if (!isRecord(nodeValue)) {
			throw new WorkflowImportError('invalidNodeShape');
		}

		normalizedNodes[nodeId] = normalizeImportedNode(nodeValue);
	});

	const hasStartNode = Object.values(normalizedNodes).some(
		(node) => node.type === 'start'
	);

	if (!hasStartNode) {
		throw new WorkflowImportError('missingStartNode');
	}

	const normalizedEdges: Record<string, WorkflowEdge> = {};

	Object.entries(edges).forEach(([edgeId, edgeValue]) => {
		if (!isRecord(edgeValue)) {
			throw new WorkflowImportError('invalidEdgeShape');
		}

		const normalizedEdge = normalizeImportedEdge(edgeValue);

		if (
			!normalizedNodes[normalizedEdge.source] ||
			!normalizedNodes[normalizedEdge.target]
		) {
			throw new WorkflowImportError('missingEdgeNodeReference');
		}

		normalizedEdges[edgeId] = normalizedEdge;
	});

	const normalizedWorkflow = normalizeWorkflowEdgeOrder({
		preventSubagentLoops,
		nodes: normalizedNodes,
		edges: normalizedEdges,
	});

	return {
		workflow: normalizedWorkflow,
		summary: {
			nodeCount: Object.keys(normalizedWorkflow.nodes).length,
			edgeCount: Object.keys(normalizedWorkflow.edges).length,
			preventSubagentLoops: normalizedWorkflow.preventSubagentLoops,
		},
	};
};
