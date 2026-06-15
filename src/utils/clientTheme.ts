export const HEX_COLOR_PATTERN =
	/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export const DEFAULT_PRIMARY_COLOR = '#1A73E8';
export const DEFAULT_SECONDARY_COLOR = '#34A853';

export const MAX_BRAND_NAME_LENGTH = 150;

export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

export const ALLOWED_LOGO_MIME_TYPES = [
	'image/png',
	'image/jpeg',
	'image/svg+xml',
	'image/webp',
] as const;

export type AllowedLogoMime = (typeof ALLOWED_LOGO_MIME_TYPES)[number];

export const isValidHexColor = (value: string): boolean =>
	HEX_COLOR_PATTERN.test(value);

export const isAllowedLogoMime = (mime: string): mime is AllowedLogoMime =>
	(ALLOWED_LOGO_MIME_TYPES as readonly string[]).includes(mime);

export const normalizeHexColor = (value: string): string => {
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};
