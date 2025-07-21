// Lightweight model for table display
export type ConversationTableModel = {
  id: number;
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
import type AgentListObject from "./AgentListObject";
import type { Campaign } from "./CampaignsModel";

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
  identifier: string;
  agentId: string;
  campaignId: number;
  contactId: number | null;
  status: string;
  startDate: string;
  endDate: string;
  userId: number;
  clientId: number;
  externalPhoneNumber?: string;
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
}

export interface TranscriptContent {
  analysis: Analysis;
  metadata: Metadata;
  transcript: TranscriptEntry[];
  conversationInitiationClientData: ClientData;
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
  message: string;
  feedback: unknown | null;
  llm_usage: LlmUsage | null;
  tool_calls: unknown[];
  interrupted: boolean;
  llm_override: unknown | null;
  tool_results: unknown[];
  source_medium: string | null;
  original_message: string | null;
  time_in_call_secs: number;
  rag_retrieval_info: unknown | null;
  conversation_turn_metrics: Record<string, unknown> | null;
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
