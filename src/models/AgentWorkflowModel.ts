/** Root workflow object */
export interface AgentWorkflow {
	edges: Record<string, WorkflowEdge>;
	nodes: Record<string, WorkflowNode>;
	prevent_subagent_loops: boolean;
}

/** Edge between two nodes */
export interface WorkflowEdge {
	source: string;
	target: string;
	forward_condition?: ForwardCondition;
	backward_condition?: ForwardCondition;
}

/** Conditions that decide whether an edge is taken */
export type ForwardCondition =
	| UnconditionalCondition
	| LlmCondition
	| ResultCondition
	| ExpressionCondition;

export interface UnconditionalCondition {
	type: 'unconditional';
	label?: string | null;
}

export interface LlmCondition {
	type: 'llm';
	condition: string;
	label?: string | null;
}

export interface ResultCondition {
	type: 'result';
	successful: boolean;
}

export interface ExpressionCondition {
	type: 'expression';
	expression: BoolExpr;
	label?: string | null;
}

/** Boolean expression tree */
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
	prompt: string;
}

/** All node variants stored in agentConfig.workflow.nodes */
export type WorkflowNode =
	| StartNode
	| EndNode
	| ToolNode
	| OverrideAgentNode
	| UpdateStateNode
	| PhoneNumberTransferNode
	| StandaloneAgentNode;

/** Base fields shared by all nodes */
export interface WorkflowNodeBase {
	type: string;
	label?: string;
	position: { x: number; y: number };
	edge_order: string[];
	uiMeta?: {
		variant?: 'transfer' | 'subagent';
		created_by_ui?: boolean;
	};
}

export interface StartNode extends WorkflowNodeBase {
	type: 'start';
}

export interface EndNode extends WorkflowNodeBase {
	type: 'end';
}

export interface ToolNode extends WorkflowNodeBase {
	type: 'tool';
	tools: Array<{ tool_id: string }>;
}

export interface UpdateStateValueSchema {
	type: 'string' | 'boolean' | 'integer' | 'number';
	description: string;
	enum: string[] | null;
}

export interface UpdateStateLlmExpression {
	type: 'llm';
	value_schema: UpdateStateValueSchema;
	prompt: string;
}

export interface UpdateStateStringExpression {
	type: 'string_literal';
	value: string;
}

export interface UpdateStateNumberExpression {
	type: 'number_literal';
	value: number;
}

export interface UpdateStateBooleanExpression {
	type: 'boolean_literal';
	value: boolean;
}

export interface UpdateStateNullExpression {
	type: 'null_literal';
}

export interface UpdateStateDynamicVariableExpression {
	type: 'dynamic_variable';
	variable_name: string;
}

export type UpdateStateExpression =
	| UpdateStateLlmExpression
	| UpdateStateStringExpression
	| UpdateStateNumberExpression
	| UpdateStateBooleanExpression
	| UpdateStateNullExpression
	| UpdateStateDynamicVariableExpression;

export interface UpdateStateUpdate {
	type: 'dynamic_variable';
	variable_name: string;
	expression: UpdateStateExpression;
}

export interface UpdateStateNode extends WorkflowNodeBase {
	type: 'update_state';
	label: string;
	updates: UpdateStateUpdate[];
}

export interface OverrideAgentNode extends WorkflowNodeBase {
	type: 'override_agent';
	label: string;
	additional_prompt: string | null;
	additional_tool_ids: string[];
	additional_knowledge_base: string[];
	auto_advance_after_first_response?: boolean;
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
	conversation_config: Record<string, unknown>;
}

export interface PhoneNumberTransferNode extends WorkflowNodeBase {
	type: 'phone_number';
	transfer_type: 'conference' | 'blind' | 'sip_refer' | (string & {});
	transfer_destination:
		| { type: 'phone'; phone_number: string }
		| { type: 'sip_uri'; sip_uri: string }
		| { type: 'phone_dynamic_variable'; phone_number: string }
		| { type: 'sip_uri_dynamic_variable'; sip_uri: string };
	custom_sip_headers?: Array<{ name: string; value: string }>;
}

/** group node — visual container */
export interface GroupNode extends WorkflowNodeBase {
	type: 'group';
}

export interface StandaloneAgentNode extends WorkflowNodeBase {
	type: 'standalone_agent';
	node_id?: string | null;
	agent_id: string;
	delay_ms: number;
	transfer_message?: string | null;
	enable_transferred_agent_first_message: boolean;
	additional_prompt?: string | null;
	additional_tool_ids?: string[];
	additional_knowledge_base?: string[];
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
	conversation_config?: Record<string, unknown>;
}
