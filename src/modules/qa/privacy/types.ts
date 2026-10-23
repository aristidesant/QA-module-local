/** The groups a QA manager switches on or off. */
export type SensitiveCategory =
	| 'payment'
	| 'identity'
	| 'contact'
	| 'credentials';

/** What exactly was found; each kind belongs to one category. */
export type SensitiveKind =
	| 'card'
	| 'iban'
	| 'cvv'
	| 'expiry'
	| 'bankAccount'
	| 'nationalId'
	| 'ssn'
	| 'passport'
	| 'email'
	| 'phone'
	| 'address'
	| 'dob'
	| 'pin';

export interface SensitiveCategoryConfig {
	enabled: boolean;
	/** Digits left visible at the end, e.g. 4 for a card. 0 hides everything. */
	showLast: number;
}

export interface RevealPolicy {
	/** Whether a QA manager can reveal the data on the call detail at all. */
	allowed: boolean;
	/** How long the data stays visible after a reveal. */
	minutes: number;
	/** A free-text note is required besides the reason. */
	requireNote: boolean;
}

export interface PrivacySettings {
	enabled: boolean;
	categories: Record<SensitiveCategory, SensitiveCategoryConfig>;
	/** Mute the recording while the data is said. */
	muteAudio: boolean;
	reveal: RevealPolicy;
}

/** One span of sensitive data found in a text. */
export interface SensitiveHit {
	start: number;
	end: number;
	kind: SensitiveKind;
	category: SensitiveCategory;
	original: string;
	/** What is shown instead, e.g. "•••• 1234". */
	preview: string;
}

/** A text split into plain parts and masked parts, in order. */
export interface MaskSegment {
	text: string;
	hit?: SensitiveHit;
}

export type RevealReason =
	| 'disputeReview'
	| 'complianceInvestigation'
	| 'customerRequest'
	| 'fraudCheck'
	| 'other';

export interface RevealSession {
	callId: string;
	by: string;
	reason: RevealReason;
	note: string;
	at: string;
	expiresAt: string;
}

export interface RevealLogEntry extends RevealSession {
	id: string;
	/** Set when the reviewer hid the data before it expired. */
	hiddenAt?: string;
}
