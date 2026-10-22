import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import type { BurnoutLexicon, LexiconCategory, LexiconLanguage } from './types';

export const LEXICON_CATEGORIES: LexiconCategory[] = [
	'negativeLanguage',
	'apathyPhrases',
	'empathyPhrases',
];

export const LEXICON_LANGUAGES: LexiconLanguage[] = ['es', 'en'];

/** Lower case, no accents and single spaces, so "No sé" and "no se" read the same. */
export const normalizeText = (text: string): string =>
	text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^\p{L}\p{N}']+/gu, ' ')
		.trim();

/** A list without blanks and without repeats, as it is saved. */
export const cleanList = (items: string[]): string[] => {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const item of items) {
		const text = item.trim();
		const key = normalizeText(text);
		if (!key || seen.has(key)) continue;
		seen.add(key);
		out.push(text);
	}
	return out;
};

export interface SentenceAnalysis {
	/** The phrases of each list found in the sentence, as they are written in the list. */
	matches: Record<LexiconCategory, string[]>;
	words: number;
	/** A reply of few words that is not on the exceptions list. */
	isShortReply: boolean;
	/** A reply of few words that the exceptions list lets through. */
	isExcepted: boolean;
}

/** What the word lists make of one sentence the agent says. Phrases match whole words, ignoring case and accents. */
export function analyzeSentence(
	text: string,
	lexicon: BurnoutLexicon,
	language: LexiconLanguage
): SentenceAnalysis {
	const normalized = normalizeText(text);
	const padded = ` ${normalized} `;
	const found = (list: string[]) =>
		list.filter((phrase) => {
			const key = normalizeText(phrase);
			return key !== '' && padded.includes(` ${key} `);
		});
	const words = normalized ? normalized.split(' ').length : 0;
	const short = words > 0 && words <= lexicon.shortReplies.maxWords;
	const excepted =
		short &&
		lexicon.shortReplies.exceptions[language].some(
			(phrase) => normalizeText(phrase) === normalized
		);
	return {
		matches: {
			negativeLanguage: found(lexicon.lists.negativeLanguage[language]),
			apathyPhrases: found(lexicon.lists.apathyPhrases[language]),
			empathyPhrases: found(lexicon.lists.empathyPhrases[language]),
		},
		words,
		isShortReply: short && !excepted,
		isExcepted: excepted,
	};
}

const STATS_DAYS = 30;

export interface LexiconStats {
	/** Matches of the apathy phrases across the team in the last 30 days. */
	apathyPhrases: number;
	/** Matches of the empathy phrases across the team in the last 30 days. */
	empathyPhrases: number;
	/** Average negative words per 100 the agents said, last 30 days. */
	negativeLanguageRate: number;
	calls: number;
}

let statsCache: LexiconStats | null = null;

/** The word-choice figures of the team over the last 30 days, read from the voice analysis of the calls. */
export function lexiconStats(): LexiconStats {
	if (statsCache) return statsCache;
	const from = addDays(TODAY, -(STATS_DAYS - 1));
	const calls = TEAM_CALLS.filter((c) => c.date.slice(0, 10) >= from);
	const sum = (pick: (c: (typeof calls)[number]) => number) =>
		calls.reduce((total, c) => total + pick(c), 0);
	statsCache = {
		apathyPhrases: Math.round(sum((c) => c.voice.apathyPhrases)),
		empathyPhrases: Math.round(sum((c) => c.voice.empathyPhrases)),
		negativeLanguageRate: calls.length
			? Math.round((sum((c) => c.voice.negativeLanguage) / calls.length) * 10) /
				10
			: 0,
		calls: calls.length,
	};
	return statsCache;
}
