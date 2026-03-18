import {
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

interface UseWorkflowSyncOptions {
	workflow?: AgentWorkflow;
	allowDefaultInit: boolean;
	onWorkflowChange?: (workflow: AgentWorkflow) => void;
	reactFlowInstance: ReactFlowInstance | null;
	nodes: Node[];
	edges: Edge[];
	setNodes: Dispatch<SetStateAction<Node[]>>;
	setEdges: Dispatch<SetStateAction<Edge[]>>;
	buildDefaultWorkflow: () => AgentWorkflow;
	mapWorkflowToNodes: (workflow: AgentWorkflow) => {
		nodes: Node[];
		edges: Edge[];
	};
	buildWorkflowFromState: (nodes: Node[], edges: Edge[]) => AgentWorkflow;
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

const buildCanvasSignature = (
	buildWorkflowFromState: (nodes: Node[], edges: Edge[]) => AgentWorkflow,
	nodes: Node[],
	edges: Edge[]
) => serializeWorkflow(buildWorkflowFromState(nodes, edges));

const getNodeMeasurements = (nodes: Node[]): NodeLayoutMeasurement[] =>
	nodes.map((node) => ({
		id: node.id,
		x: node.position.x,
		y: node.position.y,
		width: typeof node.width === 'number' ? node.width : 0,
		height: typeof node.height === 'number' ? node.height : 0,
	}));

const buildLayoutSignature = (
	nodeMeasurements: NodeLayoutMeasurement[],
	edges: Edge[]
) => {
	const nodeSignature = nodeMeasurements
		.map(({ id, x, y, width, height }) => `${id}:${x}:${y}:${width}:${height}`)
		.sort()
		.join('|');
	const edgeSignature = edges
		.map(({ id, source, target }) => `${id}:${source}:${target}`)
		.sort()
		.join('|');

	return `${nodeSignature}::${edgeSignature}`;
};

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
	allowDefaultInit,
	onWorkflowChange,
	setNodes,
	setEdges,
	buildDefaultWorkflow,
	mapWorkflowToNodes,
	refs,
}: Omit<
	UseWorkflowSyncOptions,
	'nodes' | 'edges' | 'buildWorkflowFromState'
> & { refs: WorkflowSyncRefs }) => {
	const workflowSignature = useMemo(() => {
		if (!workflow) {
			return null;
		}

		return serializeWorkflow(workflow);
	}, [workflow]);

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
		const nextWorkflowSignature = serializeWorkflow(nextWorkflow);
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

		const { nodes: mappedNodes, edges: mappedEdges } =
			mapWorkflowToNodes(nextWorkflow);

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
	buildWorkflowFromState,
	refs,
}: Pick<
	UseWorkflowSyncOptions,
	'workflow' | 'nodes' | 'edges' | 'onWorkflowChange' | 'buildWorkflowFromState'
> & { refs: WorkflowSyncRefs }) => {
	const canvasSignature = useMemo(
		() => buildCanvasSignature(buildWorkflowFromState, nodes, edges),
		[buildWorkflowFromState, edges, nodes]
	);

	useEffect(() => {
		if (!refs.hasHydratedRef.current || !onWorkflowChange) {
			return;
		}

		if (refs.isHydratingRef.current) {
			refs.isHydratingRef.current = false;
			return;
		}

		if (refs.lastEmittedCanvasSignatureRef.current === canvasSignature) {
			return;
		}

		const nextWorkflow = buildWorkflowFromState(nodes, edges);
		const workflowSignature = workflow ? serializeWorkflow(workflow) : null;

		refs.lastEmittedCanvasSignatureRef.current = canvasSignature;
		refs.lastAppliedWorkflowSignatureRef.current = canvasSignature;
		refs.pendingCanvasSignaturesRef.current = [
			...refs.pendingCanvasSignaturesRef.current.filter(
				(signature) => signature !== canvasSignature
			),
			canvasSignature,
		];

		if (workflowSignature === canvasSignature) {
			return;
		}

		onWorkflowChange(nextWorkflow);
	}, [
		buildWorkflowFromState,
		canvasSignature,
		edges,
		nodes,
		onWorkflowChange,
		refs,
		workflow,
	]);
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
}: Pick<UseWorkflowSyncOptions, 'nodes' | 'edges' | 'setEdges'>) => {
	const nodeMeasurements = useMemo(() => getNodeMeasurements(nodes), [nodes]);
	const layoutSignature = useMemo(
		() => buildLayoutSignature(nodeMeasurements, edges),
		[edges, nodeMeasurements]
	);

	useEffect(() => {
		if (nodes.length === 0 || edges.length === 0) {
			return;
		}

		const nextEdges = syncEdgeHandles(edges, nodeMeasurements);

		if (nextEdges !== edges) {
			setEdges(nextEdges);
		}
	}, [edges, layoutSignature, nodeMeasurements, nodes.length, setEdges]);
};

const useWorkflowSync = ({
	workflow,
	allowDefaultInit,
	onWorkflowChange,
	reactFlowInstance,
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
		allowDefaultInit,
		onWorkflowChange,
		reactFlowInstance,
		setNodes,
		setEdges,
		buildDefaultWorkflow,
		mapWorkflowToNodes,
		refs,
	});

	useWorkflowEmission({
		workflow,
		nodes,
		edges,
		onWorkflowChange,
		buildWorkflowFromState,
		refs,
	});

	useWorkflowViewportFit({
		reactFlowInstance,
		nodes,
		refs,
	});

	useEdgeHandleSync({
		nodes,
		edges,
		setEdges,
	});
};

export default useWorkflowSync;
