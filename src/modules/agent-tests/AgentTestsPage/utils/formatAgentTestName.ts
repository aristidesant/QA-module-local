export const formatAgentTestName = (name?: string | null): string => {
	const rawName = (name ?? '').trim();

	if (!rawName) {
		return '';
	}

	if (!rawName.includes('##')) {
		return rawName;
	}

	const [, ...nameParts] = rawName.split('##');
	const formattedName = nameParts.join('##').trim();

	return formattedName || rawName;
};
