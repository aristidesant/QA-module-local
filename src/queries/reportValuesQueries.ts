import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import reportValuesApi from '~/api/reportValuesApi';
import type {
	CreateReportValueDto,
	UpdateReportValueDto,
} from '~/models/ReportValue';

export const useGetReportColumns = (contactGroupId: number) => {
	return useQuery({
		queryKey: ['reportColumns', contactGroupId],
		queryFn: async () => {
			const api = reportValuesApi();
			return api.getColumns(contactGroupId);
		},
		enabled: !!contactGroupId && !Number.isNaN(contactGroupId),
	});
};

export const useCreateReportValue = (contactGroupId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (dto: CreateReportValueDto) => {
			const api = reportValuesApi();
			return api.create(dto);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['reportColumns', contactGroupId],
			});
		},
	});
};

export const useUpdateReportValue = (contactGroupId: number) => {
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
				queryKey: ['reportColumns', contactGroupId],
			});
		},
	});
};

export const useDeleteReportValue = (contactGroupId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = reportValuesApi();
			return api.remove(id);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ['reportColumns', contactGroupId],
			});
		},
	});
};
