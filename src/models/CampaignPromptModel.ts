import { Campaign } from './CampaignsModel';

export type CampaignPromptModel = {
	id?: number;
	typeId: number;
	campaignId: number;
	prompt: string;
	createdAt?: string;
	campaign?: Campaign;
};
