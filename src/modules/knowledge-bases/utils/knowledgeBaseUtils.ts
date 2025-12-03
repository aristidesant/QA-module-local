import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';

/**
 * List of common TLDs to help identify URLs without protocol.
 * This helps distinguish between "hello.dev" (URL) and "hello world" (text).
 */
const COMMON_TLDS = [
	'com',
	'org',
	'net',
	'edu',
	'gov',
	'io',
	'dev',
	'app',
	'co',
	'ai',
	'me',
	'info',
	'biz',
	'us',
	'uk',
	'ca',
	'de',
	'fr',
	'es',
	'it',
	'nl',
	'au',
	'jp',
	'cn',
	'in',
	'br',
	'mx',
	'ru',
	'pl',
	'se',
	'no',
	'fi',
	'tech',
	'cloud',
	'online',
	'site',
	'website',
	'blog',
	'shop',
	'store',
	'xyz',
	'top',
	'live',
	'world',
	'digital',
	'network',
	'systems',
	'solutions',
];

/**
 * Checks if a string looks like a URL (with or without protocol).
 * Detects patterns like:
 * - https://example.com
 * - http://example.com/path
 * - example.com
 * - hello.dev
 * - subdomain.example.com/path?query=1
 */
export function isValidUrl(text: string): boolean {
	const trimmed = text.trim();
	if (!trimmed) return false;

	// If it has a valid protocol, use the URL constructor
	if (/^https?:\/\//i.test(trimmed)) {
		try {
			const url = new URL(trimmed);
			return url.protocol === 'http:' || url.protocol === 'https:';
		} catch {
			return false;
		}
	}

	// Check if it looks like a URL without protocol
	// Pattern: domain.tld or subdomain.domain.tld with optional path/query
	const urlPattern = /^(?:[\w-]+\.)+([a-z]{2,})(\/[^\s]*)?$/i;
	const match = trimmed.match(urlPattern);

	if (match) {
		const tld = match[1].toLowerCase();
		// Check if the TLD is a known one
		if (COMMON_TLDS.includes(tld)) {
			return true;
		}
		// Also accept any 2-3 letter TLD (country codes like .uk, .de, .mx)
		if (tld.length >= 2 && tld.length <= 3) {
			return true;
		}
	}

	return false;
}

/**
 * Normalizes a URL by adding https:// if no protocol is present.
 */
export function normalizeUrl(text: string): string {
	const trimmed = text.trim();
	if (!trimmed) return trimmed;

	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}

	return `https://${trimmed}`;
}

/**
 * Infers the knowledge base type from the form values.
 * Priority: file > URL > text
 */
export function inferType(
	content: string,
	file: File | null
): KnowledgeBaseType | null {
	if (file) return KnowledgeBaseType.FILE;
	if (isValidUrl(content)) return KnowledgeBaseType.URL;
	if (content.trim()) return KnowledgeBaseType.TEXT;
	return null;
}
