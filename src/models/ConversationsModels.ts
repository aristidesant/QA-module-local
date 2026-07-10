// Lightweight model for table display
export type ConversationTableModel = {
	id: number;
	identifier?: string | null;
	agentName: string;
	agentVoiceLanguage: string;
	contactName?: string;
	contactPhoneNumber?: string;
	status: string;
	startDate: string;
	endDate: string;
	createdAt: string;
	updatedAt: string;
	externalPhoneNumber: string;
};

export type PaginatedConversationsResponse<TConversation = ConversationsModel> =
	{
		total: number;
		limit: number;
		offset: number;
		conversations: TConversation[];
	};
import type AgentListObject from './AgentListObject';
import { CallDispositionModel } from './CallDispositionModel';
import type { Campaign } from './CampaignsModel';

export type ConversationDemoModel = {
	agentId: string;
	phoneNumber: string;
	dynamicVariables?: {
		customerName: string;
		customerId: string;
	};
};
export interface ConversationsModel {
	id: number;
	identifier?: string | null;
	agentId: string;
	agentName?: string;
	campaignId: number;
	contactId: number | null;
	status: string;
	startDate: string;
	endDate: string;
	userId: number;
	contactName?: string | null;
	clientId: number;
	externalPhoneNumber?: string;
	contactPhoneNumber?: string;
	transcriptContent: TranscriptContent;
	transcriptUrl: string | null;
	transcriptVoiceUrl: string | null;
	voiceFileId: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	agent: AgentListObject;
	campaign: Campaign;
	contact: Contact | null;
	voiceFile: VoiceFileModel | null;
	dispositions?: CallDispositionModel | null;
	summary?: {
		es?: string;
		en?: string;
	};
}

export interface TranscriptContent {
	analysis: Analysis;
	metadata: Metadata;
	transcript: TranscriptEntry[];
	conversationInitiationClientData: ClientData;
	conversation_initiation_client_data?: ClientData;
}

export interface Analysis {
	call_successful: string;
	transcript_summary: string;
	data_collection_results: Record<string, unknown>;
	evaluation_criteria_results: Record<string, unknown>;
}

export interface Metadata {
	cost: number;
	feedback: {
		likes: number;
		dislikes: number;
		overall_score: number | null;
	};
	call_duration_secs: number;
	termination_reason: string;
	start_time_unix_secs: number;
}

export interface TranscriptEntry {
	role: string;
	message: string | null;
	feedback: unknown | null;
	llm_usage: LlmUsage | null;
	tool_calls: ToolCall[];
	interrupted: boolean;
	llm_override: string | null;
	tool_results: ToolResult[];
	source_medium: string | null;
	agent_metadata?: AgentMetadata;
	original_message: string | null;
	time_in_call_secs: number;
	multivoice_message: unknown | null;
	rag_retrieval_info: Record<string, unknown> | null;
	conversation_turn_metrics: ConversationTurnMetrics | null;
	analysis?: unknown | null;
	config_snapshot_id?: string | null;
	contextual_update_info?: unknown | null;
	file_input?: unknown | null;
	ignored_as_backchannel?: boolean | null;
	reasoned?: boolean | null;
	reasoning?: unknown | null;
	source_event_id?: string | null;
	used_static_kb_document_ids?: string[] | null;
	user_identifier?: string | null;
	[key: string]: unknown;
}

export interface AgentMetadata {
	agent_id: string;
	branch_id: string | null;
	workflow_node_id: string | null;
}

export interface ToolCall {
	type: string;
	tool_name: string;
	request_id?: string | null;
	tool_details: unknown | null;
	params_as_json?: string | null;
	tool_has_been_called?: boolean;
	[key: string]: unknown;
}

export interface ToolResult {
	type?: string;
	tool_name?: string;
	request_id?: string;
	result_value?: unknown;
	raw_error_message?: string;
	error_type?: string;
	is_error?: boolean;
	is_blocked?: boolean;
	tool_has_been_called?: boolean;
	tool_latency_secs?: number;
	result?: unknown;
	dynamic_variable_updates?: unknown[] | null;
	[key: string]: unknown;
}

export interface LlmUsage {
	model_usage: Record<
		string,
		{
			input: {
				price: number;
				tokens: number;
			};
			output_total: {
				price: number;
				tokens: number;
			};
			input_cache_read: {
				price: number;
				tokens: number;
			};
			input_cache_write: {
				price: number;
				tokens: number;
			};
		}
	>;
}

export interface ConversationTurnMetrics {
	metrics?: Record<
		string,
		{
			elapsed_time?: number;
			[key: string]: unknown;
		}
	>;
	convai_llm_service_ttfb?: {
		elapsed_time?: number;
		[key: string]: unknown;
	};
	convai_tts_service_ttfb?: {
		elapsed_time?: number;
		[key: string]: unknown;
	};
	convai_asr_trailing_service_latency?: {
		elapsed_time?: number;
		[key: string]: unknown;
	};
	convai_tts_model?: string | null;
	convai_asr_provider?: string | null;
	convai_llm_model?: string | null;
	[key: string]: unknown;
}

export interface ClientData {
	dynamic_variables: Record<string, unknown>;
	custom_llm_extra_body: Record<string, unknown>;
	conversation_config_override: Record<string, unknown>;
}

export interface Contact {
	// Define contact fields as needed
	[key: string]: unknown;
}
export interface VoiceFileModel {
	id: number;
	name: string;
	mime: string;
	repositoryKey: string;
	repositoryRoute: string;
	extension: string;
	description: string | null;
	typeId: number;
	userId: number;
	clientId: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}
