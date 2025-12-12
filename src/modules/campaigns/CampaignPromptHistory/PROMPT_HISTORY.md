# Campaign Prompt History (Per Prompt Type)

This feature lets users inspect and restore previous versions of a campaign prompt, scoped to a specific prompt type. It is available from the prompt editors inside the campaign configuration UI.

## Backend Endpoints

The front-end integrates with these endpoints:

- `GET /campaign-prompt-history/campaign/{campaignId}`
  - Returns the full prompt history for a campaign.
- `GET /campaign-prompt-history/campaign/{campaignId}/prompt-type/{campaignPromptTypeId}`
  - Returns the prompt history for a specific campaign and prompt type.
- `GET /campaign-prompt-history/campaign/{campaignId}/prompt-type/{campaignPromptTypeId}/latest`
  - Returns the latest prompt history record for a specific campaign and prompt type.

## API Client

File: `src/api/campaignPromptHistoryApi.ts`

Available methods:

- `getCampaignPromptHistory(campaignId, params?)`
- `getCampaignPromptHistoryByPromptType(campaignId, campaignPromptTypeId, params?)`
- `getLatestCampaignPromptHistoryByPromptType(campaignId, campaignPromptTypeId)`

`params` supports:

```ts
{
  version?: number;
  userId?: number;
  limit?: number;
  offset?: number;
}
```

## React Query Hooks

File: `src/queries/campaignPromptHistoryQueries.ts`

- `useGetCampaignPromptHistory(campaignId, params?)`
- `useGetCampaignPromptHistoryByPromptType(campaignId, campaignPromptTypeId, params?)`
- `useGetLatestCampaignPromptHistoryByPromptType(campaignId, campaignPromptTypeId)`

Each hook is disabled automatically until required IDs are present.

## UI Components

### `CampaignPromptHistory`

File: `src/modules/campaigns/CampaignPromptHistory/CampaignPromptHistory.tsx`

Props:

```ts
{
  campaignId: string | number;
  campaignPromptTypeId?: string | number;
  currentPromptText?: string;
  onSelect: (promptText: string) => void;
}
```

Behavior:

- Fetches history using the prompt-type scoped hook when `campaignPromptTypeId` is provided; otherwise falls back to campaign-wide history.
- Renders a compact `BaseTable` with previous versions (latest/current record is excluded from the list).
- Selecting **View** opens a full-screen diff view.
- Selecting **Restore** calls `onSelect(promptText)` for the chosen version.

### `PromptHistoryModal`

File: `src/modules/campaigns/CampaignPromptHistory/PromptHistoryModal.tsx`

Behavior:

- Uses `react-diff-view` to display a split diff between the selected history version and the current prompt text.
- If no current text is provided, it shows the historical prompt as plain text.
- **Restore This Version** returns the historical `promptText`.

### `CampaignConfigurationPromptHistoryModal`

File: `src/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationPrompt/CampaignConfigurationPromptHistoryModal/CampaignConfigurationPromptHistoryModal.tsx`

Thin wrapper over `CampaignPromptHistory`:

```ts
{
  opened: boolean;
  onClose: () => void;
  campaignId: number;
  campaignPromptTypeId?: number;
  currentPromptText?: string;
  onSelect: (selectedPrompt: string) => void;
}
```

### Prompt Editors Integration

History access is surfaced via a small history icon:

- `PromptEditor`: `src/modules/campaigns/.../PromptTypeAccordionItem/PromptEditor.tsx`
- `PromptTypeAccordionItem`: `src/modules/campaigns/.../PromptTypeAccordionItem/PromptTypeAccordionItem.tsx`

Flow:

1. Click the **history** `ActionIcon` to open the history modal.
2. The modal lists previous versions for the active prompt type.
3. Click **View** to inspect a full diff against the current editor content.
4. Click **Restore** to populate the editor with the selected historical text.

## Notes

- Diff rendering relies on `react-diff-view` and the shared diff utilities already used for AI prompt changes.
- The history list is paginated with `usePagination` and `PaginationControls`.
