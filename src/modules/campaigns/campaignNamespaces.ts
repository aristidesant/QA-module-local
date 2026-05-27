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
	'campaign.form.voices',
	'campaign.form.versioning',
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
	campaigns: [
		'campaigns.list',
		'campaigns.wizard',
		'campaign.form.shared',
		'campaign.form.agents',
		'knowledge-bases',
	],
	'campaign.detail': campaignDetailNamespaces,
	'campaign.detail.index': campaignDetailNamespaces,
	'campaign.detail.agent': campaignDetailNamespaces,
	'campaign.detail.test': 'campaign.detail.test',
	dashboards: 'dashboards',
	'conversations.detail': 'conversations',
};
