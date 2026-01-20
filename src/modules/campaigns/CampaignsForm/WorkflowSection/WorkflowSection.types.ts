import type {
	BoolExpr,
	ForwardCondition,
	WorkflowNode,
} from '~/models/AgentWorkflowModel';

type WorkflowNodeVariant = 'start' | 'standalone' | 'end' | 'default';

type WorkflowLayoutDirection = 'horizontal' | 'vertical';

interface SubagentData {
	prompt?: string;
	overridePrompt?: boolean;
	voiceId?: string;
	llmModel?: string;
	eagerness?: string;
	knowledgeBaseIds?: string[];
	toolIds?: string[];
}

type WorkflowNodeData = {
	label: string;
	workflowType: WorkflowNode['type'];
	variant: WorkflowNodeVariant;
	canConnectIn: boolean;
	canConnectOut: boolean;
	subagent?: SubagentData;
	toolLabels?: string[];
} & Record<string, unknown>;

type ConditionData = {
	conditionType: ForwardCondition['type'];
	condition?: string;
	successful?: boolean;
	expression?: BoolExpr;
	label?: string;
};

type WorkflowEdgeData = {
	forward?: ConditionData;
	backward?: ConditionData;
};

export type {
	ConditionData,
	WorkflowEdgeData,
	WorkflowNodeData,
	WorkflowLayoutDirection,
	WorkflowNodeVariant,
};
