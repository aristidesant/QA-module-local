import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	type Dispatch,
	type MutableRefObject,
	type SetStateAction,
} from 'react';
import type { Edge, Node, ReactFlowInstance } from '@xyflow/react';
import { calculateHandlePositionsFromPoints } from '../../utils/handlePositionCalculator';
import { HANDLE_ID_MAP, serializeWorkflow } from '../WorkflowCanvas.helpers';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import type { NodeGroups } from '~/models/CampaignsModel';
import type { BuildWorkflowResult } from '../WorkflowCanvas.helpers';

interface UseWorkflowSyncOptions {
	workflow?: AgentWorkflow;
	nodeGroups?: NodeGroups;
	allowDefaultInit: boolean;
	onWorkflowChange?: (workflow: AgentWorkflow) => void;
	onNodeGroupsChange?: (nodeGroups: NodeGroups) => void;
	reactFlowInstance: ReactFlowInstance | null;
	/** Ref that is true while the user is actively dragging a node */
	isDraggingRef: MutableRefObject<boolean>;
	nodes: Node[];
	edges: Edge[];
	setNodes: Dispatch<SetStateAction<Node[]>>;
	setEdges: Dispatch<SetStateAction<Edge[]>>;
	buildDefaultWorkflow: () => AgentWorkflow;
	mapWorkflowToNodes: (
		workflow: AgentWorkflow,
		nodeGroups?: NodeGroups
	) => {
		nodes: Node[];
		edges: Edge[];
	};
	buildWorkflowFromState: (nodes: Node[], edges: Edge[]) => BuildWorkflowResult;
}

interface WorkflowSyncRefs {
	isHydratingRef: MutableRefObject<boolean>;
	hasHydratedRef: MutableRefObject<boolean>;
	lastAppliedWorkflowSignatureRef: MutableRefObject<string | null>;
	lastEmittedCanvasSignatureRef: MutableRefObject<string | null>;
	pendingCanvasSignaturesRef: MutableRefObject<string[]>;
	pendingFitWorkflowSignatureRef: MutableRefObject<string | null>;
	lastFittedWorkflowSignatureRef: MutableRefObject<string | null>;
}

interface NodeLayoutMeasurement {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

type WorkflowHydrationMode = 'external' | 'default-init' | 'skip';

const getWorkflowHydrationMode = ({
	workflow,
	allowDefaultInit,
}: Pick<
	UseWorkflowSyncOptions,
	'workflow' | 'allowDefaultInit'
>): WorkflowHydrationMode => {
	if (workflow) {
		return 'external';
	}

	if (allowDefaultInit) {
		return 'default-init';
	}

	return 'skip';
};

/**
 * Build a combined signature for both workflow and nodeGroups.
 * Used so that hydration & emission can compare the same format.
 */
const buildCombinedSignature = (
	workflow: AgentWorkflow,
	groups?: NodeGroups
): string => {
	const workflowSig = serializeWorkflow(workflow);
	const safeGroups = groups ?? {};
	const groupsSig = JSON.stringify(
		Object.entries(safeGroups).sort(([a], [b]) => a.localeCompare(b))
	);
	return `${workflowSig}::groups::${groupsSig}`;
};

const buildCanvasSignature = (
	buildWorkflowFromState: (nodes: Node[], edges: Edge[]) => BuildWorkflowResult,
	nodes: Node[],
	edges: Edge[]
) => {
	const result = buildWorkflowFromState(nodes, edges);
	return buildCombinedSignature(result.workflow, result.nodeGroups);
};

const getNodeMeasurements = (nodes: Node[]): NodeLayoutMeasurement[] =>
	nodes.map((node) => ({
		id: node.id,
		x: node.position.x,
		y: node.position.y,
		width: typeof node.width === 'number' ? node.width : 0,
		height: typeof node.height === 'number' ? node.height : 0,
	}));

const syncEdgeHandles = (
	currentEdges: Edge[],
	nodeMeasurements: NodeLayoutMeasurement[]
) => {
	const nodeMap = new Map(nodeMeasurements.map((node) => [node.id, node]));
	let hasChanges = false;

	const nextEdges = currentEdges.map((edge) => {
		const sourceNode = nodeMap.get(edge.source);
		const targetNode = nodeMap.get(edge.target);

		if (!sourceNode || !targetNode) {
			return edge;
		}

		const sourceCenter = {
			x: sourceNode.x + sourceNode.width / 2,
			y: sourceNode.y + sourceNode.height / 2,
		};
		const targetCenter = {
			x: targetNode.x + targetNode.width / 2,
			y: targetNode.y + targetNode.height / 2,
		};
		const { sourcePosition, targetPosition } =
			calculateHandlePositionsFromPoints(sourceCenter, targetCenter);
		const sourceHandle = HANDLE_ID_MAP.source[sourcePosition];
		const targetHandle = HANDLE_ID_MAP.target[targetPosition];

		if (
			edge.sourceHandle === sourceHandle &&
			edge.targetHandle === targetHandle
		) {
			return edge;
		}

		hasChanges = true;

		return {
			...edge,
			sourceHandle,
			targetHandle,
		};
	});

	return hasChanges ? nextEdges : currentEdges;
};

const useWorkflowHydration = ({
	workflow,
	nodeGroups,
	allowDefaultInit,
	onWorkflowChange,
	setNodes,
	setEdges,
	buildDefaultWorkflow,
	mapWorkflowToNodes,
	refs,
}: Omit<
	UseWorkflowSyncOptions,
	| 'nodes'
	| 'edges'
	| 'isDraggingRef'
	| 'buildWorkflowFromState'
	| 'onNodeGroupsChange'
> & { refs: WorkflowSyncRefs }) => {
	const workflowSignature = useMemo(() => {
		if (!workflow) {
			return null;
		}

		return buildCombinedSignature(workflow, nodeGroups);
	}, [workflow, nodeGroups]);

	useEffect(() => {
		const hydrationMode = getWorkflowHydrationMode({
			workflow,
			allowDefaultInit,
		});

		if (hydrationMode === 'skip') {
			return;
		}

		const nextWorkflow =
			hydrationMode === 'external' && workflow
				? workflow
				: buildDefaultWorkflow();
		const nextWorkflowSignature = buildCombinedSignature(
			nextWorkflow,
			nodeGroups
		);
		const pendingCanvasSignatures = refs.pendingCanvasSignaturesRef.current;
		const pendingCanvasSignatureIndex = pendingCanvasSignatures.indexOf(
			nextWorkflowSignature
		);

		if (pendingCanvasSignatureIndex >= 0) {
			refs.pendingCanvasSignaturesRef.current = pendingCanvasSignatures.slice(
				pendingCanvasSignatureIndex + 1
			);

			if (pendingCanvasSignatureIndex !== pendingCanvasSignatures.length - 1) {
				return;
			}
		}

		if (
			refs.lastAppliedWorkflowSignatureRef.current === nextWorkflowSignature
		) {
			return;
		}

		const { nodes: mappedNodes, edges: mappedEdges } = mapWorkflowToNodes(
			nextWorkflow,
			nodeGroups
		);

		refs.isHydratingRef.current = true;
		refs.hasHydratedRef.current = true;
		refs.lastAppliedWorkflowSignatureRef.current = nextWorkflowSignature;
		refs.lastEmittedCanvasSignatureRef.current = nextWorkflowSignature;
		refs.pendingFitWorkflowSignatureRef.current = nextWorkflowSignature;

		setNodes(mappedNodes);
		setEdges(mappedEdges);

		if (
			hydrationMode === 'default-init' &&
			onWorkflowChange &&
			workflowSignature !== nextWorkflowSignature
		) {
			onWorkflowChange(nextWorkflow);
		}
	}, [
		allowDefaultInit,
		buildDefaultWorkflow,
		mapWorkflowToNodes,
		nodeGroups,
		onWorkflowChange,
		refs,
		setEdges,
		setNodes,
		workflow,
		workflowSignature,
	]);
};

const useWorkflowEmission = ({
	workflow,
	nodes,
	edges,
	onWorkflowChange,
	onNodeGroupsChange,
	buildWorkflowFromState,
	isDraggingRef,
	refs,
}: Pick<
	UseWorkflowSyncOptions,
	| 'workflow'
	| 'nodes'
	| 'edges'
	| 'onWorkflowChange'
	| 'onNodeGroupsChange'
	| 'buildWorkflowFromState'
	| 'isDraggingRef'
> & { refs: WorkflowSyncRefs }) => {
	// Keep latest values in refs so the flush callback always reads fresh data
	// without needing to be recreated on every render.
	const latestRef = useRef({ nodes, edges, workflow });
	latestRef.current = { nodes, edges, workflow };

	const pendingFlushRef = useRef(false);

	const flush = useCallback(() => {
		pendingFlushRef.current = false;

		if (!refs.hasHydratedRef.current || !onWorkflowChange) return;

		const { nodes: n, edges: e, workflow: w } = latestRef.current;
		const canvasSignature = buildCanvasSignature(buildWorkflowFromState, n, e);

		if (refs.lastEmittedCanvasSignatureRef.current === canvasSignature) return;

		const result = buildWorkflowFromState(n, e);
		const workflowSignature = w ? serializeWorkflow(w) : null;

		refs.lastEmittedCanvasSignatureRef.current = canvasSignature;
		refs.lastAppliedWorkflowSignatureRef.current = canvasSignature;
		refs.pendingCanvasSignaturesRef.current = [
			...refs.pendingCanvasSignaturesRef.current.filter(
				(sig) => sig !== canvasSignature
			),
			canvasSignature,
		];

		const nextWorkflowSignature = serializeWorkflow(result.workflow);
		if (workflowSignature !== nextWorkflowSignature) {
			onWorkflowChange(result.workflow);
		}

		onNodeGroupsChange?.(result.nodeGroups);
	}, [buildWorkflowFromState, onNodeGroupsChange, onWorkflowChange, refs]);

	useEffect(() => {
		if (!refs.hasHydratedRef.current || !onWorkflowChange) return;

		if (refs.isHydratingRef.current) {
			refs.isHydratingRef.current = false;
			return;
		}

		// While dragging, mark that a flush is needed but don't do expensive work.
		if (isDraggingRef.current) {
			pendingFlushRef.current = true;
			return;
		}

		// Not dragging — flush immediately.
		flush();
	}, [flush, isDraggingRef, nodes, edges, onWorkflowChange, refs]);

	// Expose pendingFlushRef so the drag-stop handler can trigger it.
	return { pendingFlushRef, flush };
};

const useWorkflowViewportFit = ({
	reactFlowInstance,
	nodes,
	refs,
}: Pick<UseWorkflowSyncOptions, 'reactFlowInstance' | 'nodes'> & {
	refs: WorkflowSyncRefs;
}) => {
	useEffect(() => {
		const pendingWorkflowSignature =
			refs.pendingFitWorkflowSignatureRef.current;

		if (!reactFlowInstance || !pendingWorkflowSignature) {
			return;
		}

		if (
			refs.lastFittedWorkflowSignatureRef.current === pendingWorkflowSignature
		) {
			refs.pendingFitWorkflowSignatureRef.current = null;
			return;
		}

		if (nodes.length === 0) {
			return;
		}

		refs.lastFittedWorkflowSignatureRef.current = pendingWorkflowSignature;
		refs.pendingFitWorkflowSignatureRef.current = null;

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
	}, [nodes.length, reactFlowInstance, refs]);
};

const useEdgeHandleSync = ({
	nodes,
	edges,
	setEdges,
	isDraggingRef,
}: Pick<
	UseWorkflowSyncOptions,
	'nodes' | 'edges' | 'setEdges' | 'isDraggingRef'
>) => {
	const latestRef = useRef({ nodes, edges });
	latestRef.current = { nodes, edges };

	const pendingFlushRef = useRef(false);

	const flush = useCallback(() => {
		pendingFlushRef.current = false;
		const { nodes: n, edges: e } = latestRef.current;
		if (n.length === 0 || e.length === 0) return;

		const measurements = getNodeMeasurements(n);
		const nextEdges = syncEdgeHandles(e, measurements);
		if (nextEdges !== e) {
			setEdges(nextEdges);
		}
	}, [setEdges]);

	useEffect(() => {
		if (nodes.length === 0 || edges.length === 0) return;

		// While dragging, mark dirty but skip expensive work.
		if (isDraggingRef.current) {
			pendingFlushRef.current = true;
			return;
		}

		// Not dragging — sync immediately.
		flush();
	}, [edges, flush, isDraggingRef, nodes]);

	return { pendingFlushRef, flush };
};

const useWorkflowSync = ({
	workflow,
	nodeGroups,
	allowDefaultInit,
	onWorkflowChange,
	onNodeGroupsChange,
	reactFlowInstance,
	isDraggingRef,
	nodes,
	edges,
	setNodes,
	setEdges,
	buildDefaultWorkflow,
	mapWorkflowToNodes,
	buildWorkflowFromState,
}: UseWorkflowSyncOptions) => {
	const refs = {
		isHydratingRef: useRef(false),
		hasHydratedRef: useRef(false),
		lastAppliedWorkflowSignatureRef: useRef<string | null>(null),
		lastEmittedCanvasSignatureRef: useRef<string | null>(null),
		pendingCanvasSignaturesRef: useRef<string[]>([]),
		pendingFitWorkflowSignatureRef: useRef<string | null>(null),
		lastFittedWorkflowSignatureRef: useRef<string | null>(null),
	};

	useWorkflowHydration({
		workflow,
		nodeGroups,
		allowDefaultInit,
		onWorkflowChange,
		reactFlowInstance,
		setNodes,
		setEdges,
		buildDefaultWorkflow,
		mapWorkflowToNodes,
		refs,
	});

	const emission = useWorkflowEmission({
		workflow,
		nodes,
		edges,
		onWorkflowChange,
		onNodeGroupsChange,
		buildWorkflowFromState,
		isDraggingRef,
		refs,
	});

	useWorkflowViewportFit({
		reactFlowInstance,
		nodes,
		refs,
	});

	const edgeSync = useEdgeHandleSync({
		nodes,
		edges,
		setEdges,
		isDraggingRef,
	});

	/**
	 * Call this from the drag-stop handler to flush any work
	 * that was deferred while the user was dragging.
	 */
	const flushOnDragStop = useCallback(() => {
		if (edgeSync.pendingFlushRef.current) {
			edgeSync.flush();
		}
		if (emission.pendingFlushRef.current) {
			emission.flush();
		}
	}, [edgeSync, emission]);

	return { flushOnDragStop };
};

export default useWorkflowSync;
