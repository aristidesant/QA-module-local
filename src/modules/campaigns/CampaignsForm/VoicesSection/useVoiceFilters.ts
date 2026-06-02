import { useCallback, useMemo, useState } from 'react';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';

export interface VoiceFilterOption {
	value: string;
	label: string;
}

export interface UseVoiceFiltersReturn {
	search: string;
	genders: string[];
	languages: string[];
	setSearch: (value: string) => void;
	toggleGender: (value: string) => void;
	toggleLanguage: (value: string) => void;
	reset: () => void;
	activeFilterCount: number;
	hasActiveFilters: boolean;
	availableGenders: VoiceFilterOption[];
	availableLanguages: VoiceFilterOption[];
	filter: (voices: AgentVoiceModel[]) => AgentVoiceModel[];
}

const normalize = (value: string | null | undefined): string =>
	(value ?? '').toLowerCase().trim();

export const useVoiceFilters = (
	voices: AgentVoiceModel[]
): UseVoiceFiltersReturn => {
	const [search, setSearch] = useState<string>('');
	const [genders, setGenders] = useState<string[]>([]);
	const [languages, setLanguages] = useState<string[]>([]);

	const toggleGender = useCallback((value: string) => {
		const key = normalize(value);
		setGenders((current) =>
			current.includes(key)
				? current.filter((item) => item !== key)
				: [...current, key]
		);
	}, []);

	const toggleLanguage = useCallback((value: string) => {
		const key = normalize(value);
		setLanguages((current) =>
			current.includes(key)
				? current.filter((item) => item !== key)
				: [...current, key]
		);
	}, []);

	const reset = useCallback(() => {
		setSearch('');
		setGenders([]);
		setLanguages([]);
	}, []);

	const availableGenders = useMemo<VoiceFilterOption[]>(() => {
		const seen = new Map<string, string>();
		voices.forEach(({ voice }) => {
			const key = normalize(voice.gender);
			if (key && !seen.has(key)) {
				seen.set(key, voice.gender);
			}
		});
		return Array.from(seen.entries()).map(([value, label]) => ({
			value,
			label,
		}));
	}, [voices]);

	const availableLanguages = useMemo<VoiceFilterOption[]>(() => {
		const seen = new Map<string, string>();
		voices.forEach(({ voice }) => {
			const key = normalize(voice.language);
			if (key && !seen.has(key)) {
				seen.set(key, voice.language);
			}
		});
		return Array.from(seen.entries())
			.map(([value, label]) => ({ value, label }))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [voices]);

	const filter = useCallback(
		(input: AgentVoiceModel[]): AgentVoiceModel[] => {
			const searchTerm = normalize(search);
			return input.filter(({ voice }) => {
				if (genders.length > 0 && !genders.includes(normalize(voice.gender))) {
					return false;
				}
				if (
					languages.length > 0 &&
					!languages.includes(normalize(voice.language))
				) {
					return false;
				}
				if (searchTerm) {
					const haystack = [voice.name, voice.description, voice.accent]
						.map(normalize)
						.join(' ');
					if (!haystack.includes(searchTerm)) {
						return false;
					}
				}
				return true;
			});
		},
		[search, genders, languages]
	);

	const activeFilterCount =
		(search.trim() ? 1 : 0) + genders.length + languages.length;

	return {
		search,
		genders,
		languages,
		setSearch,
		toggleGender,
		toggleLanguage,
		reset,
		activeFilterCount,
		hasActiveFilters: activeFilterCount > 0,
		availableGenders,
		availableLanguages,
		filter,
	};
};
