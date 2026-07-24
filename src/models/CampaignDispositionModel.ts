export interface CampaignDispositionModel {
	id: number;
	name: string;
	description?: string | null;
	path: string[];
	order?: number | null;
	isActive?: boolean | null;
	isFinal?: boolean | null;
	isVoiceMail?: boolean | null;
	doNotCall?: boolean | null;
	isAbandoned?: boolean | null;
	requiresReschedule?: boolean | null;
	rescheduleTime?: number | null;
	isInvalidatesNumber?: boolean | null;
	callStatus?: string | null;
	statusContact?: string | null;
	contactOutcome?: string | null;
}
