import type { AttentionMap } from '~/modules/qa/components/ProfileShell';
import type { AgentProfile } from '../types';
import type { ProfileTab } from '../constants';
import { dimensionPercent } from '../helpers';

export type AgentAttentionMap = AttentionMap<ProfileTab>;

type Level = AgentAttentionMap[ProfileTab];

const worse = (a: Level, b: NonNullable<Level>): NonNullable<Level> =>
	a === 'critical' || b === 'critical' ? 'critical' : 'warning';

/**
 * Which tabs need a look. Same quiet rule as the rest of the module: only a
 * score below 70, an unacknowledged alert, or a burnout level above low.
 */
export const profileAttention = (
	profile: AgentProfile,
	burnoutLevel: 'low' | 'medium' | 'high'
): AgentAttentionMap => {
	const out: AgentAttentionMap = {};
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
