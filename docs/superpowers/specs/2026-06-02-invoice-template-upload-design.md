# Invoice Template Upload — Design

**Date:** 2026-06-02
**Status:** Approved
**Scope:** Add .docx template upload + assignment UI to the InvoicesPage

---

## Overview

Invoice DOCX files are generated from a template stored in DigitalOcean Spaces. The frontend must upload a `.docx` template via the generic `/files/upload` endpoint, then associate it with the issuer client via `PATCH /clients/:id`. This is exposed as an expandable SectionCard on the existing InvoicesPage, usable only by the master tenant.

---

## Architecture

### File Structure Additions

```
src/
  api/
    fileApi.ts                              ← ADD uploadFile method
  modules/
    billing/
      components/
        InvoiceTemplateManager/             ← NEW component
          InvoiceTemplateManager.tsx
          InvoiceTemplateManager.module.css
          index.ts
      InvoicesPage/
        InvoicesPage.tsx                    ← EDIT — render InvoiceTemplateManager
  queries/
    fileQueries.ts                          ← ADD useUploadFile mutation hook
  locales/
    en/billing.json                         ← ADD template translation keys
    es/billing.json                         ← ADD template translation keys
```

No new models, no new routes. The existing `fileApi.ts`, `clientApi.ts`, and `updateClient` mutation handle the data layer.

---

## UI Layout

A collapsible SectionCard placed between `InvoiceFilters` and the `BaseTable` on InvoicesPage.

**Collapsed state (default):**

```
┌─────────────────────────────────────────────┐
│ [▸] Invoice Template Settings    (2)        │
└─────────────────────────────────────────────┘
```

The badge shows count of issuer clients that have a template configured.

**Expanded state:**

```
┌─────────────────────────────────────────────┐
│ [▾] Invoice Template Settings               │
├─────────────────────────────────────────────┤
│ Issuer Client:  [Select ▼]                  │
│                                              │
│ Current template: newtech-template.docx  ✔   │
│ Last updated:    2026-06-02                  │
│                                              │
│ [Upload New Template]  [Remove Template]     │
│                                              │
│ ℹ️ Changing the template affects future       │
│ downloads of existing invoices.              │
└─────────────────────────────────────────────┘
```

- **Issuer Client** — Select populated from all clients. Filters files displayed.
- **Current template** — Shows selected `.docx` filename. Green checkmark if `invoiceTemplateFileId` is set, red "Not configured" if null.
- **Upload New Template** — Button opens native file picker for `.docx` only. On selection, uploads via `/files/upload` then immediately patches the client.
- **Remove Template** — Calls `PATCH /clients/:id` with `invoiceTemplateFileId: null`. Hidden if none is set.

---

## Data Flow

### Upload + Assign (single action)

```
User clicks "Upload New Template"
  → selects .docx file (frontend validates extension + MIME)
  → mutation 1: POST /files/upload (FormData with codeType='INVOICE_TEMPLATE')
  → on success → mutation 2: PATCH /clients/:id { invoiceTemplateFileId: <id> }
  → on success → invalidate queries, update UI
  → on error at step 1 → show upload error notification
  → on error at step 2 → show assignment error notification (file uploaded but not assigned)
```

### Remove

```
User clicks "Remove Template"
  → PATCH /clients/:id { invoiceTemplateFileId: null }
  → invalidate queries, update UI
```

### Client switch

```
User changes Issuer Client Select
  → fetch that client's files via useGetClientFiles(newClientId)
  → show that client's invoiceTemplateFileId if set
```

---

## API Layer

### `fileApi.ts` — new `uploadFile` method

```typescript
uploadFile: async (
	file: File,
	codeType?: string,
	description?: string
): Promise<FileModel> => {
	const formData = new FormData();
	formData.append('file', file);
	if (codeType) formData.append('codeType', codeType);
	if (description) formData.append('description', description);
	const response = await axios.post<FileModel>(
		`${DEFAULT_API_URL}/files/upload`,
		formData
	);
	return response.data;
};
```

### Existing — `clientApi.updateClient`

`PATCH /clients/:id` with `{ invoiceTemplateFileId: number }` — already exists.

### `fileQueries.ts` — new `useUploadFile` mutation

Follows the existing `useUploadContactGroupFile` pattern:

```typescript
export const useUploadFile = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: {
			file: File;
			codeType?: string;
			description?: string;
		}) => {
			const api = fileApi();
			return api.uploadFile(params.file, params.codeType, params.description);
		},
		onSuccess: () => {
			// Caller handles invalidation with the specific clientId
		},
	});
};
```

Invalidation happens in the component's `onSuccess` callbacks since the client ID is only known at the component level.

### Existing — `useGetClientFiles(clientId)`

Fetches files for a client, filtered to `.docx` on the frontend.

---

## Validation

| Scope    | Check                              | Implementation                                                                                                                                        |
| -------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | File must be `.docx`               | `accept=".docx"` on input + `file.name.endsWith('.docx')` + `file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'` |
| Frontend | Warn about existing invoice impact | Info alert in the card                                                                                                                                |
| Backend  | File must belong to same client    | Validation on `PATCH /clients/:id` (already exists)                                                                                                   |
| Backend  | Extension must be `.docx`          | Validation on `PATCH /clients/:id` (already exists)                                                                                                   |
| Backend  | Invalid placeholders               | 422 on `GET /invoices/:id/docx` (already exists)                                                                                                      |

---

## i18n

### New keys (`billing.json`)

```json
{
	"templates": {
		"card": {
			"title": "Invoice Template Settings",
			"description": "Manage DOCX templates used for invoice generation"
		},
		"issuerClient": {
			"label": "Issuer Client",
			"placeholder": "Select issuer client"
		},
		"currentTemplate": "Current Template",
		"lastUpdated": "Last updated",
		"status": {
			"configured": "Configured",
			"none": "Not configured"
		},
		"actions": {
			"upload": "Upload Template",
			"uploading": "Uploading...",
			"remove": "Remove Template"
		},
		"info": "Changing the template affects future downloads of existing invoices.",
		"count": "{count} configured",
		"notifications": {
			"uploaded": "Template uploaded and assigned",
			"removed": "Template removed",
			"uploadError": "Could not upload the invoice template. Please verify the file is a valid .docx.",
			"assignError": "The selected template does not belong to this issuer client or is not a .docx file."
		}
	}
}
```

---

## Error Handling

| Scenario                           | Behavior                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Non-.docx file selected            | Frontend prevents upload, shows notification                                                             |
| 400 from `/files/upload`           | Notification: templates.notifications.uploadError                                                        |
| 400 from `PATCH /clients/:id`      | Notification: templates.notifications.assignError                                                        |
| 422 on invoice download            | Existing notification in `useDownloadDocx`                                                               |
| Client Select empty                | Upload and Remove buttons disabled. User must select an issuer client first.                             |
| Upload successful but assign fails | File is orphaned (uploaded but not assigned). Show error notification with the specific backend message. |
| Network error during upload        | Standard error notification via `getErrorMessage`                                                        |

---

## Assumptions

1. `/files/upload` endpoint exists and accepts `codeType: 'INVOICE_TEMPLATE'`.
2. Backend validates `invoiceTemplateFileId` belongs to the same client and is `.docx` on `PATCH /clients/:id` (already implemented per the existing codebase).
3. The same `FileModel` shape is returned by `/files/upload` and `/files?clientId=`.
4. All billing routes remain `masterOnly`.

---

## Future Improvements

A convenience endpoint `POST /clients/:clientId/invoice-template` that uploads + assigns in one call would simplify this to a single mutation. Not needed for the initial implementation.
