import type {
	PrivacySettings,
	RevealReason,
	SensitiveCategory,
	SensitiveKind,
} from './types';

export const SENSITIVE_CATEGORIES: SensitiveCategory[] = [
	'payment',
	'identity',
	'contact',
	'credentials',
];

/** Kinds of each category, in the order Settings lists them. */
export const KINDS_BY_CATEGORY: Record<SensitiveCategory, SensitiveKind[]> = {
	payment: ['card', 'cvv', 'expiry', 'iban', 'bankAccount'],
	identity: ['nationalId', 'ssn', 'passport'],
	contact: ['phone', 'email', 'address'],
	credentials: ['pin', 'dob'],
};

/** Short label on the masked chip. English by the call-evaluation convention. */
export const KIND_LABEL: Record<SensitiveKind, string> = {
	card: 'Card',
	iban: 'IBAN',
	cvv: 'CVV',
	expiry: 'Expiry',
	bankAccount: 'Account',
	nationalId: 'ID',
	ssn: 'SSN',
	passport: 'Passport',
	email: 'Email',
	phone: 'Phone',
	address: 'Address',
	dob: 'Date of birth',
	pin: 'PIN / code',
};

export const REVEAL_REASONS: RevealReason[] = [
	'disputeReview',
	'complianceInvestigation',
	'customerRequest',
	'fraudCheck',
	'other',
];

export const REVEAL_MINUTES = { min: 5, max: 120 } as const;

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
	enabled: true,
	categories: {
		payment: { enabled: true, showLast: 4 },
		identity: { enabled: true, showLast: 0 },
		contact: { enabled: true, showLast: 0 },
		credentials: { enabled: true, showLast: 0 },
	},
	muteAudio: true,
	reveal: { allowed: true, minutes: 15, requireNote: false },
};
