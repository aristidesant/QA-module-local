import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import reportTemplatesApi from '~/api/reportTemplatesApi';
import type {
	CreateReportTemplateDto,
	UpdateReportTemplateDto,
	BulkUpdateReportTemplateColumnsDto,
	ExportReportTemplateDto,
	CreateReportValueWithTemplateDto,
	UpdateReportValueDto,
} from '~/models/ReportValue';

type TemplateMutationOptions = {
	invalidateOnSuccess?: boolean;
};

export const useGetReportTemplates = () => {
	return useQuery({
		queryKey: ['reportTemplates'],
		queryFn: async () => {
			const api = reportTemplatesApi();
			return api.list();
		},
	});
};

export const useGetReportTemplate = (templateId: number) => {
	return useQuery({
		queryKey: ['reportTemplates', 'detail', templateId],
		queryFn: async () => {
			const api = reportTemplatesApi();
			return api.getById(templateId);
		},
		enabled: !!templateId && !Number.isNaN(templateId),
	});
};

export const useCreateReportTemplate = (
	options: TemplateMutationOptions = {}
) => {
	const queryClient = useQueryClient();
	const { invalidateOnSuccess = true } = options;
	return useMutation({
		mutationFn: async (dto: CreateReportTemplateDto) => {
			const api = reportTemplatesApi();
			return api.create(dto);
		},
		onSuccess: () => {
			if (!invalidateOnSuccess) return;
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplates'],
			});
		},
	});
};

export const useUpdateReportTemplate = (
	templateId: number,
	options: TemplateMutationOptions = {}
) => {
	const queryClient = useQueryClient();
	const { invalidateOnSuccess = true } = options;
	return useMutation({
		mutationFn: async (dto: UpdateReportTemplateDto) => {
			const api = reportTemplatesApi();
			return api.update(templateId, dto);
		},
		onSuccess: () => {
			if (!invalidateOnSuccess) return;
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplates', 'detail', templateId],
			});
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplates'],
			});
		},
	});
};

export const useDeleteReportTemplate = (
	options: TemplateMutationOptions = {}
) => {
	const queryClient = useQueryClient();
	const { invalidateOnSuccess = true } = options;
	return useMutation({
		mutationFn: async (id: number) => {
			const api = reportTemplatesApi();
			return api.delete(id);
		},
		onSuccess: () => {
			if (!invalidateOnSuccess) return;
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplates'],
			});
		},
	});
};

export const useGetReportTemplateColumns = (
	templateId: number,
	params?: {
		page?: number;
		limit?: number;
		originType?: string;
		dataType?: string;
	}
) => {
	return useQuery({
		queryKey: ['reportTemplateColumns', templateId, params],
		queryFn: async () => {
			const api = reportTemplatesApi();
			return api.getColumns(templateId, params);
		},
		enabled: !!templateId && !Number.isNaN(templateId),
	});
};

export const useGetAllReportTemplateColumns = (templateId: number) => {
	return useQuery({
		queryKey: ['reportTemplateColumns', 'all', templateId],
		queryFn: async () => {
			const api = reportTemplatesApi();
			return api.getAllColumns(templateId);
		},
		enabled: !!templateId && !Number.isNaN(templateId),
	});
};

export const useBulkUpdateReportTemplateColumns = (
	templateId: number,
	options: TemplateMutationOptions = {}
) => {
	const queryClient = useQueryClient();
	const { invalidateOnSuccess = true } = options;
	return useMutation({
		mutationFn: async (dto: BulkUpdateReportTemplateColumnsDto) => {
			const api = reportTemplatesApi();
			return api.bulkUpdateColumns(templateId, dto);
		},
		onSuccess: () => {
			if (!invalidateOnSuccess) return;
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplateColumns', templateId],
			});
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplateColumns', 'all', templateId],
			});
		},
	});
};

export const useCreateReportTemplateColumn = (
	templateId: number,
	options: TemplateMutationOptions = {}
) => {
	const queryClient = useQueryClient();
	const { invalidateOnSuccess = true } = options;
	return useMutation({
		mutationFn: async (dto: CreateReportValueWithTemplateDto) => {
			const api = reportTemplatesApi();
			return api.createColumn(dto);
		},
		onSuccess: () => {
			if (!invalidateOnSuccess) return;
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplateColumns', templateId],
			});
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplateColumns', 'all', templateId],
			});
		},
	});
};

export const useUpdateReportTemplateColumn = (
	templateId: number,
	options: TemplateMutationOptions = {}
) => {
	const queryClient = useQueryClient();
	const { invalidateOnSuccess = true } = options;
	return useMutation({
		mutationFn: async ({
			id,
			dto,
		}: {
			id: number;
			dto: UpdateReportValueDto;
		}) => {
			const api = reportTemplatesApi();
			return api.updateColumn(id, dto);
		},
		onSuccess: () => {
			if (!invalidateOnSuccess) return;
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplateColumns', templateId],
			});
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplateColumns', 'all', templateId],
			});
		},
	});
};

export const useDeleteReportTemplateColumn = (
	templateId: number,
	options: TemplateMutationOptions = {}
) => {
	const queryClient = useQueryClient();
	const { invalidateOnSuccess = true } = options;
	return useMutation({
		mutationFn: async (id: number) => {
			const api = reportTemplatesApi();
			return api.deleteColumn(id);
		},
		onSuccess: () => {
			if (!invalidateOnSuccess) return;
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplateColumns', templateId],
			});
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplateColumns', 'all', templateId],
			});
		},
	});
};

export const useDuplicateReportTemplateColumn = (
	templateId: number,
	options: TemplateMutationOptions = {}
) => {
	const queryClient = useQueryClient();
	const { invalidateOnSuccess = true } = options;
	return useMutation({
		mutationFn: async ({
			id,
			dto,
		}: {
			id: number;
			dto: { sheet: number; sheetName: string; order: number; label: string };
		}) => {
			const api = reportTemplatesApi();
			return api.duplicateColumn(id, dto);
		},
		onSuccess: () => {
			if (!invalidateOnSuccess) return;
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplateColumns', templateId],
			});
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplateColumns', 'all', templateId],
			});
		},
	});
};

export const useExportReportTemplate = (
	options: TemplateMutationOptions = {}
) => {
	const queryClient = useQueryClient();
	const { invalidateOnSuccess = true } = options;
	return useMutation({
		mutationFn: async ({
			templateId,
			dto,
		}: {
			templateId: number;
			dto: ExportReportTemplateDto;
		}) => {
			const api = reportTemplatesApi();
			return api.export(templateId, dto);
		},
		onSuccess: () => {
			if (!invalidateOnSuccess) return;
			void queryClient.invalidateQueries({
				queryKey: ['reportTemplates'],
			});
		},
	});
};
