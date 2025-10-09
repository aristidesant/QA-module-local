import type { Campaign } from './CampaignsModel';
import type { UserModel } from './UserModels';

export interface CampaignPromptHistoryItem {
	id: number;
	campaignId: number;
	userId: number;
	version: number;
	promptText: string;
	agentConfig: {
		conversationConfig: {
			agent: {
				prompt: {
					prompt: string;
				};
			};
		};
	};
	clientId: number;
	createdAt: string;
	comment: string;
	campaign: Campaign;
	user: UserModel;
}

export interface CampaignPromptHistoryResponse {
	total: number;
	limit: number;
	offset: number;
	data: CampaignPromptHistoryItem[];
}
