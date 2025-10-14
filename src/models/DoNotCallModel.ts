export type DoNotCallReason =
	| 'CUSTOMER_REQUEST'
	| 'DISPOSITION_OUTCOME'
	| 'REGULATORY_COMPLIANCE'
	| 'MANUAL_ADMIN_BLOCK';

export type DoNotCallStatus = 'active' | 'expired' | 'all';

export interface DoNotCallModel {
	id: number;
	clientId: number;
	phoneNumber: string;
	reason: DoNotCallReason;
	notes: string | null;
	expiresAt: string | null;
	createdByUserId: number;
	callDispositionId: number | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: Record<string, never> | null;
	isActive: boolean;
}

export interface DoNotCallListParams {
	phoneNumber?: string;
	reason?: DoNotCallReason;
	status?: DoNotCallStatus;
	page?: number;
	limit?: number;
}

export interface DoNotCallListResponse {
	data: DoNotCallModel[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface DoNotCallCreateRequest {
	phoneNumber: string;
	reason: DoNotCallReason;
	notes?: string;
	expiresAt?: string;
	callDispositionId?: number;
}

export interface DoNotCallUpdateRequest {
	reason?: DoNotCallReason;
	notes?: string;
	expiresAt?: string;
}

export interface DoNotCallCheckResponse {
	phoneNumber: string;
	isBlocked: boolean;
	dncEntry: DoNotCallModel | null;
}

export interface DoNotCallCleanExpiredResponse {
	cleaned: number;
}
