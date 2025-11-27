// src/models/CampaignRequirementsModel.ts

export interface CampaignRequirements {
	canRun: boolean;
	campaignType: string;
	hasActiveSchedule: boolean;
	hasAgentsWithPrompt: boolean;
	hasDispositionFlow: boolean;
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
		dispositionFlow: {
			assigned: boolean;
			flowId: number | null;
		};
	};
}
