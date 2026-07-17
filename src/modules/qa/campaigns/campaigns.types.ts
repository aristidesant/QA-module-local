import type { CampaignStatus, ConversationSource } from '~/models/qa';

export interface CampaignFormValues {
	name: string;
	description: string;
	status: CampaignStatus;
	source: ConversationSource | '';
}
