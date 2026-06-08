# Invoice Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the existing billing invoice workflow into a cohesive operational command center across list, creation, detail, and invoice review surfaces.

**Architecture:** Keep the existing billing routes, API hooks, React Query flow, and master-only guards unchanged. Add small billing-local display helpers, refactor the shared invoice snapshot review into clearer panels, and then update each route page to use the richer hierarchy. Locale updates happen first so all new UI copy can use the `billing` namespace in English and Spanish.

**Tech Stack:** React 19, React Router v7, Vite, TypeScript, Mantine v9, TanStack React Query v5, TanStack React Table v8 through `BaseTable`, CSS Modules, `@tabler/icons-react`, `react-i18next`.

---

## Scope And Worktree Notes

The current worktree already contains unrelated modified billing/API/client files. Implementation must preserve those changes. Before each commit, stage only the files touched by that task.

Do not change backend contracts, routes, permissions, invoice statuses, or invoice mutation behavior.

## File Structure

Create:

- `src/modules/billing/utils/invoiceDisplay.ts` — billing-local formatting, totals parsing, page-scoped workspace stats, client display helpers.
- `src/modules/billing/utils/index.ts` — barrel export for billing utility helpers.
- `docs/superpowers/plans/2026-06-03-invoice-page-redesign.md` — this plan.

Modify:

- `src/locales/en/billing.json` — new workspace, review, confirmation, failure, and empty-state copy.
- `src/locales/es/billing.json` — Spanish equivalents for every new key.
- `src/modules/billing/components/InvoiceFilters/InvoiceFilters.tsx` — compact toolbar markup and accessible clear action.
- `src/modules/billing/components/InvoiceFilters/InvoiceFilters.module.css` — responsive compact toolbar layout.
- `src/modules/billing/hooks/useInvoiceColumns.tsx` — stronger invoice number/status/relationship/total cells.
- `src/modules/billing/InvoicesPage/InvoicesPage.tsx` — command-center header, page-scoped summary, compact template placement, localized failures.
- `src/modules/billing/InvoicesPage/InvoicesPage.module.css` — workspace layout, header metrics, table row polish.
- `src/modules/billing/components/InvoiceSnapshotCard/InvoiceSnapshotCard.tsx` — richer reusable snapshot review component.
- `src/modules/billing/components/InvoiceSnapshotCard/InvoiceSnapshotCard.module.css` — party panels, totals panel, tables, responsive layout.
- `src/modules/billing/InvoiceNewPage/InvoiceNewPage.tsx` — grouped parameters, summary panel, improved review/confirm steps, localized failures.
- `src/modules/billing/InvoiceNewPage/InvoiceNewPage.module.css` — grouped form layout, side summary, review/confirm layout.
- `src/modules/billing/InvoiceDetailPage/InvoiceDetailPage.tsx` — review header, action hierarchy, voided panel, detail layout.
- `src/modules/billing/InvoiceDetailPage/InvoiceDetailPage.module.css` — review workspace responsive layout.

## Task 1: Add Billing Display Helpers And Locale Keys

**Files:**

- Create: `src/modules/billing/utils/invoiceDisplay.ts`
- Create: `src/modules/billing/utils/index.ts`
- Modify: `src/locales/en/billing.json`
- Modify: `src/locales/es/billing.json`

- [ ] **Step 1: Create billing display helpers**

Create `src/modules/billing/utils/invoiceDisplay.ts` with:

```ts
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

export function formatInvoiceDate(value?: string | null): string {
	if (!value) return EMPTY_VALUE;

	const date = new Date(value);
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
	const visibleTotal = invoices.reduce(
		(sum, invoice) => sum + getInvoiceTotalValue(invoice),
		0
	);
	const fallbackCurrency = invoices[0]?.currency ?? 'USD';

	return {
		loadedCount: invoices.length,
		draftCount: invoices.filter((invoice) => invoice.status === 'DRAFT').length,
		issuedCount: invoices.filter((invoice) => invoice.status === 'ISSUED')
			.length,
		voidedCount: invoices.filter((invoice) => invoice.status === 'VOIDED')
			.length,
		visibleTotal,
		visibleTotalFormatted: formatVisibleInvoiceValue(
			visibleTotal,
			fallbackCurrency
		),
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
```

- [ ] **Step 2: Create the utility barrel**

Create `src/modules/billing/utils/index.ts` with:

```ts
export * from './invoiceDisplay';
```

- [ ] **Step 3: Add English locale keys**

Modify `src/locales/en/billing.json` by adding these keys while preserving existing keys:

```json
{
	"page": {
		"summary": {
			"loaded": "Loaded",
			"draft": "Draft",
			"issued": "Issued",
			"voided": "Voided",
			"visibleValue": "Visible value"
		}
	},
	"list": {
		"emptyTitle": "No invoices match this view",
		"emptyDescription": "Adjust filters or create a new invoice to start billing this client relationship.",
		"relationship": "{{issuer}} to {{receiver}}"
	},
	"new": {
		"sections": {
			"parties": "Parties",
			"period": "Billing period",
			"identity": "Invoice identity",
			"financials": "Financial settings",
			"summary": "Invoice setup",
			"review": "Review invoice",
			"confirm": "Confirm invoice"
		},
		"summary": {
			"issuer": "Issuer",
			"receiver": "Receiver",
			"currency": "Currency",
			"taxRate": "Tax rate",
			"hourlyRate": "Hourly rate",
			"status": "Create as",
			"draftDescription": "Save this invoice so it can be reviewed and issued later.",
			"issuedDescription": "Create the invoice and mark it issued immediately."
		}
	},
	"detail": {
		"review": {
			"title": "Invoice review",
			"identity": "Invoice identity",
			"parties": "Parties",
			"financials": "Financial summary",
			"total": "Total",
			"subtotal": "Subtotal",
			"tax": "Tax",
			"hourlyRate": "Hourly rate",
			"taxRate": "Tax rate",
			"voidedTitle": "Invoice voided",
			"voidedAt": "Voided at",
			"voidReason": "Reason"
		}
	},
	"snapshot": {
		"invoiceBasics": "Invoice basics",
		"emptyValue": "Not provided"
	},
	"notifications": {
		"previewFailed": {
			"title": "Preview failed",
			"message": "Could not preview this invoice. Review the parameters and try again."
		},
		"createFailed": {
			"title": "Invoice not created",
			"message": "Could not create this invoice. Try again."
		},
		"createConflict": {
			"title": "Invoice conflict",
			"message": "A conflict was detected. The preview has been refreshed."
		},
		"issueFailed": {
			"title": "Invoice not issued",
			"message": "Could not issue this invoice. Try again."
		},
		"voidFailed": {
			"title": "Invoice not voided",
			"message": "Could not void this invoice. Try again."
		},
		"voidReasonRequired": {
			"title": "Reason required",
			"message": "Add a reason before voiding this invoice."
		},
		"downloadFailed": {
			"title": "Download failed"
		}
	}
}
```

- [ ] **Step 4: Add Spanish locale keys**

Modify `src/locales/es/billing.json` with matching keys:

```json
{
	"page": {
		"summary": {
			"loaded": "Cargadas",
			"draft": "Borrador",
			"issued": "Emitidas",
			"voided": "Anuladas",
			"visibleValue": "Valor visible"
		}
	},
	"list": {
		"emptyTitle": "No hay facturas para esta vista",
		"emptyDescription": "Ajusta los filtros o crea una nueva factura para iniciar la facturación de esta relación de clientes.",
		"relationship": "{{issuer}} a {{receiver}}"
	},
	"new": {
		"sections": {
			"parties": "Partes",
			"period": "Período de facturación",
			"identity": "Identidad de la factura",
			"financials": "Configuración financiera",
			"summary": "Configuración de factura",
			"review": "Revisar factura",
			"confirm": "Confirmar factura"
		},
		"summary": {
			"issuer": "Emisor",
			"receiver": "Receptor",
			"currency": "Moneda",
			"taxRate": "Impuesto",
			"hourlyRate": "Tarifa por hora",
			"status": "Crear como",
			"draftDescription": "Guarda esta factura para revisarla y emitirla más tarde.",
			"issuedDescription": "Crea la factura y márcala como emitida inmediatamente."
		}
	},
	"detail": {
		"review": {
			"title": "Revisión de factura",
			"identity": "Identidad de la factura",
			"parties": "Partes",
			"financials": "Resumen financiero",
			"total": "Total",
			"subtotal": "Subtotal",
			"tax": "Impuesto",
			"hourlyRate": "Tarifa por hora",
			"taxRate": "Tasa de impuesto",
			"voidedTitle": "Factura anulada",
			"voidedAt": "Anulada en",
			"voidReason": "Motivo"
		}
	},
	"snapshot": {
		"invoiceBasics": "Datos de factura",
		"emptyValue": "No indicado"
	},
	"notifications": {
		"previewFailed": {
			"title": "No se pudo previsualizar",
			"message": "No se pudo previsualizar esta factura. Revisa los parámetros e intenta de nuevo."
		},
		"createFailed": {
			"title": "Factura no creada",
			"message": "No se pudo crear esta factura. Intenta de nuevo."
		},
		"createConflict": {
			"title": "Conflicto de factura",
			"message": "Se detectó un conflicto. La vista previa fue actualizada."
		},
		"issueFailed": {
			"title": "Factura no emitida",
			"message": "No se pudo emitir esta factura. Intenta de nuevo."
		},
		"voidFailed": {
			"title": "Factura no anulada",
			"message": "No se pudo anular esta factura. Intenta de nuevo."
		},
		"voidReasonRequired": {
			"title": "Motivo requerido",
			"message": "Agrega un motivo antes de anular esta factura."
		},
		"downloadFailed": {
			"title": "No se pudo descargar"
		}
	}
}
```

- [ ] **Step 5: Verify TypeScript and JSON parsing**

Run:

```bash
npm run typecheck
```

Expected: command exits with code `0`.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add src/modules/billing/utils src/locales/en/billing.json src/locales/es/billing.json
git commit -m "feat: add invoice display helpers and copy"
```

## Task 2: Refactor Invoice Snapshot Review Surface

**Files:**

- Modify: `src/modules/billing/components/InvoiceSnapshotCard/InvoiceSnapshotCard.tsx`
- Modify: `src/modules/billing/components/InvoiceSnapshotCard/InvoiceSnapshotCard.module.css`

- [ ] **Step 1: Replace snapshot component structure**

Replace `src/modules/billing/components/InvoiceSnapshotCard/InvoiceSnapshotCard.tsx` with:

```tsx
import { useState } from 'react';
import {
	Badge,
	Collapse,
	Divider,
	Group,
	Stack,
	Table,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import type {
	ClientSnapshot,
	InvoiceSnapshot,
	PocSnapshot,
} from '~/models/InvoiceModel';
import { EMPTY_VALUE } from '~/modules/billing/utils';
import styles from './InvoiceSnapshotCard.module.css';

interface InfoFieldProps {
	label: string;
	value?: string | number | null;
}

function InfoField({ label, value }: InfoFieldProps) {
	const displayValue =
		value === null || value === undefined || value === '' ? EMPTY_VALUE : value;

	return (
		<div className={styles.infoBlock}>
			<Text className={styles.label}>{label}</Text>
			<Text className={styles.value}>{displayValue}</Text>
		</div>
	);
}

interface PartyPanelProps {
	title: string;
	party: ClientSnapshot;
}

function PartyPanel({ title, party }: PartyPanelProps) {
	return (
		<SectionCard title={title} padding='sm' contentSpacing='xs'>
			<div className={styles.partyHeader}>
				<Text className={styles.partyName}>{party.name || EMPTY_VALUE}</Text>
				{party.rnc && (
					<Badge size='sm' variant='light' color='gray'>
						{party.rnc}
					</Badge>
				)}
			</div>
			<div className={styles.infoGrid}>
				<InfoField label='Email' value={party.email} />
				<InfoField label='Phone' value={party.phone} />
				<InfoField label='Website' value={party.website} />
				<InfoField label='Address' value={party.address} />
			</div>
		</SectionCard>
	);
}

interface PocPanelProps {
	title: string;
	poc: PocSnapshot;
}

function PocPanel({ title, poc }: PocPanelProps) {
	return (
		<SectionCard title={title} padding='sm' contentSpacing='xs'>
			<div className={styles.infoGrid}>
				<InfoField label='Name' value={poc.name} />
				<InfoField label='Email' value={poc.email} />
			</div>
		</SectionCard>
	);
}

interface TotalsPanelProps {
	snapshot: InvoiceSnapshot;
}

function TotalsPanel({ snapshot }: TotalsPanelProps) {
	const { t } = useTranslation('billing');
	const { totals, invoice } = snapshot;

	return (
		<SectionCard title={t('snapshot.totals')} padding='sm'>
			<div className={styles.totalsPanel}>
				<div className={styles.totalHero}>
					<Text className={styles.label}>{t('snapshot.total')}</Text>
					<Text className={styles.totalAmount}>{totals.totalFormatted}</Text>
				</div>
				<div className={styles.totalsGrid}>
					<Text size='sm'>{t('snapshot.subtotal')}</Text>
					<Text size='sm' ta='right'>
						{totals.subtotalFormatted}
					</Text>
					<Text size='sm'>
						{t('snapshot.tax')} ({totals.taxRate}%)
					</Text>
					<Text size='sm' ta='right'>
						{totals.taxTotalFormatted}
					</Text>
					<Text size='sm'>{t('detail.review.hourlyRate')}</Text>
					<Text size='sm' ta='right'>
						{invoice.hourlyRateFormatted}
					</Text>
					<Divider className={styles.divider} />
					<Text size='sm' fw={700}>
						{t('detail.metadata.currency')}
					</Text>
					<Text size='sm' fw={700} ta='right'>
						{invoice.currency}
					</Text>
				</div>
			</div>
		</SectionCard>
	);
}

interface InvoiceSnapshotCardProps {
	snapshot: InvoiceSnapshot;
}

const InvoiceSnapshotCard: React.FC<InvoiceSnapshotCardProps> = ({
	snapshot,
}) => {
	const { t } = useTranslation('billing');
	const [executionOpen, setExecutionOpen] = useState(false);

	const { issuer, receiver, poc, summaryLines, executionDetails, invoice } =
		snapshot;

	return (
		<Stack gap='md'>
			<div className={styles.reviewGrid}>
				<SectionCard
					title={t('snapshot.invoiceBasics')}
					padding='sm'
					contentSpacing='xs'
				>
					<div className={styles.infoGrid}>
						<InfoField
							label={t('detail.metadata.invoiceNumber')}
							value={invoice.number}
						/>
						<InfoField
							label={t('detail.metadata.period')}
							value={`${invoice.periodStart} - ${invoice.periodEnd}`}
						/>
						<InfoField
							label={t('detail.metadata.currency')}
							value={invoice.currency}
						/>
						<InfoField
							label={t('detail.review.taxRate')}
							value={`${invoice.taxRate}%`}
						/>
					</div>
				</SectionCard>
				<TotalsPanel snapshot={snapshot} />
			</div>

			<div className={styles.grid}>
				<PartyPanel title={t('snapshot.issuerInfo')} party={issuer} />
				<PartyPanel title={t('snapshot.receiverInfo')} party={receiver} />
			</div>

			<div className={styles.grid}>
				<PocPanel title={t('snapshot.pocIssuer')} poc={poc.issuer} />
				<PocPanel title={t('snapshot.pocReceiver')} poc={poc.receiver} />
			</div>

			<SectionCard title={t('snapshot.summaryLines')} padding='sm'>
				{summaryLines.length === 0 ? (
					<Text size='sm' c='dimmed'>
						{t('snapshot.noSummaryLines')}
					</Text>
				) : (
					<Table striped withTableBorder>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>{t('snapshot.columns.campaign')}</Table.Th>
								<Table.Th ta='right'>{t('snapshot.columns.agents')}</Table.Th>
								<Table.Th ta='right'>{t('snapshot.columns.uptime')}</Table.Th>
								<Table.Th ta='right'>{t('snapshot.columns.calls')}</Table.Th>
								<Table.Th ta='right'>
									{t('snapshot.columns.hourlyRate')}
								</Table.Th>
								<Table.Th ta='right'>{t('snapshot.columns.total')}</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{summaryLines.map((line) => (
								<Table.Tr key={line.campaignId}>
									<Table.Td>{line.campaignName}</Table.Td>
									<Table.Td ta='right'>{line.activeAiAgents}</Table.Td>
									<Table.Td ta='right'>{line.uptimeFormatted}</Table.Td>
									<Table.Td ta='right'>{line.callsCount}</Table.Td>
									<Table.Td ta='right'>{line.hourlyRateFormatted}</Table.Td>
									<Table.Td ta='right'>
										<Text fw={600}>{line.totalFormatted}</Text>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				)}
			</SectionCard>

			{executionDetails.length > 0 && (
				<SectionCard padding='sm'>
					<UnstyledButton
						onClick={() => setExecutionOpen((open) => !open)}
						className={styles.collapseButton}
					>
						<Group justify='space-between'>
							<Text size='sm' fw={600}>
								{t('snapshot.executionDetails')}
							</Text>
							{executionOpen ? (
								<IconChevronUp size={16} />
							) : (
								<IconChevronDown size={16} />
							)}
						</Group>
					</UnstyledButton>
					<Collapse expanded={executionOpen} mt='sm'>
						<Table striped withTableBorder>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('snapshot.columns.campaign')}</Table.Th>
									<Table.Th>{t('snapshot.columns.date')}</Table.Th>
									<Table.Th ta='right'>{t('snapshot.columns.agents')}</Table.Th>
									<Table.Th ta='right'>{t('snapshot.columns.uptime')}</Table.Th>
									<Table.Th ta='right'>{t('snapshot.columns.calls')}</Table.Th>
									<Table.Th>{t('snapshot.columns.start')}</Table.Th>
									<Table.Th>{t('snapshot.columns.end')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{executionDetails.map((detail, index) => (
									<Table.Tr
										key={`${detail.campaignId}-${detail.executionDate}-${index}`}
									>
										<Table.Td>{detail.campaignName}</Table.Td>
										<Table.Td>{detail.executionDate}</Table.Td>
										<Table.Td ta='right'>{detail.activeAiAgents}</Table.Td>
										<Table.Td ta='right'>{detail.uptimeFormatted}</Table.Td>
										<Table.Td ta='right'>{detail.callsCount}</Table.Td>
										<Table.Td>
											{new Date(detail.startTimestamp).toLocaleString()}
										</Table.Td>
										<Table.Td>
											{new Date(detail.endTimestamp).toLocaleString()}
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Collapse>
				</SectionCard>
			)}
		</Stack>
	);
};

export default InvoiceSnapshotCard;
```

- [ ] **Step 2: Replace snapshot styles**

Replace `src/modules/billing/components/InvoiceSnapshotCard/InvoiceSnapshotCard.module.css` with:

```css
.reviewGrid {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(280px, 0.7fr);
	gap: var(--mantine-spacing-md);
	align-items: stretch;
}

.grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: var(--mantine-spacing-md);
}

.infoGrid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: var(--mantine-spacing-sm);
}

.infoBlock {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
}

.label {
	font-size: var(--mantine-font-size-xs);
	color: var(--mantine-color-dimmed);
}

.value {
	font-size: var(--mantine-font-size-sm);
	font-weight: 500;
	overflow-wrap: anywhere;
}

.partyHeader {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--mantine-spacing-xs);
	flex-wrap: wrap;
}

.partyName {
	font-size: var(--mantine-font-size-md);
	font-weight: 650;
	line-height: 1.25;
}

.totalsPanel {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-md);
}

.totalHero {
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding-bottom: var(--mantine-spacing-xs);
	border-bottom: 1px solid var(--surface-border);
}

.totalAmount {
	font-size: 1.75rem;
	font-weight: 750;
	line-height: 1.1;
	letter-spacing: 0;
}

.totalsGrid {
	display: grid;
	grid-template-columns: 1fr auto;
	gap: var(--mantine-spacing-xs) var(--mantine-spacing-xl);
}

.collapseButton {
	width: 100%;
}

.divider {
	grid-column: 1 / -1;
}

@media (max-width: 768px) {
	.reviewGrid,
	.grid,
	.infoGrid {
		grid-template-columns: 1fr;
	}

	.totalAmount {
		font-size: 1.4rem;
	}
}
```

- [ ] **Step 3: Verify TypeScript**

Run:

```bash
npm run typecheck
```

Expected: command exits with code `0`.

- [ ] **Step 4: Commit Task 2**

Run:

```bash
git add src/modules/billing/components/InvoiceSnapshotCard
git commit -m "feat: redesign invoice snapshot review"
```

## Task 3: Redesign Invoice Workspace List Page

**Files:**

- Modify: `src/modules/billing/InvoicesPage/InvoicesPage.tsx`
- Modify: `src/modules/billing/InvoicesPage/InvoicesPage.module.css`
- Modify: `src/modules/billing/components/InvoiceFilters/InvoiceFilters.tsx`
- Modify: `src/modules/billing/components/InvoiceFilters/InvoiceFilters.module.css`
- Modify: `src/modules/billing/hooks/useInvoiceColumns.tsx`

- [ ] **Step 1: Update invoice filters markup**

In `src/modules/billing/components/InvoiceFilters/InvoiceFilters.tsx`, keep the existing props and logic. Change the root container to use `className={styles.toolbar}` and wrap the clear button with `className={styles.clearAction}`:

```tsx
return (
	<div className={styles.toolbar}>
		<Select
			label={t('filters.status.label')}
			placeholder={t('filters.status.placeholder')}
			data={statusOptions}
			value={filters.status ?? null}
			onChange={(v) =>
				onChange({ ...filters, status: (v as InvoiceStatus) ?? undefined })
			}
			clearable
			size='sm'
			className={styles.selectField}
		/>
		<Select
			label={t('filters.issuerClient.label')}
			placeholder={t('filters.issuerClient.placeholder')}
			data={clientOptions}
			value={
				filters.issuerClientId != null ? String(filters.issuerClientId) : null
			}
			onChange={(v) =>
				onChange({ ...filters, issuerClientId: v ? Number(v) : undefined })
			}
			clearable
			searchable
			size='sm'
			className={styles.selectField}
		/>
		<Select
			label={t('filters.receiverClient.label')}
			placeholder={t('filters.receiverClient.placeholder')}
			data={clientOptions}
			value={
				filters.receiverClientId != null
					? String(filters.receiverClientId)
					: null
			}
			onChange={(v) =>
				onChange({ ...filters, receiverClientId: v ? Number(v) : undefined })
			}
			clearable
			searchable
			size='sm'
			className={styles.selectField}
		/>
		<DateInput
			label={t('filters.periodStart')}
			value={
				filters.periodStart
					? new Date(`${filters.periodStart}T00:00:00Z`)
					: null
			}
			onChange={(value: string | null) => {
				const dateStr = value
					? new Date(value).toISOString().split('T')[0]
					: undefined;
				onChange({ ...filters, periodStart: dateStr });
			}}
			clearable
			size='sm'
			className={styles.dateField}
		/>
		<DateInput
			label={t('filters.periodEnd')}
			value={
				filters.periodEnd ? new Date(`${filters.periodEnd}T00:00:00Z`) : null
			}
			onChange={(value: string | null) => {
				const dateStr = value
					? new Date(value).toISOString().split('T')[0]
					: undefined;
				onChange({ ...filters, periodEnd: dateStr });
			}}
			clearable
			size='sm'
			className={styles.dateField}
		/>
		{hasActiveFilters && (
			<Group align='flex-end' className={styles.clearAction}>
				<Button variant='subtle' size='sm' onClick={() => onChange({})}>
					{t('filters.clearFilters')}
				</Button>
			</Group>
		)}
	</div>
);
```

- [ ] **Step 2: Update invoice filter styles**

Replace `src/modules/billing/components/InvoiceFilters/InvoiceFilters.module.css` with:

```css
.toolbar,
.root {
	display: grid;
	grid-template-columns:
		minmax(140px, 0.8fr)
		minmax(180px, 1fr)
		minmax(180px, 1fr)
		minmax(150px, 0.8fr)
		minmax(150px, 0.8fr)
		auto;
	gap: var(--mantine-spacing-sm);
	align-items: end;
}

.selectField,
.dateField {
	min-width: 0;
}

.clearAction {
	min-height: 36px;
}

@media (max-width: 1100px) {
	.toolbar,
	.root {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 640px) {
	.toolbar,
	.root {
		grid-template-columns: 1fr;
	}

	.clearAction {
		justify-content: flex-start;
	}
}
```

- [ ] **Step 3: Update invoice columns**

Modify `src/modules/billing/hooks/useInvoiceColumns.tsx` imports:

```tsx
import { ActionIcon, Group, Stack, Text, Tooltip } from '@mantine/core';
import {
	formatInvoiceDate,
	formatInvoicePeriod,
	getInvoiceTotalDisplay,
} from '~/modules/billing/utils';
```

Then update the `invoiceNumber`, `issuer`, `receiver`, `period`, `total`, and `createdAt` cells:

```tsx
{
	accessorKey: 'invoiceNumber',
	header: t('list.columns.invoiceNumber'),
	cell: ({ row }) => (
		<Stack gap={2}>
			<Text size='sm' fw={650}>
				{row.original.invoiceNumber}
			</Text>
			<InvoiceStatusBadge status={row.original.status} />
		</Stack>
	),
},
{
	id: 'issuer',
	header: t('list.columns.issuer'),
	cell: ({ row }) => (
		<Text size='sm' fw={500}>
			{row.original.snapshot?.issuer?.name ?? String(row.original.issuerClientId)}
		</Text>
	),
},
{
	id: 'receiver',
	header: t('list.columns.receiver'),
	cell: ({ row }) => (
		<Text size='sm'>
			{row.original.snapshot?.receiver?.name ??
				String(row.original.receiverClientId)}
		</Text>
	),
},
{
	id: 'period',
	header: t('list.columns.period'),
	cell: ({ row }) =>
		formatInvoicePeriod(row.original.periodStart, row.original.periodEnd),
},
{
	id: 'total',
	header: t('list.columns.total'),
	cell: ({ row }) => (
		<Text size='sm' fw={700} ta='right'>
			{getInvoiceTotalDisplay(row.original)}
		</Text>
	),
},
{
	id: 'createdAt',
	header: t('list.columns.createdAt'),
	cell: ({ row }) => formatInvoiceDate(row.original.createdAt),
},
```

- [ ] **Step 4: Add workspace summary to `InvoicesPage`**

In `src/modules/billing/InvoicesPage/InvoicesPage.tsx`, add imports:

```tsx
import { Button, Group, SimpleGrid, Stack, Title } from '@mantine/core';
import { IconFileInvoice } from '@tabler/icons-react';
import { buildInvoiceWorkspaceStats } from '~/modules/billing/utils';
```

After `const invoices = invoicesData?.data ?? [];`, add:

```tsx
const workspaceStats = buildInvoiceWorkspaceStats(invoices);
```

Replace the current top-level returned content inside `classes.root` with this structure:

```tsx
<SectionCard padding='lg'>
	<div className={classes.workspaceHeader}>
		<Stack gap={4}>
			<Group gap='xs'>
				<IconFileInvoice size={20} />
				<Title order={3}>{t('page.title')}</Title>
			</Group>
			<Text size='sm' c='dimmed'>
				{t('page.description')}
			</Text>
		</Stack>
		<Button onClick={() => void navigate('/billing/invoices/new')}>
			{t('page.actions.newInvoice')}
		</Button>
	</div>
	<SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing='sm'>
		<div className={classes.metric}>
			<Text size='xs' c='dimmed'>{t('page.summary.loaded')}</Text>
			<Text fw={750}>{workspaceStats.loadedCount}</Text>
		</div>
		<div className={classes.metric}>
			<Text size='xs' c='dimmed'>{t('page.summary.draft')}</Text>
			<Text fw={750}>{workspaceStats.draftCount}</Text>
		</div>
		<div className={classes.metric}>
			<Text size='xs' c='dimmed'>{t('page.summary.issued')}</Text>
			<Text fw={750}>{workspaceStats.issuedCount}</Text>
		</div>
		<div className={classes.metric}>
			<Text size='xs' c='dimmed'>{t('page.summary.voided')}</Text>
			<Text fw={750}>{workspaceStats.voidedCount}</Text>
		</div>
		<div className={classes.metric}>
			<Text size='xs' c='dimmed'>{t('page.summary.visibleValue')}</Text>
			<Text fw={750}>{workspaceStats.visibleTotalFormatted}</Text>
		</div>
	</SimpleGrid>
</SectionCard>

<SectionCard padding='md'>
	<InvoiceFilters
		filters={filters}
		clients={clients}
		isLoading={isClientsLoading && clients.length === 0}
		onChange={handleFiltersChange}
	/>
</SectionCard>

<InvoiceTemplateManager />

<SectionCard title={t('page.title')} description={t('page.description')}>
	{/* keep current Alert/BaseTable logic here */}
</SectionCard>
```

Keep the existing alert and `BaseTable` logic inside the final `SectionCard`, but remove `onAdd` from that card because the primary action now lives in the header.

- [ ] **Step 5: Localize list mutation failures**

In `InvoicesPage`, replace hardcoded failure notifications:

```tsx
notifications.show({
	title: t('notifications.issueFailed.title'),
	message: t('notifications.issueFailed.message'),
	color: 'red',
});
```

```tsx
notifications.show({
	title: t('notifications.voidReasonRequired.title'),
	message: t('notifications.voidReasonRequired.message'),
	color: 'red',
});
```

```tsx
notifications.show({
	title: t('notifications.voidFailed.title'),
	message: t('notifications.voidFailed.message'),
	color: 'red',
});
```

For download failures, use:

```tsx
notifications.show({
	title: t('notifications.downloadFailed.title'),
	message: t('notifications.downloadFailed.invalidTemplate'),
	color: 'red',
});
```

Use the same `title` for `noTemplate` and `generic` branches.

- [ ] **Step 6: Update workspace styles**

Replace `src/modules/billing/InvoicesPage/InvoicesPage.module.css` with:

```css
.root {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-md);
}

.workspaceHeader {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: var(--mantine-spacing-md);
	flex-wrap: wrap;
	margin-bottom: var(--mantine-spacing-md);
}

.metric {
	min-width: 0;
	padding: var(--mantine-spacing-sm);
	border: 1px solid var(--surface-border);
	border-radius: var(--mantine-radius-md);
	background: var(--mantine-color-default);
}

.tableRow {
	cursor: pointer;
}

.tableRow:hover {
	background: var(--mantine-color-default-hover);
}

@media (max-width: 640px) {
	.workspaceHeader {
		align-items: stretch;
	}
}
```

- [ ] **Step 7: Verify TypeScript**

Run:

```bash
npm run typecheck
```

Expected: command exits with code `0`.

- [ ] **Step 8: Commit Task 3**

Run:

```bash
git add src/modules/billing/InvoicesPage src/modules/billing/components/InvoiceFilters src/modules/billing/hooks/useInvoiceColumns.tsx
git commit -m "feat: redesign invoice workspace"
```

## Task 4: Redesign Create Invoice Flow

**Files:**

- Modify: `src/modules/billing/InvoiceNewPage/InvoiceNewPage.tsx`
- Modify: `src/modules/billing/InvoiceNewPage/InvoiceNewPage.module.css`

- [ ] **Step 1: Add helper render functions inside `InvoiceNewPage`**

Inside `InvoiceNewPage`, after `clientOptions`, add:

```tsx
const selectedIssuerLabel = getClientOptionLabel(
	clients,
	form.values.issuerClientId
);
const selectedReceiverLabel = getClientOptionLabel(
	clients,
	form.values.receiverClientId
);

const setupSummary = (
	<SectionCard title={t('new.sections.summary')} padding='sm'>
		<Stack gap='xs'>
			<Group justify='space-between'>
				<Text size='sm' c='dimmed'>
					{t('new.summary.issuer')}
				</Text>
				<Text size='sm' fw={500}>
					{selectedIssuerLabel}
				</Text>
			</Group>
			<Group justify='space-between'>
				<Text size='sm' c='dimmed'>
					{t('new.summary.receiver')}
				</Text>
				<Text size='sm' fw={500}>
					{selectedReceiverLabel}
				</Text>
			</Group>
			<Group justify='space-between'>
				<Text size='sm' c='dimmed'>
					{t('new.summary.period')}
				</Text>
				<Text size='sm' fw={500}>
					{formatInvoicePeriod(form.values.periodStart, form.values.periodEnd)}
				</Text>
			</Group>
			<Group justify='space-between'>
				<Text size='sm' c='dimmed'>
					{t('new.summary.currency')}
				</Text>
				<Text size='sm' fw={500}>
					{form.values.currency}
				</Text>
			</Group>
			<Group justify='space-between'>
				<Text size='sm' c='dimmed'>
					{t('new.summary.taxRate')}
				</Text>
				<Text size='sm' fw={500}>
					{form.values.taxRate}%
				</Text>
			</Group>
			<Group justify='space-between'>
				<Text size='sm' c='dimmed'>
					{t('new.summary.hourlyRate')}
				</Text>
				<Text size='sm' fw={500}>
					{form.values.hourlyRate}
				</Text>
			</Group>
		</Stack>
	</SectionCard>
);
```

Add imports:

```tsx
import {
	getClientOptionLabel,
	formatInvoicePeriod,
} from '~/modules/billing/utils';
```

- [ ] **Step 2: Localize create flow failures**

In `handlePreview`, replace the catch notification with:

```tsx
notifications.show({
	title: t('notifications.previewFailed.title'),
	message: t('notifications.previewFailed.message'),
	color: 'red',
});
```

In the `409` branch of `handleCreate`, replace the notification with:

```tsx
notifications.show({
	title: t('notifications.createConflict.title'),
	message: t('notifications.createConflict.message'),
	color: 'yellow',
});
```

In the generic create failure branch, replace the notification with:

```tsx
notifications.show({
	title: t('notifications.createFailed.title'),
	message: t('notifications.createFailed.message'),
	color: 'red',
});
```

- [ ] **Step 3: Replace Step 1 content**

Inside the parameters step, replace the single `classes.formGrid` block with:

```tsx
<div className={classes.createLayout}>
	<Stack gap='md'>
		<SectionCard title={t('new.sections.parties')} padding='sm'>
			<div className={classes.formGrid}>
				<Select
					label={t('new.form.issuerClient.label')}
					placeholder={t('new.form.issuerClient.placeholder')}
					data={clientOptions}
					searchable
					size='sm'
					{...form.getInputProps('issuerClientId')}
				/>
				<Select
					label={t('new.form.receiverClient.label')}
					placeholder={t('new.form.receiverClient.placeholder')}
					data={clientOptions}
					searchable
					size='sm'
					{...form.getInputProps('receiverClientId')}
				/>
			</div>
		</SectionCard>

		<SectionCard title={t('new.sections.period')} padding='sm'>
			<div className={classes.formGrid}>
				<DateInput
					label={t('new.form.periodStart.label')}
					size='sm'
					clearable
					{...form.getInputProps('periodStart')}
				/>
				<DateInput
					label={t('new.form.periodEnd.label')}
					size='sm'
					clearable
					{...form.getInputProps('periodEnd')}
				/>
			</div>
		</SectionCard>

		<SectionCard title={t('new.sections.identity')} padding='sm'>
			<TextInput
				label={t('new.form.invoiceNumber.label')}
				placeholder={t('new.form.invoiceNumber.placeholder')}
				size='sm'
				{...form.getInputProps('invoiceNumber')}
			/>
		</SectionCard>

		<SectionCard title={t('new.sections.financials')} padding='sm'>
			<div className={classes.formGrid}>
				<div>
					<Text size='sm' fw={500} mb={4}>
						{t('new.form.currency.label')}
					</Text>
					<SegmentedControl
						data={['USD', 'DOP']}
						value={form.values.currency}
						onChange={(v) =>
							form.setFieldValue('currency', v as InvoiceCurrency)
						}
						size='sm'
					/>
				</div>
				<NumberInput
					label={t('new.form.taxRate.label')}
					min={0}
					max={100}
					size='sm'
					{...form.getInputProps('taxRate')}
				/>
				<NumberInput
					label={t('new.form.hourlyRate.label')}
					min={0}
					size='sm'
					{...form.getInputProps('hourlyRate')}
				/>
			</div>
		</SectionCard>
	</Stack>

	<aside className={classes.summaryAside}>{setupSummary}</aside>
</div>
```

Keep the existing preview button after this layout.

- [ ] **Step 4: Improve Step 2 and Step 3 section wrappers**

In the preview step, wrap the warnings/conflict/snapshot block in:

```tsx
<SectionCard title={t('new.sections.review')} padding='sm'>
	<Stack gap='md'>
		{/* existing warnings, conflict, and InvoiceSnapshotCard blocks */}
	</Stack>
</SectionCard>
```

In the confirm step, replace the current anonymous `SectionCard padding='sm'` with:

```tsx
<SectionCard title={t('new.sections.confirm')} padding='sm'>
	<Stack gap='xs'>
		<Group justify='space-between'>
			<Text size='sm' c='dimmed'>
				{t('new.summary.period')}
			</Text>
			<Text size='sm'>
				{formatInvoicePeriod(form.values.periodStart, form.values.periodEnd)}
			</Text>
		</Group>
		<Group justify='space-between'>
			<Text size='sm' c='dimmed'>
				{t('new.summary.invoiceNumber')}
			</Text>
			<Text size='sm'>{form.values.invoiceNumber}</Text>
		</Group>
		<Group justify='space-between'>
			<Text size='sm' c='dimmed'>
				{t('new.summary.total')}
			</Text>
			<Text size='md' fw={750}>
				{preview?.snapshot.totals.totalFormatted ?? '—'}
			</Text>
		</Group>
	</Stack>
</SectionCard>
```

Below the status `SegmentedControl`, add:

```tsx
<Text size='sm' c='dimmed'>
	{invoiceStatus === 'DRAFT'
		? t('new.summary.draftDescription')
		: t('new.summary.issuedDescription')}
</Text>
```

- [ ] **Step 5: Update create page styles**

Replace `src/modules/billing/InvoiceNewPage/InvoiceNewPage.module.css` with:

```css
.root {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-md);
}

.stepperWrapper {
	width: 100%;
}

.createLayout {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
	gap: var(--mantine-spacing-md);
	align-items: start;
}

.summaryAside {
	position: sticky;
	top: var(--mantine-spacing-md);
}

.formGrid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: var(--mantine-spacing-md);
}

.actions {
	display: flex;
	justify-content: flex-end;
	gap: var(--mantine-spacing-sm);
	padding-top: var(--mantine-spacing-md);
}

@media (max-width: 900px) {
	.createLayout {
		grid-template-columns: 1fr;
	}

	.summaryAside {
		position: static;
	}
}

@media (max-width: 640px) {
	.formGrid {
		grid-template-columns: 1fr;
	}
}
```

- [ ] **Step 6: Verify TypeScript**

Run:

```bash
npm run typecheck
```

Expected: command exits with code `0`.

- [ ] **Step 7: Commit Task 4**

Run:

```bash
git add src/modules/billing/InvoiceNewPage
git commit -m "feat: redesign invoice creation flow"
```

## Task 5: Redesign Invoice Detail Review Workspace

**Files:**

- Modify: `src/modules/billing/InvoiceDetailPage/InvoiceDetailPage.tsx`
- Modify: `src/modules/billing/InvoiceDetailPage/InvoiceDetailPage.module.css`

- [ ] **Step 1: Add detail imports**

In `InvoiceDetailPage.tsx`, add Mantine imports:

```tsx
import { Badge, Divider, Stack } from '@mantine/core';
```

Add utility imports:

```tsx
import {
	formatInvoiceDate,
	formatInvoiceDateTime,
	formatInvoicePeriod,
	getInvoiceSubtotalDisplay,
	getInvoiceTaxDisplay,
	getInvoiceTotalDisplay,
} from '~/modules/billing/utils';
```

- [ ] **Step 2: Localize detail failures**

Replace hardcoded failure notifications in issue, void, reason-required, and download branches with the same localized keys from Task 3.

Use:

```tsx
notifications.show({
	title: t('notifications.issueFailed.title'),
	message: t('notifications.issueFailed.message'),
	color: 'red',
});
```

```tsx
notifications.show({
	title: t('notifications.voidReasonRequired.title'),
	message: t('notifications.voidReasonRequired.message'),
	color: 'red',
});
```

```tsx
notifications.show({
	title: t('notifications.voidFailed.title'),
	message: t('notifications.voidFailed.message'),
	color: 'red',
});
```

For download failures, use:

```tsx
notifications.show({
	title: t('notifications.downloadFailed.title'),
	message: t('notifications.downloadFailed.generic'),
	color: 'red',
});
```

Use `invalidTemplate` and `noTemplate` messages in their existing status-specific branches.

- [ ] **Step 3: Replace detail header and metadata cards**

Replace the first two `SectionCard` blocks in the successful render with:

```tsx
<SectionCard padding='lg'>
	<div className={classes.reviewHeader}>
		<Stack gap='xs'>
			<Group gap='xs'>
				<Button
					variant='subtle'
					leftSection={<IconArrowLeft size={16} />}
					onClick={() => void navigate('/billing/invoices')}
					size='sm'
				>
					{t('detail.actions.back')}
				</Button>
				<InvoiceStatusBadge status={invoice.status} />
			</Group>
			<Title order={2}>{invoice.invoiceNumber}</Title>
			<Group gap='xs'>
				<Badge variant='light'>
					{formatInvoicePeriod(invoice.periodStart, invoice.periodEnd)}
				</Badge>
				<Badge variant='light' color='gray'>
					{formatInvoiceDate(invoice.createdAt)}
				</Badge>
			</Group>
		</Stack>
		<Stack gap='xs' align='flex-end'>
			<Text size='xs' c='dimmed'>
				{t('detail.review.total')}
			</Text>
			<Text className={classes.headerTotal}>
				{getInvoiceTotalDisplay(invoice)}
			</Text>
			<Group gap='xs'>
				{invoice.status === 'DRAFT' && (
					<Button
						leftSection={<IconCheck size={16} />}
						color='green'
						size='sm'
						loading={issueMutation.isPending}
						onClick={handleIssue}
					>
						{t('detail.actions.issue')}
					</Button>
				)}
				<Button
					leftSection={<IconDownload size={16} />}
					variant={invoice.status === 'ISSUED' ? 'filled' : 'light'}
					size='sm'
					loading={isDownloading}
					onClick={() => void handleDownload()}
				>
					{t('detail.actions.download')}
				</Button>
				{invoice.status !== 'VOIDED' && (
					<Button
						leftSection={<IconBan size={16} />}
						color='red'
						variant='light'
						size='sm'
						loading={voidMutation.isPending}
						onClick={handleVoid}
					>
						{t('detail.actions.void')}
					</Button>
				)}
			</Group>
		</Stack>
	</div>
</SectionCard>;

{
	(invoice.voidedAt || invoice.voidReason) && (
		<Alert
			icon={<IconBan size={18} />}
			color='red'
			title={t('detail.review.voidedTitle')}
		>
			<Stack gap='xs'>
				{invoice.voidedAt && (
					<Group justify='space-between'>
						<Text size='sm' c='dimmed'>
							{t('detail.review.voidedAt')}
						</Text>
						<Text size='sm'>{formatInvoiceDateTime(invoice.voidedAt)}</Text>
					</Group>
				)}
				{invoice.voidReason && (
					<Group justify='space-between' align='flex-start'>
						<Text size='sm' c='dimmed'>
							{t('detail.review.voidReason')}
						</Text>
						<Text size='sm' ta='right'>
							{invoice.voidReason}
						</Text>
					</Group>
				)}
			</Stack>
		</Alert>
	);
}

<div className={classes.reviewGrid}>
	<SectionCard title={t('detail.review.identity')} padding='sm'>
		<div className={classes.metaGrid}>
			<div className={classes.metaItem}>
				<Text size='xs' c='dimmed'>
					{t('detail.metadata.invoiceNumber')}
				</Text>
				<Text size='sm' fw={600}>
					{invoice.invoiceNumber}
				</Text>
			</div>
			<div className={classes.metaItem}>
				<Text size='xs' c='dimmed'>
					{t('detail.metadata.status')}
				</Text>
				<InvoiceStatusBadge status={invoice.status} />
			</div>
			<div className={classes.metaItem}>
				<Text size='xs' c='dimmed'>
					{t('detail.metadata.period')}
				</Text>
				<Text size='sm'>
					{formatInvoicePeriod(invoice.periodStart, invoice.periodEnd)}
				</Text>
			</div>
			<div className={classes.metaItem}>
				<Text size='xs' c='dimmed'>
					{t('detail.metadata.createdAt')}
				</Text>
				<Text size='sm'>{formatInvoiceDate(invoice.createdAt)}</Text>
			</div>
		</div>
	</SectionCard>

	<SectionCard title={t('detail.review.financials')} padding='sm'>
		<div className={classes.totalsGrid}>
			<Text size='sm'>{t('detail.review.subtotal')}</Text>
			<Text size='sm' ta='right'>
				{getInvoiceSubtotalDisplay(invoice)}
			</Text>
			<Text size='sm'>{t('detail.review.tax')}</Text>
			<Text size='sm' ta='right'>
				{getInvoiceTaxDisplay(invoice)}
			</Text>
			<Text size='sm'>{t('detail.review.hourlyRate')}</Text>
			<Text size='sm' ta='right'>
				{invoice.snapshot.invoice.hourlyRateFormatted}
			</Text>
			<Divider className={classes.divider} />
			<Text size='md' fw={750}>
				{t('detail.review.total')}
			</Text>
			<Text size='md' fw={750} ta='right'>
				{getInvoiceTotalDisplay(invoice)}
			</Text>
		</div>
	</SectionCard>
</div>;
```

Keep `<InvoiceSnapshotCard snapshot={invoice.snapshot} />` below the new review layout.

- [ ] **Step 4: Update detail styles**

Replace `src/modules/billing/InvoiceDetailPage/InvoiceDetailPage.module.css` with:

```css
.root {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-md);
}

.reviewHeader {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: var(--mantine-spacing-md);
	flex-wrap: wrap;
}

.headerTotal {
	font-size: 2rem;
	font-weight: 780;
	line-height: 1;
	letter-spacing: 0;
}

.reviewGrid {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr);
	gap: var(--mantine-spacing-md);
}

.metaGrid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: var(--mantine-spacing-md);
}

.metaItem {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
}

.totalsGrid {
	display: grid;
	grid-template-columns: 1fr auto;
	gap: var(--mantine-spacing-xs) var(--mantine-spacing-xl);
}

.divider {
	grid-column: 1 / -1;
}

@media (max-width: 768px) {
	.reviewGrid,
	.metaGrid {
		grid-template-columns: 1fr;
	}

	.headerTotal {
		font-size: 1.5rem;
	}
}
```

- [ ] **Step 5: Verify TypeScript**

Run:

```bash
npm run typecheck
```

Expected: command exits with code `0`.

- [ ] **Step 6: Commit Task 5**

Run:

```bash
git add src/modules/billing/InvoiceDetailPage
git commit -m "feat: redesign invoice detail review"
```

## Task 6: Final Verification And Build

**Files:**

- Review: all files modified by Tasks 1-5.

- [ ] **Step 1: Run TypeScript check**

Run:

```bash
npm run typecheck
```

Expected: command exits with code `0`.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: command exits with code `0` and produces the Vite production build output.

- [ ] **Step 3: Inspect final diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only intended billing redesign files remain modified.

- [ ] **Step 4: Commit final verification fixes if any were required**

If Task 6 required small compile or build fixes, stage only those files:

```bash
git add src/modules/billing src/locales/en/billing.json src/locales/es/billing.json
git commit -m "fix: finalize invoice redesign build"
```

If no fixes were needed, skip this commit.
