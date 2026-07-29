export interface DemoWizardCampaignDetails {
	name: string;
	campaignType: string;
	callDirection: string;
	description: string;
}

export interface DemoWizardUploadedFile {
	id: string;
	fileName: string;
	durationSeconds: number;
	format: string;
	agentName: string;
	campaignFileId: string;
}
