import type { MouseEvent } from 'react';
import { createContext, useContext } from 'react';
import type {
	Connection,
	Edge,
	Node,
	OnEdgesChange,
	OnNodesChange,
} from '@xyflow/react';
import type { WorkflowNode } from '~/models/AgentWorkflowModel';
import type {
	WorkflowEdgeData,
	WorkflowLayoutDirection,
	WorkflowNodeData,
} from './WorkflowSection.types';

type WorkflowState = {
	nodes: Node<WorkflowNodeData>[];
	edges: Edge<WorkflowEdgeData>[];
	onNodesChange: OnNodesChange<Node<WorkflowNodeData>>;
	onEdgesChange: OnEdgesChange<Edge<WorkflowEdgeData>>;
	onConnect: (connection: Connection) => void;
	isValidConnection: (connection: Connection | Edge) => boolean;
	onNodeClick: (event: MouseEvent, node: Node) => void;
	onEdgeClick: (
		event: MouseEvent,
		edge: Edge,
		initialTab?: 'forward' | 'backward'
	) => void;
	onAddFromStart: (id: string) => void;
	onAddBranch: (id: string, type: WorkflowNode['type']) => void;
	onDeleteNode: (id: string) => void;
	onDuplicateNode: (id: string) => void;
	createStartFlow: () => void;
	preventSubagentLoops: boolean;
	onPreventSubagentLoopsChange: (checked: boolean) => void;
	workflowJson: string;
	hasWorkflow: boolean;
	isEmptyState: boolean;
	layoutDirection: WorkflowLayoutDirection;
	onLayoutDirectionChange: (direction: WorkflowLayoutDirection) => void;
	organizeLayout: () => void;
};

const WorkflowStateContext = createContext<WorkflowState | null>(null);

const useWorkflowState = () => {
	const context = useContext(WorkflowStateContext);
	if (!context) {
		throw new Error(
			'useWorkflowState must be used within WorkflowStateContext'
		);
	}
	return context;
};

export { WorkflowStateContext, useWorkflowState };
export type { WorkflowState };
