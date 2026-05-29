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
		override_prompt?: boolean;
		voice_id?: string;
		llm_model?: string;
		eagerness?: string;
		spelling_patience?: string;
		inherit_knowledge_base?: boolean;
		knowledge_base_ids?: string[];
		tool_ids?: string[];
	};
};
