import {
	createContext,
	useContext,
	useMemo,
	type PropsWithChildren,
} from 'react';
import type { WorkflowNodeType } from '../nodeTypes';

interface AddNodeVariantPayload {
	type: WorkflowNodeType;
	variant?: 'transfer' | 'subagent';
}

interface WorkflowCanvasActionsContextValue {
	addNode: (
		parentNodeId: string,
		parentPosition: { x: number; y: number }
	) => string | undefined;
	addNodeWithType: (
		parentNodeId: string,
		parentPosition: { x: number; y: number },
		nodeType: WorkflowNodeType
	) => string | undefined;
	addNodeWithVariant: (
		parentNodeId: string,
		parentPosition: { x: number; y: number },
		payload: AddNodeVariantPayload
	) => string | undefined;
	deleteNode: (nodeId: string) => void;
	copyNode: (nodeId: string) => void;
	openEdge: (edgeId: string) => void;
	deleteEdge: (edgeId: string) => void;
	/** Open the edge context menu at the given screen coordinates. */
	openEdgeContextMenu: (edgeId: string, pos: { x: number; y: number }) => void;
	groupSelectedNodes: () => void;
	ungroupNodes: (groupNodeId: string) => void;
	addNodeToGroup: (groupNodeId: string) => void;
	cloneGroup: (groupNodeId: string) => void;
	addNewNodeToGroup: (
		groupNodeId: string,
		nodeType: WorkflowNodeType,
		variant?: 'transfer' | 'subagent'
	) => string | undefined;
	addExistingNodeToGroup: (groupNodeId: string, existingNodeId: string) => void;
	/** @deprecated No-op kept for compatibility. Edge actions are no longer shown. */
	clearEdgeActions: () => void;
}

const WorkflowCanvasActionsContext =
	createContext<WorkflowCanvasActionsContextValue | null>(null);

interface WorkflowCanvasActionsProviderProps extends PropsWithChildren {
	actions: WorkflowCanvasActionsContextValue;
}

export const WorkflowCanvasActionsProvider = ({
	actions,
	children,
}: WorkflowCanvasActionsProviderProps) => {
	const contextValue = useMemo(() => actions, [actions]);

	return (
		<WorkflowCanvasActionsContext.Provider value={contextValue}>
			{children}
		</WorkflowCanvasActionsContext.Provider>
	);
};

export const useWorkflowCanvasActions = () => {
	const context = useContext(WorkflowCanvasActionsContext);

	if (!context) {
		throw new Error(
			'useWorkflowCanvasActions must be used within WorkflowCanvasActionsProvider'
		);
	}

	return context;
};
