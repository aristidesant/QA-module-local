/**
 * Workflow model (camelCase) for building/validating an ElevenLabs “Agents workflow”
 * like the one shown in the Update Agent response.
 *
 * Notes:
 * - The API returns snake_case (e.g., prevent_subagent_loops, edge_order, turn_timeout).
 * - These types assume you transform to camelCase in your app layer.
 */

/** Root workflow object */
export interface AgentWorkflow {
	edges: Record<string, WorkflowEdge>;
	nodes: Record<string, WorkflowNode>;
	preventSubagentLoops: boolean;
}

/** Edge between two nodes */
export interface WorkflowEdge {
	source: string; // node id
	target: string; // node id
	forwardCondition?: ForwardCondition;
	backwardCondition?: ForwardCondition;
}

/** Conditions that decide whether an edge is taken */
export type ForwardCondition =
	| UnconditionalCondition
	| LlmCondition
	| ResultCondition
	| ExpressionCondition;

export interface UnconditionalCondition {
	type: 'unconditional';
}

export interface LlmCondition {
	type: 'llm';
	/** Natural-language condition prompt evaluated by the agent/LLM */
	condition: string;
	/** Optional label for the condition */
	label?: string;
}

export interface ResultCondition {
	type: 'result';
	/** Whether the previous tool call must be successful to traverse this edge */
	successful: boolean;
}

export interface ExpressionCondition {
	type: 'expression';
	/** Boolean expression tree */
	expression: BoolExpr;
	/** Optional label for the expression */
	label?: string;
}

/** Boolean expression tree (matches the sample’s structure) */
export type BoolExpr =
	| OrOperatorExpr
	| AndOperatorExpr
	| EqOperatorExpr
	| NeqOperatorExpr
	| GtOperatorExpr
	| GteOperatorExpr
	| LtOperatorExpr
	| LteOperatorExpr
	| DynamicVariableExpr
	| StringLiteralExpr
	| NumberLiteralExpr
	| BooleanLiteralExpr
	| LlmPromptExpr;

export interface OrOperatorExpr {
	type: 'or_operator';
	children: BoolExpr[];
}
export type OrExpr = OrOperatorExpr;

export interface AndOperatorExpr {
	type: 'and_operator';
	children: BoolExpr[];
}
export type AndExpr = AndOperatorExpr;

export interface EqOperatorExpr {
	type: 'eq_operator';
	left: ValueExpr;
	right: ValueExpr;
}

export interface NeqOperatorExpr {
	type: 'neq_operator';
	left: ValueExpr;
	right: ValueExpr;
}

export interface GtOperatorExpr {
	type: 'gt_operator';
	left: ValueExpr;
	right: ValueExpr;
}

export interface GteOperatorExpr {
	type: 'gte_operator';
	left: ValueExpr;
	right: ValueExpr;
}

export interface LtOperatorExpr {
	type: 'lt_operator';
	left: ValueExpr;
	right: ValueExpr;
}

export interface LteOperatorExpr {
	type: 'lte_operator';
	left: ValueExpr;
	right: ValueExpr;
}

export type ComparisonOperatorExpr =
	| EqOperatorExpr
	| NeqOperatorExpr
	| GtOperatorExpr
	| GteOperatorExpr
	| LtOperatorExpr
	| LteOperatorExpr;

export type ValueExpr =
	| DynamicVariableExpr
	| StringLiteralExpr
	| NumberLiteralExpr
	| BooleanLiteralExpr
	| LlmPromptExpr;

export interface DynamicVariableExpr {
	type: 'dynamic_variable';
	name: string;
}

export interface StringLiteralExpr {
	type: 'string_literal';
	value: string;
}

export interface NumberLiteralExpr {
	type: 'number_literal';
	value: number;
}

export interface BooleanLiteralExpr {
	type: 'boolean_literal';
	value: boolean;
}

export interface LlmPromptExpr {
	type: 'llm';
	/** A prompt that should evaluate to boolean */
	prompt: string;
}

/** All node variants observed on the page */
export type WorkflowNode =
	| StartNode
	| EndNode
	| ToolNode
	| OverrideAgentNode
	| PhoneNumberTransferNode
	| StandaloneAgentNode;

/** Base fields many nodes share */
export interface WorkflowNodeBase {
	type: string;
	label?: string;
	position: { x: number; y: number };
	/** Ordering of outgoing edge keys (from workflow.edges) */
	edgeOrder: string[];
	uiMeta?: {
		variant?: 'transfer' | 'subagent';
		createdByUi?: boolean;
	};
}

/** start node */
export interface StartNode extends WorkflowNodeBase {
	type: 'start';
}

/** end node */
export interface EndNode extends WorkflowNodeBase {
	type: 'end';
}

/** tool node */
export interface ToolNode extends WorkflowNodeBase {
	type: 'tool';
	tools: Array<{ toolId: string }>;
}

/**
 * override_agent node (Entry / Failure / Success A in sample)
 * Used to override agent settings for a branch.
 */
export interface OverrideAgentNode extends WorkflowNodeBase {
	type: 'override_agent';
	label: string;
	additionalPrompt: string | null;
	additionalToolIds: string[];
	additionalKnowledgeBase: string[];
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
	/** Node-level partial overrides; shape depends on your app */
	conversationConfig: Record<string, unknown>;
}

/** phone number transfer node (conference transfer in sample) */
export interface PhoneNumberTransferNode extends WorkflowNodeBase {
	type: 'phone_number';
	transferType: 'conference' | 'blind' | 'sip_refer' | (string & {});
	transferDestination:
		| { type: 'phone'; phoneNumber: string }
		| { type: 'sip_uri'; sipUri: string }
		| { type: 'phone_dynamic_variable'; phoneNumber: string }
		| { type: 'sip_uri_dynamic_variable'; sipUri: string };
	custom_sip_headers?: Array<{ name: string; value: string }>;
}

/** standalone_agent transfer node */
export interface StandaloneAgentNode extends WorkflowNodeBase {
	type: 'standalone_agent';
	agentId: string;
	delayMs: number;
	transferMessage?: string;
	enableTransferredAgentFirstMessage: boolean;
	additionalPrompt?: string | null;
	additionalToolIds?: string[];
	additionalKnowledgeBase?: string[];
	/** Custom subagent configuration */
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
	/** Node-level partial overrides (built-in tools, etc.) */
	conversationConfig?: Record<string, unknown>;
}
