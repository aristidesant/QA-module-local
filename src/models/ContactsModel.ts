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

export enum OutboundCallTaskStatus {
	PENDING = 'PENDING',
	QUEUED = 'QUEUED',
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETED = 'COMPLETED',
	FAILED = 'FAILED',
	CANCELLED = 'CANCELLED',
	PAUSED = 'PAUSED',
	RETRY = 'RETRY',
	SKIPPED = 'SKIPPED',
}

export interface OutboundCallTask {
	id: number;
	contactGroupId: number;
	waveNumber: number;
	contactId: number;
	contactPhoneNumberId: number;
	agentId: string;
	conversationId: string | null;
	status: OutboundCallTaskStatus | string;
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
	// Nested relations loaded by the queue endpoint
	contact?: Pick<Contact, 'id' | 'firstName' | 'lastName'>;
	contactPhoneNumber?: Pick<ContactPhoneNumber, 'id' | 'phoneNumber'>;
	conversation?: {
		id: number;
		callDisposition?: {
			id: number;
			statusContact: string | null;
			dispositionName: string;
			callStatus: string | null;
			isAbandoned: boolean;
			doNotCall: boolean;
		};
	};
}

export interface OutboundTaskSortField {
	name: string;
	label: string;
	type: string;
}

export interface OutboundTaskSortFieldsResponse {
	staticFields: OutboundTaskSortField[];
	dynamicFields: OutboundTaskSortField[];
}

export interface SortRule {
	field: string;
	direction: 'ASC' | 'DESC';
	isDynamic: boolean;
}

export interface ReorderTasksPayload {
	contactGroupId: number;
	campaignId: number;
	sortRules: SortRule[];
}

export interface ReorderTasksResult {
	updatedCount: number;
	message: string;
}

// --- Queue Progress Types ---

export interface StatusCount {
	status: string;
	count: number;
}

export interface WaveProgress {
	waveNumber: number;
	totalTasks: number;
	tasksByStatus: StatusCount[];
	totalContacts: number;
	contactedContacts: number;
	contactProgress: number;
}

export interface GlobalProgress {
	totalTasks: number;
	tasksByStatus: StatusCount[];
	totalContacts: number;
	contactedContacts: number;
	contactProgress: number;
}

export interface QueueProgressResponse {
	global: GlobalProgress;
	waves: WaveProgress[];
}

export type BulkTaskAction = 'pause' | 'resume' | 'cancel' | 'retry';

export interface BulkTaskActionPayload {
	taskIds: number[];
	action: BulkTaskAction;
	pauseReason?: string;
}

export interface BulkTaskActionResult {
	successful: number;
	failed: number;
	errors: string[];
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
