import type { MouseEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	addEdge,
	MarkerType,
	Position,
	useEdgesState,
	useNodesState,
	type Connection,
	type Edge,
	type Node,
} from '@xyflow/react';
import type {
	AgentWorkflow,
	BoolExpr,
	ForwardCondition,
	WorkflowEdge,
	WorkflowNode,
} from '~/models/AgentWorkflowModel';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useTools } from '~/queries/toolQueries';
import WorkflowNodeConfig from './WorkflowNodeConfig';
import WorkflowEdgeConfig from './WorkflowEdgeConfig';
import { WorkflowStateContext } from './WorkflowStateContext';
import type {
	ConditionData,
	WorkflowEdgeData,
	WorkflowLayoutDirection,
	WorkflowNodeData,
	WorkflowNodeVariant,
} from './WorkflowSection.types';

type WorkflowStateProviderProps = {
	children: ReactNode;
};

const DEFAULT_PREVENT_SUBAGENT_LOOPS = false;
const EMPTY_EXPRESSION: BoolExpr = { type: 'and_operator', children: [] };
const STANDALONE_OFFSET_X = 280;
const BRANCH_OFFSET_X = 280;
const BRANCH_OFFSET_Y = 140;
const LAYOUT_NODE_GAP = 120;
const LAYOUT_LEVEL_GAP = 200;
const DEFAULT_LAYOUT_DIRECTION: WorkflowLayoutDirection = 'horizontal';

const updateNodeConnectionPositions = (
	nodes: Node<WorkflowNodeData>[],
	direction: WorkflowLayoutDirection
): Node<WorkflowNodeData>[] =>
	nodes.map((node) => {
		const isHorizontal = direction === 'horizontal';
		return {
			...node,
			sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
			targetPosition: isHorizontal ? Position.Left : Position.Top,
		};
	});

const createEmptyWorkflow = (
	preventSubagentLoops: boolean = DEFAULT_PREVENT_SUBAGENT_LOOPS
): AgentWorkflow => ({
	nodes: {},
	edges: {},
	preventSubagentLoops,
});

const truncateText = (value: string, maxLength = 40) =>
	value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;

const getNodeVariant = (type: WorkflowNode['type']): WorkflowNodeVariant => {
	if (type === 'start') {
		return 'start';
	}
	if (type === 'standalone_agent') {
		return 'standalone';
	}
	if (type === 'end') {
		return 'end';
	}
	return 'default';
};

const buildNodeLabel = (
	node: WorkflowNode,
	nodeId: string,
	availableTools: Record<string, string> = {}
): string => {
	switch (node.type) {
		case 'start':
			return 'Start';
		case 'end':
			return 'End';
		case 'tool':
			if (node.label) return node.label;
			if (node.tools?.length === 1) {
				const toolId = node.tools[0].toolId;
				return availableTools[toolId] || toolId;
			}
			return 'Dispatch tool';
		case 'override_agent':
			return node.label || 'Subagent';
		case 'phone_number':
			return node.transferDestination?.phoneNumber
				? `Phone: ${node.transferDestination.phoneNumber}`
				: 'Phone transfer';
		case 'standalone_agent':
			return node.agentId
				? `Agent Transfer: ${node.agentId}`
				: 'Agent Transfer';
		default:
			return nodeId;
	}
};

const createNodeData = (
	node: WorkflowNode,
	nodeId: string,
	availableTools: Record<string, string> = {}
): WorkflowNodeData => {
	let toolLabels: string[] | undefined;

	if (node.type === 'tool') {
		toolLabels = node.tools?.map((t) => availableTools[t.toolId] || t.toolId);
	} else if (node.type === 'override_agent') {
		toolLabels = node.additionalToolIds?.map((id) => availableTools[id] || id);
	} else if (node.type === 'standalone_agent') {
		// Standalone agents (Agent Transfer) don't typically show tool labels on the card
		toolLabels = undefined;
	}

	return {
		label: buildNodeLabel(node, nodeId, availableTools),
		workflowType: node.type,
		variant: getNodeVariant(node.type),
		canConnectIn: node.type !== 'start',
		canConnectOut: node.type !== 'end',
		subagent:
			node.type === 'override_agent' ? (node as any).subagent : undefined,
		toolLabels,
	};
};

const mapConditionToEdgeMeta = (condition: ForwardCondition): ConditionData => {
	switch (condition.type) {
		case 'llm':
			return {
				conditionType: 'llm',
				condition: condition.condition,
				label: truncateText(condition.condition || 'LLM condition'),
			};
		case 'result':
			return {
				conditionType: 'result',
				successful: condition.successful,
				label: condition.successful ? 'Result: success' : 'Result: failure',
			};
		case 'expression':
			return {
				conditionType: 'expression',
				expression: condition.expression,
				label: 'Expression',
			};
		case 'unconditional':
		default:
			return {
				conditionType: 'unconditional',
				label: 'Unconditional',
			};
	}
};

const buildForwardCondition = (data?: ConditionData): ForwardCondition => {
	if (!data) return { type: 'unconditional' };
	switch (data.conditionType) {
		case 'llm':
			return {
				type: 'llm',
				condition: data.condition ?? '',
			};
		case 'result':
			return {
				type: 'result',
				successful: data.successful ?? true,
			};
		case 'expression':
			return {
				type: 'expression',
				expression: data.expression ?? EMPTY_EXPRESSION,
			};
		case 'unconditional':
		default:
			return { type: 'unconditional' };
	}
};

const buildWorkflowNode = (
	workflowType: WorkflowNode['type'],
	position: { x: number; y: number }
): WorkflowNode => {
	const baseNode = {
		type: workflowType,
		position,
		edgeOrder: [],
	};

	switch (workflowType) {
		case 'tool':
			return { ...baseNode, type: 'tool', tools: [] };
		case 'override_agent':
			return {
				...baseNode,
				type: 'override_agent',
				label: 'Subagent',
				additionalPrompt: '',
				additionalToolIds: [],
				additionalKnowledgeBase: [],
				conversationConfig: {},
			};
		case 'phone_number':
			return {
				...baseNode,
				type: 'phone_number',
				transferType: 'conference',
				transferDestination: { type: 'phone', phoneNumber: '' },
			};
		case 'standalone_agent':
			return {
				...baseNode,
				type: 'standalone_agent',
				agentId: '',
				delayMs: 0,
				transferMessage: '',
				enableTransferredAgentFirstMessage: false,
			};
		case 'start':
		case 'end':
		default:
			return { ...baseNode, type: workflowType };
	}
};

const mapWorkflowToGraph = (
	workflow?: AgentWorkflow,
	availableTools: Record<string, string> = {}
) => {
	if (!workflow) {
		return {
			nodes: [] as Node<WorkflowNodeData>[],
			edges: [] as Edge<WorkflowEdgeData>[],
		};
	}

	const nodes = Object.entries(workflow.nodes || {}).map(([id, node]) => ({
		id,
		position: node?.position || { x: 0, y: 0 },
		data: createNodeData(node, id, availableTools),
		type: 'workflowNode',
	}));

	const edges = Object.entries(workflow.edges || {}).map(([id, edge]) => {
		const forward =
			edge.forwardCondition || (edge as any).forward_condition
				? mapConditionToEdgeMeta(
						edge.forwardCondition || (edge as any).forward_condition
					)
				: undefined;
		const backward =
			edge.backwardCondition || (edge as any).backward_condition
				? mapConditionToEdgeMeta(
						edge.backwardCondition || (edge as any).backward_condition
					)
				: undefined;

		return {
			id,
			source: edge.source,
			target: edge.target,
			type: 'workflowEdge',
			markerEnd: { type: MarkerType.ArrowClosed },
			data: { forward, backward },
		} satisfies Edge<WorkflowEdgeData>;
	});

	return { nodes, edges };
};

const buildWorkflowFromGraph = (
	nodes: Node<WorkflowNodeData>[],
	edges: Edge<WorkflowEdgeData>[],
	baseWorkflow?: AgentWorkflow
): AgentWorkflow => {
	const preventSubagentLoops =
		baseWorkflow?.preventSubagentLoops ?? DEFAULT_PREVENT_SUBAGENT_LOOPS;
	const workflow: AgentWorkflow = baseWorkflow
		? { ...baseWorkflow, preventSubagentLoops }
		: createEmptyWorkflow(preventSubagentLoops);

	const nextNodes: Record<string, WorkflowNode> = {};
	nodes.forEach((node) => {
		const workflowType = node.data?.workflowType ?? 'tool';
		const existingNode = workflow.nodes[node.id];
		const updatedNode = existingNode
			? { ...existingNode }
			: buildWorkflowNode(workflowType, node.position);

		updatedNode.position = node.position;
		updatedNode.edgeOrder = edges
			.filter((edge) => edge.source === node.id)
			.map((edge) => edge.id);

		if (updatedNode.type === 'override_agent' && node.data.subagent) {
			(updatedNode as any).subagent = node.data.subagent;
		}

		nextNodes[node.id] = updatedNode;
	});

	const nextEdges: Record<string, WorkflowEdge> = {};
	edges.forEach((edge) => {
		nextEdges[edge.id] = {
			source: edge.source,
			target: edge.target,
			forwardCondition: buildForwardCondition(edge.data?.forward),
			backwardCondition: edge.data?.backward
				? buildForwardCondition(edge.data.backward)
				: undefined,
		};
	});

	return {
		...workflow,
		nodes: nextNodes,
		edges: nextEdges,
		preventSubagentLoops,
	};
};

const createEdge = (
	source: string,
	target: string
): Edge<WorkflowEdgeData> => ({
	id: `edge-${source}-${target}-${Date.now()}`,
	source,
	target,
	type: 'workflowEdge',
	markerEnd: { type: MarkerType.ArrowClosed },
	data: {
		forward: { conditionType: 'unconditional' },
	},
});

const getLayoutedNodes = (
	nodes: Node<WorkflowNodeData>[],
	edges: Edge<WorkflowEdgeData>[],
	direction: WorkflowLayoutDirection
): Node<WorkflowNodeData>[] => {
	const nodeMap = new Map(nodes.map((node) => [node.id, node]));
	const incomingCounts = new Map<string, number>();
	const outgoing = new Map<string, string[]>();

	nodes.forEach((node) => {
		incomingCounts.set(node.id, 0);
	});

	edges.forEach((edge) => {
		if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
			return;
		}

		incomingCounts.set(edge.target, (incomingCounts.get(edge.target) ?? 0) + 1);
		const nextOutgoing = outgoing.get(edge.source) ?? [];
		nextOutgoing.push(edge.target);
		outgoing.set(edge.source, nextOutgoing);
	});

	const rootIds = nodes
		.filter((node) => (incomingCounts.get(node.id) ?? 0) === 0)
		.map((node) => node.id);

	const queue =
		rootIds.length > 0
			? [...rootIds]
			: nodes.slice(0, 1).map((node) => node.id);
	const depths = new Map<string, number>();
	queue.forEach((id) => depths.set(id, 0));

	while (queue.length > 0) {
		const nodeId = queue.shift();
		if (!nodeId) {
			continue;
		}
		const depth = depths.get(nodeId) ?? 0;
		const targets = outgoing.get(nodeId) ?? [];

		targets.forEach((target) => {
			const nextDepth = Math.max(depths.get(target) ?? 0, depth + 1);
			depths.set(target, nextDepth);
			const nextIncoming = (incomingCounts.get(target) ?? 0) - 1;
			incomingCounts.set(target, nextIncoming);
			if (nextIncoming === 0) {
				queue.push(target);
			}
		});
	}

	nodes.forEach((node) => {
		if (!depths.has(node.id)) {
			depths.set(node.id, 0);
		}
	});

	const levelMap = new Map<number, Node<WorkflowNodeData>[]>();
	nodes.forEach((node) => {
		const depth = depths.get(node.id) ?? 0;
		const group = levelMap.get(depth) ?? [];
		group.push(node);
		levelMap.set(depth, group);
	});

	const isHorizontal = direction === 'horizontal';
	const baseX = 80;
	const baseY = 80;
	const positions = new Map<string, { x: number; y: number }>();

	[...levelMap.entries()]
		.sort(([a], [b]) => a - b)
		.forEach(([depth, groupNodes]) => {
			const sorted = [...groupNodes].sort((a, b) =>
				isHorizontal ? a.position.y - b.position.y : a.position.x - b.position.x
			);

			sorted.forEach((node, index) => {
				const x = isHorizontal
					? baseX + depth * LAYOUT_LEVEL_GAP
					: baseX + index * LAYOUT_NODE_GAP;
				const y = isHorizontal
					? baseY + index * LAYOUT_NODE_GAP
					: baseY + depth * LAYOUT_LEVEL_GAP;
				positions.set(node.id, { x, y });
			});
		});

	return nodes.map((node) => {
		const position = positions.get(node.id);
		return position ? { ...node, position } : node;
	});
};

const WorkflowStateProvider = ({ children }: WorkflowStateProviderProps) => {
	const [layoutDirection, setLayoutDirection] =
		useState<WorkflowLayoutDirection>(DEFAULT_LAYOUT_DIRECTION);
	const form = useCampaignFormContext();
	const { setRightComponent } = useCampaignsStore((state) => state);
	const workflowFromForm = form.values.agentConfig?.workflow;
	const { data: allTools = [] } = useTools();

	const availableTools = useMemo(() => {
		const map: Record<string, string> = {};
		allTools.forEach((t) => {
			map[t.id.toString()] = t.name;
		});
		return map;
	}, [allTools]);

	const agentConfigRef = useRef(form.values.agentConfig);
	const lastSyncedWorkflowRef = useRef<string | null>(null);
	const edgesRef = useRef<Edge<WorkflowEdgeData>[]>([]);

	useEffect(() => {
		agentConfigRef.current = form.values.agentConfig;
	}, [form.values.agentConfig]);

	const initialGraph = useMemo(() => {
		const graph = mapWorkflowToGraph(workflowFromForm, availableTools);
		return {
			nodes: updateNodeConnectionPositions(graph.nodes, layoutDirection),
			edges: graph.edges,
		};
	}, [workflowFromForm, availableTools, layoutDirection]);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);

	useEffect(() => {
		edgesRef.current = edges;
	}, [edges]);

	const handleLayoutDirectionChange = useCallback(
		(direction: WorkflowLayoutDirection) => {
			setLayoutDirection(direction);
			setNodes((current) => {
				const layoutedNodes = getLayoutedNodes(
					current,
					edgesRef.current,
					direction
				);
				return updateNodeConnectionPositions(layoutedNodes, direction);
			});
		},
		[setNodes]
	);

	const handleOrganizeLayout = useCallback(() => {
		setNodes((current) => {
			const layoutedNodes = getLayoutedNodes(
				current,
				edgesRef.current,
				layoutDirection
			);
			return updateNodeConnectionPositions(layoutedNodes, layoutDirection);
		});
	}, [layoutDirection, setNodes]);

	const getSyncKey = useCallback(
		(wf: AgentWorkflow | null | undefined) =>
			JSON.stringify({
				workflow: wf ?? null,
				availableTools,
			}),
		[availableTools]
	);

	useEffect(() => {
		const syncKey = getSyncKey(workflowFromForm);

		if (syncKey === lastSyncedWorkflowRef.current) {
			return;
		}

		const { nodes: nextNodes, edges: nextEdges } = mapWorkflowToGraph(
			workflowFromForm,
			availableTools
		);

		lastSyncedWorkflowRef.current = syncKey;
		setNodes(updateNodeConnectionPositions(nextNodes, layoutDirection));
		setEdges(nextEdges);
	}, [
		setEdges,
		setNodes,
		workflowFromForm,
		availableTools,
		getSyncKey,
		layoutDirection,
	]);

	const syncWorkflow = useCallback(
		(nextWorkflow: AgentWorkflow) => {
			const serializedWorkflow = JSON.stringify(nextWorkflow);
			const serializedCurrent = JSON.stringify(workflowFromForm ?? null);

			if (serializedWorkflow === serializedCurrent) {
				return;
			}

			lastSyncedWorkflowRef.current = getSyncKey(nextWorkflow);
			form.setFieldValue('agentConfig', {
				...(agentConfigRef.current ?? {}),
				workflow: nextWorkflow,
			});
		},
		[form, workflowFromForm, getSyncKey]
	);

	useEffect(() => {
		if (!workflowFromForm && nodes.length === 0 && edges.length === 0) {
			return;
		}

		const nextWorkflow = buildWorkflowFromGraph(nodes, edges, workflowFromForm);
		syncWorkflow(nextWorkflow);
	}, [edges, nodes, syncWorkflow, workflowFromForm]);

	const workflowPreview = useMemo(() => {
		if (!workflowFromForm && nodes.length === 0 && edges.length === 0) {
			return null;
		}

		return buildWorkflowFromGraph(nodes, edges, workflowFromForm);
	}, [edges, nodes, workflowFromForm]);

	const workflowJson = useMemo(
		() => (workflowPreview ? JSON.stringify(workflowPreview, null, 2) : ''),
		[workflowPreview]
	);

	useEffect(() => {
		const startNode = nodes.find((node) => node.data.workflowType === 'start');
		if (startNode) {
			return;
		}

		setNodes((current: Node<WorkflowNodeData>[]) => {
			const hasStart = current.some(
				(node) => node.data.workflowType === 'start'
			);
			if (hasStart) {
				return current;
			}

			const startId = `start-${Date.now()}`;
			const startPosition = { x: 80, y: 80 };
			const startWorkflowNode = buildWorkflowNode('start', startPosition);
			const startNode: Node<WorkflowNodeData> = {
				id: startId,
				position: startPosition,
				data: createNodeData(startWorkflowNode, startId),
				type: 'workflowNode',
			};

			return updateNodeConnectionPositions(
				[...current, startNode],
				layoutDirection
			);
		});
	}, [layoutDirection, nodes, setNodes]);

	const getNodeTypeById = useCallback(
		(id: string): WorkflowNode['type'] | undefined =>
			nodes.find((node) => node.id === id)?.data.workflowType,
		[nodes]
	);

	const isValidConnection = useCallback(
		(connection: Connection | Edge) => {
			if (!connection.source || !connection.target) {
				return false;
			}

			const sourceType = getNodeTypeById(connection.source);
			const targetType = getNodeTypeById(connection.target);

			if (!sourceType || !targetType) {
				return false;
			}

			if (targetType === 'start') {
				return false;
			}

			if (sourceType === 'end') {
				return false;
			}

			if (sourceType === 'start') {
				const hasOutgoing = edges.some(
					(edge) => edge.source === connection.source
				);
				return !hasOutgoing && targetType === 'override_agent';
			}

			if (sourceType === 'standalone_agent') {
				return true;
			}

			return true;
		},
		[edges, getNodeTypeById]
	);

	const handleConnect = useCallback(
		(connection: Connection) => {
			if (!connection.source || !connection.target) {
				return;
			}

			if (!isValidConnection(connection)) {
				return;
			}

			const newEdge: Edge<WorkflowEdgeData> = createEdge(
				connection.source,
				connection.target
			);

			setEdges((current) => addEdge(newEdge, current));
		},
		[isValidConnection, setEdges]
	);

	const handleCreateStandaloneFromStart = useCallback(
		(startNodeId: string) => {
			const startNode = nodes.find((node) => node.id === startNodeId);
			if (!startNode) {
				return;
			}

			const existingStandalone = nodes.find(
				(node) => node.data.workflowType === 'override_agent'
			);
			const standaloneId =
				existingStandalone?.id ?? `override_agent-${Date.now()}`;

			if (!existingStandalone) {
				const position = {
					x: startNode.position.x + STANDALONE_OFFSET_X,
					y: startNode.position.y,
				};
				const newWorkflowNode = buildWorkflowNode('override_agent', position);

				setNodes((current: Node<WorkflowNodeData>[]) => {
					const hasStandalone = current.some(
						(node) => node.data.workflowType === 'standalone_agent'
					);
					if (hasStandalone) {
						return current;
					}

					const newNode: Node<WorkflowNodeData> = {
						id: standaloneId,
						position,
						data: createNodeData(newWorkflowNode, standaloneId),
						type: 'workflowNode',
					};

					return updateNodeConnectionPositions(
						[...current, newNode],
						layoutDirection
					);
				});
			}

			setEdges((current: Edge<WorkflowEdgeData>[]) => {
				const edgeExists = current.some(
					(edge) => edge.source === startNodeId && edge.target === standaloneId
				);
				if (edgeExists) {
					return current;
				}

				return [...current, createEdge(startNodeId, standaloneId)];
			});
		},
		[layoutDirection, nodes, setEdges, setNodes]
	);

	const handleAddBranchFromStandalone = useCallback(
		(sourceId: string, nodeType: WorkflowNode['type']) => {
			const nodeId = `${nodeType}-${Date.now()}`;

			setNodes((current: Node<WorkflowNodeData>[]) => {
				const sourceNode = current.find((node) => node.id === sourceId);
				if (!sourceNode) {
					return current;
				}

				const branchCount = edgesRef.current.filter(
					(edge) => edge.source === sourceId
				).length;

				const position = {
					x: sourceNode.position.x + BRANCH_OFFSET_X,
					y: sourceNode.position.y + branchCount * BRANCH_OFFSET_Y,
				};

				const newWorkflowNode = buildWorkflowNode(nodeType, position);

				const newNode: Node<WorkflowNodeData> = {
					id: nodeId,
					position,
					data: createNodeData(newWorkflowNode, nodeId),
					type: 'workflowNode',
				};

				return updateNodeConnectionPositions(
					[...current, newNode],
					layoutDirection
				);
			});

			setEdges((current: Edge<WorkflowEdgeData>[]) => [
				...current,
				createEdge(sourceId, nodeId),
			]);
		},
		[layoutDirection, setEdges, setNodes]
	);

	const handleDeleteNode = useCallback(
		(nodeId: string) => {
			setNodes((current) => current.filter((node) => node.id !== nodeId));
			setEdges((current) =>
				current.filter(
					(edge) => edge.source !== nodeId && edge.target !== nodeId
				)
			);
		},
		[setEdges, setNodes]
	);

	const handleDuplicateNode = useCallback(
		(nodeId: string) => {
			setNodes((current) => {
				const nodeToDuplicate = current.find((node) => node.id === nodeId);
				if (!nodeToDuplicate) return current;

				const newNodeId = `${nodeToDuplicate.data.workflowType}-${Date.now()}`;
				const newNode: Node<WorkflowNodeData> = {
					...nodeToDuplicate,
					id: newNodeId,
					position: {
						x: nodeToDuplicate.position.x + 40,
						y: nodeToDuplicate.position.y + 40,
					},
					selected: false,
				};

				// If there's underlying data in the form, we should copy it too
				if (workflowFromForm?.nodes[nodeId]) {
					const originalWorkflowNode = workflowFromForm.nodes[nodeId];
					const duplicatedWorkflowNode = {
						...originalWorkflowNode,
						position: newNode.position,
						edgeOrder: [],
					};

					const nextWorkflow = {
						...workflowFromForm,
						nodes: {
							...workflowFromForm.nodes,
							[newNodeId]: duplicatedWorkflowNode,
						},
					};
					syncWorkflow(nextWorkflow);
				}

				return updateNodeConnectionPositions(
					[...current, newNode],
					layoutDirection
				);
			});
		},
		[layoutDirection, syncWorkflow, workflowFromForm]
	);

	const handleCreateStartFlow = useCallback(() => {
		setNodes((current: Node<WorkflowNodeData>[]) => {
			const hasStart = current.some(
				(node) => node.data.workflowType === 'start'
			);
			if (hasStart) {
				return current;
			}

			const startId = `start-${Date.now()}`;
			const startPosition = { x: 80, y: 80 };

			const startWorkflowNode = buildWorkflowNode('start', startPosition);

			const startNode: Node<WorkflowNodeData> = {
				id: startId,
				position: startPosition,
				data: createNodeData(startWorkflowNode, startId),
				type: 'workflowNode',
			};

			return updateNodeConnectionPositions(
				[...current, startNode],
				layoutDirection
			);
		});
	}, [layoutDirection, setNodes]);

	const onNodeClick = useCallback(
		(_: MouseEvent, node: Node) => {
			setRightComponent(
				<WorkflowNodeConfig
					nodeId={node.id}
					onClose={() => setRightComponent(null)}
				/>
			);
		},
		[setRightComponent]
	);

	const onEdgeClick = useCallback(
		(_: MouseEvent, edge: Edge, initialTab?: 'forward' | 'backward') => {
			setRightComponent(
				<WorkflowEdgeConfig
					edgeId={edge.id}
					initialTab={initialTab}
					onClose={() => setRightComponent(null)}
				/>
			);
		},
		[setRightComponent]
	);

	const preventSubagentLoops =
		workflowFromForm?.preventSubagentLoops ?? DEFAULT_PREVENT_SUBAGENT_LOOPS;

	const hasWorkflow = nodes.length > 0 || edges.length > 0;

	const handlePreventSubagentLoopsChange = useCallback(
		(checked: boolean) => {
			const nextWorkflow = buildWorkflowFromGraph(
				nodes,
				edges,
				workflowFromForm
			);
			nextWorkflow.preventSubagentLoops = checked;
			syncWorkflow(nextWorkflow);
		},
		[edges, nodes, syncWorkflow, workflowFromForm]
	);

	const isEmptyState = nodes.length === 0 && edges.length === 0;

	return (
		<WorkflowStateContext.Provider
			value={{
				nodes,
				edges,
				onNodesChange,
				onEdgesChange,
				onConnect: handleConnect,
				isValidConnection,
				onNodeClick,
				onEdgeClick,
				onAddFromStart: handleCreateStandaloneFromStart,
				onAddBranch: handleAddBranchFromStandalone,
				onDeleteNode: handleDeleteNode,
				onDuplicateNode: handleDuplicateNode,
				createStartFlow: handleCreateStartFlow,
				preventSubagentLoops,
				onPreventSubagentLoopsChange: handlePreventSubagentLoopsChange,
				workflowJson,
				hasWorkflow,
				isEmptyState,
				layoutDirection,
				onLayoutDirectionChange: handleLayoutDirectionChange,
				organizeLayout: handleOrganizeLayout,
			}}
		>
			{children}
		</WorkflowStateContext.Provider>
	);
};

export default WorkflowStateProvider;
