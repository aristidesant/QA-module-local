# Billing / Invoices Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a master-tenant-only invoicing module with invoice generation wizard, list, detail, DOCX download, and client invoice configuration fields.

**Architecture:** New `src/modules/billing/` module with three pages (list, wizard, detail) backed by `invoiceApi.ts` + `invoiceQueries.ts`. Shared `InvoiceSnapshotCard` component used in both the wizard preview step and the detail page. Client invoice fields added to the existing `ClientForm` behind `useIsMasterClient()`.

**Tech Stack:** React, Mantine v9, TanStack React Query v5, Axios, `@mantine/dates`, React Router v7, react-i18next, @tabler/icons-react

---

## Task 1: Define invoice models and extend ClientModel

**Files:**

- Create: `src/models/InvoiceModel.ts`
- Modify: `src/models/ClientModel.ts`

- [ ] **Step 1: Create `src/models/InvoiceModel.ts`**

```ts
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
```

- [ ] **Step 2: Extend `src/models/ClientModel.ts` — add invoice fields to `ClientModel` and `UpdateClientRequest`**

In `ClientModel`, add after `countryId`:

```ts
  website?: string | null;
  pocUserId?: number | null;
  invoiceTemplateFileId?: number | null;
```

In `UpdateClientRequest`, add after `countryId`:

```ts
  website?: string | null;
  pocUserId?: number | null;
  invoiceTemplateFileId?: number | null;
```

- [ ] **Step 3: Commit**

```bash
git add src/models/InvoiceModel.ts src/models/ClientModel.ts
git commit -m "feat: add InvoiceModel types and extend ClientModel with invoice fields"
```

---

## Task 2: Implement invoiceApi.ts

**Files:**

- Create: `src/api/invoiceApi.ts`

- [ ] **Step 1: Create `src/api/invoiceApi.ts`**

```ts
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
		const response = await fetch(`${DEFAULT_API_URL}/invoices/${id}/download`, {
			headers: { Authorization: `Bearer ${token}` },
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
			'invoice.xlsx';
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
```

- [ ] **Step 2: Commit**

```bash
git add src/api/invoiceApi.ts
git commit -m "feat: add invoiceApi"
```

---

## Task 3: Implement invoiceQueries.ts

**Files:**

- Create: `src/queries/invoiceQueries.ts`

- [ ] **Step 1: Create `src/queries/invoiceQueries.ts`**

```ts
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

export const useDownloadDocx = () => {
	const { token } = useSessionStore();
	return useMutation({
		mutationFn: async (id: number) => {
			const api = invoiceApi();
			return api.downloadDocx(id, token ?? '');
		},
	});
};
```

- [ ] **Step 2: Commit**

```bash
git add src/queries/invoiceQueries.ts
git commit -m "feat: add invoiceQueries hooks"
```

---

## Task 4: Add ModuleEnum.BILLING, update sidebar, add routes

**Files:**

- Modify: `src/constants/ModuleEnum.ts`
- Modify: `src/components/Sidebar/Sidebar.tsx`
- Modify: `src/locales/en/common.json`
- Modify: `src/routes.tsx`

- [ ] **Step 1: Add `BILLING` to `src/constants/ModuleEnum.ts`**

Add `BILLING = 'BILLING'` to the `ModuleEnum` enum.

- [ ] **Step 2: Add billing nav item to `src/components/Sidebar/Sidebar.tsx`**

Import `IconFileInvoice` from `@tabler/icons-react` (add to existing import).

Add a new section after the existing `sidebarSections` array or add `invoices` to the `administration` section. The cleanest approach is adding it to the `administration` section since it's master-only:

In `sidebarSections`, inside the `administration` section's `items` array, add after `clients`:

```ts
{
  key: 'invoices',
  label: 'sidebar.items.invoices',
  icon: <IconFileInvoice size={18} className={styles.menuIcon} />,
  to: '/billing/invoices',
  module: ModuleEnum.BILLING,
  masterOnly: true,
  i18nNamespace: 'billing',
},
```

- [ ] **Step 3: Add i18n key to `src/locales/en/common.json`**

In the `sidebar.items` object, add:

```json
"invoices": "Invoices"
```

- [ ] **Step 4: Add billing routes to `src/routes.tsx`**

Add lazy imports at the top (with other lazy imports):

```ts
const InvoicesPage = React.lazy(
	() => import('./modules/billing/InvoicesPage/InvoicesPage')
);
const InvoiceNewPage = React.lazy(
	() => import('./modules/billing/InvoiceNewPage/InvoiceNewPage')
);
const InvoiceDetailPage = React.lazy(
	() => import('./modules/billing/InvoiceDetailPage/InvoiceDetailPage')
);
```

Add billing routes inside the main layout children array (alongside `clients`, `users`, etc.):

```ts
{
  path: 'billing',
  children: [
    {
      path: 'invoices',
      id: 'invoices',
      element: (
        <ModuleGuard module={ModuleEnum.BILLING} masterOnly>
          <Suspense fallback={<SuspenseFallback />}>
            <InvoicesPage />
          </Suspense>
        </ModuleGuard>
      ),
    },
    {
      path: 'invoices/new',
      id: 'invoices-new',
      element: (
        <ModuleGuard module={ModuleEnum.BILLING} masterOnly>
          <Suspense fallback={<SuspenseFallback />}>
            <InvoiceNewPage />
          </Suspense>
        </ModuleGuard>
      ),
    },
    {
      path: 'invoices/:id',
      id: 'invoices-detail',
      element: (
        <ModuleGuard module={ModuleEnum.BILLING} masterOnly>
          <Suspense fallback={<SuspenseFallback />}>
            <InvoiceDetailPage />
          </Suspense>
        </ModuleGuard>
      ),
    },
  ],
},
```

- [ ] **Step 5: Verify typecheck passes**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/constants/ModuleEnum.ts src/components/Sidebar/Sidebar.tsx src/locales/en/common.json src/routes.tsx
git commit -m "feat: add ModuleEnum.BILLING, billing routes, and sidebar nav item"
```

---

## Task 5: Create billing.json i18n file

**Files:**

- Create: `src/locales/en/billing.json`

- [ ] **Step 1: Create `src/locales/en/billing.json`**

```json
{
	"page": {
		"title": "Invoices",
		"description": "Generate and manage client invoices",
		"actions": {
			"newInvoice": "New Invoice"
		}
	},
	"list": {
		"empty": "No invoices found.",
		"error": {
			"title": "Unable to load invoices"
		},
		"columns": {
			"invoiceNumber": "Invoice #",
			"issuer": "Issuer",
			"receiver": "Receiver",
			"period": "Period",
			"status": "Status",
			"currency": "Currency",
			"total": "Total",
			"createdAt": "Created",
			"actions": "Actions"
		},
		"actions": {
			"view": "View",
			"issue": "Issue",
			"void": "Void",
			"download": "Download DOCX"
		}
	},
	"filters": {
		"status": {
			"label": "Status",
			"placeholder": "All statuses"
		},
		"issuerClient": {
			"label": "Issuer",
			"placeholder": "All issuers"
		},
		"receiverClient": {
			"label": "Receiver",
			"placeholder": "All receivers"
		},
		"periodStart": "Period from",
		"periodEnd": "Period to",
		"clearFilters": "Clear filters"
	},
	"status": {
		"DRAFT": "Draft",
		"ISSUED": "Issued",
		"VOIDED": "Voided"
	},
	"new": {
		"title": "New Invoice",
		"steps": {
			"parameters": "Parameters",
			"preview": "Preview",
			"confirm": "Confirm"
		},
		"form": {
			"issuerClient": {
				"label": "Issuer Client",
				"placeholder": "Select issuer"
			},
			"receiverClient": {
				"label": "Receiver Client",
				"placeholder": "Select receiver"
			},
			"periodStart": {
				"label": "Period Start"
			},
			"periodEnd": {
				"label": "Period End"
			},
			"invoiceNumber": {
				"label": "Invoice Number",
				"placeholder": "e.g. INV-2026-0001"
			},
			"currency": {
				"label": "Currency"
			},
			"taxRate": {
				"label": "Tax Rate (%)"
			},
			"hourlyRate": {
				"label": "Hourly Rate"
			}
		},
		"validation": {
			"issuerRequired": "Issuer is required",
			"receiverRequired": "Receiver is required",
			"periodStartRequired": "Period start is required",
			"periodEndRequired": "Period end is required",
			"invoiceNumberRequired": "Invoice number is required",
			"hourlyRateMin": "Hourly rate must be 0 or greater",
			"taxRateRange": "Tax rate must be between 0 and 100"
		},
		"actions": {
			"preview": "Preview Invoice",
			"back": "Back",
			"continue": "Continue",
			"create": "Create Invoice",
			"creating": "Creating..."
		},
		"conflict": {
			"title": "Active invoice conflict",
			"description": "An active invoice already exists for this issuer, receiver, and period:",
			"replaceLabel": "Replace existing invoice",
			"replaceReasonLabel": "Reason for replacement",
			"replaceReasonPlaceholder": "Describe why this invoice is being replaced",
			"replaceReasonRequired": "Reason is required when replacing"
		},
		"warnings": {
			"title": "Calculation warnings"
		},
		"statusLabel": "Invoice Status",
		"statusDraft": "Draft",
		"statusIssued": "Issued",
		"summary": {
			"period": "Period",
			"invoiceNumber": "Invoice Number",
			"total": "Total"
		}
	},
	"detail": {
		"title": "Invoice",
		"actions": {
			"issue": "Issue Invoice",
			"issueConfirm": "Are you sure you want to issue this invoice? This will change its status to Issued.",
			"void": "Void Invoice",
			"voidTitle": "Void Invoice",
			"voidDescription": "This action cannot be undone. Please provide a reason for voiding this invoice.",
			"voidReasonLabel": "Reason",
			"voidReasonPlaceholder": "Describe why this invoice is being voided",
			"voidConfirm": "Void Invoice",
			"download": "Download DOCX",
			"back": "Back to Invoices"
		},
		"metadata": {
			"invoiceNumber": "Invoice Number",
			"status": "Status",
			"createdAt": "Created",
			"period": "Period",
			"currency": "Currency",
			"issuer": "Issuer",
			"receiver": "Receiver"
		}
	},
	"snapshot": {
		"issuerInfo": "Issuer",
		"receiverInfo": "Receiver",
		"pocContacts": "Points of Contact",
		"pocIssuer": "Issuer POC",
		"pocReceiver": "Receiver POC",
		"summaryLines": "Summary",
		"executionDetails": "Execution Details",
		"showExecutionDetails": "Show execution details",
		"hideExecutionDetails": "Hide execution details",
		"totals": "Totals",
		"columns": {
			"campaign": "Campaign",
			"agents": "Agents",
			"uptime": "Uptime",
			"calls": "Calls",
			"hourlyRate": "Rate/hr",
			"total": "Total",
			"date": "Date",
			"start": "Start",
			"end": "End"
		},
		"noSummaryLines": "No billable activity found for this period.",
		"subtotal": "Subtotal",
		"tax": "Tax",
		"total": "Total"
	},
	"notifications": {
		"created": {
			"title": "Invoice created",
			"message": "Invoice {{number}} has been created."
		},
		"issued": {
			"title": "Invoice issued",
			"message": "Invoice {{number}} is now issued."
		},
		"voided": {
			"title": "Invoice voided",
			"message": "Invoice {{number}} has been voided."
		},
		"downloadFailed": {
			"invalidTemplate": "Invoice template is invalid. Please review the issuer's template configuration.",
			"noTemplate": "No invoice template configured for issuer. Add a .docx template in the client's invoice settings.",
			"generic": "Failed to download invoice. Please try again."
		}
	}
}
```

- [ ] **Step 2: Commit**

```bash
git add src/locales/en/billing.json
git commit -m "feat: add billing i18n strings"
```

---

## Task 6: InvoiceStatusBadge component

**Files:**

- Create: `src/modules/billing/components/InvoiceStatusBadge/InvoiceStatusBadge.tsx`
- Create: `src/modules/billing/components/InvoiceStatusBadge/index.ts`

- [ ] **Step 1: Create `src/modules/billing/components/InvoiceStatusBadge/InvoiceStatusBadge.tsx`**

```tsx
import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { InvoiceStatus } from '~/models/InvoiceModel';

const STATUS_COLOR: Record<InvoiceStatus, string> = {
	DRAFT: 'gray',
	ISSUED: 'green',
	VOIDED: 'red',
};

interface InvoiceStatusBadgeProps {
	status: InvoiceStatus;
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
	const { t } = useTranslation('billing');
	return (
		<Badge color={STATUS_COLOR[status]} variant='light' size='sm'>
			{t(`status.${status}`)}
		</Badge>
	);
};

export default InvoiceStatusBadge;
```

- [ ] **Step 2: Create `src/modules/billing/components/InvoiceStatusBadge/index.ts`**

```ts
export { default } from './InvoiceStatusBadge';
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/billing/components/InvoiceStatusBadge/
git commit -m "feat: add InvoiceStatusBadge component"
```

---

## Task 7: InvoiceSnapshotCard component

**Files:**

- Create: `src/modules/billing/components/InvoiceSnapshotCard/InvoiceSnapshotCard.tsx`
- Create: `src/modules/billing/components/InvoiceSnapshotCard/InvoiceSnapshotCard.module.css`
- Create: `src/modules/billing/components/InvoiceSnapshotCard/index.ts`

- [ ] **Step 1: Create `src/modules/billing/components/InvoiceSnapshotCard/InvoiceSnapshotCard.module.css`**

```css
.grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--mantine-spacing-md);
}

.infoBlock {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-xs);
}

.label {
	font-size: var(--mantine-font-size-xs);
	color: var(--mantine-color-dimmed);
}

.value {
	font-size: var(--mantine-font-size-sm);
}

.totalsGrid {
	display: grid;
	grid-template-columns: 1fr auto;
	gap: var(--mantine-spacing-xs) var(--mantine-spacing-xl);
	max-width: 320px;
	margin-left: auto;
}

.totalRow {
	font-weight: 600;
	font-size: var(--mantine-font-size-md);
}

@media (max-width: 768px) {
	.grid {
		grid-template-columns: 1fr;
	}
}
```

- [ ] **Step 2: Create `src/modules/billing/components/InvoiceSnapshotCard/InvoiceSnapshotCard.tsx`**

```tsx
import { useState } from 'react';
import {
	Stack,
	Text,
	Group,
	Table,
	Divider,
	UnstyledButton,
	Collapse,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import type { InvoiceSnapshot } from '~/models/InvoiceModel';
import styles from './InvoiceSnapshotCard.module.css';

interface InfoFieldProps {
	label: string;
	value?: string | null;
}

function InfoField({ label, value }: InfoFieldProps) {
	if (!value) return null;
	return (
		<div className={styles.infoBlock}>
			<Text className={styles.label}>{label}</Text>
			<Text className={styles.value}>{value}</Text>
		</div>
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

	const { issuer, receiver, poc, summaryLines, executionDetails, totals } =
		snapshot;

	return (
		<Stack gap='md'>
			{/* Issuer & Receiver */}
			<div className={styles.grid}>
				<SectionCard
					title={t('snapshot.issuerInfo')}
					padding='sm'
					contentSpacing='xs'
				>
					<InfoField label='Name' value={issuer.name} />
					<InfoField label='RNC' value={issuer.rnc} />
					<InfoField label='Email' value={issuer.email} />
					<InfoField label='Phone' value={issuer.phone} />
					<InfoField label='Address' value={issuer.address} />
					<InfoField label='Website' value={issuer.website} />
				</SectionCard>

				<SectionCard
					title={t('snapshot.receiverInfo')}
					padding='sm'
					contentSpacing='xs'
				>
					<InfoField label='Name' value={receiver.name} />
					<InfoField label='RNC' value={receiver.rnc} />
					<InfoField label='Email' value={receiver.email} />
					<InfoField label='Phone' value={receiver.phone} />
					<InfoField label='Address' value={receiver.address} />
					<InfoField label='Website' value={receiver.website} />
				</SectionCard>
			</div>

			{/* POC Contacts */}
			<div className={styles.grid}>
				<SectionCard
					title={t('snapshot.pocIssuer')}
					padding='sm'
					contentSpacing='xs'
				>
					<InfoField label='Name' value={poc.issuer.name} />
					<InfoField label='Email' value={poc.issuer.email} />
				</SectionCard>
				<SectionCard
					title={t('snapshot.pocReceiver')}
					padding='sm'
					contentSpacing='xs'
				>
					<InfoField label='Name' value={poc.receiver.name} />
					<InfoField label='Email' value={poc.receiver.email} />
				</SectionCard>
			</div>

			{/* Summary Lines */}
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
									<Table.Td ta='right'>{line.totalFormatted}</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				)}
			</SectionCard>

			{/* Execution Details (collapsible) */}
			{executionDetails.length > 0 && (
				<SectionCard padding='sm'>
					<UnstyledButton
						onClick={() => setExecutionOpen((o) => !o)}
						style={{ width: '100%' }}
					>
						<Group justify='space-between'>
							<Text size='sm' fw={500}>
								{t('snapshot.executionDetails')}
							</Text>
							{executionOpen ? (
								<IconChevronUp size={16} />
							) : (
								<IconChevronDown size={16} />
							)}
						</Group>
					</UnstyledButton>
					<Collapse in={executionOpen} mt='sm'>
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
								{executionDetails.map((detail, i) => (
									<Table.Tr key={i}>
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

			{/* Totals */}
			<SectionCard title={t('snapshot.totals')} padding='sm'>
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
					<Divider style={{ gridColumn: '1 / -1' }} />
					<Text size='sm' fw={700} className={styles.totalRow}>
						{t('snapshot.total')}
					</Text>
					<Text size='sm' fw={700} ta='right' className={styles.totalRow}>
						{totals.totalFormatted}
					</Text>
				</div>
			</SectionCard>
		</Stack>
	);
};

export default InvoiceSnapshotCard;
```

- [ ] **Step 3: Create `src/modules/billing/components/InvoiceSnapshotCard/index.ts`**

```ts
export { default } from './InvoiceSnapshotCard';
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/billing/components/InvoiceSnapshotCard/
git commit -m "feat: add InvoiceSnapshotCard component"
```

---

## Task 8: InvoiceFilters component

**Files:**

- Create: `src/modules/billing/components/InvoiceFilters/InvoiceFilters.tsx`
- Create: `src/modules/billing/components/InvoiceFilters/InvoiceFilters.module.css`
- Create: `src/modules/billing/components/InvoiceFilters/index.ts`

- [ ] **Step 1: Create `src/modules/billing/components/InvoiceFilters/InvoiceFilters.module.css`**

```css
.root {
	display: flex;
	flex-wrap: wrap;
	gap: var(--mantine-spacing-sm);
	align-items: flex-end;
}
```

- [ ] **Step 2: Create `src/modules/billing/components/InvoiceFilters/InvoiceFilters.tsx`**

```tsx
import { Button, Select, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import type { FilterInvoiceDto, InvoiceStatus } from '~/models/InvoiceModel';
import type { ClientModel } from '~/models/ClientModel';
import styles from './InvoiceFilters.module.css';

interface InvoiceFiltersProps {
	filters: FilterInvoiceDto;
	clients: ClientModel[];
	onChange: (filters: FilterInvoiceDto) => void;
}

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
	{ value: 'DRAFT', label: 'Draft' },
	{ value: 'ISSUED', label: 'Issued' },
	{ value: 'VOIDED', label: 'Voided' },
];

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
	filters,
	clients,
	onChange,
}) => {
	const { t } = useTranslation('billing');

	const clientOptions = clients.map((c) => ({
		value: String(c.id),
		label: c.name,
	}));

	const hasActiveFilters =
		!!filters.status ||
		!!filters.issuerClientId ||
		!!filters.receiverClientId ||
		!!filters.periodStart ||
		!!filters.periodEnd;

	return (
		<div className={styles.root}>
			<Select
				label={t('filters.status.label')}
				placeholder={t('filters.status.placeholder')}
				data={STATUS_OPTIONS}
				value={filters.status ?? null}
				onChange={(v) =>
					onChange({ ...filters, status: (v as InvoiceStatus) ?? undefined })
				}
				clearable
				size='sm'
				style={{ minWidth: 140 }}
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
				style={{ minWidth: 180 }}
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
				style={{ minWidth: 180 }}
			/>
			<DateInput
				label={t('filters.periodStart')}
				value={filters.periodStart ? new Date(filters.periodStart) : null}
				onChange={(v) =>
					onChange({
						...filters,
						periodStart: v ? v.toISOString().split('T')[0] : undefined,
					})
				}
				clearable
				size='sm'
				style={{ minWidth: 150 }}
			/>
			<DateInput
				label={t('filters.periodEnd')}
				value={filters.periodEnd ? new Date(filters.periodEnd) : null}
				onChange={(v) =>
					onChange({
						...filters,
						periodEnd: v ? v.toISOString().split('T')[0] : undefined,
					})
				}
				clearable
				size='sm'
				style={{ minWidth: 150 }}
			/>
			{hasActiveFilters && (
				<Group align='flex-end'>
					<Button variant='subtle' size='sm' onClick={() => onChange({})}>
						{t('filters.clearFilters')}
					</Button>
				</Group>
			)}
		</div>
	);
};

export default InvoiceFilters;
```

- [ ] **Step 3: Create `src/modules/billing/components/InvoiceFilters/index.ts`**

```ts
export { default } from './InvoiceFilters';
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/billing/components/InvoiceFilters/
git commit -m "feat: add InvoiceFilters component"
```

---

## Task 9: useInvoiceColumns hook + InvoicesPage

**Files:**

- Create: `src/modules/billing/hooks/useInvoiceColumns.ts`
- Create: `src/modules/billing/InvoicesPage/InvoicesPage.tsx`
- Create: `src/modules/billing/InvoicesPage/InvoicesPage.module.css`
- Create: `src/modules/billing/InvoicesPage/index.ts`

- [ ] **Step 1: Create `src/modules/billing/hooks/useInvoiceColumns.ts`**

```ts
import { useMemo } from 'react';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEye, IconCheck, IconBan, IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { InvoiceResponse } from '~/models/InvoiceModel';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge';

interface UseInvoiceColumnsOptions {
  onView: (invoice: InvoiceResponse) => void;
  onIssue: (invoice: InvoiceResponse) => void;
  onVoid: (invoice: InvoiceResponse) => void;
  onDownload: (invoice: InvoiceResponse) => void;
}

export function useInvoiceColumns({
  onView,
  onIssue,
  onVoid,
  onDownload,
}: UseInvoiceColumnsOptions): BaseTableColumnDef<InvoiceResponse>[] {
  const { t } = useTranslation('billing');

  return useMemo(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: t('list.columns.invoiceNumber'),
        cell: ({ getValue }) => getValue<string>(),
      },
      {
        id: 'issuer',
        header: t('list.columns.issuer'),
        cell: ({ row }) =>
          row.original.snapshot?.issuer?.name ?? String(row.original.issuerClientId),
      },
      {
        id: 'receiver',
        header: t('list.columns.receiver'),
        cell: ({ row }) =>
          row.original.snapshot?.receiver?.name ?? String(row.original.receiverClientId),
      },
      {
        id: 'period',
        header: t('list.columns.period'),
        cell: ({ row }) =>
          `${row.original.periodStart} – ${row.original.periodEnd}`,
      },
      {
        accessorKey: 'status',
        header: t('list.columns.status'),
        cell: ({ getValue }) => <InvoiceStatusBadge status={getValue<InvoiceResponse['status']>()} />,
      },
      {
        accessorKey: 'currency',
        header: t('list.columns.currency'),
        cell: ({ getValue }) => getValue<string>(),
      },
      {
        id: 'total',
        header: t('list.columns.total'),
        cell: ({ row }) =>
          row.original.snapshot?.totals?.totalFormatted ?? row.original.total,
      },
      {
        id: 'createdAt',
        header: t('list.columns.createdAt'),
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: t('list.columns.actions'),
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <Group gap='xs' wrap='nowrap'>
              <Tooltip label={t('list.actions.view')}>
                <ActionIcon
                  variant='subtle'
                  size='sm'
                  onClick={(e) => { e.stopPropagation(); onView(invoice); }}
                >
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
              {invoice.status === 'DRAFT' && (
                <Tooltip label={t('list.actions.issue')}>
                  <ActionIcon
                    variant='subtle'
                    color='green'
                    size='sm'
                    onClick={(e) => { e.stopPropagation(); onIssue(invoice); }}
                  >
                    <IconCheck size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
              {invoice.status !== 'VOIDED' && (
                <Tooltip label={t('list.actions.void')}>
                  <ActionIcon
                    variant='subtle'
                    color='red'
                    size='sm'
                    onClick={(e) => { e.stopPropagation(); onVoid(invoice); }}
                  >
                    <IconBan size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
              <Tooltip label={t('list.actions.download')}>
                <ActionIcon
                  variant='subtle'
                  size='sm'
                  onClick={(e) => { e.stopPropagation(); onDownload(invoice); }}
                >
                  <IconDownload size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          );
        },
      },
    ],
    [t, onView, onIssue, onVoid, onDownload]
  );
}
```

- [ ] **Step 2: Create `src/modules/billing/InvoicesPage/InvoicesPage.module.css`**

```css
.root {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-md);
}

.tableRow {
	cursor: pointer;
}
```

- [ ] **Step 3: Create `src/modules/billing/InvoicesPage/InvoicesPage.tsx`**

```tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Center, Loader, Text, Textarea } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable';
import {
	useGetInvoices,
	useIssueInvoice,
	useVoidInvoice,
	useDownloadDocx,
} from '~/queries/invoiceQueries';
import { useGetAllClients } from '~/queries/clientQueries';
import { usePagination } from '~/hooks/usePagination';
import type { FilterInvoiceDto, InvoiceResponse } from '~/models/InvoiceModel';
import InvoiceFilters from '../components/InvoiceFilters';
import { useInvoiceColumns } from '../hooks/useInvoiceColumns';
import classes from './InvoicesPage.module.css';

const InvoicesPage: React.FC = () => {
	const { t } = useTranslation('billing');
	const navigate = useNavigate();
	const pagination = usePagination({ initialItemsPerPage: 20 });
	const { limit, offset } = pagination.getApiParams();
	const [filters, setFilters] = useState<FilterInvoiceDto>({});

	const {
		data: invoicesData,
		isLoading,
		isError,
		error,
	} = useGetInvoices({
		...filters,
		limit,
		offset,
	});

	const { data: clients = [] } = useGetAllClients();
	const issueMutation = useIssueInvoice();
	const voidMutation = useVoidInvoice();
	const downloadMutation = useDownloadDocx();

	const totalPages = pagination.calculateTotalPages(invoicesData?.total ?? 0);
	const invoices = invoicesData?.data ?? [];

	const handleView = useCallback(
		(invoice: InvoiceResponse) => {
			void navigate(`/billing/invoices/${invoice.id}`);
		},
		[navigate]
	);

	const handleIssue = useCallback(
		(invoice: InvoiceResponse) => {
			modals.openConfirmModal({
				title: t('detail.actions.issue'),
				centered: true,
				children: <Text size='sm'>{t('detail.actions.issueConfirm')}</Text>,
				labels: {
					confirm: t('detail.actions.issue'),
					cancel: t('actions.cancel', { ns: 'common' }),
				},
				confirmProps: { color: 'green' },
				onConfirm: async () => {
					try {
						const updated = await issueMutation.mutateAsync(invoice.id);
						notifications.show({
							title: t('notifications.issued.title'),
							message: t('notifications.issued.message', {
								number: updated.invoiceNumber,
							}),
							color: 'green',
						});
					} catch {
						notifications.show({
							title: 'Error',
							message: 'Failed to issue invoice.',
							color: 'red',
						});
					}
				},
			});
		},
		[issueMutation, t]
	);

	const handleVoid = useCallback(
		(invoice: InvoiceResponse) => {
			let reason = '';
			modals.openConfirmModal({
				title: t('detail.actions.voidTitle'),
				centered: true,
				children: (
					<div>
						<Text size='sm' mb='sm'>
							{t('detail.actions.voidDescription')}
						</Text>
						<Textarea
							label={t('detail.actions.voidReasonLabel')}
							placeholder={t('detail.actions.voidReasonPlaceholder')}
							minRows={3}
							onChange={(e) => {
								reason = e.currentTarget.value;
							}}
						/>
					</div>
				),
				labels: {
					confirm: t('detail.actions.voidConfirm'),
					cancel: t('actions.cancel', { ns: 'common' }),
				},
				confirmProps: { color: 'red' },
				onConfirm: async () => {
					if (!reason.trim()) {
						notifications.show({
							title: 'Error',
							message: 'Reason is required.',
							color: 'red',
						});
						return;
					}
					try {
						const updated = await voidMutation.mutateAsync({
							id: invoice.id,
							dto: { reason },
						});
						notifications.show({
							title: t('notifications.voided.title'),
							message: t('notifications.voided.message', {
								number: updated.invoiceNumber,
							}),
							color: 'orange',
						});
					} catch {
						notifications.show({
							title: 'Error',
							message: 'Failed to void invoice.',
							color: 'red',
						});
					}
				},
			});
		},
		[voidMutation, t]
	);

	const handleDownload = useCallback(
		async (invoice: InvoiceResponse) => {
			try {
				await downloadMutation.mutateAsync(invoice.id);
			} catch (err) {
				const status = (err as Error & { status?: number }).status;
				if (status === 422) {
					notifications.show({
						title: 'Error',
						message: t('notifications.downloadFailed.invalidTemplate'),
						color: 'red',
					});
				} else if (status === 404) {
					notifications.show({
						title: 'Error',
						message: t('notifications.downloadFailed.noTemplate'),
						color: 'red',
					});
				} else {
					notifications.show({
						title: 'Error',
						message: t('notifications.downloadFailed.generic'),
						color: 'red',
					});
				}
			}
		},
		[downloadMutation, t]
	);

	const columns = useInvoiceColumns({
		onView: handleView,
		onIssue: handleIssue,
		onVoid: handleVoid,
		onDownload: handleDownload,
	});

	return (
		<ContentContainer>
			<div className={classes.root}>
				<SectionCard>
					<InvoiceFilters
						filters={filters}
						clients={clients}
						onChange={setFilters}
					/>
				</SectionCard>

				<SectionCard
					title={t('page.title')}
					description={t('page.description')}
					onAdd={() => void navigate('/billing/invoices/new')}
				>
					{isLoading && (
						<Center>
							<Loader size='sm' />
						</Center>
					)}
					{isError && (
						<Alert
							icon={<IconInfoCircle size={18} />}
							color='red'
							title={t('list.error.title')}
						>
							{error instanceof Error ? error.message : 'Unknown error'}
						</Alert>
					)}
					{!isLoading && !isError && invoices.length === 0 && (
						<Center>
							<Text size='sm' c='dimmed'>
								{t('list.empty')}
							</Text>
						</Center>
					)}
					{!isLoading && !isError && invoices.length > 0 && (
						<BaseTable<InvoiceResponse>
							data={invoices}
							columns={columns}
							onRowClick={handleView}
							getRowClassName={() => classes.tableRow}
							filterMode='server'
							pageIndex={pagination.currentPage - 1}
							pageSize={pagination.itemsPerPage}
							totalCount={invoicesData?.total ?? 0}
							onPaginationChange={(pageIndex, pageSize) => {
								pagination.setCurrentPage(pageIndex + 1);
								pagination.setItemsPerPage(pageSize);
							}}
							showPaginationControls={totalPages > 1}
							enablePagination={true}
						/>
					)}
				</SectionCard>
			</div>
		</ContentContainer>
	);
};

export default InvoicesPage;
```

- [ ] **Step 4: Create `src/modules/billing/InvoicesPage/index.ts`**

```ts
export { default } from './InvoicesPage';
```

- [ ] **Step 5: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/modules/billing/hooks/ src/modules/billing/InvoicesPage/
git commit -m "feat: add InvoicesPage with filtering and actions"
```

---

## Task 10: InvoiceNewPage (3-step wizard)

**Files:**

- Create: `src/modules/billing/InvoiceNewPage/InvoiceNewPage.tsx`
- Create: `src/modules/billing/InvoiceNewPage/InvoiceNewPage.module.css`
- Create: `src/modules/billing/InvoiceNewPage/index.ts`

- [ ] **Step 1: Create `src/modules/billing/InvoiceNewPage/InvoiceNewPage.module.css`**

```css
.root {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-md);
}

.stepperWrapper {
	max-width: 900px;
	margin: 0 auto;
	width: 100%;
}

.formGrid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--mantine-spacing-md);
}

.fullWidth {
	grid-column: 1 / -1;
}

.actions {
	display: flex;
	justify-content: flex-end;
	gap: var(--mantine-spacing-sm);
	padding-top: var(--mantine-spacing-md);
}

@media (max-width: 640px) {
	.formGrid {
		grid-template-columns: 1fr;
	}
}
```

- [ ] **Step 2: Create `src/modules/billing/InvoiceNewPage/InvoiceNewPage.tsx`**

```tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
	Alert,
	Button,
	Checkbox,
	Group,
	NumberInput,
	SegmentedControl,
	Select,
	Stack,
	Stepper,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { useGetAllClients } from '~/queries/clientQueries';
import { usePreviewInvoice, useCreateInvoice } from '~/queries/invoiceQueries';
import type {
	InvoicePreviewResponse,
	InvoiceStatus,
	InvoiceCurrency,
	CreateInvoiceDto,
} from '~/models/InvoiceModel';
import InvoiceSnapshotCard from '../components/InvoiceSnapshotCard';
import classes from './InvoiceNewPage.module.css';

interface FormValues {
	issuerClientId: string;
	receiverClientId: string;
	periodStart: Date | null;
	periodEnd: Date | null;
	invoiceNumber: string;
	currency: InvoiceCurrency;
	taxRate: number;
	hourlyRate: number;
}

const InvoiceNewPage: React.FC = () => {
	const { t } = useTranslation('billing');
	const navigate = useNavigate();

	const [active, setActive] = useState(0);
	const [preview, setPreview] = useState<InvoicePreviewResponse | null>(null);
	const [replaceExisting, setReplaceExisting] = useState(false);
	const [replaceReason, setReplaceReason] = useState('');
	const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>('DRAFT');

	const { data: clients = [] } = useGetAllClients();
	const previewMutation = usePreviewInvoice();
	const createMutation = useCreateInvoice();

	const clientOptions = clients.map((c) => ({
		value: String(c.id),
		label: c.name,
	}));

	const form = useForm<FormValues>({
		initialValues: {
			issuerClientId: '',
			receiverClientId: '',
			periodStart: null,
			periodEnd: null,
			invoiceNumber: '',
			currency: 'DOP',
			taxRate: 18,
			hourlyRate: 0,
		},
		validate: {
			issuerClientId: (v) => (!v ? t('new.validation.issuerRequired') : null),
			receiverClientId: (v) =>
				!v ? t('new.validation.receiverRequired') : null,
			periodStart: (v) => (!v ? t('new.validation.periodStartRequired') : null),
			periodEnd: (v) => (!v ? t('new.validation.periodEndRequired') : null),
			invoiceNumber: (v) =>
				!v.trim() ? t('new.validation.invoiceNumberRequired') : null,
			hourlyRate: (v) => (v < 0 ? t('new.validation.hourlyRateMin') : null),
			taxRate: (v) =>
				v < 0 || v > 100 ? t('new.validation.taxRateRange') : null,
		},
	});

	const formatDate = (d: Date | null): string =>
		d ? d.toISOString().split('T')[0] : '';

	const handlePreview = useCallback(async () => {
		const result = form.validate();
		if (result.hasErrors) return;

		const v = form.values;
		try {
			const data = await previewMutation.mutateAsync({
				issuerClientId: Number(v.issuerClientId),
				receiverClientId: Number(v.receiverClientId),
				periodStart: formatDate(v.periodStart),
				periodEnd: formatDate(v.periodEnd),
				invoiceNumber: v.invoiceNumber,
				currency: v.currency,
				taxRate: v.taxRate,
				hourlyRate: v.hourlyRate,
			});
			setPreview(data);
			setReplaceExisting(false);
			setReplaceReason('');
			setActive(1);
		} catch {
			notifications.show({
				title: 'Error',
				message: 'Failed to preview invoice.',
				color: 'red',
			});
		}
	}, [form, previewMutation]);

	const handleCreate = useCallback(async () => {
		if (!preview) return;
		const v = form.values;

		const dto: CreateInvoiceDto = {
			issuerClientId: Number(v.issuerClientId),
			receiverClientId: Number(v.receiverClientId),
			periodStart: formatDate(v.periodStart),
			periodEnd: formatDate(v.periodEnd),
			invoiceNumber: v.invoiceNumber,
			currency: v.currency,
			taxRate: v.taxRate,
			hourlyRate: v.hourlyRate,
			status: invoiceStatus,
		};

		if (replaceExisting && preview.activeInvoiceConflict) {
			dto.replaceExisting = true;
			dto.replacesInvoiceId = preview.activeInvoiceConflict.id;
			dto.replaceReason = replaceReason;
		}

		try {
			const created = await createMutation.mutateAsync(dto);
			notifications.show({
				title: t('notifications.created.title'),
				message: t('notifications.created.message', {
					number: created.invoiceNumber,
				}),
				color: 'green',
			});
			void navigate(`/billing/invoices/${created.id}`);
		} catch (err) {
			const status = (err as { response?: { status?: number } }).response
				?.status;
			if (status === 409) {
				// Race condition — go back to preview
				notifications.show({
					title: 'Conflict',
					message: 'A conflict was detected. Refreshing preview.',
					color: 'yellow',
				});
				void handlePreview();
			} else {
				notifications.show({
					title: 'Error',
					message: 'Failed to create invoice.',
					color: 'red',
				});
			}
		}
	}, [
		preview,
		form,
		invoiceStatus,
		replaceExisting,
		replaceReason,
		createMutation,
		navigate,
		t,
		handlePreview,
	]);

	return (
		<ContentContainer>
			<div className={classes.root}>
				<SectionCard title={t('new.title')}>
					<div className={classes.stepperWrapper}>
						<Stepper active={active} onStepClick={setActive}>
							{/* Step 1 — Parameters */}
							<Stepper.Step label={t('new.steps.parameters')}>
								<Stack gap='md' mt='md'>
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
										<TextInput
											label={t('new.form.invoiceNumber.label')}
											placeholder={t('new.form.invoiceNumber.placeholder')}
											size='sm'
											{...form.getInputProps('invoiceNumber')}
										/>
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
									<div className={classes.actions}>
										<Button
											onClick={() => void handlePreview()}
											loading={previewMutation.isPending}
										>
											{t('new.actions.preview')}
										</Button>
									</div>
								</Stack>
							</Stepper.Step>

							{/* Step 2 — Preview */}
							<Stepper.Step label={t('new.steps.preview')}>
								<Stack gap='md' mt='md'>
									{preview?.snapshot.calculationWarnings &&
										preview.snapshot.calculationWarnings.length > 0 && (
											<Alert
												icon={<IconAlertTriangle size={18} />}
												color='yellow'
												title={t('new.warnings.title')}
											>
												<Stack gap='xs'>
													{preview.snapshot.calculationWarnings.map((w, i) => (
														<Text key={i} size='sm'>
															{w}
														</Text>
													))}
												</Stack>
											</Alert>
										)}

									{preview?.hasActiveInvoiceConflict &&
										preview.activeInvoiceConflict && (
											<Alert
												icon={<IconInfoCircle size={18} />}
												color='red'
												title={t('new.conflict.title')}
											>
												<Stack gap='sm'>
													<Text size='sm'>{t('new.conflict.description')}</Text>
													<Text size='sm'>
														<strong>
															#{preview.activeInvoiceConflict.invoiceNumber}
														</strong>{' '}
														— {preview.activeInvoiceConflict.status} (
														{preview.activeInvoiceConflict.periodStart} –{' '}
														{preview.activeInvoiceConflict.periodEnd})
													</Text>
													<Checkbox
														label={t('new.conflict.replaceLabel')}
														checked={replaceExisting}
														onChange={(e) =>
															setReplaceExisting(e.currentTarget.checked)
														}
													/>
													{replaceExisting && (
														<Textarea
															label={t('new.conflict.replaceReasonLabel')}
															placeholder={t(
																'new.conflict.replaceReasonPlaceholder'
															)}
															value={replaceReason}
															onChange={(e) =>
																setReplaceReason(e.currentTarget.value)
															}
															minRows={2}
														/>
													)}
												</Stack>
											</Alert>
										)}

									{preview?.snapshot && (
										<InvoiceSnapshotCard snapshot={preview.snapshot} />
									)}

									<div className={classes.actions}>
										<Button variant='default' onClick={() => setActive(0)}>
											{t('new.actions.back')}
										</Button>
										<Button
											onClick={() => setActive(2)}
											disabled={
												preview?.hasActiveInvoiceConflict &&
												(!replaceExisting || !replaceReason.trim())
											}
										>
											{t('new.actions.continue')}
										</Button>
									</div>
								</Stack>
							</Stepper.Step>

							{/* Step 3 — Confirm */}
							<Stepper.Step label={t('new.steps.confirm')}>
								<Stack gap='md' mt='md'>
									<SectionCard padding='sm'>
										<Stack gap='xs'>
											<Group justify='space-between'>
												<Text size='sm' c='dimmed'>
													{t('new.summary.period')}
												</Text>
												<Text size='sm'>
													{formatDate(form.values.periodStart)} –{' '}
													{formatDate(form.values.periodEnd)}
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
												<Text size='sm' fw={600}>
													{preview?.snapshot.totals.totalFormatted ?? '—'}
												</Text>
											</Group>
										</Stack>
									</SectionCard>

									<div>
										<Text size='sm' fw={500} mb={4}>
											{t('new.statusLabel')}
										</Text>
										<SegmentedControl
											data={[
												{ value: 'DRAFT', label: t('new.statusDraft') },
												{ value: 'ISSUED', label: t('new.statusIssued') },
											]}
											value={invoiceStatus}
											onChange={(v) => setInvoiceStatus(v as InvoiceStatus)}
											size='sm'
										/>
									</div>

									<div className={classes.actions}>
										<Button variant='default' onClick={() => setActive(1)}>
											{t('new.actions.back')}
										</Button>
										<Button
											onClick={() => void handleCreate()}
											loading={createMutation.isPending}
										>
											{createMutation.isPending
												? t('new.actions.creating')
												: t('new.actions.create')}
										</Button>
									</div>
								</Stack>
							</Stepper.Step>
						</Stepper>
					</div>
				</SectionCard>
			</div>
		</ContentContainer>
	);
};

export default InvoiceNewPage;
```

- [ ] **Step 3: Create `src/modules/billing/InvoiceNewPage/index.ts`**

```ts
export { default } from './InvoiceNewPage';
```

- [ ] **Step 4: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/modules/billing/InvoiceNewPage/
git commit -m "feat: add InvoiceNewPage wizard"
```

---

## Task 11: InvoiceDetailPage

**Files:**

- Create: `src/modules/billing/InvoiceDetailPage/InvoiceDetailPage.tsx`
- Create: `src/modules/billing/InvoiceDetailPage/InvoiceDetailPage.module.css`
- Create: `src/modules/billing/InvoiceDetailPage/index.ts`

- [ ] **Step 1: Create `src/modules/billing/InvoiceDetailPage/InvoiceDetailPage.module.css`**

```css
.root {
	display: flex;
	flex-direction: column;
	gap: var(--mantine-spacing-md);
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: var(--mantine-spacing-sm);
}

.metaGrid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: var(--mantine-spacing-md);
}

.metaItem {
	display: flex;
	flex-direction: column;
	gap: 2px;
}
```

- [ ] **Step 2: Create `src/modules/billing/InvoiceDetailPage/InvoiceDetailPage.tsx`**

```tsx
import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
	Alert,
	Button,
	Center,
	Group,
	Loader,
	Text,
	Textarea,
	Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
	IconArrowLeft,
	IconBan,
	IconCheck,
	IconDownload,
	IconInfoCircle,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	useGetInvoice,
	useIssueInvoice,
	useVoidInvoice,
	useDownloadDocx,
} from '~/queries/invoiceQueries';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge';
import InvoiceSnapshotCard from '../components/InvoiceSnapshotCard';
import classes from './InvoiceDetailPage.module.css';

const InvoiceDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation('billing');
	const navigate = useNavigate();

	const invoiceId = Number(id);
	const { data: invoice, isLoading, isError, error } = useGetInvoice(invoiceId);
	const issueMutation = useIssueInvoice();
	const voidMutation = useVoidInvoice();
	const downloadMutation = useDownloadDocx();
	const [isDownloading, setIsDownloading] = useState(false);

	const handleIssue = useCallback(() => {
		modals.openConfirmModal({
			title: t('detail.actions.issue'),
			centered: true,
			children: <Text size='sm'>{t('detail.actions.issueConfirm')}</Text>,
			labels: {
				confirm: t('detail.actions.issue'),
				cancel: t('actions.cancel', { ns: 'common' }),
			},
			confirmProps: { color: 'green' },
			onConfirm: async () => {
				try {
					const updated = await issueMutation.mutateAsync(invoiceId);
					notifications.show({
						title: t('notifications.issued.title'),
						message: t('notifications.issued.message', {
							number: updated.invoiceNumber,
						}),
						color: 'green',
					});
				} catch {
					notifications.show({
						title: 'Error',
						message: 'Failed to issue invoice.',
						color: 'red',
					});
				}
			},
		});
	}, [issueMutation, invoiceId, t]);

	const handleVoid = useCallback(() => {
		let reason = '';
		modals.openConfirmModal({
			title: t('detail.actions.voidTitle'),
			centered: true,
			children: (
				<div>
					<Text size='sm' mb='sm'>
						{t('detail.actions.voidDescription')}
					</Text>
					<Textarea
						label={t('detail.actions.voidReasonLabel')}
						placeholder={t('detail.actions.voidReasonPlaceholder')}
						minRows={3}
						onChange={(e) => {
							reason = e.currentTarget.value;
						}}
					/>
				</div>
			),
			labels: {
				confirm: t('detail.actions.voidConfirm'),
				cancel: t('actions.cancel', { ns: 'common' }),
			},
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				if (!reason.trim()) {
					notifications.show({
						title: 'Error',
						message: 'Reason is required.',
						color: 'red',
					});
					return;
				}
				try {
					const updated = await voidMutation.mutateAsync({
						id: invoiceId,
						dto: { reason },
					});
					notifications.show({
						title: t('notifications.voided.title'),
						message: t('notifications.voided.message', {
							number: updated.invoiceNumber,
						}),
						color: 'orange',
					});
				} catch {
					notifications.show({
						title: 'Error',
						message: 'Failed to void invoice.',
						color: 'red',
					});
				}
			},
		});
	}, [voidMutation, invoiceId, t]);

	const handleDownload = useCallback(async () => {
		setIsDownloading(true);
		try {
			await downloadMutation.mutateAsync(invoiceId);
		} catch (err) {
			const status = (err as Error & { status?: number }).status;
			if (status === 422) {
				notifications.show({
					title: 'Error',
					message: t('notifications.downloadFailed.invalidTemplate'),
					color: 'red',
				});
			} else if (status === 404) {
				notifications.show({
					title: 'Error',
					message: t('notifications.downloadFailed.noTemplate'),
					color: 'red',
				});
			} else {
				notifications.show({
					title: 'Error',
					message: t('notifications.downloadFailed.generic'),
					color: 'red',
				});
			}
		} finally {
			setIsDownloading(false);
		}
	}, [downloadMutation, invoiceId, t]);

	if (isLoading) {
		return (
			<ContentContainer>
				<Center py='xl'>
					<Loader />
				</Center>
			</ContentContainer>
		);
	}

	if (isError || !invoice) {
		return (
			<ContentContainer>
				<Alert icon={<IconInfoCircle size={18} />} color='red'>
					{error instanceof Error ? error.message : 'Invoice not found.'}
				</Alert>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer>
			<div className={classes.root}>
				<SectionCard>
					<div className={classes.header}>
						<Group gap='sm'>
							<Button
								variant='subtle'
								leftSection={<IconArrowLeft size={16} />}
								onClick={() => void navigate('/billing/invoices')}
								size='sm'
							>
								{t('detail.actions.back')}
							</Button>
							<Title order={4}>{invoice.invoiceNumber}</Title>
							<InvoiceStatusBadge status={invoice.status} />
						</Group>
						<Group gap='xs'>
							{invoice.status === 'DRAFT' && (
								<Button
									leftSection={<IconCheck size={16} />}
									color='green'
									variant='light'
									size='sm'
									loading={issueMutation.isPending}
									onClick={handleIssue}
								>
									{t('detail.actions.issue')}
								</Button>
							)}
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
							<Button
								leftSection={<IconDownload size={16} />}
								variant='light'
								size='sm'
								loading={isDownloading}
								onClick={() => void handleDownload()}
							>
								{t('detail.actions.download')}
							</Button>
						</Group>
					</div>
				</SectionCard>

				<SectionCard padding='sm'>
					<div className={classes.metaGrid}>
						<div className={classes.metaItem}>
							<Text size='xs' c='dimmed'>
								{t('detail.metadata.period')}
							</Text>
							<Text size='sm'>
								{invoice.periodStart} – {invoice.periodEnd}
							</Text>
						</div>
						<div className={classes.metaItem}>
							<Text size='xs' c='dimmed'>
								{t('detail.metadata.currency')}
							</Text>
							<Text size='sm'>{invoice.currency}</Text>
						</div>
						<div className={classes.metaItem}>
							<Text size='xs' c='dimmed'>
								{t('detail.metadata.createdAt')}
							</Text>
							<Text size='sm'>
								{new Date(invoice.createdAt).toLocaleDateString()}
							</Text>
						</div>
					</div>
				</SectionCard>

				<InvoiceSnapshotCard snapshot={invoice.snapshot} />
			</div>
		</ContentContainer>
	);
};

export default InvoiceDetailPage;
```

- [ ] **Step 3: Create `src/modules/billing/InvoiceDetailPage/index.ts`**

```ts
export { default } from './InvoiceDetailPage';
```

- [ ] **Step 4: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/modules/billing/InvoiceDetailPage/
git commit -m "feat: add InvoiceDetailPage"
```

---

## Task 12: Extend ClientForm with invoice settings

**Files:**

- Modify: `src/modules/clients/ClientForm/ClientForm.tsx`
- Modify: `src/locales/en/clients.json`
- Modify: `src/api/userApi.ts` (add optional `clientId` param)
- Modify: `src/api/fileApi.ts` (add `getClientFiles`)
- Modify: `src/queries/userQueries.ts` (pass `clientId`)

- [ ] **Step 1: Add `clientId` to `GetAllUsersParams` in `src/api/userApi.ts`**

In the `GetAllUsersParams` interface, add:

```ts
  clientId?: number;
```

In the `getAllUsers` method, `params` already get spread into query params, so this works automatically since the object is passed as `params` to axios.

- [ ] **Step 2: Add `getClientFiles` to `src/api/fileApi.ts`**

Add this import at the top of `fileApi.ts`:

```ts
import type FileModel from '~/models/FileModel';
```

Add a `getClientFiles` function to the `fileApi` factory. Find the existing `fileApi` function and add the method:

```ts
getClientFiles: async (clientId: number): Promise<FileModel[]> => {
  const response = await axios.get<FileModel[]>(
    `${DEFAULT_API_URL}/files`,
    { params: { clientId } }
  );
  return response.data;
},
```

Also update the return type interface at the top of `fileApi.ts` (or inline — check the file first for the interface pattern). Add the method signature:

```ts
getClientFiles: (clientId: number) => Promise<FileModel[]>;
```

- [ ] **Step 3: Add `useGetClientFiles` query to `src/queries` (new file)**

Create `src/queries/fileQueries.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import fileApi from '~/api/fileApi';
import type FileModel from '~/models/FileModel';

export const useGetClientFiles = (clientId: number | undefined) => {
	return useQuery<FileModel[]>({
		queryKey: ['files', clientId],
		queryFn: async () => {
			const api = fileApi();
			return api.getClientFiles(clientId!);
		},
		enabled: !!clientId,
	});
};
```

- [ ] **Step 4: Add invoice settings i18n to `src/locales/en/clients.json`**

In the `form.sections` object, add:

```json
"invoiceSettings": {
  "title": "Invoice Settings",
  "description": "Configure invoice template and contact for this client"
}
```

In the `form.fields` object, add:

```json
"website": {
  "label": "Website",
  "placeholder": "https://www.example.com"
},
"pocUserId": {
  "label": "Point of Contact (POC)",
  "placeholder": "Select a user"
},
"invoiceTemplateFileId": {
  "label": "Invoice Template (.docx)",
  "placeholder": "Select a .docx file"
}
```

- [ ] **Step 5: Extend `ClientForm.tsx` with invoice settings section**

In `ClientForm.tsx`:

1. Add import at top:

```ts
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import { useGetAllUsers } from '~/queries/userQueries';
import { useGetClientFiles } from '~/queries/fileQueries';
```

2. Extend `ClientFormValues` interface:

```ts
  website?: string;
  pocUserId?: number | null;
  invoiceTemplateFileId?: number | null;
```

3. Add to `form.initialValues`:

```ts
  website: '',
  pocUserId: null,
  invoiceTemplateFileId: null,
```

4. Inside the component, after existing hooks:

```ts
const isMasterClient = useIsMasterClient();
const { data: allUsers = [] } = useGetAllUsers(
	clientId ? { clientId } : undefined
);
const { data: clientFiles = [] } = useGetClientFiles(
	isEditMode ? clientId : undefined
);
```

5. Populate form when client loads (in the existing `useEffect` that sets form values when `client` data is loaded), add:

```ts
  website: client.website ?? '',
  pocUserId: client.pocUserId ?? null,
  invoiceTemplateFileId: client.invoiceTemplateFileId ?? null,
```

6. Include invoice fields in the submit data (in the `handleSubmit` or mutation call). In the `updateMutation.mutateAsync` call, include:

```ts
  website: values.website || undefined,
  pocUserId: values.pocUserId ?? null,
  invoiceTemplateFileId: values.invoiceTemplateFileId ?? null,
```

7. Build select options inside the component:

```ts
const userOptions = allUsers.data
	? allUsers.data
			.filter((u) => !clientId || u.clientId === clientId)
			.map((u) => ({
				value: String(u.id),
				label: `${u.firstName ?? ''} ${u.lastName ?? ''} (${u.email})`.trim(),
			}))
	: [];

const docxFileOptions = clientFiles
	.filter((f) => f.extension === 'docx')
	.map((f) => ({ value: String(f.id), label: f.name }));
```

8. Add the section before the closing `</Stack>` inside the form, only when `isMasterClient && isEditMode`:

```tsx
{
	isMasterClient && isEditMode && (
		<SectionCard
			title={t('form.sections.invoiceSettings.title')}
			description={t('form.sections.invoiceSettings.description')}
			contentSpacing='sm'
			padding='md'
		>
			<TextInput
				label={t('form.fields.website.label')}
				placeholder={t('form.fields.website.placeholder')}
				size='sm'
				{...form.getInputProps('website')}
			/>
			<Select
				label={t('form.fields.pocUserId.label')}
				placeholder={t('form.fields.pocUserId.placeholder')}
				data={userOptions}
				value={
					form.values.pocUserId != null ? String(form.values.pocUserId) : null
				}
				onChange={(v) => form.setFieldValue('pocUserId', v ? Number(v) : null)}
				clearable
				searchable
				size='sm'
			/>
			<Select
				label={t('form.fields.invoiceTemplateFileId.label')}
				placeholder={t('form.fields.invoiceTemplateFileId.placeholder')}
				data={docxFileOptions}
				value={
					form.values.invoiceTemplateFileId != null
						? String(form.values.invoiceTemplateFileId)
						: null
				}
				onChange={(v) =>
					form.setFieldValue('invoiceTemplateFileId', v ? Number(v) : null)
				}
				clearable
				searchable
				size='sm'
			/>
		</SectionCard>
	);
}
```

Note: The `useGetAllUsers` hook returns a `Paginator<UserModel>` (with `.data` array), not a plain array. Access via `allUsers.data ?? []`. Update the options accordingly:

```ts
const userOptions = (allUsers.data ?? [])
	.filter((u) => !clientId || u.clientId === clientId)
	.map((u) => ({
		value: String(u.id),
		label: `${u.firstName ?? ''} ${u.lastName ?? ''} (${u.email})`.trim(),
	}));
```

- [ ] **Step 6: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors. Fix any type errors before proceeding.

- [ ] **Step 7: Commit**

```bash
git add src/api/userApi.ts src/api/fileApi.ts src/queries/fileQueries.ts src/modules/clients/ClientForm/ClientForm.tsx src/locales/en/clients.json
git commit -m "feat: extend ClientForm with invoice settings section"
```

---

## Task 13: Final typecheck and module index

**Files:**

- Create: `src/modules/billing/index.ts`

- [ ] **Step 1: Create `src/modules/billing/index.ts`**

```ts
export { default as InvoicesPage } from './InvoicesPage';
export { default as InvoiceNewPage } from './InvoiceNewPage';
export { default as InvoiceDetailPage } from './InvoiceDetailPage';
```

- [ ] **Step 2: Run full typecheck**

```bash
npm run typecheck
```

Expected: exit 0, no errors

- [ ] **Step 3: Run build to confirm no bundle errors**

```bash
npm run build
```

Expected: build succeeds

- [ ] **Step 4: Final commit**

```bash
git add src/modules/billing/index.ts
git commit -m "feat: billing module complete — invoices list, wizard, detail, client config"
```

---

## File Map Summary

| File                                                  | Action                                |
| ----------------------------------------------------- | ------------------------------------- |
| `src/models/InvoiceModel.ts`                          | Create                                |
| `src/models/ClientModel.ts`                           | Modify — add 3 invoice fields         |
| `src/api/invoiceApi.ts`                               | Create                                |
| `src/api/userApi.ts`                                  | Modify — add `clientId` to params     |
| `src/api/fileApi.ts`                                  | Modify — add `getClientFiles`         |
| `src/queries/invoiceQueries.ts`                       | Create                                |
| `src/queries/fileQueries.ts`                          | Create                                |
| `src/constants/ModuleEnum.ts`                         | Modify — add `BILLING`                |
| `src/components/Sidebar/Sidebar.tsx`                  | Modify — add invoices nav item        |
| `src/locales/en/common.json`                          | Modify — add `sidebar.items.invoices` |
| `src/locales/en/billing.json`                         | Create                                |
| `src/locales/en/clients.json`                         | Modify — add invoice settings i18n    |
| `src/routes.tsx`                                      | Modify — add billing routes           |
| `src/modules/billing/components/InvoiceStatusBadge/`  | Create                                |
| `src/modules/billing/components/InvoiceSnapshotCard/` | Create                                |
| `src/modules/billing/components/InvoiceFilters/`      | Create                                |
| `src/modules/billing/hooks/useInvoiceColumns.ts`      | Create                                |
| `src/modules/billing/InvoicesPage/`                   | Create                                |
| `src/modules/billing/InvoiceNewPage/`                 | Create                                |
| `src/modules/billing/InvoiceDetailPage/`              | Create                                |
| `src/modules/billing/index.ts`                        | Create                                |
| `src/modules/clients/ClientForm/ClientForm.tsx`       | Modify — add invoice settings section |
