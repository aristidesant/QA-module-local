import type { AttentionMap } from '~/modules/qa/components/ProfileShell';
import type { CustomerTab } from '../constants';
import { NPS_DETRACTOR_MAX } from '../constants';
import type { CustomerProfile } from '../types';

export type CustomerAttentionMap = AttentionMap<CustomerTab>;

/** Same rule as the header colours: resistant, high churn, detractor NPS, low sentiment. */
export const customerAttention = (
	profile: CustomerProfile,
	lowSentiment: number
): CustomerAttentionMap => {
	const { kpis } = profile;
	const out: CustomerAttentionMap = {};
	if (kpis.churnRisk === 'high' || kpis.receptivenessBand === 'resistant') {
		out.overview = 'critical';
	}
	if (kpis.avgCustomerSentiment < lowSentiment) out.sentiment = 'warning';
	if (kpis.npsLatest !== undefined && kpis.npsLatest <= NPS_DETRACTOR_MAX) {
		out.surveys = 'warning';
	}
	return out;
};
