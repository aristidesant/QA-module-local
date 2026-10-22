import { TODAY } from '~/modules/qa/analytics/constants';
import type { TeamCallMetric } from '~/modules/qa/analytics/types';
import { VOICE_SIGNALS } from './constants';
import type { CallVoiceSignals, VoiceFamily } from './types';

/**
 * How much each family of voice signals has worsened, 0 (not at all) to 1 (strongly), for the
 * agents the mock data puts at burnout risk. Every other agent keeps a steady voice. The patterns
 * differ on purpose, so the demo shows an agent whose voice went flat, one who loses the thread,
 * one who turned apathetic and one where everything slipped.
 */
export const VOICE_DETERIORATION: Record<
	string,
	Partial<Record<VoiceFamily, number>>
> = {
	// High risk
	'AGT-006': { acoustic: 0.9, tempo: 0.8, lexical: 0.6, cognitive: 0.7 },
	'AGT-017': { acoustic: 0.7, tempo: 0.55, lexical: 0.2 },
	// Medium risk
	'AGT-005': { cognitive: 0.85 },
	'AGT-007': { acoustic: 0.52 },
	'AGT-010': { lexical: 0.6 },
	'AGT-012': { tempo: 0.28 },
	'AGT-021': { acoustic: 0.44, cognitive: 0.44 },
};

/** Days the worsening takes to reach its full size, ending today. */
const RAMP_DAYS = 28;
/** Call-to-call variation around the agent's own level. */
const NOISE = 0.12;
const DAY_MS = 86_400_000;
const PERCENT_CAP: ReadonlySet<string> = new Set([
	'vocalEnergy',
	'breathiness',
	'shortTurns',
]);

function seeded(seed: number) {
	let s = seed;
	return () => {
		s = (s * 9301 + 49297) % 233280;
		return s / 233280;
	};
}

const hash = (text: string) =>
	[...text].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 233280, 7);

const daysBeforeToday = (isoDate: string) =>
	Math.floor(
		(Date.parse(`${TODAY}T00:00:00Z`) -
			Date.parse(`${isoDate.slice(0, 10)}T00:00:00Z`)) /
			DAY_MS
	);

/**
 * Gives every call the voice signals of its agent: a personal level around the typical value,
 * call-to-call noise, and the worsening of the last weeks for the agents in `VOICE_DETERIORATION`.
 * A pass of its own, with its own random stream, so the rest of the mock data never changes.
 */
export function applyVoiceSignals(calls: TeamCallMetric[], seed = 83): void {
	const rand = seeded(seed);
	for (const call of calls) {
		const pattern = VOICE_DETERIORATION[call.agentId];
		const ramp = Math.min(
			1,
			Math.max(0, (RAMP_DAYS - daysBeforeToday(call.date)) / RAMP_DAYS)
		);
		const voice = {} as CallVoiceSignals;
		for (const signal of VOICE_SIGNALS) {
			const personal =
				0.9 + 0.2 * seeded(hash(`${call.agentId}:${signal.key}`))();
			const severity = pattern?.[signal.family] ?? 0;
			// A lower-is-worse signal loses up to half its value; a higher-is-worse one triples.
			const drift =
				signal.worse === 'lower'
					? 1 - 0.5 * severity * ramp
					: 1 + 2 * severity * ramp;
			const noise = 1 + (rand() - 0.5) * 2 * NOISE;
			let value = signal.typical * personal * drift * noise;
			if (PERCENT_CAP.has(signal.key)) value = Math.min(value, 100);
			voice[signal.key] = Math.round(Math.max(0, value) * 100) / 100;
		}
		call.voice = voice;
	}
}
