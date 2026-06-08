import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import invoiceApi from '~/api/invoiceApi';
import { useSessionStore } from '~/stores/sessionStore';
import type {
	FilterInvoiceDto,
	CreateInvoiceDto,
	PreviewInvoiceDto,
	VoidInvoiceDto,
} from '~/models/InvoiceModel';

export const useGetInvoices = (filters: FilterInvoiceDto = {}) => {
	return useQuery({
		queryKey: ['invoices', filters],
		queryFn: async () => {
			const api = invoiceApi();
			return api.getInvoices(filters);
		},
	});
};

export const useGetInvoice = (id: number) => {
	return useQuery({
		queryKey: ['invoice', id],
		queryFn: async () => {
			const api = invoiceApi();
			return api.getInvoice(id);
		},
		enabled: !!id,
	});
};

export const usePreviewInvoice = () => {
	return useMutation({
		mutationFn: async (dto: PreviewInvoiceDto) => {
			const api = invoiceApi();
			return api.previewInvoice(dto);
		},
	});
};

export const useCreateInvoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (dto: CreateInvoiceDto) => {
			const api = invoiceApi();
			return api.createInvoice(dto);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['invoices'] });
		},
	});
};

export const useIssueInvoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = invoiceApi();
			return api.issueInvoice(id);
		},
		onSuccess: (data) => {
			void queryClient.invalidateQueries({ queryKey: ['invoices'] });
			void queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
		},
	});
};

export const useVoidInvoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, dto }: { id: number; dto: VoidInvoiceDto }) => {
			const api = invoiceApi();
			return api.voidInvoice(id, dto);
		},
		onSuccess: (data) => {
			void queryClient.invalidateQueries({ queryKey: ['invoices'] });
			void queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
		},
	});
};

export const useDownloadInvoice = () => {
	const { token } = useSessionStore();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = invoiceApi();
			return api.downloadInvoice(id, token ?? '');
		},
	});
};

export const useDownloadInvoiceTemplate = () => {
	const { token } = useSessionStore();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = invoiceApi();
			return api.downloadInvoiceTemplate(id, token ?? '');
		},
	});
};
