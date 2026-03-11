import { MarkerType, Position } from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import type { TFunction } from 'i18next';
import { WORKFLOW_NODE_TYPES } from '../nodeTypes';
import { getEdgeWarningLevel } from '../utils/workflowValidation';
import type {
	AgentWorkflow,
	EndNode,
	OverrideAgentNode,
	PhoneNumberTransferNode,
	StandaloneAgentNode,
	StartNode,
	ToolNode,
	WorkflowEdge,
	WorkflowNode,
} from '~/models/AgentWorkflowModel';

export const defaultEdgeOptions = {
	style: { strokeWidth: 2, stroke: '#868e96' },
	type: 'condition',
	markerEnd: {
		type: MarkerType.ArrowClosed,
		width: 15,
		height: 15,
		color: '#868e96',
	},
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
	t: TFunction
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

	const mappedNodes = Object.entries(workflowData.nodes).map(([id, node]) => ({
		id,
		type: node.type,
		position: node.position,
		dragHandle: WORKFLOW_NODE_DRAG_HANDLE_SELECTOR,
		selectable: !NON_SELECTABLE_TYPES.includes(node.type as any),
		focusable: !NON_SELECTABLE_TYPES.includes(node.type as any),
		data: {
			...node,
			type: node.type,
			position: node.position,
			edgeOrder: node.edgeOrder ?? [],
			...(node.type === WORKFLOW_NODE_TYPES.STANDALONE_AGENT ||
			node.type === WORKFLOW_NODE_TYPES.OVERRIDE_AGENT
				? {
						subagent: normalizeSubagent(
							node as OverrideAgentNode | StandaloneAgentNode
						),
					}
				: {}),
		},
	}));

	const getConditionLabel = (
		condition?: WorkflowEdge['forwardCondition']
	): string | null => {
		if (!condition) return null;
		if ('label' in condition && condition.label) return condition.label;
		if (condition.type === 'llm') {
			return condition.condition?.trim() || null;
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

		return (
			forwardLabel ||
			backwardLabel ||
			t('form.workflow.edge.notConfigured', {
				defaultValue: 'Not configured',
			})
		);
	};

	const mappedEdges = Object.entries(workflowData.edges).map(([id, edge]) => ({
		id,
		source: edge.source,
		target: edge.target,
		type: 'condition',
		data: {
			label: getEdgeLabel(edge),
			forwardCondition: edge.forwardCondition,
			backwardCondition: edge.backwardCondition,
			warningLevel: getEdgeWarningLevel(id, workflowData),
		},
	}));

	return { nodes: mappedNodes, edges: mappedEdges };
};

export const buildWorkflowFromState = (
	currentNodes: Node[],
	currentEdges: Edge[],
	preventSubagentLoops: boolean
): AgentWorkflow => {
	const workflowNodes: Record<string, WorkflowNode> = {};
	const workflowEdges: Record<string, WorkflowEdge> = {};

	const sortedNodes = [...currentNodes].sort((a, b) =>
		a.id.localeCompare(b.id)
	);
	const sortedEdges = [...currentEdges].sort((a, b) =>
		a.id.localeCompare(b.id)
	);

	sortedNodes.forEach((node) => {
		const data = node.data as Partial<WorkflowNode>;
		const baseNode = {
			type: (node.type ||
				data.type ||
				WORKFLOW_NODE_TYPES.START) as WorkflowNode['type'],
			position: node.position,
			edgeOrder: data.edgeOrder ?? [],
			label: data.label,
			uiMeta: data.uiMeta,
		};

		switch (node.type) {
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
				};
				workflowNodes[node.id] = standaloneNode;
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
			forwardCondition: data?.forwardCondition,
			backwardCondition: data?.backwardCondition,
		};
	});

	return {
		preventSubagentLoops,
		nodes: workflowNodes,
		edges: workflowEdges,
	};
};
