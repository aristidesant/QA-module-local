// src/models/CampaignRequirementsModel.ts

export interface CampaignRequirements {
	canRun: boolean;
	campaignType: string;
	hasActiveSchedule: boolean;
	hasAgentsWithPrompt: boolean;
	hasDispositionFlow: boolean;
	hasActiveContactList: boolean;
	missingRequirements: string[];
	details: {
		schedules: {
			total: number;
			active: number;
		};
		agents: {
			total: number;
			withPrompt: number;
		};
		contactLists: {
			total: number;
			active: number;
		};
		dispositionFlow: {
			assigned: boolean;
			flowId: number | null;
		};
	};
}
