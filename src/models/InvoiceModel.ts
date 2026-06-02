export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'VOIDED';
export type InvoiceCurrency = 'USD' | 'DOP';

export interface ClientSnapshot {
	id: number;
	name: string;
	rnc?: string | null;
	email?: string | null;
	phone?: string | null;
	address?: string | null;
	website?: string | null;
}

export interface PocSnapshot {
	id: number | null;
	name: string | null;
	email: string | null;
}

export interface InvoiceSummaryLine {
	campaignId: number;
	campaignName: string;
	activeAiAgents: number;
	uptimeSeconds: number;
	uptimeHours: number;
	uptimeFormatted: string;
	callsCount: number;
	hourlyRate: number;
	hourlyRateFormatted: string;
	total: number;
	totalFormatted: string;
}

export interface InvoiceExecutionDetail {
	campaignId: number;
	campaignName: string;
	executionDate: string;
	activeAiAgents: number;
	uptimeSeconds: number;
	uptimeFormatted: string;
	callsCount: number;
	startTimestamp: string;
	endTimestamp: string;
}

export interface InvoiceTotals {
	subtotal: number;
	subtotalFormatted: string;
	taxRate: number;
	taxTotal: number;
	taxTotalFormatted: string;
	total: number;
	totalFormatted: string;
}

export interface InvoiceSnapshot {
	invoice: {
		number: string;
		periodStart: string;
		periodEnd: string;
		currency: InvoiceCurrency;
		taxRate: number;
		hourlyRate: number;
		hourlyRateFormatted: string;
	};
	issuer: ClientSnapshot;
	receiver: ClientSnapshot;
	poc: {
		issuer: PocSnapshot;
		receiver: PocSnapshot;
	};
	summaryLines: InvoiceSummaryLine[];
	executionDetails: InvoiceExecutionDetail[];
	totals: InvoiceTotals;
	calculationWarnings: string[];
}

export interface InvoiceResponse {
	id: number;
	invoiceNumber: string;
	issuerClientId: number;
	receiverClientId: number;
	periodStart: string;
	periodEnd: string;
	status: InvoiceStatus;
	currency: InvoiceCurrency;
	taxRate: string;
	hourlyRate: string;
	subtotal: string;
	taxTotal: string;
	total: string;
	replacesInvoiceId?: number | null;
	voidedAt?: string | null;
	voidReason?: string | null;
	createdByUserId: number;
	clientId: number;
	snapshot: InvoiceSnapshot;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string | null;
	issuerClient?: unknown;
	receiverClient?: unknown;
	replacesInvoice?: InvoiceResponse | null;
}

export interface InvoiceConflict {
	id: number;
	invoiceNumber: string;
	status: InvoiceStatus;
	periodStart: string;
	periodEnd: string;
}

export interface InvoicePreviewResponse {
	hasActiveInvoiceConflict: boolean;
	activeInvoiceConflict: InvoiceConflict | null;
	snapshot: InvoiceSnapshot;
}

export interface InvoicePaginatedResponse {
	data: InvoiceResponse[];
	total: number;
	limit: number;
	offset: number;
}

export interface PreviewInvoiceDto {
	issuerClientId: number;
	receiverClientId: number;
	periodStart: string;
	periodEnd: string;
	invoiceNumber?: string;
	currency: InvoiceCurrency;
	taxRate: number;
	hourlyRate: number;
}

export interface CreateInvoiceDto extends PreviewInvoiceDto {
	invoiceNumber: string;
	status?: InvoiceStatus;
	replaceExisting?: boolean;
	replacesInvoiceId?: number;
	replaceReason?: string;
}

export interface FilterInvoiceDto {
	limit?: number;
	offset?: number;
	issuerClientId?: number;
	receiverClientId?: number;
	status?: InvoiceStatus;
	periodStart?: string;
	periodEnd?: string;
}

export interface VoidInvoiceDto {
	reason: string;
}
