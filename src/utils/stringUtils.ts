/**
 * Convert snake_case string to camelCase
 */
export const snakeToCamel = (str: string): string => {
	if (!str) return str;
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert camelCase keys to snake_case recursively
 */
export const toSnakeCase = (obj: any): any => {
	if (obj === null || obj === undefined || typeof obj !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(toSnakeCase);
	}

	const result: any = {};
	for (const [key, value] of Object.entries(obj)) {
		const snakeKey = key.replace(
			/[A-Z]/g,
			(letter) => `_${letter.toLowerCase()}`
		);
		result[snakeKey] = toSnakeCase(value);
	}

	return result;
};

/**
 * Convert snake_case keys to camelCase recursively
 */
export const toCamelCase = (obj: any): any => {
	if (obj === null || obj === undefined || typeof obj !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(toCamelCase);
	}

	const result: any = {};
	for (const [key, value] of Object.entries(obj)) {
		const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
			letter.toUpperCase()
		);
		result[camelKey] = toCamelCase(value);
	}

	return result;
};
