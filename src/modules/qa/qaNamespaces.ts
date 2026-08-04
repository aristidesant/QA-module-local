/**
 * Maps QA route ids to the i18n namespaces they need, mirroring
 * campaignNamespaces.ts. Consumed by I18nNamespaceLoader in routes.tsx.
 */
export const qaRouteNamespaces: Record<string, string | readonly string[]> = {
	'qa.dashboard': 'qa.dashboard',
	'qa.agents': 'qa.agents',
	'qa.agents.detail': 'qa.agents',
	'qa.campaigns': 'qa.campaigns',
	'qa.campaigns.detail': 'qa.campaigns',
	'qa.forms': 'qa.forms',
	'qa.forms.error-types': 'qa.forms',
	'qa.forms.detail': 'qa.forms',
	'qa.evaluations': 'qa.evaluations',
	'qa.evaluations.new': 'qa.evaluations',
	'qa.evaluations.detail': 'qa.evaluations',
	'qa.emotion-sentiment': 'qa.emotionSentiment',
	'qa.disputes': 'qa.disputes',
	'qa.disputes.detail': 'qa.disputes',
	'qa.evaluator-agents': 'qa.evaluatorAgents',
};
