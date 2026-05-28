// Frontend TypeScript definitions for Disposition entities

import type { DispositionNode } from './DispositionNodeModel';

// Create DTOs
export interface CreateDispositionCatalog {
	name: string;
	description?: string;
	campaignId?: number;
	isDefault?: boolean;
	type?: 'INBOUND' | 'OUTBOUND';
}

export interface UpdateDispositionCatalog {
	name?: string;
	description?: string;
	isActive?: boolean;
	isDefault?: boolean;
	type?: 'INBOUND' | 'OUTBOUND';
}

export interface CreateDispositionCategory {
	name: string;
	description?: string;
	order?: number;
	isProtected?: boolean;
}

export interface UpdateDispositionCategory {
	name?: string;
	description?: string;
	order?: number;
	isActive?: boolean;
}

export interface CreateDispositionType {
	name: string;
	description?: string;
	order?: number;
}

export interface UpdateDispositionType {
	name?: string;
	description?: string;
	order?: number;
	isActive?: boolean;
}

export interface CreateDispositionStatus {
	name: string;
	description?: string;
	isInvalidatesNumber?: boolean;
	requiresReschedule?: boolean;
	isFinal?: boolean;
	order?: number;
}

export interface UpdateDispositionStatus {
	name?: string;
	description?: string;
	isInvalidatesNumber?: boolean;
	requiresReschedule?: boolean;
	isFinal?: boolean;
	order?: number;
	isActive?: boolean;
}

export interface DispositionCatalogImportNodePayload {
	name: string;
	description?: string;
	order?: number;
	isFinal?: boolean;
	isVoiceMail?: boolean;
	doNotCall?: boolean;
	isAbandoned?: boolean;
	requiresReschedule?: boolean;
	isInvalidatesNumber?: boolean;
	isActive?: boolean;
	children: DispositionCatalogImportNodePayload[];
}

export interface DispositionCatalogImportRequest {
	dryRun?: boolean;
	name: string;
	type: 'INBOUND' | 'OUTBOUND';
	isDefault?: boolean;
	description?: string;
	dispositionNodes: DispositionCatalogImportNodePayload[];
}

export interface DispositionCatalogImportValidationError {
	path: string;
	message: string;
}

export interface DispositionCatalogImportDryRunResponse {
	dryRun: true;
	valid: boolean;
	totalNodes: number;
	nodes?: DispositionCatalogImportNodePayload[];
	errors?: DispositionCatalogImportValidationError[];
}

export interface DispositionCatalogImportedNode {
	id: number;
	name: string;
	description?: string;
	order?: number;
	isFinal?: boolean;
	isVoiceMail?: boolean;
	doNotCall?: boolean;
	isAbandoned?: boolean;
	requiresReschedule?: boolean;
	isInvalidatesNumber?: boolean;
	isActive?: boolean;
	children: DispositionCatalogImportedNode[];
}

export interface DispositionCatalogImportSuccessResponse {
	dryRun: false;
	catalogId: number;
	totalCreated: number;
	nodes: DispositionCatalogImportedNode[];
}

export type DispositionCatalogImportResponse =
	| DispositionCatalogImportDryRunResponse
	| DispositionCatalogImportSuccessResponse;

export type DispositionCatalogExportPayload = Omit<
	DispositionCatalogImportRequest,
	'dryRun'
>;

/**
 * Backwards-compatible aliases for the previous temporary implementation.
 * Prefer the spec-aligned names above in new code.
 */
export type DispositionNodeImportPayload = DispositionCatalogImportNodePayload;
export type DispositionCatalogImportPayload = DispositionCatalogImportRequest;

// Response DTOs
export interface DispositionStatusModel {
	id: number;
	name: string;
	description?: string;
	isInvalidatesNumber: boolean;
	requiresReschedule: boolean;
	isFinal: boolean;
	order: number;
	isActive: boolean;
	createdAt: string; // or Date, depending on JSON parsing
	updatedAt: string;
}

export interface DispositionTypeModel {
	id: number;
	name: string;
	description?: string;
	order: number;
	isActive: boolean;
	statuses?: DispositionStatusModel[];
	createdAt: string;
	updatedAt: string;
}

export interface DispositionCategoryModel {
	id: number;
	name: string;
	description?: string;
	order: number;
	isActive: boolean;
	isProtected: boolean;
	types?: DispositionTypeModel[];
	createdAt: string;
	updatedAt: string;
}

export interface DispositionCatalogModel {
	id: number;
	name: string;
	description?: string;
	clientId: number;
	campaignId?: number;
	isActive: boolean;
	isDefault: boolean;
	type?: 'INBOUND' | 'OUTBOUND';
	dispositionNodes?: DispositionNode[];
	createdAt: string;
	updatedAt: string;
}
