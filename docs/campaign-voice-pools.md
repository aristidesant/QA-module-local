# Campaign Voice Pools UI

## Overview

The frontend now treats campaign voices as a pool instead of a single selected voice. Users can choose campaign-level voices during creation, edit them later from a dedicated tab, and optionally narrow the selection for each contact list.

The backend still returns legacy `voiceId` in some shapes, but the frontend should prefer `voiceIds` as the canonical field.

## User Flows

### 1. Campaign wizard

`StepOneGeneral` is the entry point for selecting campaign voices during creation.

Behavior:

- Uses `CampaignVoicePoolSelector` to load client voices.
- Validates that at least one voice is selected.
- Preselects all available client voices the first time the step loads.
- Sends `campaign.voiceIds` in the `CreateCampaignWithAgentDTO` payload.
- Uses the first selected voice as the initial `agent.voiceId` sent to the backend.

This keeps campaign creation compatible with the existing agent creation flow while allowing the campaign to own multiple voices.

### 2. Campaign edit form

Existing campaigns now expose a dedicated `Voices` tab in the editor.

Behavior:

- The tab is rendered next to `Versioning`.
- It is available only when the campaign already exists.
- The tab uses `VoicesSection`, which binds directly to `form.values.voiceIds`.
- `General` no longer owns the campaign voice selector.

This keeps the edit flow clearer by separating general metadata from voice-pool management.

### 3. Contact list voice override

`ContactLimits` supports an optional voice subset for each contact list.

Behavior:

- Uses the same `CampaignVoicePoolSelector` component.
- Passes `allowedVoiceIds` so users can only select voices already assigned to the campaign.
- Sends `voiceIds` in both contact-list update and CSV-processing payloads.
- When the user leaves the selection empty, the contact list inherits the campaign pool.

The helper text changes depending on whether the campaign has voices configured.

## Shared Component

### `CampaignVoicePoolSelector`

This component is the common UI primitive for all voice-pool editing surfaces.

Capabilities:

- Fetches voices through `useGetAllAgentVoices()`.
- Renders a searchable Mantine `MultiSelect`.
- Supports an optional `allowedVoiceIds` filter.
- Shows dedicated empty, no-match, and load-error states.
- Accepts copy from the caller so each screen can describe inheritance rules differently.

Current usage:

- campaign creation wizard
- campaign edit `Voices` tab
- contact-list limits and CSV flow

## State and Models

### Wizard state

`campaignWizardStore` now persists `selectedVoiceIds` so draft and resume flows can restore the campaign voice pool.

### Form state

`CampaignsForm` initializes and rehydrates:

```ts
voiceIds: campaign?.voiceIds ?? (campaign?.voiceId ? [campaign.voiceId] : []);
```

This allows existing records that still expose only `voiceId` to remain editable.

### Updated frontend types

The following client-side models now include `voiceIds`:

- `CampaignsModel`
- `ContactGroup`
- `ContactFileSummary`
- `CreateCampaignWithAgentDTO` in `campaignsApi`

## Localization

New or updated namespaces involved in this feature:

- `campaign.form.voices`
- `campaign.form.shared`
- `campaign.form.general`
- `campaign.form.contacts`
- `campaigns.wizard`

Key changes:

- `campaign.form.shared.tabs.voices` adds the new editor tab label.
- `campaign.form.voices` owns the dedicated copy for the edit tab.
- `campaigns.wizard` keeps the creation-step validation and helper text.
- `campaign.form.contacts` describes contact-list inheritance and campaign-pool limits.

## Expected Backend Contract

The frontend assumes these backend behaviors:

1. Campaign reads return `voiceIds`.
2. Contact-group reads return `voiceIds`.
3. Campaign create/update accepts `voiceIds?: string[]`.
4. Contact-group create/update accepts `voiceIds?: string[]`.
5. CSV processing for contact lists accepts `voiceIds?: string[]`.

If `voiceIds` is missing from read responses, the edit forms will fall back to `voiceId` only where backward compatibility still exists.

## Key Files

- `src/modules/campaigns/CampaignWizard/StepOneGeneral/StepOneGeneral.tsx`
- `src/stores/campaignWizardStore.ts`
- `src/modules/campaigns/components/CampaignVoicePoolSelector/CampaignVoicePoolSelector.tsx`
- `src/modules/campaigns/CampaignTabs/CampaignTabs.tsx`
- `src/modules/campaigns/CampaignsForm/CampaignsForm.tsx`
- `src/modules/campaigns/CampaignsForm/VoicesSection/VoicesSection.tsx`
- `src/modules/campaigns/CampaignsForm/ContactSection/ContactLimits/ContactLimits.tsx`
- `src/models/CampaignsModel.ts`
- `src/models/ContactGroup.ts`
- `src/models/ContactFileSummary.ts`
- `src/api/campaignsApi.ts`

## Manual QA Checklist

1. Create a campaign in the wizard and confirm voices are preselected on the first visit.
2. Save the campaign and verify the response includes `voiceIds`.
3. Open the campaign editor and confirm the `Voices` tab appears beside `Versioning`.
4. Change the voice pool from the `Voices` tab, save, and reload the campaign.
5. Open a contact list and verify the selector only allows campaign voices.
6. Save a contact list with no selected voices and confirm it inherits the campaign pool.

## Notes

- The frontend does not implement voice-routing rules beyond explicit subset selection.
- The actual task-level distribution remains a backend responsibility.
- The first selected voice is only used as the initial agent voice during campaign creation; the runtime voice per call is resolved later by the backend.
