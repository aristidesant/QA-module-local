import { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import {
	Background,
	BackgroundVariant,
	Controls,
	ReactFlow,
	type ReactFlowInstance,
	type NodeTypes,
	useNodesState,
	useEdgesState,
	MarkerType,
	type Node,
	type Edge,
} from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import StartNodeComponent from '../nodes/StartNode';
import EndNodeComponent from '../nodes/EndNode';
import SubagentNodeComponent from '../nodes/SubagentNode';
import WorkflowNodeWrapper from '../WorkflowNode';
import { WORKFLOW_NODE_TYPES, createNodeTypes } from '../nodeTypes';
import ConditionEdge from '../edges/ConditionEdge';
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
import styles from './WorkflowCanvas.module.css';

const defaultEdgeOptions = {
	style: { strokeWidth: 2, stroke: '#868e96' },
	type: 'smoothstep',
	markerEnd: {
		type: MarkerType.ArrowClosed,
		width: 15,
		height: 15,
		color: '#868e96',
	},
};

const serializeWorkflow = (workflow: AgentWorkflow): string => {
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

interface WorkflowCanvasProps {
	workflow?: AgentWorkflow;
	onWorkflowChange?: (workflow: AgentWorkflow) => void;
	preventSubagentLoops?: boolean;
	allowDefaultInit?: boolean;
	onNodeSelect?: (nodeId: string | null) => void;
}

const WorkflowCanvas = ({
	workflow,
	onWorkflowChange,
	preventSubagentLoops = false,
	allowDefaultInit = true,
	onNodeSelect,
}: WorkflowCanvasProps) => {
	const workflowNodeCount = workflow?.nodes
		? Object.keys(workflow.nodes).length
		: 0;
	console.log('[WorkflowCanvas] mount:', {
		workflowNodeCount,
		allowDefaultInit,
	});
	const { t } = useTranslation('campaigns');
	const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	const isApplyingWorkflowRef = useRef(false);
	const lastAppliedWorkflowRef = useRef<string | null>(null);
	const lastEmittedWorkflowRef = useRef<string | null>(null);
	const lastWorkflowNodeCountRef = useRef<number>(0);
	const hasAppliedInitialWorkflowRef = useRef(false);

	const edgeTypes = useMemo(
		() => ({
			condition: ConditionEdge,
		}),
		[]
	);

	// Clear cache when workflow changes significantly (e.g., from default to real data)
	useEffect(() => {
		if (workflow && workflow.nodes) {
			const currentNodeCount = Object.keys(workflow.nodes).length;
			const previousNodeCount = lastWorkflowNodeCountRef.current;

			// If node count changed significantly (more than just adding one node), clear cache
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
				data: {
					forwardCondition: { type: 'unconditional' },
					backwardCondition: undefined,
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
		[setNodes, setEdges]
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
				data: {
					forwardCondition: { type: 'unconditional' },
					backwardCondition: undefined,
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
		[createNodeDataByType, setEdges, setNodes]
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
				const timestamp = Date.now();
				const copyId = `node-${timestamp}`;
				const copyPosition = {
					x: sourceNode.position.x + 40,
					y: sourceNode.position.y + 40,
				};
				const data = sourceNode.data as Record<string, unknown>;
				return [
					...prev,
					{
						...sourceNode,
						id: copyId,
						position: copyPosition,
						data: {
							...data,
							position: copyPosition,
							edgeOrder: [],
						},
					},
				];
			});
		},
		[setNodes]
	);

	const buildDefaultWorkflow = useCallback((): AgentWorkflow => {
		const startNode: StartNode = {
			type: WORKFLOW_NODE_TYPES.START,
			position: { x: 250, y: 50 },
			edgeOrder: [],
		};
		return {
			preventSubagentLoops: preventSubagentLoops ?? false,
			nodes: { start_node: startNode },
			edges: {},
		};
	}, [preventSubagentLoops]);

	const mapWorkflowToNodes = useCallback(
		(workflowData: AgentWorkflow): { nodes: Node[]; edges: Edge[] } => {
			const normalizeSubagent = (
				node: OverrideAgentNode | StandaloneAgentNode
			) => {
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
						existing?.prompt ??
						legacyPrompt ??
						legacyTransferMessage ??
						undefined,
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

			const mappedNodes = Object.entries(workflowData.nodes).map(
				([id, node]) => ({
					id,
					type: node.type,
					position: node.position,
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
				})
			);

			const nodeTypeById = Object.fromEntries(
				Object.entries(workflowData.nodes).map(([id, node]) => [id, node.type])
			);

			const getConditionLabel = (
				condition?: WorkflowEdge['forwardCondition']
			): string | null => {
				if (!condition) return null;
				if ('label' in condition && condition.label) return condition.label;
				if (condition.type === 'llm') return condition.condition;
				return null;
			};

			const getEdgeLabel = (edge: WorkflowEdge): string | null => {
				const sourceType = nodeTypeById[edge.source];
				if (sourceType === WORKFLOW_NODE_TYPES.START) return null;

				const forwardLabel = getConditionLabel(edge.forwardCondition);
				const backwardLabel = getConditionLabel(edge.backwardCondition);

				return (
					forwardLabel ||
					backwardLabel ||
					t('form.workflow.edge.configure', {
						defaultValue: 'Configure condition',
					})
				);
			};

			const mappedEdges = Object.entries(workflowData.edges).map(
				([id, edge]) => ({
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
				})
			);

			return { nodes: mappedNodes, edges: mappedEdges };
		},
		[t]
	);

	const buildWorkflowFromState = useCallback(
		(currentNodes: Node[], currentEdges: Edge[]): AgentWorkflow => {
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
								(data as StandaloneAgentNode)
									.enableTransferredAgentFirstMessage ?? false,
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
		},
		[preventSubagentLoops]
	);

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
		buildDefaultWorkflow,
		mapWorkflowToNodes,
		onWorkflowChange,
		reactFlowInstance,
		setEdges,
		setNodes,
		allowDefaultInit,
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
	}, [buildWorkflowFromState, edges, nodes, onWorkflowChange]);

	useEffect(() => {
		setNodes((prev) => {
			const startNodeIds = new Set(
				prev
					.filter((node) => node.type === WORKFLOW_NODE_TYPES.START)
					.map((node) => node.id)
			);
			const startNodesWithEdges = new Set(
				edges
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
						onDeleteNode: handleDeleteNode,
						onCopyNode: handleCopyNode,
					},
				};
			});

			return hasChanges ? nextNodes : prev;
		});
	}, [
		edges,
		handleAddNode,
		handleAddNodeWithType,
		handleCopyNode,
		handleDeleteNode,
		setNodes,
	]);

	const isValidConnection = useCallback(
		(connection: Edge | { source: string | null; target: string | null }) => {
			if (!connection.source || !connection.target) return false;
			const sourceNode = nodes.find((node) => node.id === connection.source);
			const targetNode = nodes.find((node) => node.id === connection.target);
			if (!sourceNode || !targetNode) return false;
			if (sourceNode.type !== WORKFLOW_NODE_TYPES.START) return true;
			return targetNode.type === WORKFLOW_NODE_TYPES.STANDALONE_AGENT;
		},
		[nodes]
	);

	const nodeTypes: NodeTypes = useMemo(
		() =>
			createNodeTypes({
				[WORKFLOW_NODE_TYPES.START]: StartNodeComponent,
				[WORKFLOW_NODE_TYPES.END]: EndNodeComponent,
				[WORKFLOW_NODE_TYPES.STANDALONE_AGENT]: SubagentNodeComponent,
				[WORKFLOW_NODE_TYPES.TOOL]: WorkflowNodeWrapper,
				[WORKFLOW_NODE_TYPES.OVERRIDE_AGENT]: SubagentNodeComponent,
				[WORKFLOW_NODE_TYPES.PHONE_NUMBER]: WorkflowNodeWrapper,
			}),
		[]
	);

	return (
		<div className={styles.canvas}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodeClick={(_, node) => onNodeSelect?.(node.id)}
				onPaneClick={() => onNodeSelect?.(null)}
				onInit={setReactFlowInstance}
				isValidConnection={isValidConnection}
				defaultEdgeOptions={defaultEdgeOptions}
				fitView
				className={styles.flow}
			>
				<Background variant={BackgroundVariant.Dots} gap={16} size={1} />
				<Controls className={styles.controls} />
			</ReactFlow>
		</div>
	);
};

export default WorkflowCanvas;
