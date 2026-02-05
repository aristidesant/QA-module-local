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

export interface OutboundCallTask {
	id: number;
	contactGroupId: number;
	waveNumber: number;
	contactId: number;
	contactPhoneNumberId: number;
	agentId: string;
	conversationId: string | null;
	status: string;
	queueJobId: string;
	scheduledAt: string;
	startedAt: string | null;
	completedAt: string | null;
	pausedAt: string | null;
	cancelledAt: string | null;
	errorMessage: string | null;
	orderIndex: number;
	orderMode: string;
	pauseReason: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Contact {
	id: number;
	firstName: string;
	lastName: string;
	identifier: string;
	identifierType: string | null;
	emails: string[];
	phoneNumbers: ContactPhoneNumber[]; // include id for editing operations
	phones?: string[]; // raw phone numbers used in create/update payloads
	birthDate: string | null; // ISO date string
	address: string;
	clientId: number;
	userId: number;
	contactGroupId: number;
	variableData?: VariableData; // dynamic custom fields per contact
	status: 'ACTIVE' | 'INACTIVE' | string;
	createdAt: string; // ISO datetime string
	updatedAt: string; // ISO datetime string
	outboundCallTasks?: OutboundCallTask[];
}

// Represents variable, schema-driven data attached to a contact
export interface VariableData {
	id: number;
	campaignId: number;
	contactId: number;
	schemaId: number;
	clientId?: number;
	schemaVersion: number;
	userId: number;
	deletedAt: string | null;
	createdAt: string; // ISO datetime string
	updatedAt: string; // ISO datetime string
	// Arbitrary key-value data captured per schema
	contactData: Record<string, unknown>;
}

// Payload for updating a contact (subset of fields; phones instead of phoneNumbers)
export interface UpdateContactPayload {
	firstName?: string;
	lastName?: string;
	identifier?: string;
	identifierType?: string | null;
	birthDate?: string | null;
	address?: string;
	// When updating, backends may accept either the full VariableData object
	// or only the schema-driven contactData. Keep broad for flexibility.
	variableData?: VariableData | Record<string, unknown>;
	emails?: string[];
	phones?: string[];
	status?: ContactStatus | string;
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
