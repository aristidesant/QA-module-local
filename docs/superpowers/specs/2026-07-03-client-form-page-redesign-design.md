# Client Form Page Redesign

**Date:** 2026-07-03  
**Status:** Approved for implementation planning  
**Surface:** Client creation and editing  
**Audience:** Master-client administrators managing client records and configuration

## Summary

Replace the current create and edit modals with dedicated routed pages. The new experience uses continuous form sections, persistent actions, and section navigation so administrators can review and update a client without nested scrolling or hidden fields.

Client creation remains intentionally short. After the required client record is created, the application redirects to the complete edit page, where billing and branding settings become available because a client ID now exists.

## Goals

- Make the form easier to scan, complete, validate, and revisit.
- Give billing and branding enough space without increasing modal complexity.
- Preserve the existing API boundaries and permission behavior.
- Make save state, validation failures, and partial update failures visible.
- Deliver equivalent usability in light mode, dark mode, desktop, tablet, and mobile layouts.

## Non-goals

- Changing client API contracts or introducing a combined backend transaction.
- Adding new client fields.
- Redesigning the clients table beyond replacing modal launch behavior with route navigation.
- Creating a multi-step wizard or independent per-section save model.
- Adding automated tests, per the repository instruction not to create tests unless explicitly requested.

## Approved Direction

### Visual register

Use the product register with a restrained color strategy. Newtech Green is reserved for the primary action, keyboard focus, active section, success, and progress. Neutral Mantine surfaces provide hierarchy in both themes; Newtech Blue is not used as a decorative competing accent.

The working scene is a master administrator at a desktop or laptop, in a well-lit operations environment, deliberately configuring an organization and expecting a compact, trustworthy interface. The page should feel comparable in clarity and density to Stripe settings, Linear settings, and GitHub organization settings while retaining the existing Newtech component vocabulary.

### Page topology

Use dedicated routes:

- `/clients/new` for creation.
- `/clients/:clientId/edit` for full editing.

The existing `/clients` route remains the list page. The New Client button navigates to `/clients/new`, and client rows or edit actions navigate to `/clients/:clientId/edit`.

## Information Architecture

### Create page

The create page contains the fields currently supported by `CreateClientRequest`, grouped into visible sections:

1. **Identity**
   - Name, required.
   - Alias, required, generated from the name until manually edited.
   - Description, optional.
2. **Contact**
   - Email, optional with format validation.
   - Phone, optional.
3. **Location and tax**
   - Address, optional.
   - RNC, optional.

On successful creation, show the existing success notification and replace the current history entry with `/clients/:clientId/edit`. The edit page then exposes billing and branding.

### Edit page

The edit page contains all create-page sections plus:

4. **Billing**
   - Website.
   - Point-of-contact user.
   - Invoice template file.
5. **Branding**
   - Logo upload, preview, replacement, and removal.
   - Brand name.
   - Primary color.
   - Secondary color.

Billing and branding retain the existing master-client and edit-mode restrictions. They must not render when the current user is not eligible under the existing `useIsMasterClient` behavior.

## Layout Strategy

### Desktop and tablet

Use `ContentContainer` with a back button, page title, short task-specific description, and persistent page actions in the header. The content area uses a responsive two-column layout:

- The main column contains continuous `SectionCard` sections in document order.
- A narrow sticky rail contains section links and a concise save-state indicator.

Each section is one `SectionCard`; cards are not nested. Fields use a two-column grid where related values benefit from comparison and a single column for long-form or narrow content. Section spacing is larger than field spacing so hierarchy remains clear without decorative separators.

The action area contains Cancel and the mode-specific primary action: Create client or Save changes. It remains visible while the main content scrolls. Do not duplicate equally prominent save buttons at the top and bottom.

### Mobile

Collapse the form to one column. Replace the side rail with a compact section jump control above the form, and place Cancel and the primary action in a sticky bottom action bar with 44px minimum touch targets. The layout must not introduce horizontal page scrolling.

## Section Navigation

The section navigator uses semantic anchor buttons targeting section IDs. It must:

- Highlight the section nearest the top of the scroll container.
- Move focus to the section heading after explicit keyboard activation.
- Mark sections containing validation errors with an icon and accessible text, not color alone.
- Exclude billing and branding when those sections are unavailable.
- Respect reduced-motion preferences when scrolling.

The navigator is an orientation aid, not a wizard. Users can edit sections in any order.

## Form Behavior

### Dirty state

Use Mantine Form dirty-state APIs to distinguish untouched, changed, and successfully saved values. The page header or navigation rail shows a localized Unsaved changes status only after a field changes.

Attempting to navigate away while dirty opens a localized confirmation dialog. Cancel remains immediate when the form is clean. After a successful save, reset the dirty baseline to the saved values before navigating or allowing exit.

### Validation

Keep the current name, alias, email, brand-name, and color rules. On invalid submission:

1. Keep all entered values.
2. Mark every affected section in the section navigator.
3. Scroll to and focus the first invalid field.
4. Announce a localized summary indicating that the form contains errors.

Do not add validation rules that are not supported by current product requirements.

### Save sequencing

Creation performs one create mutation. The returned client ID is required for redirecting to the edit page.

Editing preserves the existing sequential API behavior:

1. Update the core client record.
2. If eligible and the branding values changed, patch the client theme.

The UI must not describe this sequence as atomic. If the client update succeeds and the theme update fails, keep the page open, reset the dirty baseline only for the successfully persisted client values, retain the branding section as dirty, mark that section as failed, and show a localized warning that core details were saved but branding still needs attention.

Logo file upload remains immediate because the existing upload API requires a client ID. Upload progress and upload errors stay local to the branding section. Removing or replacing a logo changes the form value and is persisted by the next Save changes action.

## Page States

### Create default

Render the three creation sections immediately with an empty form. Alias generation should be visible through helper text rather than a separate status component.

### Edit loading

Render a page-shaped skeleton matching the final header, section cards, and navigation rail. Do not use a centered spinner.

### Edit load failure

Render an inline error state with the API error, Retry, and Back to clients actions. The page shell and title remain visible so the user retains context.

### Saving

Disable navigation actions that would create duplicate submissions. The primary button shows loading while preserving its width and label context. Fields remain readable.

### Success

Creation redirects to edit after showing the existing creation notification. Editing remains on the page, shows the existing update notification, refreshes the relevant queries, and clears the successfully saved dirty state.

### Partial failure

Keep the user on the edit page, expose the failed section in the navigator, and provide a warning that differentiates saved core details from unsaved branding changes.

## Content and Localization

Update both `src/locales/en/clients.json` and `src/locales/es/clients.json`. Replace generic reassurance copy such as the current form intro and footer note with task-specific text:

- Create title and description explain that basic client information is collected first.
- Edit title includes the client display label when available.
- Section descriptions explain the operational purpose of their fields.
- Dirty, validation, navigation-confirmation, retry, and partial-save messages are explicit.

All buttons use verb-plus-object labels. No user-facing string is hardcoded in a component.

## Accessibility

- Preserve visible Newtech Green focus rings in both themes.
- Associate every input with its label, description, and error text through Mantine primitives.
- Use `aria-current` for the active section link.
- Provide an `aria-live` region for validation summaries, save state, and partial failures.
- Ensure error and active states use text or icons in addition to color.
- Maintain logical keyboard order from page header through form sections and persistent actions.
- Meet WCAG AA contrast for text, placeholders, borders, focus, and semantic states.
- Disable smooth scrolling when `prefers-reduced-motion: reduce` is active.

## Responsive and Theme Requirements

Verify 375px, 390px, 768px, 1024px, and 1440px widths. Use Mantine variables and `light-dark()` for any CSS Module overrides. No updated component may hardcode a light-only surface, text, border, hover, focus, or shadow color.

The branding logo preview, file input, color inputs, section navigator, skeleton, error state, and sticky actions must each be checked in light and dark mode.

## Component Boundaries

The implementation should separate responsibilities without changing unrelated client data code:

- A routed page component owns mode, route params, navigation, page-level states, and form submission.
- A form component owns Mantine Form values, validation, section rendering, and mutation sequencing.
- A section navigator owns section links, active-section observation, and validation markers.
- A persistent action component owns dirty status, cancel, and submit controls.
- `ClientThemeSection` continues to own logo upload and branding controls, with its outer `SectionCard` responsibility adjusted if needed to avoid nested layout ownership.

## Manual Acceptance Criteria

- New Client opens a dedicated creation route rather than a modal.
- Creating a valid client redirects directly to that client's edit route.
- Editing from the list opens a dedicated edit route.
- All eligible sections are visible in one continuous page and the navigator tracks the active section.
- Validation focuses the first invalid field and marks every affected section.
- Dirty navigation prompts before losing changes and does not prompt after a successful save.
- A theme-patch failure after a successful core update is represented as a partial save.
- Loading and error states preserve page context and do not use a generic centered spinner.
- The desktop rail becomes a compact section control and sticky action bar on mobile.
- Light mode, dark mode, keyboard navigation, reduced motion, and the required viewport widths remain usable.
- `npm run typecheck` and `npm run build` complete successfully after implementation.
