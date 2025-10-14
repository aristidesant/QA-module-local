// Hook: useDispositionLabel
// Purpose: Provide a label transformation function that adapts wording
// depending on the currently selected campaign type.
// For INBOUND campaigns we replace occurrences of the word
// Disposition/disposition (and plural forms) with Outcome/outcome (and plural forms),
// preserving the general casing style (UPPER, Title, lower).
// For any other campaign type we return the original label untouched.

import { useCampaignsStore } from '~/stores/campaignsStore';

/**
 * Returns a function that will transform disposition related labels based on campaign type.
 * Mapping when campaign.type === 'INBOUND':
 * Singular mappings when campaign.type === 'INBOUND':
 *  Disposition  -> Outcome
 *  disposition  -> outcome
 *  DISPOSITION  -> OUTCOME
 * Plural mappings:
 *  Dispositions -> Outcomes
 *  dispositions -> outcomes
 *  DISPOSITIONS -> OUTCOMES
 * All other text remains the same. Word boundaries are respected so we don't
 * accidentally change substrings inside larger words.
 */
export function useDispositionLabel() {
	return (label: string): string => {
		if (!label || typeof label !== 'string') return label;

		// Regex captures either 'disposition(s)' or 'outcome(s)' with word boundaries, any casing.
		const pattern = /\b(disposition|outcome)(s)?\b/gi;

		return label.replace(
			pattern,
			(match: string, _singular: string, pluralPart: string) => {
				const isPlural = Boolean(pluralPart);

				// Determine casing style of the original match
				const isAllUpper = match === match.toUpperCase();
				const isAllLower = match === match.toLowerCase();
				const isTitle =
					match[0] === match[0].toUpperCase() &&
					match.slice(1) === match.slice(1).toLowerCase();

				// Map to Outcome(s) respecting casing
				if (isAllUpper) {
					return isPlural ? 'OUTCOMES' : 'OUTCOME';
				}
				if (isAllLower) {
					return isPlural ? 'outcomes' : 'outcome';
				}
				if (isTitle) {
					return isPlural ? 'Outcomes' : 'Outcome';
				}
				// Fallback: default to title case for singular/plural
				return isPlural ? 'Outcomes' : 'Outcome';
			}
		);
	};
}

export default useDispositionLabel;
