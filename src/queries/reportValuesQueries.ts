import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import reportValuesApi from '~/api/reportValuesApi';
import type {
	BulkUpdateReportValuesDto,
	CreateReportValueDto,
	UpdateReportValueDto,
} from '~/models/ReportValue';

type ReportValueMutationOptions = {
	invalidateOnSuccess?: boolean;
};

export const useGetReportColumns = (campaignId: number) => {
	return useQuery({
		queryKey: ['reportColumns', 'campaign', campaignId],
		queryFn: async () => {
			const api = reportValuesApi();
			return api.getColumns(campaignId);
		},
		enabled: !!campaignId && !Number.isNaN(campaignId),
	});
};

export const useCreateReportValue = (
	campaignId: number,
	options: ReportValueMutationOptions = {}
) => {
	const queryClient = useQueryClient();
	const { invalidateOnSuccess = true } = options;
	return useMutation({
		mutationFn: async (dto: CreateReportValueDto) => {
			const api = reportValuesApi();
			return api.create(dto);
		},
		onSuccess: () => {
			if (!invalidateOnSuccess) return;
			void queryClient.invalidateQueries({
				queryKey: ['reportColumns', 'campaign', campaignId],
			});
		},
	});
};

export const useUpdateReportValue = (campaignId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			dto,
		}: {
			id: number;
			dto: UpdateReportValueDto;
		}) => {
			const api = reportValuesApi();
			return api.update(id, dto);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['reportColumns', 'campaign', campaignId],
			});
		},
	});
};

export const useDeleteReportValue = (
	campaignId: number,
	options: ReportValueMutationOptions = {}
) => {
	const queryClient = useQueryClient();
	const { invalidateOnSuccess = true } = options;
	return useMutation({
		mutationFn: async (id: number) => {
			const api = reportValuesApi();
			return api.remove(id);
		},
		onSuccess: () => {
			if (!invalidateOnSuccess) return;
			void queryClient.invalidateQueries({
				queryKey: ['reportColumns', 'campaign', campaignId],
			});
		},
	});
};

export const useBulkUpdateReportValues = (
	campaignId: number,
	options: ReportValueMutationOptions = {}
) => {
	const queryClient = useQueryClient();
	const { invalidateOnSuccess = true } = options;
	return useMutation({
		mutationFn: async (dto: BulkUpdateReportValuesDto) => {
			const api = reportValuesApi();
			return api.bulkUpdate(campaignId, dto);
		},
		onSuccess: () => {
			if (!invalidateOnSuccess) return;
			void queryClient.invalidateQueries({
				queryKey: ['reportColumns', 'campaign', campaignId],
			});
		},
	});
};
