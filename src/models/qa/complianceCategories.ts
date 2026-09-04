import type { ListQueryParams } from './shared';

export type ComplianceCategoryMain = 'SECURITY' | 'REGULATORY' | 'LEGAL';
export type ComplianceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ComplianceCategoryListQueryParams extends ListQueryParams {
	mainCategory?: ComplianceCategoryMain;
	isActive?: boolean;
	severity?: ComplianceSeverity;
	sortBy?: 'id' | 'mainCategory' | 'subCategory' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface ComplianceCategory {
	id: number;
	clientId?: number;
	mainCategory: ComplianceCategoryMain;
	subCategory: string;
	description?: string | null;
	severity: ComplianceSeverity;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateComplianceCategoryPayload {
	mainCategory: ComplianceCategoryMain;
	subCategory: string;
	description?: string;
	severity?: ComplianceSeverity;
	isActive?: boolean;
}

export type UpdateComplianceCategoryPayload = Partial<CreateComplianceCategoryPayload>;
