import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createBusinessInsightType,
	createComplianceCategory,
	deleteBusinessInsightType,
	deleteComplianceCategory,
	getBusinessInsightTypes,
	getComplianceCategories,
	updateBusinessInsightType,
	updateComplianceCategory,
} from '~/api/qa/catalogsApi';
import type {
	BusinessInsightType,
	BusinessInsightTypeListQueryParams,
	ComplianceCategory,
	ComplianceCategoryListQueryParams,
} from '~/models/qa';
import { queryClient } from '~/queries/queryClient';

export const complianceCategoriesQueryKey = ['qa', 'complianceCategories'] as const;
export const complianceCategoriesListQueryKey = (params?: ComplianceCategoryListQueryParams) =>
	['qa', 'complianceCategories', 'list', params ?? {}] as const;

export const businessInsightTypesQueryKey = ['qa', 'businessInsightTypes'] as const;
export const businessInsightTypesListQueryKey = (params?: BusinessInsightTypeListQueryParams) =>
	['qa', 'businessInsightTypes', 'list', params ?? {}] as const;

// Compliance Categories Queries
export function useComplianceCategoriesQuery(params?: ComplianceCategoryListQueryParams) {
	return useQuery({
		queryKey: complianceCategoriesListQueryKey(params),
		queryFn: () => getComplianceCategories(params),
		staleTime: 1 * 60 * 60 * 1000, // 1 hour
		gcTime: 4 * 60 * 60 * 1000, // 4 hours (formerly cacheTime)
	});
}

export function useCreateComplianceCategoryMutation() {
	return useMutation({
		mutationFn: (payload: Omit<ComplianceCategory, 'id' | 'createdAt' | 'updatedAt'>) =>
			createComplianceCategory(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: complianceCategoriesQueryKey,
			});
		},
	});
}

export function useUpdateComplianceCategoryMutation(id: number) {
	return useMutation({
		mutationFn: (payload: Partial<Omit<ComplianceCategory, 'id' | 'createdAt' | 'updatedAt'>>) =>
			updateComplianceCategory(id, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: complianceCategoriesQueryKey,
			});
		},
	});
}

export function useDeleteComplianceCategoryMutation(id: number) {
	return useMutation({
		mutationFn: () => deleteComplianceCategory(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: complianceCategoriesQueryKey,
			});
		},
	});
}

// Business Insight Types Queries
export function useBusinessInsightTypesQuery(params?: BusinessInsightTypeListQueryParams) {
	return useQuery({
		queryKey: businessInsightTypesListQueryKey(params),
		queryFn: () => getBusinessInsightTypes(params),
		staleTime: 1 * 60 * 60 * 1000, // 1 hour
		gcTime: 4 * 60 * 60 * 1000, // 4 hours
	});
}

export function useCreateBusinessInsightTypeMutation() {
	return useMutation({
		mutationFn: (payload: Omit<BusinessInsightType, 'id' | 'createdAt' | 'updatedAt'>) =>
			createBusinessInsightType(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: businessInsightTypesQueryKey,
			});
		},
	});
}

export function useUpdateBusinessInsightTypeMutation(id: number) {
	return useMutation({
		mutationFn: (payload: Partial<Omit<BusinessInsightType, 'id' | 'createdAt' | 'updatedAt'>>) =>
			updateBusinessInsightType(id, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: businessInsightTypesQueryKey,
			});
		},
	});
}

export function useDeleteBusinessInsightTypeMutation(id: number) {
	return useMutation({
		mutationFn: () => deleteBusinessInsightType(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: businessInsightTypesQueryKey,
			});
		},
	});
}
