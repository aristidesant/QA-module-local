import React, {
	createContext,
	useContext,
	useState,
	useRef,
	useMemo,
} from 'react';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import type { ToolModel } from '~/models/ToolModel';
import type { AgentConfigModel } from '~/models/AgentListObject';
import type { KnowledgeBaseRef, BuiltInToolsState } from '../types';

interface AgentFormContextType {
	// Workflow
	workflow?: AgentWorkflow;
	nodeId: string;
	onWorkflowChange: (workflow: AgentWorkflow) => void;

	// Campaign Agent Config (for inherited values)
	campaignAgentConfig?: Partial<AgentConfigModel>;

	// Knowledge Bases
	draftKnowledgeBaseRefs: KnowledgeBaseRef[];
	setDraftKnowledgeBaseRefs: React.Dispatch<
		React.SetStateAction<KnowledgeBaseRef[]>
	>;
	knowledgeBaseSignatureRef: React.MutableRefObject<string>;

	// Tools
	builtInToolsState: BuiltInToolsState;
	setBuiltInToolsState: React.Dispatch<React.SetStateAction<BuiltInToolsState>>;
	inheritCustomTools: boolean;
	setInheritCustomTools: React.Dispatch<React.SetStateAction<boolean>>;
	customTools: ToolModel[];
	setCustomTools: React.Dispatch<React.SetStateAction<ToolModel[]>>;
	isToolMenuOpen: boolean;
	setIsToolMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AgentFormContext = createContext<AgentFormContextType | null>(null);

interface AgentFormProviderProps {
	children: React.ReactNode;
	nodeId: string;
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
	campaignAgentConfig?: Partial<AgentConfigModel>;
}

export const AgentFormProvider: React.FC<AgentFormProviderProps> = ({
	children,
	nodeId,
	workflow,
	onWorkflowChange,
	campaignAgentConfig,
}) => {
	const [draftKnowledgeBaseRefs, setDraftKnowledgeBaseRefs] = useState<
		KnowledgeBaseRef[]
	>([]);
	const knowledgeBaseSignatureRef = useRef('');

	const [builtInToolsState, setBuiltInToolsState] = useState<BuiltInToolsState>(
		{
			endConversation: true,
			detectLanguage: true,
			skipTurn: true,
			playKeypadTouchTone: false,
			voicemailDetection: true,
		}
	);

	const [inheritCustomTools, setInheritCustomTools] = useState(true);
	const [customTools, setCustomTools] = useState<ToolModel[]>([]);
	const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);

	const value = useMemo(
		() => ({
			workflow,
			nodeId,
			onWorkflowChange,
			campaignAgentConfig,
			draftKnowledgeBaseRefs,
			setDraftKnowledgeBaseRefs,
			knowledgeBaseSignatureRef,
			builtInToolsState,
			setBuiltInToolsState,
			inheritCustomTools,
			setInheritCustomTools,
			customTools,
			setCustomTools,
			isToolMenuOpen,
			setIsToolMenuOpen,
		}),
		[
			workflow,
			nodeId,
			onWorkflowChange,
			campaignAgentConfig,
			draftKnowledgeBaseRefs,
			builtInToolsState,
			inheritCustomTools,
			customTools,
			isToolMenuOpen,
		]
	);

	return (
		<AgentFormContext.Provider value={value}>
			{children}
		</AgentFormContext.Provider>
	);
};

export const useAgentForm = (): AgentFormContextType => {
	const context = useContext(AgentFormContext);
	if (!context) {
		throw new Error('useAgentForm must be used within an AgentFormProvider');
	}
	return context;
};
