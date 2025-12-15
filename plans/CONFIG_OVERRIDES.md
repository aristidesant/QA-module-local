# Global vs Client Configuration Overrides

This project distinguishes between global configurations (shared by every client) and client overrides (per-client customizations). Use this guide to replicate the override UX and data flow on other configuration pages.

## Terminology

- **Global config**: A configuration whose `clientId` is `null`. Only the master client (id `1`) can edit it.
- **Client override**: A configuration with a `clientId` value. Non-master users can edit/delete their own overrides.

## UI Patterns

1. **Alert banner for global configs**
   - Always show a banner when `clientId` is `null`.
   - Master client message: “Changes here update the global defaults for every client.”
   - Non-master message: “Read-only; create an override to customize.”
   - Use a compact inline layout: icon + title + description on a single row (wrapping if needed) with a light yellow background and subtle border to avoid visual bulk.

2. **Title actions (`titleRight`)**
   - **Create override** (non-master, global only): Action icon with tooltip, calls `createClientConfig` using the existing name/description/value/type.
   - **Delete override** (client configs): Action icon with tooltip, opens confirmation modal to remove the override.
   - **Add item**: Action icon to open the form for adding/editing entries. Disable while override operations are running. Hide this action when viewing a global config as a non-master user (they must create an override first).
   - Use `ActionIcon` with `loading` for in-progress states and tooltips with `withArrow`.

3. **Permissions and editability**
   - Master client or client overrides: can edit items.
   - Non-master on global: view-only; allow creating an override to gain edit access.

4. **Modals**
   - Delete override modal: clarify that deletion falls back to global defaults.
   - Delete item modal: standard confirmation; only for client overrides.

5. **Forms and submission rules**
   - Show form actions (e.g., Update/Create button) only when the user is allowed to submit:
     - Master client: always can submit.
     - Non-master on global config: hide the submit button; they must create an override first.
   - Keep Cancel visible for all users.
   - Pass an explicit `canSubmit` prop into forms to gate the submit button.

6. **Notice component**
   - Use `InlineNotice` (`src/components/InlineNotice`) for compact alerts with icon/title/description on one line (wrapping allowed).
   - For globals: `color="yellow"` with `IconAlertTriangle` and the master vs non-master messaging above.

## Data Flow

- **Fetch**: `useClientConfigByName(configKey)`.
- **Create override**: `useCreateClientConfig` with existing `name`, `description`, `value`, `type`.
- **Update**: `useUpdateClientConfig` for edits within the current config.
- **Delete override**: `useDeleteClientConfig` by config `name`; invalidate related queries.
- **ClientConfig typing**: `clientId` should be `number | null` to represent global records.

## Reuse Checklist

- Compute `isGlobalConfig` via `clientId == null`.
- Derive `canCreateOverride`, `canDeleteConfig`, `canEditConfig` based on `useIsMasterClient` and `isGlobalConfig`.
- Derive `canSubmit` for forms: allow submit unless `isGlobalConfig && !isMasterClient`; hide submit button when false.
- Surface the global banner (`InlineNotice`), title actions, modal flows, and form gating exactly as above to keep UX consistent across configuration screens.
