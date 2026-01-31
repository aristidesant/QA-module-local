import React, { createContext, useContext } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { AgentWorkflow, WorkflowNode } from '~/models/AgentWorkflowModel';

interface WorkflowStateContextType {
	nodes: Node[];
	edges: Edge[];
	setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
	setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
	addNode: (node: WorkflowNode, parentNodeId?: string) => void;
	removeNode: (nodeId: string) => void;
	workflowData: AgentWorkflow | null;
	setWorkflowData: (data: AgentWorkflow | null) => void;
}

const WorkflowStateContext = createContext<
	WorkflowStateContextType | undefined
>(undefined);

export const WorkflowStateProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<WorkflowStateContext.Provider value={{} as WorkflowStateContextType}>
			{children}
		</WorkflowStateContext.Provider>
	);
};

export const useWorkflowState = () => {
	const context = useContext(WorkflowStateContext);
	if (!context) {
		throw new Error(
			'useWorkflowState must be used within a WorkflowStateProvider'
		);
	}
	return context;
};

export default WorkflowStateContext;
