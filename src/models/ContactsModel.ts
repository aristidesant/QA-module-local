export interface PhoneValidationError {
	code: string;
	message: string;
	rawPhone: string;
}

export interface PhoneEntry {
	phoneNumber: string;
	validationError?: PhoneValidationError;
	// Optional metadata fields returned by some APIs
	lastCalledAt?: string | null; // ISO datetime or null when never called
	maxRetryAttempts?: number;
	priorityOrder?: number;
	retryCounter?: number;
	status?: string; // e.g. 'DO_NOT_CONTACT', 'ACTIVE', etc.
}

// Represents a stored phone number entity belonging to a contact
export interface ContactPhoneNumber extends PhoneEntry {
	id: number;
}

export interface Contact {
	id: number;
	firstName: string;
	lastName: string;
	identifier: string;
	identifierType: string | null;
	emails: string[];
	phoneNumbers: ContactPhoneNumber[]; // include id for editing operations
	birthDate: string | null; // ISO date string
	address: string;
	clientId: number;
	userId: number;
	contactGroupId: number;
	status: 'ACTIVE' | 'INACTIVE' | string;
	createdAt: string; // ISO datetime string
	updatedAt: string; // ISO datetime string
}

export enum ContactStatus {
	DO_NOT_RESPOND = 'DO_NOT_RESPOND',
	CONTACTED = 'CONTACTED',
	VOICE_MAIL = 'VOICE_MAIL',
	ON_CALL = 'ON_CALL',
	INICATIVE = 'INICATIVE', // Added per requirement (note: spelled as provided)
	DECEASED = 'DECEASED',
	INACTIVE = 'INACTIVE',
	ACTIVE = 'ACTIVE',
}
