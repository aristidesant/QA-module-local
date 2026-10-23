import { KIND_LABEL } from './constants';
import type {
	MaskSegment,
	PrivacySettings,
	SensitiveCategory,
	SensitiveHit,
	SensitiveKind,
} from './types';

interface Pattern {
	kind: SensitiveKind;
	category: SensitiveCategory;
	regex: RegExp;
}

/** Longer matches win over shorter ones that start at the same place (a date of birth over an expiry). */
const PATTERNS: Pattern[] = [
	{ kind: 'card', category: 'payment', regex: /\b(?:\d[ -]?){12}\d{1,7}\b/g },
	{
		kind: 'iban',
		category: 'payment',
		regex: /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}\b/g,
	},
	{
		kind: 'cvv',
		category: 'payment',
		regex: /\b(?:cvv|cvc|security code)\s*(?:is|:)?\s*\d{3,4}\b/gi,
	},
	{
		kind: 'expiry',
		category: 'payment',
		regex: /\b(?:0[1-9]|1[0-2])\/\d{2}\b/g,
	},
	{
		kind: 'bankAccount',
		category: 'payment',
		regex: /\b(?:account|acct)(?: number)?\s*(?:is|:)?\s*\d{8,14}\b/gi,
	},
	{ kind: 'nationalId', category: 'identity', regex: /\b\d{3}-\d{7}-\d\b/g },
	{ kind: 'ssn', category: 'identity', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
	{
		kind: 'passport',
		category: 'identity',
		regex: /\bpassport\s*(?:number|no\.?)?\s*(?:is|:)?\s*[A-Z0-9]{6,9}\b/gi,
	},
	{
		kind: 'email',
		category: 'contact',
		regex: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g,
	},
	{
		kind: 'phone',
		category: 'contact',
		regex: /(?:\+?\d{1,3}[ -])?\(?\d{3}\)?[ -]\d{3}[ -]\d{4}\b/g,
	},
	{
		kind: 'address',
		category: 'contact',
		regex:
			/\b\d{1,5} [A-Z][a-z]+(?: [A-Z][a-z]+)? (?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Calle|Avenida)\b\.?/g,
	},
	{
		kind: 'dob',
		category: 'credentials',
		regex: /\b(?:0[1-9]|[12]\d|3[01])\/(?:0[1-9]|1[0-2])\/(?:19|20)\d{2}\b/g,
	},
	{
		kind: 'pin',
		category: 'credentials',
		regex:
			/\b(?:pin|password|passcode|otp|verification code)\s*(?:is|:)?\s*\w{4,12}\b/gi,
	},
];

const previewOf = (original: string, showLast: number) => {
	const digits = original.replace(/\D/g, '');
	return showLast > 0 && digits.length > showLast
		? `•••• ${digits.slice(-showLast)}`
		: '••••';
};

/** Every sensitive span in a text under the given settings, without overlaps, in reading order. */
export const findSensitive = (
	text: string,
	settings: PrivacySettings
): SensitiveHit[] => {
	if (!settings.enabled) return [];
	const hits: SensitiveHit[] = [];
	for (const p of PATTERNS) {
		const config = settings.categories[p.category];
		if (!config.enabled) continue;
		for (const m of text.matchAll(p.regex)) {
			const start = m.index ?? 0;
			hits.push({
				start,
				end: start + m[0].length,
				kind: p.kind,
				category: p.category,
				original: m[0],
				preview: previewOf(m[0], config.showLast),
			});
		}
	}
	hits.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
	const out: SensitiveHit[] = [];
	let cursor = 0;
	for (const h of hits) {
		if (h.start < cursor) continue;
		out.push(h);
		cursor = h.end;
	}
	return out;
};

/** The text split into plain and masked parts. */
export const maskSegments = (
	text: string,
	settings: PrivacySettings
): MaskSegment[] => {
	const hits = findSensitive(text, settings);
	if (hits.length === 0) return [{ text }];
	const out: MaskSegment[] = [];
	let cursor = 0;
	for (const hit of hits) {
		if (hit.start > cursor) out.push({ text: text.slice(cursor, hit.start) });
		out.push({ text: hit.original, hit });
		cursor = hit.end;
	}
	if (cursor < text.length) out.push({ text: text.slice(cursor) });
	return out;
};

/** Plain-string placeholder, for places that cannot render a chip. */
export const placeholderOf = (hit: SensitiveHit) =>
	`[${KIND_LABEL[hit.kind]} ${hit.preview}]`;

export const maskText = (text: string, settings: PrivacySettings): string =>
	maskSegments(text, settings)
		.map((s) => (s.hit ? placeholderOf(s.hit) : s.text))
		.join('');
