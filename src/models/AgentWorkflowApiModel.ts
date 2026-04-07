import type { ForwardCondition, WorkflowNode } from './AgentWorkflowModel';

export interface AgentWorkflowApi {
	edges: Record<string, WorkflowEdgeApi>;
	nodes: Record<string, WorkflowNodeApi>;
	prevent_subagent_loops: boolean;
}

export interface WorkflowEdgeApi {
	source: string;
	target: string;
	forward_condition?: ForwardCondition;
	backward_condition?: ForwardCondition;
}

export type WorkflowNodeApi =
	| StartNodeApi
	| EndNodeApi
	| ToolNodeApi
	| OverrideAgentNodeApi
	| PhoneNumberTransferNodeApi
	| StandaloneAgentNodeApi;

export interface WorkflowNodeBaseApi {
	type: WorkflowNode['type'];
	label?: string;
	position: { x: number; y: number };
	edge_order: string[];
}

export interface StartNodeApi extends WorkflowNodeBaseApi {
	type: 'start';
}

export interface EndNodeApi extends WorkflowNodeBaseApi {
	type: 'end';
}

export interface ToolNodeApi extends WorkflowNodeBaseApi {
	type: 'tool';
	tools: Array<{ tool_id: string }>;
}

export interface OverrideAgentNodeApi extends WorkflowNodeBaseApi {
	type: 'override_agent';
	label: string;
	additional_prompt: string;
	additional_tool_ids: string[];
	additional_knowledge_base: string[];
	subagent?: {
		prompt?: string;
		override_prompt?: boolean;
		voice_id?: string;
		llm_model?: string;
		eagerness?: string;
		spelling_patience?: string;
		knowledge_base_ids?: string[];
		tool_ids?: string[];
	};
	conversation_config: Record<string, unknown>;
}

export type PhoneNumberTransferDestinationApi =
	| { type: 'phone'; phone_number: string }
	| { type: 'sip_uri'; sip_uri: string }
	| { type: 'phone_dynamic_variable'; phone_number: string }
	| { type: 'sip_uri_dynamic_variable'; sip_uri: string };

export interface PhoneNumberTransferNodeApi extends WorkflowNodeBaseApi {
	type: 'phone_number';
	transfer_type: 'conference' | 'blind' | 'sip_refer' | (string & {});
	transfer_destination: PhoneNumberTransferDestinationApi | null;
}

export interface StandaloneAgentNodeApi extends WorkflowNodeBaseApi {
	type: 'standalone_agent';
	agent_id: string;
	delay_ms: number;
	transfer_message?: string | null;
	enable_transferred_agent_first_message: boolean;
	additional_prompt?: string;
	additional_tool_ids?: string[];
	additional_knowledge_base?: string[];
	subagent?: {
		prompt?: string;
		override_prompt?: boolean;
		voice_id?: string;
		llm_model?: string;
		eagerness?: string;
		spelling_patience?: string;
		knowledge_base_ids?: string[];
		tool_ids?: string[];
	};
	conversation_config?: Record<string, unknown>;
}
