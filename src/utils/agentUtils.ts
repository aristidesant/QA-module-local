import type AgentListObject from '~/models/AgentListObject';

/**
 * Determines if an agent is female based on voice gender or voice name patterns
 */
export const getAgentGender = (
	agent?: AgentListObject
): { isFemale: boolean; source: 'gender' | 'name' | 'default' } => {
	// Check explicit gender field first
	if (agent?.voice?.gender) {
		return {
			isFemale: agent.voice.gender.toLowerCase() === 'female',
			source: 'gender',
		};
	}

	// Fallback: try to determine from voice name if gender field is missing
	if (agent?.voice?.name) {
		const voiceName = agent.voice.name.toLowerCase();
		// Common female voice names patterns
		const femaleNames = [
			'rachel',
			'bella',
			'domi',
			'alice',
			'emma',
			'sophia',
			'aria',
			'grace',
		];
		const isFemale = femaleNames.some((name) => voiceName.includes(name));
		return {
			isFemale,
			source: 'name',
		};
	}

	// Default to male if can't determine
	return {
		isFemale: false,
		source: 'default',
	};
};

/**
 * Gets the appropriate avatar URL based on agent gender
 */
export const getAgentAvatarUrl = (agent?: AgentListObject): string => {
	const { isFemale } = getAgentGender(agent);
	return isFemale ? '/images/avatar-f-do.png' : '/images/avatar-m-do.png';
};

/**
 * Converts language code to display name
 */
export const getLanguageDisplayName = (code: string): string => {
	const languageLower = code.toLowerCase();
	switch (languageLower) {
		case 'en':
		case 'english':
			return 'English';
		case 'es':
		case 'spanish':
		case 'español':
			return 'Spanish';
		default:
			return code.charAt(0).toUpperCase() + code.slice(1);
	}
};

/**
 * Gets the agent's language from the correct configuration path
 */
export const getAgentLanguage = (agent?: AgentListObject): string => {
	const languageCode =
		agent?.config?.conversationConfig?.agent?.language || 'en';
	return getLanguageDisplayName(languageCode);
};

/**
 * Gets the appropriate flag emoji based on language
 */
export const getLanguageFlagEmoji = (language: string): string => {
	const languageLower = language.toLowerCase();

	if (
		languageLower.includes('spanish') ||
		languageLower.includes('español') ||
		languageLower.includes('es')
	) {
		return '🇩🇴'; // Dominican Republic
	}

	if (languageLower.includes('english') || languageLower.includes('en')) {
		return '🇺🇸'; // United States
	}

	return '🌐'; // Default world icon
};

/**
 * Gets the raw language code from agent configuration
 */
export const getAgentLanguageCode = (agent?: AgentListObject): string => {
	return agent?.config?.conversationConfig?.agent?.language || 'en';
};
