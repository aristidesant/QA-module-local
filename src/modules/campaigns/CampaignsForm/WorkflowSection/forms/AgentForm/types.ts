import type { AgentWorkflow, WorkflowNode } from '~/models/AgentWorkflowModel';

export interface AgentFormProps {
	nodeId: string;
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
}

export type KnowledgeBaseRef = {
	id: string;
	name?: string;
};

export interface BuiltInTool {
	id: string;
	label: string;
	showSettings: boolean;
	switchDisabled: boolean;
}

export interface BuiltInToolsState {
	endConversation: boolean;
	detectLanguage: boolean;
	skipTurn: boolean;
	playKeypadTouchTone: boolean;
	voicemailDetection: boolean;
}

export interface SelectOption {
	value: string;
	label: string;
}

export type Subagent = WorkflowNode & {
	subagent?: {
		prompt?: string;
		overridePrompt?: boolean;
		voiceId?: string;
		llmModel?: string;
		eagerness?: string;
		spellingPatience?: string;
		inheritKnowledgeBase?: boolean;
		knowledgeBaseIds?: string[];
		toolIds?: string[];
	};
};
