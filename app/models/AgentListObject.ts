import type { Voice } from "./AgentVoiceModel";

export default interface AgentListObject {
  id: string;
  name: string;
  config: Record<string, any>;
  type: "INBOUND" | "OUTBOUND";
  status: "ACTIVE" | "INACTIVE";
  clientId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  voiceId: string | null;
  voice: Voice | null;
}

export type AgentUpdateModel = {
  use_tool_ids: boolean;
  conversation_config: Record<string, any>;
  platform_settings: Record<string, any>;
  name: string;
  promptId: number;
  agentType: "INBOUND" | "OUTBOUND";
};
