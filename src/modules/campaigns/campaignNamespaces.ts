export const campaignDetailNamespaces = [
	'campaign.detail',
	'campaign.form.shared',
	'campaign.form.sync',
	'campaign.form.general',
	'campaign.form.agents',
	'campaign.form.workflow',
	'campaign.form.outcomes',
	'campaign.form.params',
	'campaign.form.analytics',
	'campaign.form.dashboards',
	'campaign.form.report-values',
	'campaign.form.contacts',
	'campaign.form.do-not-call',
	'campaign.contact-list',
	'do-not-call',
	'common',
] as const;

export const campaignRouteNamespaces: Record<
	string,
	string | readonly string[]
> = {
	campaigns: 'campaigns.list',
	'campaign.detail': campaignDetailNamespaces,
	dashboards: 'dashboards',
};
