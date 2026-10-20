import { SENTIMENT_LEVELS } from './constants';
import type {
	CampaignRef,
	ContextRule,
	DateTimeFormat,
	EmotionEntry,
	NamingConvention,
	ParsedField,
	RuleScope,
	ScaleBand,
	SentimentLevel,
} from './types';

/** Lower number wins: a campaign rule beats a campaign-type rule, which beats the client default. */
const SCOPE_RANK: Record<RuleScope, number> = {
	CAMPAIGN: 0,
	CAMPAIGN_TYPE: 1,
	CLIENT: 2,
};

/** The most specific scope that also covers this rule's topic, or null when nothing overrides it. */
export const overriddenBy = (
	rule: ContextRule,
	rules: ContextRule[]
): RuleScope | null => {
	const stronger = rules
		.filter(
			(other) =>
				other.id !== rule.id &&
				other.status === 'ACTIVE' &&
				other.topic === rule.topic &&
				SCOPE_RANK[other.scope] < SCOPE_RANK[rule.scope]
		)
		.sort((a, b) => SCOPE_RANK[a.scope] - SCOPE_RANK[b.scope]);
	return stronger[0]?.scope ?? null;
};

/** One rule per topic for a campaign: campaign > campaign type > client, active rules only. */
export const effectiveRulesFor = (
	campaign: CampaignRef,
	rules: ContextRule[]
): ContextRule[] => {
	const applicable = rules.filter((rule) => {
		if (rule.status !== 'ACTIVE') return false;
		if (rule.scope === 'CLIENT') return true;
		if (rule.scope === 'CAMPAIGN_TYPE')
			return rule.target === campaign.campaignType;
		return rule.target === campaign.name;
	});
	const byTopic = new Map<string, ContextRule>();
	for (const rule of applicable) {
		const current = byTopic.get(rule.topic);
		if (!current || SCOPE_RANK[rule.scope] < SCOPE_RANK[current.scope]) {
			byTopic.set(rule.topic, rule);
		}
	}
	return [...byTopic.values()].sort((a, b) => a.topic.localeCompare(b.topic));
};

const DATE_PATTERNS: Record<DateTimeFormat, RegExp> = {
	'YYYYMMDD-HHmmss': /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/,
	YYYYMMDDHHmmss: /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
	'YYYY-MM-DD_HH-mm-ss': /^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})$/,
};

const transformDateTime = (
	raw: string,
	format: DateTimeFormat
): string | null => {
	const match = DATE_PATTERNS[format].exec(raw);
	if (!match) return null;
	const [, y, mo, d, h, mi, s] = match;
	return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
};

/** Splits a filename by the convention's separator and maps each segment to its token. */
export const parseFilename = (
	filename: string,
	convention: NamingConvention
): ParsedField[] => {
	const base = filename.trim().replace(/\.[a-z0-9]+$/i, '');
	const segments = base === '' ? [] : base.split(convention.separator);
	return convention.tokens.map((token, index) => {
		const raw = segments[index] ?? null;
		if (raw === null || raw === '') {
			return { token, raw: null, transformed: null, ok: false };
		}
		if (token === 'date-time') {
			const transformed = transformDateTime(raw, convention.dateTimeFormat);
			return { token, raw, transformed, ok: transformed !== null };
		}
		return { token, raw, transformed: raw, ok: true };
	});
};

/** "Low < 70", "Watch 70–89", "On target ≥ 90" for a band and the one after it. */
export const formatBand = (band: ScaleBand, next?: ScaleBand): string => {
	if (!next) return `${band.label} ≥ ${band.min}`;
	if (band.min === 0) return `${band.label} < ${next.min}`;
	return `${band.label} ${band.min}–${next.min - 1}`;
};

export const emotionCountsByLevel = (
	emotions: EmotionEntry[]
): Record<SentimentLevel, number> => {
	const counts = Object.fromEntries(
		SENTIMENT_LEVELS.map((level) => [level, 0])
	) as Record<SentimentLevel, number>;
	for (const emotion of emotions) counts[emotion.level] += 1;
	return counts;
};

export const nextId = (prefix: string) =>
	`${prefix}-${Math.random().toString(36).slice(2, 8)}`;
