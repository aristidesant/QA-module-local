# Invoice Template Upload — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add .docx template upload + assignment UI as an expandable SectionCard on the InvoicesPage.

**Architecture:** Uses existing `POST /files/upload` and `PATCH /clients/:id` endpoints. A new `InvoiceTemplateManager` component handles file picker, upload mutation, and immediate client patch. The existing `fileApi.ts` gets a new `uploadFile` method; `fileQueries.ts` gets a `useUploadFile` mutation hook. No new models or routes.

**Tech Stack:** React + TypeScript, Mantine v9, TanStack React Query v5, i18next, Axios

---

## File Structure Changes

**Create:**

- `src/modules/billing/components/InvoiceTemplateManager/InvoiceTemplateManager.tsx`
- `src/modules/billing/components/InvoiceTemplateManager/index.ts`

**Modify:**

- `src/api/fileApi.ts` — add `uploadFile` method
- `src/queries/fileQueries.ts` — add `useUploadFile` mutation
- `src/modules/billing/InvoicesPage/InvoicesPage.tsx` — render InvoiceTemplateManager
- `src/locales/en/billing.json` — add template translation keys
- `src/locales/es/billing.json` — add template translation keys

---

### Task 1: Add `uploadFile` to `fileApi.ts`

**Files:**

- Modify: `src/api/fileApi.ts`

- [ ] **Add `uploadFile` method to `fileApi`**

Replace the factory return type annotation to include the new method. Add this after `getPresignedFileUrl`:

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
},
```

- [ ] **Verify the build**

```bash
npm run typecheck
```

Expected: No type errors. The `FileModel` import already exists at line 3.

---

### Task 2: Add `useUploadFile` mutation to `fileQueries.ts`

**Files:**

- Modify: `src/queries/fileQueries.ts`

- [ ] **Add `useUploadFile` export**

Add after the `useGetClientFiles` hook:

```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
```

No change needed — `useMutation` is already not imported. Update the import:

```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
```

Then add the hook:

```typescript
export const useUploadFile = () => {
	return useMutation({
		mutationFn: async (params: {
			file: File;
			codeType?: string;
			description?: string;
		}): Promise<FileModel> => {
			const api = fileApi();
			return api.uploadFile(params.file, params.codeType, params.description);
		},
	});
};
```

- [ ] **Verify the build**

```bash
npm run typecheck
```

Expected: No type errors.

---

### Task 3: Add i18n keys

**Files:**

- Modify: `src/locales/en/billing.json`
- Modify: `src/locales/es/billing.json`

- [ ] **Add English translation keys**

Add before the closing `}` of `src/locales/en/billing.json`:

Insert this at line 195 (before the last `}`):

```json
,
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
```

- [ ] **Add Spanish translation keys**

Insert this at line 195 (before the last `}`) of `src/locales/es/billing.json`:

```json
,
	"templates": {
		"card": {
			"title": "Configuración de Plantilla de Factura",
			"description": "Administra las plantillas DOCX para la generación de facturas"
		},
		"issuerClient": {
			"label": "Cliente Emisor",
			"placeholder": "Seleccionar cliente emisor"
		},
		"currentTemplate": "Plantilla Actual",
		"lastUpdated": "Última actualización",
		"status": {
			"configured": "Configurada",
			"none": "Sin configurar"
		},
		"actions": {
			"upload": "Subir Plantilla",
			"uploading": "Subiendo...",
			"remove": "Eliminar Plantilla"
		},
		"info": "Cambiar la plantilla afecta las descargas futuras de facturas existentes.",
		"count": "{count} configuradas",
		"notifications": {
			"uploaded": "Plantilla subida y asignada",
			"removed": "Plantilla eliminada",
			"uploadError": "No se pudo subir la plantilla. Verifica que el archivo sea un .docx válido.",
			"assignError": "La plantilla seleccionada no pertenece a este cliente emisor o no es un archivo .docx."
		}
	}
```

- [ ] **Verify the build**

```bash
npm run typecheck
```

Expected: No type errors.

---

### Task 4: Create `InvoiceTemplateManager` component

**Files:**

- Create: `src/modules/billing/components/InvoiceTemplateManager/InvoiceTemplateManager.tsx`
- Create: `src/modules/billing/components/InvoiceTemplateManager/index.ts`

- [ ] **Create `index.ts` barrel export**

```typescript
export { default } from './InvoiceTemplateManager';
```

- [ ] **Create `InvoiceTemplateManager.tsx`**

```typescript
import { useRef, useState } from 'react';
import {
    Alert,
    Badge,
    Button,
    Center,
    Group,
    Select,
    Stack,
    Text,
    Collapse,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconChevronDown, IconChevronRight, IconInfoCircle, IconUpload, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '~/utils/httpClient';
import SectionCard from '~/components/SectionCard';
import { useGetAllClients, useGetClient, useUpdateClient } from '~/queries/clientQueries';
import { useGetClientFiles, useUploadFile } from '~/queries/fileQueries';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const InvoiceTemplateManager: React.FC = () => {
    const { t } = useTranslation('billing');
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

    const { data: clients = [] } = useGetAllClients();
    const { data: selectedClient } = useGetClient(selectedClientId ?? 0);
    const { data: clientFiles = [] } = useGetClientFiles(selectedClientId ?? undefined);
    const uploadMutation = useUploadFile();
    const updateMutation = useUpdateClient();

    const currentTemplateFileId = selectedClient?.invoiceTemplateFileId ?? null;
    const currentTemplateFile = currentTemplateFileId
        ? clientFiles.find((f) => f.id === currentTemplateFileId) ?? null
        : null;

    const configuredCount = clients.filter(
        (c) => c.invoiceTemplateFileId != null
    ).length;

    const clientOptions = clients.map((c) => ({
        value: String(c.id),
        label: c.name,
    }));

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedClientId) return;

        if (!file.name.toLowerCase().endsWith('.docx')) {
            notifications.show({
                title: t('templates.notifications.uploadError'),
                message: '',
                color: 'red',
            });
            return;
        }

        try {
            const uploadedFile = await uploadMutation.mutateAsync({
                file,
                codeType: 'INVOICE_TEMPLATE',
                description: `Invoice template for ${selectedClient?.name ?? 'client'}`,
            });

            await updateMutation.mutateAsync({
                id: selectedClientId,
                data: { invoiceTemplateFileId: uploadedFile.id },
            });

            queryClient.invalidateQueries({ queryKey: ['files', selectedClientId] });
            queryClient.invalidateQueries({ queryKey: ['client', selectedClientId] });

            notifications.show({
                title: t('templates.notifications.uploaded'),
                message: '',
                color: 'green',
            });
        } catch (error) {
            notifications.show({
                title: t('templates.notifications.uploadError'),
                message: getErrorMessage(error),
                color: 'red',
            });
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemove = async () => {
        if (!selectedClientId) return;

        try {
            await updateMutation.mutateAsync({
                id: selectedClientId,
                data: { invoiceTemplateFileId: null },
            });

            queryClient.invalidateQueries({ queryKey: ['files', selectedClientId] });
            queryClient.invalidateQueries({ queryKey: ['client', selectedClientId] });

            notifications.show({
                title: t('templates.notifications.removed'),
                message: '',
                color: 'orange',
            });
        } catch (error) {
            notifications.show({
                title: t('templates.notifications.assignError'),
                message: getErrorMessage(error),
                color: 'red',
            });
        }
    };

    const isUploading = uploadMutation.isPending || updateMutation.isPending;

    return (
        <SectionCard
            title={
                <Group gap='xs' onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
                    {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                    <Text>{t('templates.card.title')}</Text>
                    {configuredCount > 0 && (
                        <Badge size='sm' variant='light' color='green'>
                            {t('templates.count', { count: configuredCount })}
                        </Badge>
                    )}
                </Group>
            }
            description={t('templates.card.description')}
        >
            <Collapse in={isExpanded}>
                <Stack gap='sm'>
                    <Select
                        label={t('templates.issuerClient.label')}
                        placeholder={t('templates.issuerClient.placeholder')}
                        data={clientOptions}
                        value={selectedClientId != null ? String(selectedClientId) : null}
                        onChange={(v) => setSelectedClientId(v ? Number(v) : null)}
                        clearable
                        searchable
                        size='sm'
                    />

                    {selectedClientId && (
                        <>
                            <Group gap='xs'>
                                <Text size='sm' fw={500}>
                                    {t('templates.currentTemplate')}:
                                </Text>
                                {currentTemplateFile ? (
                                    <Group gap={4}>
                                        <Text size='sm'>{currentTemplateFile.name}</Text>
                                        <Badge size='sm' color='green' variant='light'>
                                            {t('templates.status.configured')}
                                        </Badge>
                                    </Group>
                                ) : (
                                    <Badge size='sm' color='gray' variant='light'>
                                        {t('templates.status.none')}
                                    </Badge>
                                )}
                            </Group>

                            <Alert
                                icon={<IconInfoCircle size={16} />}
                                color='blue'
                                variant='light'
                                p='xs'
                            >
                                <Text size='xs'>{t('templates.info')}</Text>
                            </Alert>

                            <Group gap='xs'>
                                <Button
                                    size='sm'
                                    variant='light'
                                    leftSection={<IconUpload size={16} />}
                                    loading={isUploading}
                                    disabled={!selectedClientId}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {isUploading
                                        ? t('templates.actions.uploading')
                                        : t('templates.actions.upload')}
                                </Button>

                                {currentTemplateFile && (
                                    <Button
                                        size='sm'
                                        variant='outline'
                                        color='red'
                                        leftSection={<IconTrash size={16} />}
                                        loading={isUploading}
                                        onClick={handleRemove}
                                    >
                                        {t('templates.actions.remove')}
                                    </Button>
                                )}
                            </Group>

                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='.docx'
                                style={{ display: 'none' }}
                                onChange={handleFileSelected}
                            />
                        </>
                    )}

                    {!selectedClientId && (
                        <Center>
                            <Text size='sm' c='dimmed'>
                                {t('templates.issuerClient.placeholder')}
                            </Text>
                        </Center>
                    )}
                </Stack>
            </Collapse>
        </SectionCard>
    );
};

export default InvoiceTemplateManager;
```

- [ ] **Verify the build**

```bash
npm run typecheck
```

Expected: No type errors.

---

### Task 5: Integrate into `InvoicesPage`

**Files:**

- Modify: `src/modules/billing/InvoicesPage/InvoicesPage.tsx`

- [ ] **Import and render InvoiceTemplateManager**

At the top, add the import alongside the existing component imports (after line 21 `import InvoiceFilters from '../components/InvoiceFilters';`):

```typescript
import InvoiceTemplateManager from '../components/InvoiceTemplateManager';
```

Then in the JSX, add the component between the filters SectionCard and the table SectionCard (after line 208 `</SectionCard>` and before line 210 `<SectionCard`):

```tsx
<InvoiceTemplateManager />
```

The resulting JSX should look like:

```tsx
	return (
		<ContentContainer>
			<div className={classes.root}>
				<SectionCard>
					<InvoiceFilters
						filters={filters}
						clients={clients}
						onChange={handleFiltersChange}
					/>
				</SectionCard>

				<InvoiceTemplateManager />

				<SectionCard
					title={t('page.title')}
					...
```

- [ ] **Verify the build**

```bash
npm run typecheck
```

Expected: No type errors.

---

## Verification

After all tasks are complete, run:

```bash
npm run typecheck
```

Expected: No type errors, build succeeds.
