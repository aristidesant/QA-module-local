import { MarkerType, Position } from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import type { TFunction } from 'i18next';
import { WORKFLOW_NODE_TYPES } from '../nodeTypes';
import { getEdgeWarningLevel } from '../utils/workflowValidation';
import type {
	AgentWorkflow,
	BoolExpr,
	EndNode,
	OverrideAgentNode,
	PhoneNumberTransferNode,
	UpdateStateNode,
	StandaloneAgentNode,
	StartNode,
	ToolNode,
	WorkflowEdge,
	WorkflowNode,
} from '~/models/AgentWorkflowModel';
import type { NodeGroups } from '~/models/CampaignsModel';

const COMPARISON_OPERATOR_LABELS: Partial<Record<BoolExpr['type'], string>> = {
	eq_operator: '==',
	neq_operator: '!=',
	gt_operator: '>',
	gte_operator: '>=',
	lt_operator: '<',
	lte_operator: '<=',
};

const normalizeWorkflowNodeType = (type: string) =>
	type === 'updateState' ? WORKFLOW_NODE_TYPES.UPDATE_STATE : type;

const quoteExpressionString = (value: string) =>
	`"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

const formatExpressionValue = (expression: BoolExpr): string | null => {
	switch (expression.type) {
		case 'dynamic_variable':
			return expression.name.trim() || null;
		case 'string_literal':
			return quoteExpressionString(expression.value);
		case 'number_literal':
			return Number.isFinite(expression.value)
				? String(expression.value)
				: null;
		case 'boolean_literal':
			return expression.value ? 'true' : 'false';
		case 'llm': {
			const prompt = expression.prompt.trim();
			return prompt ? `llm(${quoteExpressionString(prompt)})` : null;
		}
		default:
			return null;
	}
};

const formatExpressionLabel = (expression: BoolExpr): string | null => {
	if (expression.type === 'and_operator' || expression.type === 'or_operator') {
		const operator = expression.type === 'and_operator' ? 'AND' : 'OR';
		const children = expression.children
			.map(formatExpressionLabel)
			.filter((label): label is string => Boolean(label));

		if (!children.length) return null;
		return children.length === 1
			? children[0]
			: children.map((label) => `(${label})`).join(` ${operator} `);
	}

	const operator = COMPARISON_OPERATOR_LABELS[expression.type];

	if (operator && 'left' in expression && 'right' in expression) {
		const left = formatExpressionValue(expression.left);
		const right = formatExpressionValue(expression.right);
		return left && right ? `${left} ${operator} ${right}` : null;
	}

	return formatExpressionValue(expression);
};

export const createWorkflowEdgeMarker = (
	orient: 'auto' | 'auto-start-reverse'
) => ({
	type: MarkerType.Arrow,
	width: 12,
	height: 12,
	orient,
	markerUnits: 'strokeWidth',
	color: 'var(--workflow-shell-control-text, var(--mantine-color-gray-6))',
});

export const defaultEdgeOptions = {
	style: {
		strokeWidth: 2,
		stroke: 'var(--workflow-shell-control-text, var(--mantine-color-gray-6))',
		strokeLinecap: 'round',
		strokeLinejoin: 'round',
	},
	type: 'condition',
	markerEnd: createWorkflowEdgeMarker('auto'),
};

export const WORKFLOW_NODE_DRAG_HANDLE_SELECTOR = '.workflowNodeDragHandle';

export const HANDLE_ID_MAP = {
	source: {
		[Position.Top]: 'source-top',
		[Position.Right]: 'source-right',
		[Position.Bottom]: 'source-bottom',
		[Position.Left]: 'source-left',
	},
	target: {
		[Position.Top]: 'target-top',
		[Position.Right]: 'target-right',
		[Position.Bottom]: 'target-bottom',
		[Position.Left]: 'target-left',
	},
} as const;

export type NodeInternalsMap = Map<
	string,
	{
		positionAbsolute?: { x: number; y: number };
		width?: number;
		height?: number;
	}
>;

export const serializeWorkflow = (workflow: AgentWorkflow): string => {
	const sortedNodes = Object.entries(workflow.nodes)
		.sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
		.map(([id, node]) => [id, node]);
	const sortedEdges = Object.entries(workflow.edges)
		.sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
		.map(([id, edge]) => [id, edge]);
	return JSON.stringify({
		preventSubagentLoops: workflow.preventSubagentLoops,
		nodes: sortedNodes,
		edges: sortedEdges,
	});
};

/**
 * If a workflow somehow ends up with more than one START node, keep only the
 * connected one (i.e. the one that appears as a source in at least one edge).
 * If none or multiple are connected, keep the first one found.
 */
export const sanitizeStartNodes = (
	nodes: Record<string, WorkflowNode>,
	edges: Record<string, WorkflowEdge>
): Record<string, WorkflowNode> => {
	const startNodeIds = Object.entries(nodes)
		.filter(([, node]) => node.type === WORKFLOW_NODE_TYPES.START)
		.map(([id]) => id);

	if (startNodeIds.length <= 1) return nodes;

	const connectedStartIds = startNodeIds.filter((id) =>
		Object.values(edges).some((edge) => edge.source === id)
	);

	const keepId = connectedStartIds[0] ?? startNodeIds[0];

	const result = { ...nodes };
	startNodeIds.forEach((id) => {
		if (id !== keepId) delete result[id];
	});

	return result;
};

export const buildDefaultWorkflow = (
	preventSubagentLoops: boolean
): AgentWorkflow => {
	const startNode: StartNode = {
		type: WORKFLOW_NODE_TYPES.START,
		position: { x: 250, y: 50 },
		edgeOrder: [],
	};
	return {
		preventSubagentLoops,
		nodes: { start_node: startNode },
		edges: {},
	};
};

export const mapWorkflowToNodes = (
	workflowData: AgentWorkflow,
	t: TFunction,
	nodeGroups?: NodeGroups
): { nodes: Node[]; edges: Edge[] } => {
	const normalizeSubagent = (node: OverrideAgentNode | StandaloneAgentNode) => {
		const legacyPrompt =
			'additionalPrompt' in node ? node.additionalPrompt : undefined;
		const legacyToolIds =
			'additionalToolIds' in node ? node.additionalToolIds : undefined;
		const legacyKnowledgeBaseIds =
			'additionalKnowledgeBase' in node
				? node.additionalKnowledgeBase
				: undefined;
		const legacyTransferMessage =
			'transferMessage' in node ? node.transferMessage : undefined;
		const existing = node.subagent;

		const nextSubagent = {
			...existing,
			prompt:
				existing?.prompt ?? legacyPrompt ?? legacyTransferMessage ?? undefined,
			toolIds: existing?.toolIds ?? legacyToolIds ?? [],
			knowledgeBaseIds:
				existing?.knowledgeBaseIds ?? legacyKnowledgeBaseIds ?? [],
		};

		if (
			nextSubagent.prompt ||
			nextSubagent.toolIds.length > 0 ||
			nextSubagent.knowledgeBaseIds.length > 0
		) {
			return nextSubagent;
		}

		return existing;
	};

	const NON_SELECTABLE_TYPES = [
		WORKFLOW_NODE_TYPES.START,
		WORKFLOW_NODE_TYPES.END,
	];

	const sanitizedNodes = sanitizeStartNodes(
		workflowData.nodes,
		workflowData.edges
	);

	// Build child→parent map from the campaign-level nodeGroups
	const childToGroup = new Map<string, string>();
	const safeNodeGroups = nodeGroups ?? {};
	Object.entries(safeNodeGroups).forEach(([groupId, group]) => {
		group.childNodeIds.forEach((childId) => childToGroup.set(childId, groupId));
	});

	// Build React Flow nodes for groups
	const groupReactNodes: Node[] = Object.entries(safeNodeGroups).map(
		([id, group]) => ({
			id,
			type: WORKFLOW_NODE_TYPES.GROUP,
			position: group.position,
			style: {
				...(group.width ? { width: group.width } : {}),
				...(group.height ? { height: group.height } : {}),
			},
			data: {
				type: WORKFLOW_NODE_TYPES.GROUP,
				position: group.position,
				label: group.label ?? '',
				color: group.color ?? '',
				edgeOrder: [],
			},
			selectable: true,
			focusable: true,
			dragHandle: undefined,
		})
	);

	const mappedNodes = Object.entries(sanitizedNodes).map(([id, node]) => {
		const normalizedNodeType = normalizeWorkflowNodeType(node.type);
		const parentGroupId = childToGroup.get(id);

		return {
			id,
			type: normalizedNodeType,
			position: node.position,
			dragHandle: WORKFLOW_NODE_DRAG_HANDLE_SELECTOR,
			selectable: !NON_SELECTABLE_TYPES.includes(normalizedNodeType as any),
			focusable: !NON_SELECTABLE_TYPES.includes(normalizedNodeType as any),
			...(parentGroupId
				? { parentId: parentGroupId, extent: 'parent' as const }
				: {}),
			data: {
				...node,
				type: normalizedNodeType,
				position: node.position,
				edgeOrder: node.edgeOrder ?? [],
				...(normalizedNodeType === WORKFLOW_NODE_TYPES.STANDALONE_AGENT ||
				normalizedNodeType === WORKFLOW_NODE_TYPES.OVERRIDE_AGENT
					? {
							subagent: normalizeSubagent(
								node as OverrideAgentNode | StandaloneAgentNode
							),
						}
					: {}),
			},
		};
	});

	// Group nodes must appear before their children in the array
	const sortedNodes = [...groupReactNodes, ...mappedNodes];

	const getConditionLabel = (
		condition?: WorkflowEdge['forwardCondition']
	): string | null => {
		if (!condition) return null;
		if ('label' in condition && condition.label) return condition.label;
		if (condition.type === 'llm') {
			return condition.condition?.trim() || null;
		}
		if (condition.type === 'expression') {
			return formatExpressionLabel(condition.expression);
		}
		if (condition.type === 'result') {
			return condition.successful
				? t('form.workflow.edge.results.success', {
						defaultValue: 'Success',
					})
				: t('form.workflow.edge.results.failure', {
						defaultValue: 'Failure',
					});
		}
		return null;
	};

	const getEdgeLabel = (
		edge: WorkflowEdge
	):
		| string
		| {
				forwardLabel: string;
				backwardLabel: string;
		  }
		| null => {
		const sourceNode = workflowData.nodes[edge.source];
		if (sourceNode?.type === WORKFLOW_NODE_TYPES.START) {
			return null;
		}

		const forwardLabel = getConditionLabel(edge.forwardCondition);
		const backwardLabel = getConditionLabel(edge.backwardCondition);

		if (forwardLabel && backwardLabel) {
			return {
				forwardLabel,
				backwardLabel,
			};
		}

		return forwardLabel || backwardLabel || null;
	};

	const mappedEdges = Object.entries(workflowData.edges)
		.filter(
			([, edge]) => sanitizedNodes[edge.source] && sanitizedNodes[edge.target]
		)
		.map(([id, edge]) => {
			const sourceNode = sanitizedNodes[edge.source];
			const label = getEdgeLabel(edge);

			return {
				id,
				source: edge.source,
				target: edge.target,
				type: 'condition',
				data: {
					label,
					sourceNodeType: sourceNode?.type,
					forwardCondition: edge.forwardCondition,
					backwardCondition: edge.backwardCondition,
					warningLevel: getEdgeWarningLevel(id, workflowData),
				},
			};
		});

	return { nodes: sortedNodes, edges: mappedEdges };
};

export interface BuildWorkflowResult {
	workflow: AgentWorkflow;
	nodeGroups: NodeGroups;
}

export const buildWorkflowFromState = (
	currentNodes: Node[],
	currentEdges: Edge[],
	preventSubagentLoops: boolean
): BuildWorkflowResult => {
	const workflowNodes: Record<string, WorkflowNode> = {};
	const workflowEdges: Record<string, WorkflowEdge> = {};
	const nodeGroups: NodeGroups = {};

	const sortedNodes = [...currentNodes].sort((a, b) =>
		a.id.localeCompare(b.id)
	);
	const sortedEdges = [...currentEdges].sort((a, b) =>
		a.id.localeCompare(b.id)
	);

	// Collect group node IDs → child IDs
	const groupChildMap = new Map<string, string[]>();
	sortedNodes.forEach((node) => {
		if (node.type === WORKFLOW_NODE_TYPES.GROUP) {
			groupChildMap.set(node.id, []);
		}
	});
	sortedNodes.forEach((node) => {
		if (node.parentId && groupChildMap.has(node.parentId)) {
			groupChildMap.get(node.parentId)!.push(node.id);
		}
	});

	sortedNodes.forEach((node) => {
		const data = node.data as Partial<WorkflowNode>;
		const normalizedNodeType = normalizeWorkflowNodeType(
			(node.type || data.type || WORKFLOW_NODE_TYPES.START) as string
		);
		const baseNode = {
			type: normalizedNodeType as WorkflowNode['type'],
			position: node.position,
			edgeOrder: data.edgeOrder ?? [],
			label: data.label,
			uiMeta: data.uiMeta,
		};

		switch (normalizedNodeType) {
			case WORKFLOW_NODE_TYPES.TOOL: {
				const toolNode: ToolNode = {
					...baseNode,
					type: WORKFLOW_NODE_TYPES.TOOL,
					tools: (data as ToolNode).tools ?? [],
				};
				workflowNodes[node.id] = toolNode;
				break;
			}
			case WORKFLOW_NODE_TYPES.OVERRIDE_AGENT: {
				const subagent = (data as OverrideAgentNode).subagent;
				const additionalPrompt =
					(data as OverrideAgentNode).additionalPrompt ??
					subagent?.prompt ??
					'';
				const additionalToolIds =
					(data as OverrideAgentNode).additionalToolIds ??
					subagent?.toolIds ??
					[];
				const additionalKnowledgeBase =
					(data as OverrideAgentNode).additionalKnowledgeBase ??
					subagent?.knowledgeBaseIds ??
					[];
				const overrideNode: OverrideAgentNode = {
					...baseNode,
					type: WORKFLOW_NODE_TYPES.OVERRIDE_AGENT,
					label: baseNode.label || '',
					additionalPrompt,
					additionalToolIds,
					additionalKnowledgeBase,
					subagent,
					conversationConfig:
						(data as OverrideAgentNode).conversationConfig ?? {},
				};
				workflowNodes[node.id] = overrideNode;
				break;
			}
			case WORKFLOW_NODE_TYPES.UPDATE_STATE: {
				const updateStateNode: UpdateStateNode = {
					...baseNode,
					type: WORKFLOW_NODE_TYPES.UPDATE_STATE,
					label: baseNode.label ?? '',
					updates: (data as UpdateStateNode).updates ?? [],
				};
				workflowNodes[node.id] = updateStateNode;
				break;
			}
			case WORKFLOW_NODE_TYPES.PHONE_NUMBER: {
				const phoneNode: PhoneNumberTransferNode = {
					...baseNode,
					type: WORKFLOW_NODE_TYPES.PHONE_NUMBER,
					transferType:
						(data as PhoneNumberTransferNode).transferType ?? 'conference',
					transferDestination: (data as PhoneNumberTransferNode)
						.transferDestination ?? {
						type: 'phone',
						phoneNumber: '',
					},
				};
				workflowNodes[node.id] = phoneNode;
				break;
			}
			case WORKFLOW_NODE_TYPES.STANDALONE_AGENT: {
				const subagent = (data as StandaloneAgentNode).subagent;
				const additionalPrompt =
					(data as StandaloneAgentNode).additionalPrompt ??
					subagent?.prompt ??
					undefined;
				const additionalToolIds =
					(data as StandaloneAgentNode).additionalToolIds ??
					subagent?.toolIds ??
					[];
				const additionalKnowledgeBase =
					(data as StandaloneAgentNode).additionalKnowledgeBase ??
					subagent?.knowledgeBaseIds ??
					[];
				const standaloneNode: StandaloneAgentNode = {
					...baseNode,
					type: WORKFLOW_NODE_TYPES.STANDALONE_AGENT,
					agentId: (data as StandaloneAgentNode).agentId ?? '',
					delayMs: (data as StandaloneAgentNode).delayMs ?? 0,
					enableTransferredAgentFirstMessage:
						(data as StandaloneAgentNode).enableTransferredAgentFirstMessage ??
						false,
					transferMessage: (data as StandaloneAgentNode).transferMessage,
					additionalPrompt,
					additionalToolIds,
					additionalKnowledgeBase,
					subagent,
					conversationConfig:
						(data as StandaloneAgentNode).conversationConfig ?? {},
				};
				workflowNodes[node.id] = standaloneNode;
				break;
			}
			case WORKFLOW_NODE_TYPES.GROUP: {
				const nodeData = node.data as { label?: string; color?: string };
				nodeGroups[node.id] = {
					label: nodeData.label,
					position: node.position,
					width:
						typeof node.style?.width === 'number'
							? node.style.width
							: undefined,
					height:
						typeof node.style?.height === 'number'
							? node.style.height
							: undefined,
					color: nodeData.color || undefined,
					childNodeIds: groupChildMap.get(node.id) ?? [],
				};
				break;
			}
			case WORKFLOW_NODE_TYPES.END: {
				const endNode: EndNode = {
					...baseNode,
					type: WORKFLOW_NODE_TYPES.END,
				};
				workflowNodes[node.id] = endNode;
				break;
			}
			case WORKFLOW_NODE_TYPES.START:
			default: {
				const startNode: StartNode = {
					...baseNode,
					type: WORKFLOW_NODE_TYPES.START,
				};
				workflowNodes[node.id] = startNode;
				break;
			}
		}
	});

	sortedEdges.forEach((edge) => {
		const data = edge.data as Partial<WorkflowEdge> | undefined;
		workflowEdges[edge.id] = {
			source: edge.source,
			target: edge.target,
			forwardCondition: data?.forwardCondition ?? {
				type: 'unconditional' as const,
			},
			backwardCondition: data?.backwardCondition,
		};
	});

	return {
		workflow: {
			preventSubagentLoops,
			nodes: workflowNodes,
			edges: workflowEdges,
		},
		nodeGroups,
	};
};
