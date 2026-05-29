import type {
	AgentWorkflow,
	WorkflowEdge,
	WorkflowNode,
} from '~/models/AgentWorkflowModel';
import type { NodeGroups, NodeStyles } from '~/models/CampaignsModel';
import { sanitizeStartNodes } from '../WorkflowCanvas/WorkflowCanvas.helpers';
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
	prevent_subagent_loops: boolean;
	/** Number of custom node styles included in the envelope (0 = none) */
	nodeStyleCount: number;
	/** Number of node groups included in the envelope (0 = none) */
	nodeGroupCount: number;
}

export interface WorkflowImportResult {
	summary: WorkflowImportSummary;
	workflow: AgentWorkflow;
	/** Custom node styles from the clipboard envelope (undefined = not present) */
	nodeStyles?: NodeStyles;
	/** Node groups from the clipboard envelope (undefined = not present) */
	nodeGroups?: NodeGroups;
}

/**
 * Clipboard envelope version marker.
 * When present in the parsed JSON root, signals that the payload uses the
 * enriched envelope format (workflow + optional nodeStyles + nodeGroups).
 */
const CLIPBOARD_ENVELOPE_MARKER = '_nai_clipboard';
const CLIPBOARD_ENVELOPE_VERSION = 1;

export interface SerializeEnvelopeOptions {
	workflow: AgentWorkflow;
	includeNodeStyles?: boolean;
	includeNodeGroups?: boolean;
	nodeStyles?: NodeStyles;
	nodeGroups?: NodeGroups;
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

const camelizeKeys = (value: unknown): unknown => {
	if (value === null || value === undefined || typeof value !== 'object') {
		return value;
	}
	if (Array.isArray(value)) {
		return value.map(camelizeKeys);
	}
	return Object.entries(value).reduce<Record<string, unknown>>(
		(result, [key, childValue]) => {
			result[snakeToCamel(key)] = camelizeKeys(childValue);
			return result;
		},
		{}
	);
};

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

const normalizeImportedWorkflowRoot = (value: Record<string, unknown>) => ({
	prevent_subagent_loops:
		value.prevent_subagent_loops,
	nodes: value.nodes,
	edges: value.edges,
});

const normalizeImportedNode = (
	nodeValue: Record<string, unknown>
): WorkflowNode => {
	if (
		typeof nodeValue.type !== 'string' ||
		!isValidPosition(nodeValue.position)
	) {
		throw new WorkflowImportError('invalidNodeShape');
	}

	const nextNode = cloneValue(nodeValue) as unknown as WorkflowNode;
	nextNode.edge_order = normalizeEdgeOrderValue(nodeValue.edge_order);

	return nextNode;
};

const normalizeImportedEdge = (
	edgeValue: Record<string, unknown>
): WorkflowEdge => {
	if (
		typeof edgeValue.source !== 'string' ||
		typeof edgeValue.target !== 'string'
	) {
		throw new WorkflowImportError('invalidEdgeShape');
	}

	return cloneValue(edgeValue) as unknown as WorkflowEdge;
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
		const configuredOrder = normalizeEdgeOrderValue(node.edge_order);
		const validConfiguredOrder = configuredOrder.filter(
			(edgeId) => nextWorkflow.edges[edgeId]?.source === nodeId
		);
		const outgoingEdgeIds = outgoingEdgeIdsBySource.get(nodeId) ?? [];
		const missingOutgoingEdgeIds = outgoingEdgeIds.filter(
			(edgeId) => !validConfiguredOrder.includes(edgeId)
		);

		node.edge_order = [...validConfiguredOrder, ...missingOutgoingEdgeIds];
	});

	return nextWorkflow;
};

export const serializeWorkflowForClipboard = (
	workflow: AgentWorkflow
): string => {
	const sanitizedWorkflow = stripWorkflowUiMeta(workflow);
	return JSON.stringify(toSnakeCase(sanitizedWorkflow), null, 2);
};

/**
 * Serialize a workflow + optional node styles / node groups into an enriched
 * clipboard envelope.  The envelope carries a `_nai_clipboard` marker so the
 * import logic can distinguish it from a plain‑workflow JSON payload.
 *
 * When neither styles nor groups are included, falls back to the plain
 * workflow format for maximum backward compatibility.
 */
export const serializeWorkflowEnvelope = ({
	workflow,
	includeNodeStyles,
	includeNodeGroups,
	nodeStyles,
	nodeGroups,
}: SerializeEnvelopeOptions): string => {
	const hasStyles =
		includeNodeStyles && nodeStyles && Object.keys(nodeStyles).length > 0;
	const hasGroups =
		includeNodeGroups && nodeGroups && Object.keys(nodeGroups).length > 0;

	// If nothing extra is bundled, use the legacy plain‑workflow format.
	if (!hasStyles && !hasGroups) {
		return serializeWorkflowForClipboard(workflow);
	}

	const sanitizedWorkflow = stripWorkflowUiMeta(workflow);

	const envelope: Record<string, unknown> = {
		[CLIPBOARD_ENVELOPE_MARKER]: CLIPBOARD_ENVELOPE_VERSION,
		workflow: toSnakeCase(sanitizedWorkflow),
	};

	if (hasStyles) {
		envelope.node_styles = toSnakeCase(nodeStyles);
	}

	if (hasGroups) {
		envelope.node_groups = toSnakeCase(nodeGroups);
	}

	return JSON.stringify(envelope, null, 2);
};

/**
 * Strip nodeStyles entries whose keys don't exist in the imported workflow.
 */
const stripOrphanNodeStyles = (
	nodeStyles: NodeStyles,
	workflowNodeIds: Set<string>
): NodeStyles => {
	const cleaned: NodeStyles = {};
	for (const [nodeId, style] of Object.entries(nodeStyles)) {
		if (workflowNodeIds.has(nodeId)) {
			cleaned[nodeId] = style;
		}
	}
	return cleaned;
};

/**
 * Strip nodeGroups entries whose childNodeIds don't exist in the imported
 * workflow, and remove groups left with zero children.
 */
const stripOrphanNodeGroups = (
	nodeGroups: NodeGroups,
	workflowNodeIds: Set<string>
): NodeGroups => {
	const cleaned: NodeGroups = {};
	for (const [groupId, group] of Object.entries(nodeGroups)) {
		const validChildren = group.childNodeIds.filter((id) =>
			workflowNodeIds.has(id)
		);
		if (validChildren.length > 0) {
			cleaned[groupId] = { ...group, childNodeIds: validChildren };
		}
	}
	return cleaned;
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

	// ── Envelope detection ──
	// If the root object contains our marker key, it's an enriched envelope.
	const isEnvelope =
		CLIPBOARD_ENVELOPE_MARKER in parsedValue && isRecord(parsedValue.workflow);

	const workflowRoot = isEnvelope
		? (parsedValue.workflow as Record<string, unknown>)
		: parsedValue;

	const normalizedValue = normalizeImportedWorkflowRoot(workflowRoot);
	const { nodes, edges } = normalizedValue;

	if (!isRecord(nodes)) {
		throw new WorkflowImportError('invalidNodes');
	}

	if (!isRecord(edges)) {
		throw new WorkflowImportError('invalidEdges');
	}

	let prevent_subagent_loops = fallbackPreventSubagentLoops;
	if (normalizedValue.prevent_subagent_loops !== undefined) {
		if (typeof normalizedValue.prevent_subagent_loops !== 'boolean') {
			throw new WorkflowImportError('invalidPreventSubagentLoops');
		}

		prevent_subagent_loops = normalizedValue.prevent_subagent_loops;
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
		prevent_subagent_loops,
		nodes: sanitizeStartNodes(normalizedNodes, normalizedEdges),
		edges: normalizedEdges,
	});

	// ── Extract optional envelope layers ──
	const workflowNodeIds = new Set(Object.keys(normalizedWorkflow.nodes));
	let importedNodeStyles: NodeStyles | undefined;
	let importedNodeGroups: NodeGroups | undefined;

	if (isEnvelope) {
		const rawStyles = parsedValue.node_styles ?? parsedValue.nodeStyles;
		if (isRecord(rawStyles)) {
			const camelized = camelizeKeys(rawStyles) as NodeStyles;
			importedNodeStyles = stripOrphanNodeStyles(camelized, workflowNodeIds);
			if (Object.keys(importedNodeStyles).length === 0) {
				importedNodeStyles = undefined;
			}
		}

		const rawGroups = parsedValue.node_groups ?? parsedValue.nodeGroups;
		if (isRecord(rawGroups)) {
			const camelized = camelizeKeys(rawGroups) as NodeGroups;
			importedNodeGroups = stripOrphanNodeGroups(camelized, workflowNodeIds);
			if (Object.keys(importedNodeGroups).length === 0) {
				importedNodeGroups = undefined;
			}
		}
	}

	return {
		workflow: normalizedWorkflow,
		nodeStyles: importedNodeStyles,
		nodeGroups: importedNodeGroups,
		summary: {
			nodeCount: Object.keys(normalizedWorkflow.nodes).length,
			edgeCount: Object.keys(normalizedWorkflow.edges).length,
			prevent_subagent_loops: normalizedWorkflow.prevent_subagent_loops,
			nodeStyleCount: importedNodeStyles
				? Object.keys(importedNodeStyles).length
				: 0,
			nodeGroupCount: importedNodeGroups
				? Object.keys(importedNodeGroups).length
				: 0,
		},
	};
};
