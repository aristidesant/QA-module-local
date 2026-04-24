import { useCallback, useMemo, useRef, useState } from 'react';
import {
	ReactFlowProvider,
	applyEdgeChanges,
	reconnectEdge,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import type { Connection, Edge, Node, ReactFlowInstance } from '@xyflow/react';
import type { EdgeChange } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import StartNodeComponent from '../nodes/StartNode';
import EndNodeComponent from '../nodes/EndNode';
import StandaloneAgentNodeComponent from '../nodes/StandaloneAgentNode';
import SubagentNodeComponent from '../nodes/SubagentNode';
import ToolNodeComponent from '../nodes/ToolNode';
import PhoneNumberNodeComponent from '../nodes/PhoneNumberNode/PhoneNumberNode';
import GroupNodeComponent from '../nodes/GroupNode';
import {
	WORKFLOW_NODE_TYPES,
	createNodeTypes,
	type WorkflowNodeType,
} from '../nodeTypes';
import ConditionEdge from '../edges/ConditionEdge';
import { updateWorkflowEdge } from '../forms/nodeFormUtils';
import type { AgentWorkflow, WorkflowEdge } from '~/models/AgentWorkflowModel';
import FlowView from './FlowView';
import EdgeConditionModalWrapper from './EdgeConditionModalWrapper';
import { WorkflowCanvasActionsProvider } from './WorkflowCanvasActionsContext';
import useWorkflowNodes, { createNodeDataByType } from './useWorkflowNodes';
import useWorkflowSync from './useWorkflowSync';
import useNodeCollisions from './useNodeCollisions';
import {
	buildDefaultWorkflow,
	buildWorkflowFromState,
	defaultEdgeOptions,
	mapWorkflowToNodes,
	WORKFLOW_NODE_DRAG_HANDLE_SELECTOR,
} from './WorkflowCanvas.helpers';
import type { BuildWorkflowResult } from './WorkflowCanvas.helpers';
import type { NodeGroups } from '~/models/CampaignsModel';
import { generateUUIDv4 } from '~/utils/uuidUtils';
import styles from './WorkflowCanvas.module.css';

interface WorkflowCanvasProps {
	workflow?: AgentWorkflow;
	onWorkflowChange?: (workflow: AgentWorkflow) => void;
	nodeGroups?: NodeGroups;
	onNodeGroupsChange?: (nodeGroups: NodeGroups) => void;
	preventSubagentLoops?: boolean;
	allowDefaultInit?: boolean;
	onNodeSelect?: (nodeId: string | null) => void;
	layoutMode?: 'compact' | 'fullscreen';
}

interface AddNodeVariantPayload {
	type: WorkflowNodeType;
	variant?: 'transfer' | 'subagent';
}

interface ValidateConnectionOptions {
	ignoreEdgeId?: string;
	allowStartEdgeReplacement?: boolean;
}

const WorkflowCanvasInner = ({
	workflow,
	onWorkflowChange,
	nodeGroups,
	onNodeGroupsChange,
	preventSubagentLoops = false,
	allowDefaultInit = true,
	onNodeSelect,
	layoutMode = 'compact',
}: WorkflowCanvasProps) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
	const [edges, setEdges] = useEdgesState<Edge>([]);
	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	const [modalOpened, setModalOpened] = useState(false);
	const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
	const [selectedEdgeActionId, setSelectedEdgeActionId] = useState<
		string | null
	>(null);
	const nodesRef = useRef<Node[]>(nodes);
	const edgesRef = useRef<Edge[]>(edges);
	const isDraggingRef = useRef(false);

	nodesRef.current = nodes;
	edgesRef.current = edges;

	const closeEdgeActions = useCallback(() => {
		setSelectedEdgeActionId(null);
	}, []);

	const removeEdgeFromSourceNode = useCallback(
		(currentNodes: Node[], edgeToRemove: Pick<Edge, 'id' | 'source'>): Node[] =>
			currentNodes.map((node) => {
				if (node.id !== edgeToRemove.source) {
					return node;
				}

				const data = node.data as { edgeOrder?: string[] };
				const edgeOrder = data.edgeOrder ?? [];
				const nextEdgeOrder = edgeOrder.filter((id) => id !== edgeToRemove.id);

				if (nextEdgeOrder.length === edgeOrder.length) {
					return node;
				}

				return {
					...node,
					data: {
						...data,
						edgeOrder: nextEdgeOrder,
					},
				};
			}),
		[]
	);

	const handleOpenEdgeModal = useCallback(
		(edgeId: string) => {
			closeEdgeActions();
			setSelectedEdgeId(edgeId);
			setModalOpened(true);
		},
		[closeEdgeActions]
	);

	const handleCloseModal = useCallback(() => {
		setModalOpened(false);
		setSelectedEdgeId(null);
	}, []);

	const validateConnection = useCallback(
		(
			connection: Edge | { source: string | null; target: string | null },
			options: ValidateConnectionOptions = {}
		) => {
			if (!connection.source || !connection.target) return false;

			const sourceNode = nodesRef.current.find(
				(node) => node.id === connection.source
			);
			const targetNode = nodesRef.current.find(
				(node) => node.id === connection.target
			);

			if (!sourceNode || !targetNode) return false;
			if (sourceNode.type !== WORKFLOW_NODE_TYPES.START) return true;

			const { ignoreEdgeId, allowStartEdgeReplacement = false } = options;

			const hasOutgoingEdge = edgesRef.current.some(
				(edge) =>
					edge.source === sourceNode.id &&
					(ignoreEdgeId === undefined || edge.id !== ignoreEdgeId)
			);

			if (hasOutgoingEdge && !allowStartEdgeReplacement) return false;

			return (
				targetNode.type === WORKFLOW_NODE_TYPES.STANDALONE_AGENT ||
				targetNode.type === WORKFLOW_NODE_TYPES.OVERRIDE_AGENT
			);
		},
		[]
	);

	const handleSaveEdgeCondition = useCallback(
		(
			edgeId: string,
			forwardCondition?: WorkflowEdge['forwardCondition'],
			backwardCondition?: WorkflowEdge['backwardCondition']
		) => {
			if (!workflow) return;

			const nextWorkflow = updateWorkflowEdge(workflow, edgeId, {
				forwardCondition,
				backwardCondition,
			});

			if (nextWorkflow) {
				onWorkflowChange?.(nextWorkflow);
			}
		},
		[onWorkflowChange, workflow]
	);

	const edgeTypes = useMemo(
		() => ({
			condition: ConditionEdge,
		}),
		[]
	);

	const nodeTypes = useMemo(
		() =>
			createNodeTypes({
				[WORKFLOW_NODE_TYPES.START]: StartNodeComponent,
				[WORKFLOW_NODE_TYPES.END]: EndNodeComponent,
				[WORKFLOW_NODE_TYPES.STANDALONE_AGENT]: StandaloneAgentNodeComponent,
				[WORKFLOW_NODE_TYPES.TOOL]: ToolNodeComponent,
				[WORKFLOW_NODE_TYPES.OVERRIDE_AGENT]: SubagentNodeComponent,
				[WORKFLOW_NODE_TYPES.PHONE_NUMBER]: PhoneNumberNodeComponent,
				[WORKFLOW_NODE_TYPES.GROUP]: GroupNodeComponent,
			}),
		[]
	);

	const {
		handleAddNode,
		handleAddNodeWithType,
		handleAddNodeWithVariant,
		handleDeleteNode,
		handleCopyNode,
	} = useWorkflowNodes({
		nodesRef,
		edgesRef,
		setNodes,
		setEdges,
		t,
	});

	const { resolveNodeCollisions } = useNodeCollisions({ setNodes });

	const buildDefaultWorkflowCallback = useCallback(
		() => buildDefaultWorkflow(preventSubagentLoops),
		[preventSubagentLoops]
	);

	const mapWorkflowToNodesCallback = useCallback(
		(workflowData: AgentWorkflow, groups?: NodeGroups) =>
			mapWorkflowToNodes(workflowData, t, groups),
		[t]
	);

	const buildWorkflowFromStateCallback = useCallback(
		(currentNodes: Node[], currentEdges: Edge[]): BuildWorkflowResult =>
			buildWorkflowFromState(currentNodes, currentEdges, preventSubagentLoops),
		[preventSubagentLoops]
	);

	const { flushOnDragStop } = useWorkflowSync({
		workflow,
		nodeGroups,
		allowDefaultInit,
		onWorkflowChange,
		onNodeGroupsChange,
		reactFlowInstance,
		nodes,
		edges,
		setNodes,
		setEdges,
		buildDefaultWorkflow: buildDefaultWorkflowCallback,
		mapWorkflowToNodes: mapWorkflowToNodesCallback,
		buildWorkflowFromState: buildWorkflowFromStateCallback,
		isDraggingRef,
	});

	const handleNodeDragStart = useCallback(() => {
		isDraggingRef.current = true;
	}, [isDraggingRef]);

	const handleNodeDragStop = useCallback(() => {
		isDraggingRef.current = false;
		resolveNodeCollisions();
		flushOnDragStop();
	}, [flushOnDragStop, isDraggingRef, resolveNodeCollisions]);

	const isValidConnection = useCallback(
		(connection: Edge | { source: string | null; target: string | null }) =>
			validateConnection(connection, { allowStartEdgeReplacement: true }),
		[validateConnection]
	);

	const edgeReconnectSuccessful = useRef(true);

	const handleReconnectStart = useCallback(() => {
		edgeReconnectSuccessful.current = false;
	}, []);

	const handleReconnect = useCallback(
		(oldEdge: Edge, newConnection: Connection) => {
			if (!newConnection.source || !newConnection.target) return;
			if (
				!validateConnection(newConnection, {
					ignoreEdgeId: oldEdge.id,
					allowStartEdgeReplacement: true,
				})
			)
				return;

			edgeReconnectSuccessful.current = true;

			closeEdgeActions();
			setNodes((currentNodes) => {
				if (oldEdge.source === newConnection.source) {
					return currentNodes;
				}

				return currentNodes.map((node) => {
					if (node.id === oldEdge.source) {
						const [updatedNode] = removeEdgeFromSourceNode([node], oldEdge);
						return updatedNode ?? node;
					}

					if (node.id !== newConnection.source) {
						return node;
					}

					const data = node.data as { edgeOrder?: string[] };
					const edgeOrder = data.edgeOrder ?? [];

					if (edgeOrder.includes(oldEdge.id)) {
						return node;
					}

					return {
						...node,
						data: {
							...data,
							edgeOrder: [...edgeOrder, oldEdge.id],
						},
					};
				});
			});
			setEdges((currentEdges) =>
				reconnectEdge(oldEdge, newConnection, currentEdges, {
					shouldReplaceId: false,
				})
			);
		},
		[
			closeEdgeActions,
			removeEdgeFromSourceNode,
			setEdges,
			setNodes,
			validateConnection,
		]
	);

	const handleReconnectEnd = useCallback(
		(_: MouseEvent | TouchEvent, _edge: Edge) => {
			edgeReconnectSuccessful.current = true;
		},
		[]
	);

	const handleEdgesChange = useCallback(
		(changes: EdgeChange<Edge>[]) => {
			const removedEdgeIds = new Set(
				changes
					.filter((change) => change.type === 'remove')
					.map((change) => change.id)
			);

			if (removedEdgeIds.size > 0) {
				closeEdgeActions();
				setNodes((currentNodes) =>
					currentNodes.map((node) => {
						const data = node.data as { edgeOrder?: string[] };
						const edgeOrder = data.edgeOrder ?? [];
						const nextEdgeOrder = edgeOrder.filter(
							(edgeId) => !removedEdgeIds.has(edgeId)
						);

						if (nextEdgeOrder.length === edgeOrder.length) {
							return node;
						}

						return {
							...node,
							data: {
								...data,
								edgeOrder: nextEdgeOrder,
							},
						};
					})
				);
			}

			setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges));
		},
		[closeEdgeActions, setEdges, setNodes]
	);

	const handleDeleteEdge = useCallback(
		(edgeId: string) => {
			closeEdgeActions();
			setModalOpened(false);
			setSelectedEdgeId((currentEdgeId) =>
				currentEdgeId === edgeId ? null : currentEdgeId
			);

			const edgeToDelete = edgesRef.current.find((edge) => edge.id === edgeId);
			if (!edgeToDelete) return;

			setNodes((currentNodes) =>
				removeEdgeFromSourceNode(currentNodes, edgeToDelete)
			);
			setEdges((currentEdges) =>
				currentEdges.filter((edge) => edge.id !== edgeId)
			);
		},
		[closeEdgeActions, removeEdgeFromSourceNode, setEdges, setNodes]
	);

	const handleConnect = useCallback(
		(connection: Connection) => {
			if (!connection.source || !connection.target) return;
			if (
				!validateConnection(connection, {
					allowStartEdgeReplacement: true,
				})
			)
				return;

			closeEdgeActions();

			const sourceNode = nodesRef.current.find(
				(node) => node.id === connection.source
			);
			const isStartSource = sourceNode?.type === WORKFLOW_NODE_TYPES.START;
			const existingStartEdge = isStartSource
				? edgesRef.current.find((edge) => edge.source === connection.source)
				: undefined;
			const edgeId = existingStartEdge?.id ?? `edge-${generateUUIDv4()}`;
			const defaultEdgeData = isStartSource
				? {
						label: null,
						sourceNodeType: WORKFLOW_NODE_TYPES.START,
					}
				: {
						label: t('form.workflow.edge.notConfigured', {
							defaultValue: 'Not configured',
						}),
						sourceNodeType: sourceNode?.type,
					};
			const nextEdge: Edge = {
				...(existingStartEdge ?? {}),
				id: edgeId,
				source: connection.source,
				target: connection.target,
				sourceHandle: connection.sourceHandle,
				targetHandle: connection.targetHandle,
				type: 'condition',
				data: isStartSource
					? {
							...(existingStartEdge?.data ?? {}),
							...defaultEdgeData,
							...(!existingStartEdge?.data?.forwardCondition
								? { forwardCondition: { type: 'unconditional' as const } }
								: {}),
						}
					: (existingStartEdge?.data ?? defaultEdgeData),
			};

			setNodes((currentNodes) =>
				currentNodes.map((node) => {
					if (node.id !== connection.source) return node;

					const data = node.data as { edgeOrder?: string[] };
					const edgeOrder = data.edgeOrder ?? [];

					if (edgeOrder.includes(edgeId)) return node;

					return {
						...node,
						data: {
							...data,
							edgeOrder: [...edgeOrder, edgeId],
						},
					};
				})
			);
			setEdges((currentEdges) => {
				if (existingStartEdge) {
					const isSameConnection =
						existingStartEdge.target === nextEdge.target &&
						existingStartEdge.sourceHandle === nextEdge.sourceHandle &&
						existingStartEdge.targetHandle === nextEdge.targetHandle;

					if (isSameConnection) return currentEdges;
				}

				const edgeAlreadyExists = currentEdges.some(
					(edge) =>
						edge.id !== edgeId &&
						edge.source === nextEdge.source &&
						edge.target === nextEdge.target &&
						edge.sourceHandle === nextEdge.sourceHandle &&
						edge.targetHandle === nextEdge.targetHandle
				);

				if (edgeAlreadyExists) return currentEdges;
				if (existingStartEdge) {
					return currentEdges.map((edge) =>
						edge.id === edgeId ? { ...edge, ...nextEdge } : edge
					);
				}

				return [...currentEdges, nextEdge];
			});
		},
		[closeEdgeActions, setEdges, setNodes, t, validateConnection]
	);

	const handleGroupSelectedNodes = useCallback(() => {
		const selectedNodes = nodesRef.current.filter(
			(n) =>
				n.selected &&
				n.type !== WORKFLOW_NODE_TYPES.START &&
				n.type !== WORKFLOW_NODE_TYPES.END &&
				n.type !== WORKFLOW_NODE_TYPES.GROUP
		);
		if (selectedNodes.length < 2) return;

		const PADDING = 40;
		const LABEL_OFFSET = 32;
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;

		selectedNodes.forEach((node) => {
			const w = (node.measured?.width ?? node.width ?? 200) as number;
			const h = (node.measured?.height ?? node.height ?? 80) as number;
			minX = Math.min(minX, node.position.x);
			minY = Math.min(minY, node.position.y);
			maxX = Math.max(maxX, node.position.x + w);
			maxY = Math.max(maxY, node.position.y + h);
		});

		const groupId = `group-${generateUUIDv4()}`;
		const groupX = minX - PADDING;
		const groupY = minY - PADDING - LABEL_OFFSET;
		const groupWidth = maxX - minX + PADDING * 2;
		const groupHeight = maxY - minY + PADDING * 2 + LABEL_OFFSET;

		const groupNode: Node = {
			id: groupId,
			type: WORKFLOW_NODE_TYPES.GROUP,
			position: { x: groupX, y: groupY },
			style: { width: groupWidth, height: groupHeight },
			data: {
				type: WORKFLOW_NODE_TYPES.GROUP,
				position: { x: groupX, y: groupY },
				label: '',
				edgeOrder: [],
			},
			selectable: true,
			focusable: true,
			dragHandle: undefined,
		};

		const childIds = new Set(selectedNodes.map((n) => n.id));

		setNodes((currentNodes) => {
			const updatedChildren = currentNodes.map((node) => {
				if (!childIds.has(node.id)) return node;
				return {
					...node,
					parentId: groupId,
					extent: 'parent' as const,
					position: {
						x: node.position.x - groupX,
						y: node.position.y - groupY,
					},
					selected: false,
				};
			});
			// Group node must appear before its children in the array
			return [groupNode, ...updatedChildren];
		});
	}, [setNodes]);

	const handleUngroupNodes = useCallback(
		(groupNodeId: string) => {
			setNodes((currentNodes) => {
				const groupNode = currentNodes.find((n) => n.id === groupNodeId);
				if (!groupNode) return currentNodes;

				const groupPos = groupNode.position;
				return currentNodes
					.filter((n) => n.id !== groupNodeId)
					.map((node) => {
						if (node.parentId !== groupNodeId) return node;
						// Convert parent-relative position to absolute canvas position
						const absolutePos = {
							x: node.position.x + groupPos.x,
							y: node.position.y + groupPos.y,
						};
						return {
							...node,
							parentId: undefined,
							extent: undefined,
							position: absolutePos,
							// Also update data.position so emission doesn't revert to
							// the old parent-relative coords on the next hydration cycle
							data: {
								...(node.data as Record<string, unknown>),
								position: absolutePos,
							},
							// Clear cached measurements so React Flow re-computes layout
							measured: undefined,
							dragging: false,
						};
					});
			});
		},
		[setNodes]
	);

	const handleAddNodeToGroup = useCallback(
		(groupNodeId: string) => {
			const groupNode = nodesRef.current.find((n) => n.id === groupNodeId);
			if (!groupNode) return;

			const groupWidth =
				typeof groupNode.style?.width === 'number'
					? groupNode.style.width
					: (groupNode.measured?.width ?? 400);
			const groupHeight =
				typeof groupNode.style?.height === 'number'
					? groupNode.style.height
					: (groupNode.measured?.height ?? 300);

			// Find children to position new node without overlap
			const children = nodesRef.current.filter(
				(n) => n.parentId === groupNodeId
			);
			const PADDING = 40;
			const LABEL_OFFSET = 32;
			const NODE_WIDTH = 200;
			const NODE_HEIGHT = 80;

			// Place new node at the center-bottom area of the group, offset if occupied
			let newX = (groupWidth - NODE_WIDTH) / 2;
			let newY = LABEL_OFFSET + PADDING;

			if (children.length > 0) {
				// Find the lowest child position and place below it
				const maxChildY = Math.max(
					...children.map(
						(c) =>
							c.position.y + (c.measured?.height ?? c.height ?? NODE_HEIGHT)
					)
				);
				newY = Math.min(maxChildY + 20, groupHeight - NODE_HEIGHT - PADDING);
			}

			const nodeId = `override_agent-${generateUUIDv4()}`;
			const newNode: Node = {
				id: nodeId,
				type: WORKFLOW_NODE_TYPES.OVERRIDE_AGENT,
				position: { x: newX, y: newY },
				parentId: groupNodeId,
				extent: 'parent' as const,
				dragHandle: '.workflowNodeDragHandle',
				data: {
					type: WORKFLOW_NODE_TYPES.OVERRIDE_AGENT,
					position: { x: newX, y: newY },
					label: '',
					edgeOrder: [],
					additionalPrompt: '',
					additionalToolIds: [],
					additionalKnowledgeBase: [],
					conversationConfig: {},
					uiMeta: { createdByUi: true },
				},
			};

			setNodes((currentNodes) => [...currentNodes, newNode]);
		},
		[setNodes]
	);

	const handleAddNewNodeToGroup = useCallback(
		(
			groupNodeId: string,
			nodeType: WorkflowNodeType,
			variant?: 'transfer' | 'subagent'
		) => {
			const groupNode = nodesRef.current.find((n) => n.id === groupNodeId);
			if (!groupNode) return;

			const groupWidth =
				typeof groupNode.style?.width === 'number'
					? groupNode.style.width
					: (groupNode.measured?.width ?? 400);
			const groupHeight =
				typeof groupNode.style?.height === 'number'
					? groupNode.style.height
					: (groupNode.measured?.height ?? 300);

			const children = nodesRef.current.filter(
				(n) => n.parentId === groupNodeId
			);
			const PADDING = 40;
			const LABEL_OFFSET = 32;
			const NODE_WIDTH = 200;
			const NODE_HEIGHT = 80;

			let newX = (groupWidth - NODE_WIDTH) / 2;
			let newY = LABEL_OFFSET + PADDING;

			if (children.length > 0) {
				const maxChildY = Math.max(
					...children.map(
						(c) =>
							c.position.y + (c.measured?.height ?? c.height ?? NODE_HEIGHT)
					)
				);
				newY = Math.min(maxChildY + 20, groupHeight - NODE_HEIGHT - PADDING);
			}

			const position = { x: newX, y: newY };
			const baseData = createNodeDataByType(nodeType, position);
			const data = variant
				? {
						...baseData,
						uiMeta: { variant, createdByUi: true },
					}
				: { ...baseData, uiMeta: { createdByUi: true } };

			const nodeId = `${nodeType}-${generateUUIDv4()}`;
			const newNode: Node = {
				id: nodeId,
				type: nodeType,
				position,
				parentId: groupNodeId,
				extent: 'parent' as const,
				dragHandle: WORKFLOW_NODE_DRAG_HANDLE_SELECTOR,
				data,
			};

			setNodes((currentNodes) => [...currentNodes, newNode]);
		},
		[setNodes]
	);

	const handleAddExistingNodeToGroup = useCallback(
		(groupNodeId: string, existingNodeId: string) => {
			const groupNode = nodesRef.current.find((n) => n.id === groupNodeId);
			const existingNode = nodesRef.current.find(
				(n) => n.id === existingNodeId
			);
			if (!groupNode || !existingNode) return;

			// Prevent adding a node that already belongs to a group
			if (existingNode.parentId) return;

			const groupPos = groupNode.position;
			const PADDING = 40;
			const LABEL_OFFSET = 32;

			// Convert absolute position to group-relative
			const relativePos = {
				x: existingNode.position.x - groupPos.x,
				y: existingNode.position.y - groupPos.y,
			};

			const nodeW = (existingNode.measured?.width ??
				existingNode.width ??
				200) as number;
			const nodeH = (existingNode.measured?.height ??
				existingNode.height ??
				80) as number;

			let groupWidth =
				typeof groupNode.style?.width === 'number'
					? groupNode.style.width
					: (groupNode.measured?.width ?? 400);
			let groupHeight =
				typeof groupNode.style?.height === 'number'
					? groupNode.style.height
					: (groupNode.measured?.height ?? 300);

			// Calculate required group size from UNCLAMPED relative position first
			const requiredWidth = Math.max(
				relativePos.x + nodeW + PADDING,
				PADDING + nodeW + PADDING
			);
			const requiredHeight = Math.max(
				relativePos.y + nodeH + PADDING,
				LABEL_OFFSET + PADDING + nodeH + PADDING
			);

			// Expand group to fit the node if necessary
			const needsExpand =
				requiredWidth > groupWidth || requiredHeight > groupHeight;
			if (needsExpand) {
				groupWidth = Math.max(groupWidth, requiredWidth);
				groupHeight = Math.max(groupHeight, requiredHeight);
			}

			// Now clamp position to the (possibly expanded) group bounds
			relativePos.x = Math.max(
				PADDING,
				Math.min(relativePos.x, groupWidth - nodeW - PADDING)
			);
			relativePos.y = Math.max(
				LABEL_OFFSET + PADDING,
				Math.min(relativePos.y, groupHeight - nodeH - PADDING)
			);

			setNodes((currentNodes) =>
				currentNodes.map((node) => {
					if (node.id === existingNodeId) {
						return {
							...node,
							parentId: groupNodeId,
							extent: 'parent' as const,
							position: relativePos,
						};
					}
					if (node.id === groupNodeId && needsExpand) {
						return {
							...node,
							style: {
								...node.style,
								width: groupWidth,
								height: groupHeight,
							},
						};
					}
					return node;
				})
			);
		},
		[setNodes]
	);

	const handleCloneGroup = useCallback(
		(groupNodeId: string) => {
			const CLONE_GAP = 40;
			const newGroupId = `group-${generateUUIDv4()}`;

			setNodes((currentNodes) => {
				const groupNode = currentNodes.find((n) => n.id === groupNodeId);
				if (!groupNode) return currentNodes;

				// Offset to the RIGHT of the original group (not diagonally behind it)
				const groupWidth =
					typeof groupNode.style?.width === 'number'
						? groupNode.style.width
						: (groupNode.measured?.width ?? 400);

				const clonedGroupPos = {
					x: groupNode.position.x + groupWidth + CLONE_GAP,
					y: groupNode.position.y,
				};

				// Differentiate the cloned group label
				const originalData = groupNode.data as Record<string, unknown>;
				const originalLabel =
					typeof originalData.label === 'string' && originalData.label
						? originalData.label
						: t('form.workflow.group.defaultLabel');
				const clonedLabel = `${originalLabel} (${t('form.workflow.group.copy', { defaultValue: 'Copy' })})`;

				const clonedGroup: Node = {
					...groupNode,
					id: newGroupId,
					position: { ...clonedGroupPos },
					data: {
						...originalData,
						label: clonedLabel,
						position: { ...clonedGroupPos },
					},
					selected: false,
					style: groupNode.style ? { ...groupNode.style } : undefined,
					// Clear measured so React Flow re-measures the clone independently
					measured: undefined,
				};

				// Clone all children with fully unique IDs and independent data
				const children = currentNodes.filter((n) => n.parentId === groupNodeId);
				const clonedChildren: Node[] = children.map((child) => {
					const childCopyId = `${child.type ?? 'node'}-${generateUUIDv4()}`;
					const childData = JSON.parse(JSON.stringify(child.data)) as Record<
						string,
						unknown
					>;
					return {
						...child,
						id: childCopyId,
						parentId: newGroupId,
						extent: 'parent' as const,
						position: { x: child.position.x, y: child.position.y },
						selected: false,
						// Clear measured/dragging so React Flow treats clone as independent
						measured: undefined,
						dragging: false,
						data: {
							...childData,
							edgeOrder: [],
						},
					};
				});

				// Group node must appear before children in the array
				return [...currentNodes, clonedGroup, ...clonedChildren];
			});

			// nodeGroups metadata (label, color, childNodeIds) will be computed
			// automatically by the emission cycle via buildWorkflowFromState.
			// Do NOT call onNodeGroupsChange here — doing so with childNodeIds: []
			// races with hydration and strips parentId from cloned children.
		},
		[setNodes, t]
	);

	const actions = useMemo(
		() => ({
			addNode: (
				parentNodeId: string,
				parentPosition: { x: number; y: number }
			) => {
				closeEdgeActions();
				handleAddNode(parentNodeId, parentPosition);
			},
			addNodeWithType: (
				parentNodeId: string,
				parentPosition: { x: number; y: number },
				nodeType: WorkflowNodeType
			) => {
				closeEdgeActions();
				handleAddNodeWithType(parentNodeId, parentPosition, nodeType);
			},
			addNodeWithVariant: (
				parentNodeId: string,
				parentPosition: { x: number; y: number },
				payload: AddNodeVariantPayload
			) => {
				closeEdgeActions();
				handleAddNodeWithVariant(parentNodeId, parentPosition, payload);
			},
			deleteNode: (nodeId: string) => {
				closeEdgeActions();
				setModalOpened(false);
				setSelectedEdgeId(null);

				// When deleting a group, batch-remove the group AND all its children
				// in a single state update to avoid stale-ref issues.
				const targetNode = nodesRef.current.find((n) => n.id === nodeId);
				if (targetNode?.type === WORKFLOW_NODE_TYPES.GROUP) {
					const idsToRemove = new Set<string>([nodeId]);
					nodesRef.current
						.filter((n) => n.parentId === nodeId)
						.forEach((n) => idsToRemove.add(n.id));

					const removedEdgeIds = new Set(
						edgesRef.current
							.filter(
								(edge) =>
									idsToRemove.has(edge.source) || idsToRemove.has(edge.target)
							)
							.map((edge) => edge.id)
					);

					setEdges((cur) => cur.filter((edge) => !removedEdgeIds.has(edge.id)));
					setNodes((cur) =>
						cur
							.filter((n) => !idsToRemove.has(n.id))
							.map((n) => {
								const data = n.data as { edgeOrder?: string[] };
								const edgeOrder = data.edgeOrder ?? [];
								const cleaned = edgeOrder.filter(
									(eid) => !removedEdgeIds.has(eid)
								);
								if (cleaned.length === edgeOrder.length) return n;
								return {
									...n,
									data: { ...data, edgeOrder: cleaned },
								};
							})
					);
					return;
				}

				handleDeleteNode(nodeId);
			},
			copyNode: (nodeId: string) => {
				closeEdgeActions();
				handleCopyNode(nodeId);
			},
			openEdge: handleOpenEdgeModal,
			deleteEdge: handleDeleteEdge,
			toggleEdgeActions: (edgeId: string) =>
				setSelectedEdgeActionId((currentEdgeId) =>
					currentEdgeId === edgeId ? null : edgeId
				),
			clearEdgeActions: closeEdgeActions,
			groupSelectedNodes: handleGroupSelectedNodes,
			ungroupNodes: handleUngroupNodes,
			addNodeToGroup: handleAddNodeToGroup,
			cloneGroup: handleCloneGroup,
			addNewNodeToGroup: (
				groupNodeId: string,
				nodeType: WorkflowNodeType,
				variant?: 'transfer' | 'subagent'
			) => {
				closeEdgeActions();
				handleAddNewNodeToGroup(groupNodeId, nodeType, variant);
			},
			addExistingNodeToGroup: (groupNodeId: string, existingNodeId: string) => {
				closeEdgeActions();
				handleAddExistingNodeToGroup(groupNodeId, existingNodeId);
			},
		}),
		[
			closeEdgeActions,
			edgesRef,
			handleAddNode,
			handleAddNodeWithType,
			handleAddNodeWithVariant,
			handleCopyNode,
			handleDeleteEdge,
			handleDeleteNode,
			handleGroupSelectedNodes,
			handleOpenEdgeModal,
			handleUngroupNodes,
			handleAddNodeToGroup,
			handleCloneGroup,
			handleAddNewNodeToGroup,
			handleAddExistingNodeToGroup,
			nodesRef,
			setEdges,
			setNodes,
		]
	);

	return (
		<WorkflowCanvasActionsProvider
			actions={actions}
			selectedEdgeActionId={selectedEdgeActionId}
			onSelectedEdgeActionChange={setSelectedEdgeActionId}
		>
			<div
				className={`${styles.canvas} ${
					layoutMode === 'fullscreen'
						? styles.canvasFullscreen
						: styles.canvasCompact
				}`}
			>
				<FlowView
					nodes={nodes}
					edges={edges}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					onNodesChange={onNodesChange}
					onEdgesChange={handleEdgesChange}
					onConnect={handleConnect}
					onReconnect={handleReconnect}
					onReconnectStart={handleReconnectStart}
					onReconnectEnd={handleReconnectEnd}
					onNodeSelect={onNodeSelect}
					onCanvasClick={closeEdgeActions}
					onNodeDragStart={handleNodeDragStart}
					onNodeDragStop={handleNodeDragStop}
					onInit={setReactFlowInstance}
					isValidConnection={isValidConnection}
					defaultEdgeOptions={defaultEdgeOptions}
					flowClassName={styles.flow}
					controlsClassName={styles.controls}
				/>
			</div>

			<EdgeConditionModalWrapper
				workflow={workflow}
				selectedEdgeId={selectedEdgeId}
				modalOpened={modalOpened}
				onClose={handleCloseModal}
				onSave={handleSaveEdgeCondition}
			/>
		</WorkflowCanvasActionsProvider>
	);
};

const WorkflowCanvas = (props: WorkflowCanvasProps) => (
	<ReactFlowProvider>
		<WorkflowCanvasInner {...props} />
	</ReactFlowProvider>
);

export default WorkflowCanvas;
