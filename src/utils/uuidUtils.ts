/**
 * Generates a UUID v4 using the browser's native crypto.randomUUID() method
 * @returns A UUID v4 string
 */
export const generateUUIDv4 = (): string => {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}

	// Fallback for environments without crypto.randomUUID (though unlikely in modern browsers)
	throw new Error('crypto.randomUUID is not available');
};
