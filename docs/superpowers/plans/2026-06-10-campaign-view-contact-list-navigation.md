# Campaign View Contact List Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the campaign contact-list overview into a navigation-first table that opens the dedicated contact-list page on row click and exposes row actions through a `3 dots` menu.

**Architecture:** Keep the change localized to the campaign contact-list overview flow. The overview page owns campaign context and table rendering, the table columns own row affordances and action wiring, and the dedicated contact-list page remains the destination for detail inspection. Remove the drawer dependency from the overview screen so the list no longer needs to maintain separate preview state.

**Tech Stack:** React Router v7, Mantine v9, TanStack React Table v8, Zustand v5, TypeScript

---

### Task 1: Remove drawer-driven state from the campaign view

**Files:**

- Modify: `/Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignViewPage/CampaignViewPage.tsx`
- Modify: `/Users/ramonmena/Projects/nai-agent-service-front/src/stores/campaignsStore.ts`
- Modify: `/Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignsForm/ContactSection/ContactList/ContactListView.tsx`

- [ ] **Step 1: Inspect the current drawer dependencies**

```ts
// CampaignViewPage currently renders this AppDrawer block:
// <AppDrawer opened={isContactListDrawerOpen && Boolean(selectedContactList)} ... />
// The goal is to remove this entire preview surface from the overview page.
```

- [ ] **Step 2: Remove the drawer rendering and the now-unused imports/state from the view page**

```tsx
// In CampaignViewPage.tsx:
// - remove AppDrawer import
// - remove CampaignHealth and ContactListDetails imports if nothing else uses them
// - stop reading selectedContactList, isContactListDrawerOpen, and closeContactListDrawer from the store
// - keep selectCampaign, resetView, campaign loading, and the ContactSection content intact

return (
	<ContentContainer ...>
		<Stack gap='sm' className={styles.contentStack}>
			<div className={styles.contactsSection}>
				<ContactSection />
			</div>
		</Stack>
	</ContentContainer>
);
```

- [ ] **Step 3: Remove row-selection state that only existed for drawer highlighting**

```tsx
// In ContactListView.tsx:
// - remove selectedContactList usage from the store
// - remove selectedRowId from BaseTable
// - replace the row click handler with navigation to the contact-list detail route

<BaseTable
	data={data}
	columns={columns}
	emptyMessage={labels.emptyMessage}
	onRowClick={(contactGroup) => {
		navigate(`/campaign/${campaignId}/contact-list/${contactGroup.id}`);
	}}
	isLoading={isLoading}
	getRowId={(row) => row.id}
/>
```

- [ ] **Step 4: Remove drawer-only fields from the Zustand store only if they are no longer used elsewhere**

```ts
// In campaignsStore.ts:
// - keep selectedContactList, openContactListDrawer, closeContactListDrawer only if another screen still depends on them
// - if they are no longer used after the overview cleanup, remove the state and the related resetView fields
// - do not remove behavior that is still consumed by other campaign screens
```

- [ ] **Step 5: Run a focused typecheck for the touched campaign view files**

```bash
npm run typecheck
```

Expected: pass with no new type errors from removing drawer wiring.

### Task 2: Replace the actions column with a grouped overflow menu

**Files:**

- Modify: `/Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignsForm/ContactSection/ContactList/useContactListColumns.tsx`
- Modify: `/Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignsForm/ContactSection/ContactList/ContactListControl/ContactListControl.tsx`
- Modify: `/Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignsForm/ContactSection/ContactList/ContactListView.module.css` if needed for table affordance styling

- [ ] **Step 1: Inspect the current action surface so the menu preserves every existing operation**

```tsx
// Current actions are split across:
// - ContactListControl.tsx for status / edit / delete / clean queue / start-resume flows
// - a separate open-contact-list icon in useContactListColumns.tsx
// The menu must keep the same permission checks and confirmation modals.
```

- [ ] **Step 2: Refactor the contact-list control into menu-friendly action descriptors or menu sections**

```tsx
// In ContactListControl.tsx:
// - preserve the existing handlers:
//   handleToggleStatus
//   handleEdit
//   handleDelete
//   handleCleanQueue
//   handleNavigate
//   handleExtendWaves
//   handleCompleteGroup
// - expose them through a grouped menu instead of a row of ActionIcons
// - keep the exact confirmation modal behavior for destructive actions
//
// Suggested shape:
// const menuGroups = [
//   { label: t('...manage'), items: [...] },
//   { label: t('...status'), items: [...] },
//   { label: t('...operations'), items: [...] },
//   { label: t('...danger'), items: [...] },
// ];
```

- [ ] **Step 3: Build the `3 dots` trigger and dropdown using Mantine `Menu`**

```tsx
// Use the same menu pattern already present in the codebase:
// <Menu shadow='md' position='bottom-end' withinPortal>
//   <Menu.Target>
//     <ActionIcon ... aria-label={t('moreActions')}>
//       <IconDotsVertical size={14} />
//     </ActionIcon>
//   </Menu.Target>
//   <Menu.Dropdown onClick={(event) => event.stopPropagation()}>
//     ...
//   </Menu.Dropdown>
// </Menu>
//
// Stop propagation on the trigger and dropdown items so the row click does not fire.
```

- [ ] **Step 4: Update the row name affordance so the destination is obvious**

```tsx
// In useContactListColumns.tsx:
// - keep the name cell truncation
// - add a subtle navigational cue, such as link-like text color, a small arrow icon, or a stronger hover state
// - keep the table compact and avoid making the cell visually noisy
```

- [ ] **Step 5: Remove the separate open-contact-list icon from the actions column**

```tsx
// In useContactListColumns.tsx:
// - delete the inline ActionIcon that opens the detail page
// - keep navigation as the row click behavior from Task 1
// - let the overflow menu own all row-level actions
```

- [ ] **Step 6: Verify the row-action boundary in the browser**

```bash
npm run dev
```

Expected: clicking the row navigates; clicking the menu opens actions without navigation.

### Task 3: Clean up residual drawer assumptions and verify the destination page still owns details

**Files:**

- Modify: `/Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignsForm/ContactSection/ContactListDetails/ContactListDetails.tsx`
- Modify: `/Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignContactListPage/CampaignContactListPage.tsx` if any copy or affordance needs to better reflect the new overview flow
- Modify: `/Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignViewPage/CampaignViewPage.module.css` if layout spacing changes after removing the drawer

- [ ] **Step 1: Confirm the detail page still contains the operational action surface**

```tsx
// ContactListDetails.tsx already owns:
// - activate/deactivate
// - extend waves
// - complete list
// - edit contact list
// - delete contact list
// - clean queue
// - open contact-list action
// Keep this page as the authoritative place for inspection and operations.
```

- [ ] **Step 2: Remove any leftover wording in the overview page that suggests a preview drawer**

```tsx
// In CampaignViewPage.tsx and related copy:
// - delete drawer title/description strings if they are no longer referenced
// - ensure the overview page no longer implies "preview the list here"
// - keep the page title and contact section description aligned with navigation-first behavior
```

- [ ] **Step 3: Make sure the contact-list page still reads as the destination from the overview**

```tsx
// In CampaignContactListPage.tsx:
// - keep breadcrumbs and tabs as-is
// - if needed, lightly improve the back-navigation copy so the user can return to campaign view easily
// - do not redesign the page structure; it is already the correct destination surface
```

- [ ] **Step 4: Run a full typecheck and fix any regressions from the menu refactor**

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 5: Run a production build for the final confidence check**

```bash
npm run build
```

Expected: pass.

- [ ] **Step 6: Commit the implementation once the build passes**

```bash
git add src/modules/campaigns/CampaignViewPage/CampaignViewPage.tsx src/modules/campaigns/CampaignsForm/ContactSection/ContactList/useContactListColumns.tsx src/modules/campaigns/CampaignsForm/ContactSection/ContactList/ContactListControl/ContactListControl.tsx src/modules/campaigns/CampaignsForm/ContactSection/ContactList/ContactListView.tsx src/stores/campaignsStore.ts docs/superpowers/plans/2026-06-10-campaign-view-contact-list-navigation.md
git commit -m "feat: navigate contact lists from campaign view"
```

## Self-Review

- Spec coverage:
  - row click navigation is covered in Task 1
  - actions menu is covered in Task 2
  - drawer removal and copy cleanup are covered in Task 1 and Task 3
  - accessibility and dark/light support are preserved by reusing Mantine table and menu primitives
- Placeholder scan:
  - no TBD/TODO placeholders
  - no vague "handle edge cases" steps
  - every code-changing step includes concrete code or exact commands
- Type consistency:
  - `navigate('/campaign/:campaignId/contact-list/:contactGroupId')` is used consistently
  - the existing `ContactListControl` handlers remain the source of truth for actions
  - `BaseTable` keeps its existing `onRowClick` contract
