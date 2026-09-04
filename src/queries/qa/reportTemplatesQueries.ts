import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createReportTemplate,
	generateReport,
	getGeneratedReports,
	getReportTemplateDetail,
	getReportTemplates,
	updateReportTemplate,
} from '~/api/qa/reportTemplatesApi';
import type {
	CreateReportTemplatePayload,
	GenerateReportPayload,
	ReportTemplateListQueryParams,
	UpdateReportTemplatePayload,
} from '~/models/qa';
import { queryClient } from '~/queries/queryClient';

export const reportTemplatesQueryKey = ['qa', 'reportTemplates'] as const;
export const reportTemplatesListQueryKey = (params?: ReportTemplateListQueryParams) =>
	['qa', 'reportTemplates', 'list', params ?? {}] as const;
export const reportTemplateQueryKey = (templateId: number) =>
	['qa', 'reportTemplates', templateId] as const;
export const generatedReportsQueryKey = (templateId: number) =>
	['qa', 'reportTemplates', templateId, 'reports'] as const;

export function useReportTemplatesQuery(params?: ReportTemplateListQueryParams) {
	return useQuery({
		queryKey: reportTemplatesListQueryKey(params),
		queryFn: () => getReportTemplates(params),
		staleTime: 5 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
	});
}

export function useReportTemplateDetailQuery(templateId: number) {
	return useQuery({
		enabled: Number.isFinite(templateId),
		queryKey: reportTemplateQueryKey(templateId),
		queryFn: () => getReportTemplateDetail(templateId),
		staleTime: 5 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
	});
}

export function useGeneratedReportsQuery(templateId: number) {
	return useQuery({
		enabled: Number.isFinite(templateId),
		queryKey: generatedReportsQueryKey(templateId),
		queryFn: () => getGeneratedReports(templateId),
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}

export function useCreateReportTemplateMutation() {
	return useMutation({
		mutationFn: (payload: CreateReportTemplatePayload) =>
			createReportTemplate(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: reportTemplatesQueryKey });
		},
	});
}

export function useUpdateReportTemplateMutation(templateId: number) {
	return useMutation({
		mutationFn: (payload: UpdateReportTemplatePayload) =>
			updateReportTemplate(templateId, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: reportTemplatesQueryKey });
		},
	});
}

export function useGenerateReportMutation() {
	return useMutation({
		mutationFn: (data: { templateId: number; payload: GenerateReportPayload }) =>
			generateReport(data.templateId, data.payload),
		onSuccess: async (_, { templateId }) => {
			await queryClient.invalidateQueries({
				queryKey: generatedReportsQueryKey(templateId),
			});
		},
	});
}
