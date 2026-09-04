import type {
	BusinessInsightType,
	BusinessInsightTypeListQueryParams,
	ComplianceCategory,
	ComplianceCategoryListQueryParams,
	PaginatedResponse,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function getComplianceCategories(params?: ComplianceCategoryListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<ComplianceCategory>>(
		'/compliance-categories',
		{ params }
	);
	return response.data;
}

export async function createComplianceCategory(payload: Omit<ComplianceCategory, 'id' | 'createdAt' | 'updatedAt'>) {
	const response = await qaHttpClient.post<ComplianceCategory>(
		'/compliance-categories',
		payload
	);
	return response.data;
}

export async function updateComplianceCategory(id: number, payload: Partial<Omit<ComplianceCategory, 'id' | 'createdAt' | 'updatedAt'>>) {
	const response = await qaHttpClient.patch<ComplianceCategory>(
		`/compliance-categories/${id}`,
		payload
	);
	return response.data;
}

export async function deleteComplianceCategory(id: number) {
	const response = await qaHttpClient.delete<void>(`/compliance-categories/${id}`);
	return response.data;
}

export async function getBusinessInsightTypes(params?: BusinessInsightTypeListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<BusinessInsightType>>(
		'/business-insight-types',
		{ params }
	);
	return response.data;
}

export async function createBusinessInsightType(payload: Omit<BusinessInsightType, 'id' | 'createdAt' | 'updatedAt'>) {
	const response = await qaHttpClient.post<BusinessInsightType>(
		'/business-insight-types',
		payload
	);
	return response.data;
}

export async function updateBusinessInsightType(id: number, payload: Partial<Omit<BusinessInsightType, 'id' | 'createdAt' | 'updatedAt'>>) {
	const response = await qaHttpClient.patch<BusinessInsightType>(
		`/business-insight-types/${id}`,
		payload
	);
	return response.data;
}

export async function deleteBusinessInsightType(id: number) {
	const response = await qaHttpClient.delete<void>(`/business-insight-types/${id}`);
	return response.data;
}
