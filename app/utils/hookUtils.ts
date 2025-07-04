/**
 * Utility functions for safe hook operations and dependency handling
 */

/**
 * Safely handles array values that might be undefined or null
 * @param arr - Array that might be undefined or null
 * @returns Empty array if input is falsy, otherwise the original array
 */
export const safeArray = <T>(arr: T[] | undefined | null): T[] => arr ?? [];

/**
 * Safely handles string values that might be undefined or null
 * @param str - String that might be undefined or null
 * @returns Empty string if input is falsy, otherwise the original string
 */
export const safeString = (str: string | undefined | null): string => str ?? "";

/**
 * Safely handles number values that might be undefined or null
 * @param num - Number that might be undefined or null
 * @returns 0 if input is falsy, otherwise the original number
 */
export const safeNumber = (num: number | undefined | null): number => num ?? 0;

/**
 * Safely handles boolean values that might be undefined or null
 * @param bool - Boolean that might be undefined or null
 * @returns false if input is falsy, otherwise the original boolean
 */
export const safeBoolean = (bool: boolean | undefined | null): boolean =>
  bool ?? false;

/**
 * Creates stable dependency arrays for React hooks by ensuring all values are defined
 * @param deps - Array of dependencies that might contain undefined values
 * @returns Array with all undefined values replaced with stable defaults
 */
export const stableDeps = (deps: unknown[]): unknown[] => {
  return deps.map((dep) => {
    if (dep === null || dep === undefined) return null;
    if (Array.isArray(dep)) return safeArray(dep);
    if (typeof dep === "string") return safeString(dep);
    if (typeof dep === "number") return safeNumber(dep);
    if (typeof dep === "boolean") return safeBoolean(dep);
    return dep;
  });
};

/**
 * Safe length accessor that handles undefined/null arrays
 * @param arr - Array that might be undefined or null
 * @returns Length of array or 0 if array is falsy
 */
export const safeLength = (arr: unknown[] | undefined | null): number => {
  return Array.isArray(arr) ? arr.length : 0;
};
