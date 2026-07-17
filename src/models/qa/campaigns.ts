import type { ListQueryParams } from './shared';

export type CampaignStatus = 'ACTIVE' | 'INACTIVE';
export type CampaignFileStatus =
	| 'PENDING'
	| 'IN_PROCESS'
	| 'COMPLETE'
	| 'ERROR';
export type ConversationSource =
	| 'UCXM'
	| 'ELEVENLABS'
	| 'MANUAL_UPLOAD'
	| 'OTHER';

export interface CampaignListQueryParams extends ListQueryParams {
	q?: string;
	status?: CampaignStatus;
	sortBy?: 'id' | 'name' | 'status' | 'createdAt' | 'updatedAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface Campaign {
	id: number;
	clientId?: number;
	name: string;
	description?: string | null;
	status: CampaignStatus;
	source?: ConversationSource | null;
	sourceMetadata?: Record<string, unknown> | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateCampaignPayload {
	name: string;
	description?: string;
	status?: CampaignStatus;
	source?: ConversationSource;
	sourceMetadata?: Record<string, unknown>;
}

export type UpdateCampaignPayload = Partial<CreateCampaignPayload>;

export interface CampaignFile {
	id: number;
	campaignId: number;
	fileName: string;
	contentType?: string | null;
	status: CampaignFileStatus;
	totalRows?: number | null;
	processedRows?: number | null;
	errorRows?: number | null;
	errorMessage?: string | null;
}
