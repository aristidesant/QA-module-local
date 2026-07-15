/**
 * Maps QA route ids to the i18n namespaces they need, mirroring
 * campaignNamespaces.ts. Consumed by I18nNamespaceLoader in routes.tsx.
 */
export const qaRouteNamespaces: Record<string, string | readonly string[]> = {
	qa: ['qa.common'],
	'qa.dashboard': ['qa.dashboard', 'qa.common'],
	'qa.agents': ['qa.agents', 'qa.common'],
	'qa.agents.detail': ['qa.agents', 'qa.common'],
	'qa.campaigns': ['qa.campaigns', 'qa.common'],
	'qa.campaigns.detail': ['qa.campaigns', 'qa.common'],
	'qa.forms': ['qa.forms', 'qa.common'],
	'qa.forms.error-types': ['qa.forms', 'qa.common'],
	'qa.forms.detail': ['qa.forms', 'qa.common'],
	'qa.evaluations': ['qa.evaluations', 'qa.common'],
	'qa.evaluations.new': ['qa.evaluations', 'qa.common'],
	'qa.evaluations.detail': ['qa.evaluations', 'qa.common'],
	'qa.disputes': ['qa.disputes', 'qa.common'],
	'qa.disputes.detail': ['qa.disputes', 'qa.common'],
	'qa.evaluator-agents': ['qa.evaluatorAgents', 'qa.common'],
};
