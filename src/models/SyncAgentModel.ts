export type AgentType = 'INBOUND' | 'OUTBOUND';

export type AgentStatus = 'ACTIVE' | 'INACTIVE';

export interface SyncAgentRequest {
	agentId: string;
	campaignId: number;
	type: AgentType;
}

export interface SyncAgentResponse {
	id: string;
	identifier: string;
	name: string;
	type: AgentType;
	status: AgentStatus;
	config: Record<string, unknown>;
	voiceId: string | null;
	clientId: number;
	userId: number;
	outboundPhoneNumberId: number | null;
	inboundPhoneNumberId: number | null;
	noiseCancellation: boolean | null;
	versioningEnabled: boolean;
	mainBranchId: string | null;
	createdAt: string;
	updatedAt: string;
}
