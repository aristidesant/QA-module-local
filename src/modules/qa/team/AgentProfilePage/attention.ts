import type { AgentProfile } from '../types';
import type { ProfileTab } from '../constants';
import { dimensionPercent } from '../helpers';

export type Attention = 'warning' | 'critical';
export type AttentionMap = Partial<Record<ProfileTab, Attention>>;

const worse = (a: Attention | undefined, b: Attention): Attention =>
	a === 'critical' || b === 'critical' ? 'critical' : 'warning';

/**
 * Which tabs need a look. Same quiet rule as the rest of the module: only a
 * score below 70, an unacknowledged alert, or a burnout level above low.
 */
export const profileAttention = (
	profile: AgentProfile,
	burnoutLevel: 'low' | 'medium' | 'high'
): AttentionMap => {
	const out: AttentionMap = {};
	const open = profile.risk.alerts.filter((a) => !a.acknowledged);
	if (open.length > 0) {
		out.overview = open.some((a) => a.severity === 'critical')
			? 'critical'
			: 'warning';
	}
	for (const d of profile.dimensions) {
		if (dimensionPercent(d) < 70) out[d.key] = worse(out[d.key], 'warning');
	}
	if (burnoutLevel !== 'low') {
		out.burnout = burnoutLevel === 'high' ? 'critical' : 'warning';
	}
	return out;
};
