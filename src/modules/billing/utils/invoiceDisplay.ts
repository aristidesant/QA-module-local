import type { ClientModel } from '~/models/ClientModel';
import type { InvoiceResponse } from '~/models/InvoiceModel';

export interface InvoiceWorkspaceStats {
	loadedCount: number;
	draftCount: number;
	issuedCount: number;
	voidedCount: number;
	visibleTotal: number;
	visibleTotalFormatted: string;
}

export const EMPTY_VALUE = '—';

function parseDateOnly(value: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return null;

	const [, year, month, day] = match;
	return new Date(Number(year), Number(month) - 1, Number(day));
}

export function formatInvoiceDate(value?: string | null): string {
	if (!value) return EMPTY_VALUE;

	const date = parseDateOnly(value) ?? new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleDateString();
}

export function formatInvoiceDateTime(value?: string | null): string {
	if (!value) return EMPTY_VALUE;

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleString();
}

export function formatInvoicePeriod(
	periodStart?: string | null,
	periodEnd?: string | null
): string {
	if (!periodStart && !periodEnd) return EMPTY_VALUE;
	if (!periodStart) return periodEnd ?? EMPTY_VALUE;
	if (!periodEnd) return periodStart;

	return `${periodStart} - ${periodEnd}`;
}

export function getInvoiceTotalDisplay(invoice: InvoiceResponse): string {
	return (
		invoice.snapshot?.totals?.totalFormatted ?? invoice.total ?? EMPTY_VALUE
	);
}

export function getInvoiceSubtotalDisplay(invoice: InvoiceResponse): string {
	return (
		invoice.snapshot?.totals?.subtotalFormatted ??
		invoice.subtotal ??
		EMPTY_VALUE
	);
}

export function getInvoiceTaxDisplay(invoice: InvoiceResponse): string {
	return (
		invoice.snapshot?.totals?.taxTotalFormatted ??
		invoice.taxTotal ??
		EMPTY_VALUE
	);
}

export function getInvoiceTotalValue(invoice: InvoiceResponse): number {
	const snapshotTotal = invoice.snapshot?.totals?.total;
	if (typeof snapshotTotal === 'number' && Number.isFinite(snapshotTotal)) {
		return snapshotTotal;
	}

	const parsed = Number(invoice.total);
	return Number.isFinite(parsed) ? parsed : 0;
}

export function formatVisibleInvoiceValue(
	total: number,
	fallbackCurrency: string
): string {
	return new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: fallbackCurrency || 'USD',
		maximumFractionDigits: 2,
	}).format(total);
}

export function buildInvoiceWorkspaceStats(
	invoices: InvoiceResponse[]
): InvoiceWorkspaceStats {
	const currencies = new Set(invoices.map((invoice) => invoice.currency));
	const hasSingleCurrency = currencies.size <= 1;
	const visibleTotal = hasSingleCurrency
		? invoices.reduce((sum, invoice) => sum + getInvoiceTotalValue(invoice), 0)
		: 0;
	const fallbackCurrency = invoices[0]?.currency ?? 'USD';

	return {
		loadedCount: invoices.length,
		draftCount: invoices.filter((invoice) => invoice.status === 'DRAFT').length,
		issuedCount: invoices.filter((invoice) => invoice.status === 'ISSUED')
			.length,
		voidedCount: invoices.filter((invoice) => invoice.status === 'VOIDED')
			.length,
		visibleTotal,
		visibleTotalFormatted: hasSingleCurrency
			? formatVisibleInvoiceValue(visibleTotal, fallbackCurrency)
			: EMPTY_VALUE,
	};
}

export function getClientOptionLabel(
	clients: ClientModel[],
	clientId?: string | number | null
): string {
	if (clientId == null || clientId === '') return EMPTY_VALUE;

	const id = Number(clientId);
	const client = clients.find((item) => item.id === id);

	return client?.name ?? String(clientId);
}
