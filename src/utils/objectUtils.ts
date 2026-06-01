/**
 * Check if a value is valid for merging
 *
 * A value is considered invalid (and therefore skipped during merge) if it is:
 * - null or undefined
 * - an empty string
 * - NaN
 * - an empty array (prevents overwriting existing non-empty arrays with empty defaults)
 */
const isValidValue = (value: unknown): boolean => {
	return (
		value !== null &&
		value !== undefined &&
		(typeof value !== 'string' || value.length > 0) &&
		(typeof value !== 'number' || !isNaN(value)) &&
		(!Array.isArray(value) || value.length > 0)
	);
};

/**
 * Check if an object is a valid object for recursive merging
 */
const isValidObject = (obj: unknown): obj is Record<string, any> => {
	return (
		obj !== null &&
		obj !== undefined &&
		typeof obj === 'object' &&
		!Array.isArray(obj) &&
		Object.keys(obj).length > 0
	);
};

/**
 * Deep merge configuration objects
 *
 * Merges source properties into target, with the following behavior:
 * - If a source value exists in target and both are objects, recursively merge them
 * - If a source value is an object but target doesn't have that parent, create the parent and deep clone the object
 * - Arrays are replaced entirely (not merged)
 * - Otherwise, use the source value
 *
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns A new merged object
 */
export const deepMergeConfig = (
	target: Record<string, any>,
	source: Record<string, any>
): Record<string, any> => {
	const result = { ...target };

	Object.entries(source).forEach(([key, value]) => {
		if (value === null) {
			result[key] = null;
			return;
		}

		if (isValidValue(value)) {
			if (isValidObject(value)) {
				if (isValidObject(result[key])) {
					// Both are valid objects - recursively merge them
					result[key] = deepMergeConfig(result[key], value);
				} else {
					// Parent doesn't exist or isn't a valid object - create it by deep cloning the source object
					result[key] = JSON.parse(JSON.stringify(value));
				}
			} else if (Array.isArray(value)) {
				// Replace arrays entirely (don't merge)
				result[key] = [...value];
			} else {
				// Use the source value (primitive type)
				result[key] = value;
			}
		}
	});

	return result;
};
