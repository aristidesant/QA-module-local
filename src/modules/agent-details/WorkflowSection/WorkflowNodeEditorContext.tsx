import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type PropsWithChildren,
} from 'react';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import type { AgentConfigModel } from '~/models/AgentListObject';

interface WorkflowNodeEditorContextValue {
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
	campaignAgentConfig?: Partial<AgentConfigModel>;
	openedNodeId: string | null;
	openNodeDrawer: (nodeId: string) => void;
	closeNodeDrawer: () => void;
	isNodeDrawerOpen: (nodeId: string) => boolean;
}

interface WorkflowNodeEditorProviderProps extends PropsWithChildren {
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
	campaignAgentConfig?: Partial<AgentConfigModel>;
}

const WorkflowNodeEditorContext =
	createContext<WorkflowNodeEditorContextValue | null>(null);

export const WorkflowNodeEditorProvider = ({
	workflow,
	onWorkflowChange,
	campaignAgentConfig,
	children,
}: WorkflowNodeEditorProviderProps) => {
	const [openedNodeId, setOpenedNodeId] = useState<string | null>(null);
	// Ghost-click guard: Mantine's overlay fires onClose on mousedown, but the
	// click event arrives a tick later and can land on a node surface beneath the
	// overlay, re-opening the drawer. Block openNodeDrawer for 200 ms after close.
	const closedAtRef = useRef<number>(0);

	useEffect(() => {
		if (openedNodeId && !workflow?.nodes?.[openedNodeId]) {
			setOpenedNodeId(null);
		}
	}, [openedNodeId, workflow?.nodes]);

	const openNodeDrawer = useCallback((nodeId: string) => {
		if (Date.now() - closedAtRef.current < 200) return;
		setOpenedNodeId(nodeId);
	}, []);

	const closeNodeDrawer = useCallback(() => {
		closedAtRef.current = Date.now();
		setOpenedNodeId(null);
	}, []);

	const isNodeDrawerOpen = useCallback(
		(nodeId: string) => openedNodeId === nodeId,
		[openedNodeId]
	);

	const value = useMemo(
		() => ({
			workflow,
			onWorkflowChange,
			campaignAgentConfig,
			openedNodeId,
			openNodeDrawer,
			closeNodeDrawer,
			isNodeDrawerOpen,
		}),
		[
			campaignAgentConfig,
			closeNodeDrawer,
			isNodeDrawerOpen,
			onWorkflowChange,
			openNodeDrawer,
			openedNodeId,
			workflow,
		]
	);

	return (
		<WorkflowNodeEditorContext.Provider value={value}>
			{children}
		</WorkflowNodeEditorContext.Provider>
	);
};

export const useWorkflowNodeEditor = () => {
	const context = useContext(WorkflowNodeEditorContext);

	if (!context) {
		throw new Error(
			'useWorkflowNodeEditor must be used within WorkflowNodeEditorProvider'
		);
	}

	return context;
};
