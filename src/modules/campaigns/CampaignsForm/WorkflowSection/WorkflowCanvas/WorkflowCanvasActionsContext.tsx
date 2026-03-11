import {
	createContext,
	useEffect,
	useContext,
	useMemo,
	useRef,
	type PropsWithChildren,
} from 'react';
import { useStore } from 'zustand';
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { WorkflowNodeType } from '../nodeTypes';

interface AddNodeVariantPayload {
	type: WorkflowNodeType;
	variant?: 'transfer' | 'subagent';
}

interface WorkflowCanvasActionsContextValue {
	addNode: (
		parentNodeId: string,
		parentPosition: { x: number; y: number }
	) => void;
	addNodeWithType: (
		parentNodeId: string,
		parentPosition: { x: number; y: number },
		nodeType: WorkflowNodeType
	) => void;
	addNodeWithVariant: (
		parentNodeId: string,
		parentPosition: { x: number; y: number },
		payload: AddNodeVariantPayload
	) => void;
	deleteNode: (nodeId: string) => void;
	copyNode: (nodeId: string) => void;
	openEdge: (edgeId: string) => void;
	deleteEdge: (edgeId: string) => void;
	toggleEdgeActions: (edgeId: string) => void;
	clearEdgeActions: () => void;
}

interface WorkflowCanvasEdgeUiState {
	selectedEdgeActionId: string | null;
	setSelectedEdgeActionId: (edgeId: string | null) => void;
}

type WorkflowCanvasEdgeUiStore = StoreApi<WorkflowCanvasEdgeUiState>;

const WorkflowCanvasActionsContext =
	createContext<WorkflowCanvasActionsContextValue | null>(null);

const WorkflowCanvasEdgeUiContext =
	createContext<WorkflowCanvasEdgeUiStore | null>(null);

interface WorkflowCanvasActionsProviderProps extends PropsWithChildren {
	actions: WorkflowCanvasActionsContextValue;
	selectedEdgeActionId: string | null;
	onSelectedEdgeActionChange: (edgeId: string | null) => void;
}

export const WorkflowCanvasActionsProvider = ({
	actions,
	selectedEdgeActionId,
	onSelectedEdgeActionChange,
	children,
}: WorkflowCanvasActionsProviderProps) => {
	const edgeUiStoreRef = useRef<WorkflowCanvasEdgeUiStore | null>(null);

	if (!edgeUiStoreRef.current) {
		edgeUiStoreRef.current = createStore<WorkflowCanvasEdgeUiState>((set) => ({
			selectedEdgeActionId: null,
			setSelectedEdgeActionId: (edgeId) =>
				set({ selectedEdgeActionId: edgeId }),
		}));
	}

	useEffect(() => {
		edgeUiStoreRef.current?.setState({
			selectedEdgeActionId,
			setSelectedEdgeActionId: onSelectedEdgeActionChange,
		});
	}, [onSelectedEdgeActionChange, selectedEdgeActionId]);

	const contextValue = useMemo(() => actions, [actions]);

	return (
		<WorkflowCanvasActionsContext.Provider value={contextValue}>
			<WorkflowCanvasEdgeUiContext.Provider value={edgeUiStoreRef.current}>
				{children}
			</WorkflowCanvasEdgeUiContext.Provider>
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

const useWorkflowCanvasEdgeUiStore = <T,>(
	selector: (state: WorkflowCanvasEdgeUiState) => T
) => {
	const store = useContext(WorkflowCanvasEdgeUiContext);

	if (!store) {
		throw new Error(
			'useWorkflowCanvasEdgeUiStore must be used within WorkflowCanvasActionsProvider'
		);
	}

	return useStore(store, selector);
};

export const useIsEdgeActionsOpen = (edgeId: string) =>
	useWorkflowCanvasEdgeUiStore(
		(state) => state.selectedEdgeActionId === edgeId
	);

export const useWorkflowCanvasEdgeUiActions = () =>
	useWorkflowCanvasEdgeUiStore((state) => state.setSelectedEdgeActionId);
