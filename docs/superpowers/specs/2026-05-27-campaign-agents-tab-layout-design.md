# Campaign Agents Tab Layout Redesign

**Date:** 2026-05-27  
**Status:** Draft  
**Author:** Codex

## Overview

Redesign the agent list shown directly in the campaign agents tab so it feels more concise, premium, and easier to scan. The new layout should use a featured primary agent presentation plus a compact supporting list, with initials-based avatars instead of image avatars.

## Problem

The current agent list feels too close to a generic admin list. It takes more vertical space than necessary, repeats information that is not always useful at a glance, and does not create a strong visual hierarchy for the agent that matters most in the campaign.

There is also no real need for a "view all agents" affordance in this context because campaigns do not reach a scale where that control would add value.

## Goals

- Make the agents tab feel more concise and visually intentional
- Highlight the primary or selected agent more clearly
- Replace missing avatar images with a deterministic initials-based visual
- Keep the list highly readable without showing redundant metadata
- Preserve all current actions, loading, empty, and error states

## Non-Goals

- Changing the campaign agent data model
- Adding pagination or a "view all agents" control
- Introducing real profile images or external avatar assets
- Reworking the campaign-level navigation or permissions

## Proposed Layout

### Primary Pattern

Use the approved **Approach C**:

- A featured card for the most important agent at the top
- A compact supporting list below for the remaining agents
- No separate "View all agents" row or footer

This keeps the tab visually anchored while still allowing quick scanning of the rest of the agents.

### Row Content

Each agent row should only surface the most useful information:

- A circular initials badge instead of an image avatar
- Agent name
- Role/type badges
- Overflow actions menu

The row should not show language text in the compact state. That information is currently available, but it is not worth the space in this layout.

### Featured Agent Card

The featured agent should feel distinct without becoming a second page:

- Slightly larger surface and stronger border treatment
- Clear selected-state styling
- More prominent name and badge hierarchy
- Same action model as the rest of the list

## Component Changes

### `AgentCampaignSelectionList`

- Rework the list structure to render a featured top card plus a compact list below
- Remove any concept of a "view all" control
- Keep the existing add and sync actions in the header
- Keep click-to-open behavior and existing menu actions
- Preserve loading, error, and empty states

### Initials Visual

- Add a lightweight initials generator for agent names
- Render initials inside a circular badge or avatar-like surface
- Use a stable visual treatment that works in light, dark, and auto color scheme modes
- Derive color from theme tokens or existing semantic colors rather than hardcoded one-off values

### Styling

- Use CSS Modules for all new styles
- Keep spacing compact and consistent with the rest of the form
- Use subtle borders and soft elevation only
- Avoid layout shift on hover
- Ensure selected, hover, focus, and disabled states are visually distinct in both light and dark mode

## Information Hierarchy

| Element                    | Visible | Notes                                  |
| -------------------------- | ------- | -------------------------------------- |
| Initials badge             | Yes     | Replaces missing avatar image          |
| Agent name                 | Yes     | Primary text in the row/card           |
| Principal / subagent badge | Yes     | Important for quick scanning           |
| Agent type badge           | Yes     | Secondary badge, still useful          |
| Language                   | No      | Removed from the compact layout        |
| View all control           | No      | Not needed for expected campaign sizes |

## State Handling

- **Loading:** Preserve the current skeleton/loading treatment, but adapt it to the new card hierarchy
- **Empty:** Keep the existing empty state copy and actions
- **Error:** Keep the retryable error alert pattern
- **Selected/active agent:** Use a clearer highlighted treatment in the featured area and list rows

## i18n

Keep existing keys where possible. Only add or adjust strings if the layout needs explicit copy for:

- Selected/featured agent labeling, if used
- Any new initials-related fallback text, if needed for accessibility

If no new visible copy is introduced, avoid new translation keys.

## Accessibility

- Keep each agent row fully clickable with keyboard support
- Ensure the overflow menu remains reachable and does not trigger navigation
- Provide a clear accessible name for the initials badge if needed
- Preserve focus visibility in both light and dark modes

## Files Expected To Change

| File                                                                                                                | Change                                  |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `src/modules/campaigns/CampaignsForm/AgentSection/AgentCampaignSelectionList/AgentCampaignSelectionList.tsx`        | New structure and row content           |
| `src/modules/campaigns/CampaignsForm/AgentSection/AgentCampaignSelectionList/AgentCampaignSelectionList.module.css` | New card, row, and state styling        |
| `src/modules/campaigns/CampaignsForm/AgentSection/AgentCampaignSelectionList/AgentListSkeleton.tsx`                 | Adjust skeleton to match the new layout |
| `src/locales/en/campaign.form.agents.json`                                                                          | Only if new copy is required            |
| `src/locales/es/campaign.form.agents.json`                                                                          | Only if new copy is required            |

## Acceptance Criteria

- The agents tab looks noticeably more concise and premium than the current version
- Agent initials are shown in place of avatar images
- No "View all agents" control appears
- The primary agent is visually emphasized without creating clutter
- The layout remains usable in light, dark, and auto mode
- Existing add, sync, open, remove, loading, empty, and error behaviors still work

## Testing

No tests will be added unless explicitly requested.
