# Invoice Template Settings Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the full SectionCard wrapper with a minimalist toolbar row that expands inline to reveal template management controls.

**Architecture:** The InvoiceTemplateManager component will render a clickable toolbar row with dashed border. Clicking toggles a Collapse component that reveals the controls directly below the toolbar. The toolbar and expanded panel share visual continuity through matching dashed borders and seamless connection when expanded.

**Tech Stack:** React, Mantine (Collapse, Badge, Select, Button, Text, Group, Stack, Center), CSS Modules, Tabler Icons

---

## File Structure

**Modify:**

- `src/modules/billing/components/InvoiceTemplateManager/InvoiceTemplateManager.module.css` — Add styles for toolbar row and expanded panel
- `src/modules/billing/components/InvoiceTemplateManager/InvoiceTemplateManager.tsx` — Replace SectionCard with toolbar row + inline expansion

**No changes required:**

- `src/modules/billing/InvoicesPage/InvoicesPage.tsx` — Component position unchanged
- `src/locales/en/billing.json` — Existing i18n keys sufficient
- `src/modules/billing/components/PlaceholderGuideModal/` — No changes

---

### Task 1: Update CSS Module with Toolbar Styles

**Files:**

- Modify: `src/modules/billing/components/InvoiceTemplateManager/InvoiceTemplateManager.module.css:1-7`

- [ ] **Step 1: Replace CSS module content with toolbar and panel styles**

Replace the entire content of `InvoiceTemplateManager.module.css` with:

```css
.toolbarRow {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 12px;
	border: 1px dashed #dee2e6;
	border-radius: 6px;
	background: white;
	cursor: pointer;
	transition: border-radius 0.15s ease;
}

.toolbarRowExpanded {
	border-radius: 6px 6px 0 0;
	border-bottom: none;
}

.toolbarLabel {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 13px;
	font-weight: 500;
	color: #495057;
}

.expandedPanel {
	background: #fafbfc;
	padding: 12px;
	border: 1px dashed #dee2e6;
	border-top: 1px solid #f1f3f5;
	border-radius: 0 0 6px 6px;
}

.hiddenInput {
	display: none;
}
```

- [ ] **Step 2: Verify CSS syntax**

Run: `npm run typecheck`
Expected: No errors (CSS modules don't block typecheck)

- [ ] **Step 3: Commit CSS changes**

```bash
git add src/modules/billing/components/InvoiceTemplateManager/InvoiceTemplateManager.module.css
git commit -m "style: add toolbar row styles for InvoiceTemplateManager"
```

---

### Task 2: Rewrite Component to Use Toolbar Row

**Files:**

- Modify: `src/modules/billing/components/InvoiceTemplateManager/InvoiceTemplateManager.tsx:1-349`

- [ ] **Step 1: Remove SectionCard import and update imports**

Replace lines 1-42 with:

```typescript
import { useRef, useState } from 'react';
import {
	Badge,
	Button,
	Center,
	Collapse,
	Group,
	Select,
	Skeleton,
	Stack,
	Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
	IconChevronDown,
	IconDownload,
	IconFileDescription,
	IconUpload,
	IconTrash,
	IconVariable,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './InvoiceTemplateManager.module.css';
import {
	useGetAllClients,
	useGetClient,
	useUpdateClient,
} from '~/queries/clientQueries';
import {
	useGetClientFiles,
	useGetFileTypes,
	useUploadFile,
} from '~/queries/fileQueries';
import { useDownloadInvoiceTemplate } from '~/queries/invoiceQueries';
import PlaceholderGuideModal from '~/modules/billing/components/PlaceholderGuideModal';
```

Changes:

- Removed `Alert`, `UnstyledButton` from Mantine imports
- Removed `IconChevronRight`, `IconInfoCircle` from Tabler imports
- Added `IconFileDescription` for toolbar icon
- Removed `SectionCard` import

- [ ] **Step 2: Replace the return statement (lines 183-346)**

Replace the entire return statement with:

```tsx
return (
	<>
		<div
			role='button'
			tabIndex={0}
			aria-expanded={isExpanded}
			aria-controls='invoice-template-settings'
			onClick={() => setIsExpanded(!isExpanded)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					setIsExpanded(!isExpanded);
				}
			}}
			className={`${classes.toolbarRow} ${isExpanded ? classes.toolbarRowExpanded : ''}`}
		>
			<div className={classes.toolbarLabel}>
				<IconFileDescription size={14} stroke={1.5} />
				<Text span size='sm' fw={500}>
					Invoice Templates
				</Text>
				{configuredCount > 0 && (
					<Badge size='sm' variant='light' color='green'>
						{t('templates.count', { count: configuredCount })}
					</Badge>
				)}
			</div>
			<IconChevronDown
				size={14}
				stroke={1.5}
				style={{
					transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
					transition: 'transform 0.15s ease',
				}}
			/>
		</div>

		<Collapse expanded={isExpanded} id='invoice-template-settings'>
			<div className={classes.expandedPanel}>
				<Stack gap='sm'>
					{isClientsLoading && clients.length === 0 ? (
						<Stack gap={6}>
							<Skeleton height={12} width='34%' radius='xl' />
							<Skeleton height={36} radius='sm' />
						</Stack>
					) : (
						<>
							<Button
								size='xs'
								variant='subtle'
								leftSection={<IconVariable size={14} />}
								onClick={openGuideModal}
								p={4}
							>
								{t('templates.variablesGuide.action')}
							</Button>
							<Select
								label={t('templates.issuerClient.label')}
								placeholder={t('templates.issuerClient.placeholder')}
								data={clientOptions}
								value={
									selectedClientId != null ? String(selectedClientId) : null
								}
								onChange={(v) => setSelectedClientId(v ? Number(v) : null)}
								clearable
								searchable
								size='xs'
							/>
						</>
					)}

					{selectedClientId && (
						<>
							<Group gap='xs'>
								<Text size='xs' fw={500}>
									{t('templates.currentTemplate')}:
								</Text>
								{isTemplateDataLoading ? (
									<Skeleton height={18} width='42%' radius='xl' />
								) : currentTemplateFile ? (
									<Group gap={4}>
										<Text size='xs'>{currentTemplateFile.name}</Text>
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

							{isTemplateDataLoading ? (
								<Stack gap='xs'>
									<Skeleton height={48} radius='md' />
									<Group gap='xs'>
										<Skeleton height={30} width={120} radius='sm' />
										<Skeleton height={30} width={106} radius='sm' />
									</Group>
								</Stack>
							) : (
								<>
									<Text size='xs' c='dimmed'>
										{t('templates.info')}
									</Text>

									<Group gap='xs'>
										<Button
											size='xs'
											variant='light'
											leftSection={<IconUpload size={14} />}
											loading={isUploading}
											disabled={!selectedClientId || !templateTypeId}
											onClick={() => fileInputRef.current?.click()}
										>
											{isUploading
												? t('templates.actions.uploading')
												: t('templates.actions.upload')}
										</Button>

										{currentTemplateFile && (
											<>
												<Button
													size='xs'
													variant='light'
													leftSection={<IconDownload size={14} />}
													loading={downloadTemplateMutation.isPending}
													onClick={handleDownloadTemplate}
												>
													{t('templates.actions.download')}
												</Button>
												<Button
													size='xs'
													variant='outline'
													color='red'
													leftSection={<IconTrash size={14} />}
													loading={isUploading}
													onClick={handleRemove}
												>
													{t('templates.actions.remove')}
												</Button>
											</>
										)}
									</Group>

									<input
										ref={fileInputRef}
										type='file'
										accept='.xlsx'
										className={classes.hiddenInput}
										onChange={handleFileSelected}
									/>
								</>
							)}
						</>
					)}

					{!selectedClientId && (
						<Center py='xs'>
							<Text size='xs' c='dimmed'>
								{t('templates.issuerClient.placeholder')}
							</Text>
						</Center>
					)}
				</Stack>
			</div>
		</Collapse>
		<PlaceholderGuideModal
			opened={guideModalOpened}
			onClose={closeGuideModal}
		/>
	</>
);
```

Key changes:

- Removed `SectionCard` wrapper entirely
- Toolbar row is a clickable `div` with proper ARIA attributes and keyboard support
- Toolbar uses `IconFileDescription` instead of chevron in title
- Chevron is now on the right side, rotates when expanded
- Expanded content wrapped in `div.expandedPanel` instead of being direct child of SectionCard
- Removed `Alert` component, replaced with plain `Text` with `c='dimmed'`
- Reduced all component sizes: buttons `size='xs'`, text `size='xs'`, icons `size={14}`
- Removed `UnstyledButton` — toolbar row itself is the clickable element

- [ ] **Step 3: Run typecheck to verify**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Commit component changes**

```bash
git add src/modules/billing/components/InvoiceTemplateManager/InvoiceTemplateManager.tsx
git commit -m "feat: replace SectionCard with toolbar row in InvoiceTemplateManager"
```

---

### Task 3: Verify Visual Result and Cleanup

**Files:** None (verification only)

- [ ] **Step 1: Start dev server**

Run: `npm run dev`
Expected: Dev server starts on localhost

- [ ] **Step 2: Navigate to /billing/invoices and verify**

Check:

- Toolbar row appears between filters and invoices table
- Toolbar has dashed border, icon + label + badge + chevron
- Clicking toolbar expands/collapses the panel
- Expanded panel has gray background, same dashed border continuing
- All functionality works: client select, upload, download, remove
- Badge shows correct count
- Lazy loading works (network tab shows queries only fire when expanded)

- [ ] **Step 3: Verify responsive behavior**

Resize browser to mobile width and verify:

- Toolbar row doesn't overflow
- Expanded panel content wraps appropriately
- Buttons remain accessible

- [ ] **Step 4: Final commit (if any adjustments needed)**

Only if visual adjustments were made:

```bash
git add -A
git commit -m "fix: adjust InvoiceTemplateManager spacing and sizing"
```

---

## Success Criteria Checklist

After completing all tasks, verify:

- [ ] Toolbar row is visually less prominent than SectionCards above and below
- [ ] Dashed border is consistent between toolbar and expanded panel
- [ ] All existing functionality preserved (upload, download, remove, client select)
- [ ] Lazy loading still works (queries only fire when expanded)
- [ ] Badge shows configured count in collapsed state
- [ ] Keyboard accessible (Enter/Space to toggle)
- [ ] No TypeScript errors
- [ ] No visual overflow on mobile

---

## Notes for Implementation

**No i18n changes needed:** The existing key `templates.count` is reused for the badge. The toolbar label "Invoice Templates" is hardcoded in the component (shorter than the old "Invoice Template Settings" title). If localization is required later, add a new key `templates.toolbar.label`.

**No InvoicesPage changes needed:** The component remains at line 273 in the same position. The page's flex gap spacing works correctly with the new component structure.

**Accessibility:** The toolbar row uses `role='button'`, `tabIndex={0}`, `aria-expanded`, and `aria-controls` for screen reader support. Keyboard handlers allow Enter/Space to toggle.

**Performance:** No changes to query logic. The `enabled` parameter on queries still uses `isExpanded` to lazy-load data.
