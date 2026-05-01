# Monday Ticket Spec: Reuse of Captured Data Across Conversations

## Ticket Title

Allow the agent to capture information during a conversation and reuse it in future interactions with the same contact.

## Problem

Today, information captured during a conversation is not modeled as durable runtime state that can be reliably reused in future conversations with the same contact.

- Reusable catalog templates and campaign runtime values were mixed under `custom-variable` terminology.
- Analytics editing depended on `agentConfig.dataCollection`, which cannot preserve inactive rows.
- Previously captured values were not consistently injected into new interactions for the same contact.
- This limits business scenarios where the agent must capture a value in one call and reuse it later. For example, if during a conversation the customer provides a promised payment date, in a future interaction the agent should be able to retrieve that date and ask about it directly.

## Goal

Introduce a clear catalog-versus-runtime model so that a campaign can:

1. Capture relevant information during a conversation with a contact.
2. Persist that information as reusable runtime state without relying only on the provider mirror.
3. Recover the information obtained from the latest relevant conversation for the same contact and use it in a new interaction.
4. Keep inactive variables without deleting them.
5. Continue reusing template groups and variables as the configuration baseline.

## Scope

### Backend

- Rename database objects and the canonical module surface from `custom-variable*` to `data-collection-template*`.
- Keep compatibility wrappers for old imports during the migration.
- Create and maintain `campaign_data_collection_variables` as the campaign runtime source of truth.
- Backfill runtime rows from the existing campaign/agent configuration.
- Extend `GET /campaigns/:id` and `PATCH /campaigns/:id` to read and write `dataCollectionVariables`.
- Treat `campaign.agentConfig.dataCollection` as an active-only compatibility mirror.
- Update template assignment so that it populates runtime rows.
- When starting a conversation, look up the latest stored values for active runtime keys for the same contact and inject them into the new interaction payload.

### Frontend

- Rename the canonical model, API, query, and module surfaces to `data-collection-template*`.
- Keep compatibility wrappers for old file paths while the migration is completed.
- Use `campaign.dataCollectionVariables` as the source of truth for Analytics editing.
- Support `isActive` in the Analytics table and editor.
- Persist inactive rows while excluding them from the mirror sent to the provider.
- Update campaign management labels from `Custom Variables` to `Data Collection Templates`.

## Functional Requirements

### Catalog rename

- Template group routes must be exposed under `/data-collection-template-groups`.
- Catalog UI screens must reflect the new terminology.

### Runtime persistence

- Campaign runtime rows must store:
  - `key`
  - `label`
  - `definition`
  - `isActive`
  - `agentId` provenance when available
- Runtime rows must be readable from the campaign detail payload.
- Runtime rows must be writable from the campaign update payload.

### Activation

- A runtime variable must be able to be activated or deactivated without being deleted.
- Inactive rows must remain visible in the UI.
- Only active rows may be reflected in runtime payloads sent to ElevenLabs or the provider.

### Reuse across conversations

- When starting a new conversation, the backend must obtain the latest stored values for active runtime keys for the same contact.
- Reuse must be oriented toward enabling the agent to use information captured in a past conversation within a new interaction with the same contact.
- Reserved dynamic keys must not be reused.
- Matching values must be injected into the new conversation payload using the same key.
- The business case where the agent captures a promised date and later reuses it to ask the customer about that committed date must be explicitly supported.

## Non-goals

- Reworking report template logic beyond import compatibility.
- Removing all old compatibility wrappers in the same delivery.
- Replacing all query keys or all internal variable names in a single pass.

## Acceptance Criteria

- Catalog APIs respond under `/data-collection-template-groups`.
- Campaign detail includes `dataCollectionVariables`.
- Campaign update accepts `dataCollectionVariables` and preserves inactive rows.
- The Analytics UI shows active and inactive rows and allows changing their state.
- Active rows continue to be mirrored into `agentConfig.dataCollection`.
- Inactive rows are excluded from the mirror sent to the provider.
- Assigning a template group to a campaign creates runtime rows.
- Starting a conversation reuses the latest captured values for the same contact for matching active keys.
- The flow supports a promised date captured in a previous conversation being used in a new interaction with that same contact.

## QA Checklist

- Create a campaign variable and save it as active.
- Deactivate the variable, save, reload, and confirm it remains visible but excluded from active payloads.
- Reactivate it and confirm it reappears in active payloads.
- Assign a template group to a campaign and confirm runtime rows are created.
- Complete a conversation that captures a value and confirm the next conversation for the same contact receives it.
- Validate specifically the case where a promised date is captured and the agent can later reuse it in a future interaction with the same contact.
- Confirm that campaign management screens display the `Data Collection Templates` terminology.

## Dependencies

- Database migration for the renamed catalog tables and the new runtime table.
- Backend campaign response and update contract.
- Frontend Analytics form synchronization logic.

## Rollout Notes

- Keep compatibility wrappers temporarily for old imports.
- Existing consumers that still read `agentConfig.dataCollection` continue to work for active rows.
- Future cleanup can remove wrappers once all imports have migrated to the canonical `data-collection-template*` surface.
