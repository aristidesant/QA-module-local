# Agent Standalone View Design

**Date:** 2026-05-27
**Status:** Approved
**Author:** Ramon Mena

## Overview

Restructure the agent editing experience within campaigns so that clicking an agent in the agents list navigates to a dedicated route (`/campaign/:campaignId/agent/:agentId`) that shows only the agent editor — without the campaign-level tabs visible.

## Problem

Currently, editing an agent happens inside the "Agents" tab of the campaign editor (`CampaignsForm`). The campaign tabs remain visible above the agent detail, creating visual noise and competing for attention. The agent editor is also deeply nested inside the campaign form context, making it harder to reason about in isolation.

## Goals

- Give the agent editor its own dedicated URL and page layout
- Remove campaign-level tabs from the agent editing view
- Provide clear navigation back to the campaign via breadcrumb
- Organize agent configuration into more granular, focused tabs
- Eliminate the settings drawer by moving its content inline

## Non-Goals

- Changing the campaign editor layout or tabs
- Modifying the agent data model or API
- Adding new agent configuration fields

## Architecture

### Route Structure

New child route under `campaign.detail`:

```
campaign/:campaignId              (CampaignPage — fetches campaign, Outlet)
  index                            → CampaignEditorPage (campaign tabs)
  agent/:campaignAgentId           → AgentDetailPage (NEW — standalone agent editor)
  test                             → CampaignTestPage
```

`AgentDetailPage` reads the campaign from the `OutletContext` provided by `CampaignPage`. No duplicate campaign fetching.

### Navigation

- **Breadcrumb:** `← Campaign Name / Agent Name` in the header
  - "Campaign Name" is a link that navigates back to the campaign editor (index route)
  - "Agent Name" is the current page (non-clickable)
- **Browser back/forward** works naturally since this is a real route
- **URL is shareable** and bookmarkable

### Sub-Tabs

The agent editor has 4 internal tabs:

| Tab               | Content                                                                                              | Components                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Prompt**        | System prompt display + edit modal                                                                   | `CampaignConfigurationPrompt` (reused)                                          |
| **Configuration** | First message textarea + predefined parameters                                                       | `CampaignConfigurationBasic` + `CampaignConfigurationPredefinedParams` (reused) |
| **Workflow**      | Visual workflow editor (React Flow)                                                                  | `WorkflowSection` (reused, `showAgentSelector=false`)                           |
| **Advanced**      | Tools, system tools, knowledge base, ASR keywords, dynamic variables, dictionary, noise cancellation | Components moved from `AgentSectionRightPanel` into inline sections             |

### Save Behavior

- **Save button** in the header next to the breadcrumb
- Uses `useUpdateCampaignAgentConfig` to persist `agentConfig` and `versionDescription`
- Opens `AgentSaveReviewModal` when versioning is enabled (same behavior as current)
- No `CampaignFormProvider` needed — the agent has its own save, independent of the campaign form

### Settings Drawer

**Eliminated.** All content previously in `AgentSectionRightPanel` (Tools, KB, ASR, Dynamic Variables, Dictionary, Noise Cancellation) is now inline in the **Advanced** tab. Voice preview and subagent templates are out of scope for this iteration.

## Component Architecture

### New Components

```
src/modules/campaigns/AgentDetailPage/
  AgentDetailPage.tsx          — Page component: breadcrumb + tabs + save button
  AgentDetailPage.module.css   — Page styles
  AgentDetailTabs.tsx          — Sub-tab bar (Prompt, Config, Workflow, Advanced)
  AgentDetailBreadcrumb.tsx    — Breadcrumb: ← Campaign Name / Agent Name
  AdvancedTab.tsx              — Advanced settings: tools, KB, ASR, vars, dictionary, noise
  index.ts                     — Barrel export
```

### `AgentDetailPage`

- Reads campaign from `useOutletContext<Campaign>()`
- Reads `campaignAgentId` from route params
- Fetches campaign agent via `useGetCampaignAgent(campaignId, campaignAgentId)`
- Fetches full agent via `useGetAgent(agentId)`
- Provides `CampaignIdContext` and `CampaignAgentEditorContext`
- Renders breadcrumb, tab bar, active tab content, and save button
- Handles loading, error, and not-found states

### `AgentDetailTabs`

- Mantine `Tabs` component with 4 values: `prompt`, `config`, `workflow`, `advanced`
- Tab state stored in local component state (not Zustand — no need to persist across navigation)
- Renders the active tab content

### `AgentDetailBreadcrumb`

- Renders `← Campaign Name / Agent Name`
- Campaign Name links to `/campaign/:campaignId` (campaign editor index)
- Uses Mantine `Breadcrumbs` or custom layout

### `AdvancedTab`

- Renders sections in order: Tools, System Tools, Knowledge Base, ASR Keywords, Dynamic Variables, Dictionary, Noise Cancellation
- Each section uses `SectionCard` for visual grouping
- Reuses existing components: `CampaignConfigurationTools`, `CampaignConfigurationSystemTools`, `CampaignConfigurationKnowledgeBase`, `CampaignConfigurationAsrKeywords`, `CampaignConfigurationDynamicVariables`, `CampaignConfigurationDictionarySelector`

### Modified Components

| Component                    | Change                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `AgentSection`               | Simplified: only renders `AgentCampaignSelectionList`. No list/detail toggle. Clicking an agent navigates to the new route. |
| `CampaignsForm`              | The agents tab no longer wraps `AgentSection` in a `<form>`. No save button for agents tab.                                 |
| `AgentCampaignSelectionList` | `onSelectAgent` now navigates to `/campaign/:campaignId/agent/:campaignAgentId` instead of calling a callback.              |

### Deleted Components

| Component                | Reason                         |
| ------------------------ | ------------------------------ |
| `AgentCampaignDetail`    | Replaced by `AgentDetailPage`  |
| `AgentSectionRightPanel` | Content moved to `AdvancedTab` |

## Data Flow

```
CampaignPage (fetches campaign)
  └─ OutletContext: Campaign
       └─ AgentDetailPage
            ├─ Reads campaign from OutletContext
            ├─ Fetches campaignAgent via useGetCampaignAgent(campaignId, campaignAgentId)
            ├─ Fetches agent via useGetAgent(agentId)
            ├─ Provides CampaignIdContext
            ├─ Provides CampaignAgentEditorContext
            └─ Renders:
                 ├─ AgentDetailBreadcrumb (← Campaign Name / Agent Name)
                 ├─ AgentDetailTabs (Prompt | Config | Workflow | Advanced)
                 └─ Save Button → useUpdateCampaignAgentConfig + AgentSaveReviewModal
```

## Contexts

| Context                      | Provided By       | Needed By                                                |
| ---------------------------- | ----------------- | -------------------------------------------------------- |
| `CampaignIdContext`          | `AgentDetailPage` | All child components that need `campaignId`              |
| `CampaignAgentEditorContext` | `AgentDetailPage` | Tab content components that read/write agent draft state |
| `CampaignFormProvider`       | NOT provided      | Agent has its own save, not part of campaign form        |

## Routing Changes

In `src/routes.tsx`, add a new child under `campaign.detail`:

```tsx
{
    path: 'agent/:campaignAgentId',
    id: 'campaign.detail.agent',
    element: (
        <I18nNamespaceLoader>
            <Suspense fallback={<SuspenseFallback />}>
                <AgentDetailPage />
            </Suspense>
        </I18nNamespaceLoader>
    ),
}
```

## i18n

Reuse the existing `campaigns` namespace with `agentDetail.` prefix for all new keys.

Keys needed (in both `en/campaigns.json` and `es/campaigns.json`):

- `agentDetail.tabs.prompt`
- `agentDetail.tabs.configuration`
- `agentDetail.tabs.workflow`
- `agentDetail.tabs.advanced`
- `agentDetail.save`
- `agentDetail.breadcrumb.back`
- `agentDetail.advanced.tools`
- `agentDetail.advanced.systemTools`
- `agentDetail.advanced.knowledgeBase`
- `agentDetail.advanced.asrKeywords`
- `agentDetail.advanced.dynamicVariables`
- `agentDetail.advanced.dictionary`
- `agentDetail.advanced.noiseCancellation`

## Error Handling

- If campaign agent not found: show not-found state with link back to campaign
- If campaign not found: `CampaignPage` already handles this
- If save fails: show Mantine notification with error message (same pattern as current)

## Testing

No tests unless explicitly requested (per AGENTS.md).
