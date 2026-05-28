/** Deterministic avatar generation for client selection. */

interface AvatarStyle {
	initials: string;
	gradient: string;
}

/** 12 curated gradient pairs for client avatars. */
const GRADIENTS = [
	'linear-gradient(135deg, #4caf50, #2e7d32)',
	'linear-gradient(135deg, #1976d2, #0d47a1)',
	'linear-gradient(135deg, #e65100, #bf360c)',
	'linear-gradient(135deg, #7b1fa2, #4a148c)',
	'linear-gradient(135deg, #c62828, #b71c1c)',
	'linear-gradient(135deg, #00695c, #004d40)',
	'linear-gradient(135deg, #f57f17, #e65100)',
	'linear-gradient(135deg, #455a64, #263238)',
	'linear-gradient(135deg, #5c6bc0, #283593)',
	'linear-gradient(135deg, #00838f, #006064)',
	'linear-gradient(135deg, #ad1457, #880e4f)',
	'linear-gradient(135deg, #6d4c41, #4e342e)',
];

/**
 * Extract initials from a client name.
 * - Multi-word: first letter of first two words ("Acme Corporation" → "AC")
 * - camelCase: split on uppercase boundaries ("nombreApellido" → "NA")
 * - Fallback: first two letters of the name
 */
function getInitials(name: string): string {
	const trimmed = name.trim();

	const words = trimmed.split(/\s+/).filter(Boolean);
	if (words.length >= 2) {
		return (words[0][0] + words[1][0]).toUpperCase();
	}

	const camelParts = trimmed.split(/(?=[A-Z])/).filter(Boolean);
	if (camelParts.length >= 2) {
		return (camelParts[0][0] + camelParts[1][0]).toUpperCase();
	}

	const letters = trimmed
		.replace(/[^a-zA-Z]/g, '')
		.slice(0, 2)
		.toUpperCase();
	return letters.length === 2 ? letters : letters.padEnd(2, letters.charAt(0));
}

/** Deterministic hash from a string to an index in the gradient palette. */
function getGradientIndex(name: string): number {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = (hash * 31 + name.charCodeAt(i)) | 0;
	}
	return (hash >>> 0) % GRADIENTS.length;
}

/** Generate avatar style for a client. */
export function generateClientAvatar(clientName: string): AvatarStyle {
	return {
		initials: getInitials(clientName),
		gradient: GRADIENTS[getGradientIndex(clientName)],
	};
}
