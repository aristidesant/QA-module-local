import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type {
	InvoiceResponse,
	InvoicePreviewResponse,
	InvoicePaginatedResponse,
	PreviewInvoiceDto,
	CreateInvoiceDto,
	FilterInvoiceDto,
	VoidInvoiceDto,
} from '~/models/InvoiceModel';

interface InvoiceApiClient {
	previewInvoice: (dto: PreviewInvoiceDto) => Promise<InvoicePreviewResponse>;
	createInvoice: (dto: CreateInvoiceDto) => Promise<InvoiceResponse>;
	getInvoices: (
		filters?: FilterInvoiceDto
	) => Promise<InvoicePaginatedResponse>;
	getInvoice: (id: number) => Promise<InvoiceResponse>;
	issueInvoice: (id: number) => Promise<InvoiceResponse>;
	voidInvoice: (id: number, dto: VoidInvoiceDto) => Promise<InvoiceResponse>;
	downloadDocx: (id: number, token: string) => Promise<void>;
}

const invoiceApi = (
	_authHeader: Record<string, string> = {}
): InvoiceApiClient => ({
	previewInvoice: async (dto) => {
		const response = await axios.post<InvoicePreviewResponse>(
			`${DEFAULT_API_URL}/invoices/preview`,
			dto,
			{ headers: { ..._authHeader } }
		);
		return response.data;
	},

	createInvoice: async (dto) => {
		const response = await axios.post<InvoiceResponse>(
			`${DEFAULT_API_URL}/invoices`,
			dto,
			{ headers: { ..._authHeader } }
		);
		return response.data;
	},

	getInvoices: async (filters = {}) => {
		const response = await axios.get<InvoicePaginatedResponse>(
			`${DEFAULT_API_URL}/invoices`,
			{ params: filters, headers: { ..._authHeader } }
		);
		return response.data;
	},

	getInvoice: async (id) => {
		const response = await axios.get<InvoiceResponse>(
			`${DEFAULT_API_URL}/invoices/${id}`,
			{ headers: { ..._authHeader } }
		);
		return response.data;
	},

	issueInvoice: async (id) => {
		const response = await axios.patch<InvoiceResponse>(
			`${DEFAULT_API_URL}/invoices/${id}/issue`,
			{},
			{ headers: { ..._authHeader } }
		);
		return response.data;
	},

	voidInvoice: async (id, dto) => {
		const response = await axios.patch<InvoiceResponse>(
			`${DEFAULT_API_URL}/invoices/${id}/void`,
			dto,
			{ headers: { ..._authHeader } }
		);
		return response.data;
	},

	downloadDocx: async (id, token) => {
		const response = await fetch(`${DEFAULT_API_URL}/invoices/${id}/docx`, {
			headers: { ..._authHeader, Authorization: `Bearer ${token}` },
		});
		if (!response.ok) {
			const status = response.status;
			const error = new Error(`DOCX download failed: ${status}`);
			(error as Error & { status: number }).status = status;
			throw error;
		}
		const blob = await response.blob();
		const contentDisposition =
			response.headers.get('Content-Disposition') ?? '';
		const filename =
			contentDisposition.match(/filename="?([^";\s]+)"?/)?.[1] ??
			'invoice.docx';
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	},
});

export default invoiceApi;
