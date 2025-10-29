export interface CampaignLiveMetric {
	campaign: string;
	aht: string; // Average Handle Time
	calls: {
		total: number;
		contactable: number;
		non_contactable: number;
	};
	percentages: {
		contactable: string;
		non_contactable: string;
	};
}
