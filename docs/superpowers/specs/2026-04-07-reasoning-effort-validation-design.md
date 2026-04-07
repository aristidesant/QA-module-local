# Design: reasoningEffort UI Validation

**Date:** 2026-04-07
**Branch:** fix/campaign/analytics/data_collection/import_variable

## Problem

The backend's `cleanAgentConfigForElevenLabs` was not stripping `reasoningEffort` from the agent prompt config when the selected LLM was not a Claude model. This caused a `400` from ElevenLabs when saving a campaign whose agent had a stale `reasoningEffort` field (set when the agent previously used a Claude reasoning model).

The backend fix strips `reasoningEffort` when `prompt.llm` is defined and does not start with `'claude-'`. This UI change mirrors that logic at two layers.

## Scope

Two files are modified, plus one shared helper:

1. `src/modules/configurations/CampaignPredefinedParamsPage/CampaignPredefinedParamsForm/formConfig.ts` — add `isClaudeLlm` helper
2. `src/modules/campaigns/CampaignsForm/CampaignsForm.tsx` — save-time cleanup
3. `src/modules/campaigns/CampaignsForm/WorkflowSection/forms/AgentForm/tabs/GeneralTab/GeneralTab.tsx` — LLM-change cleanup

## Utility

```ts
// formConfig.ts
export const isClaudeLlm = (llm: string | undefined): boolean =>
	llm !== undefined && llm.startsWith('claude-');
```

Collocated with `LLM_MODELS` and `getGroupedLlmOptions` since that file owns all LLM model definitions.

## Fix 1 — Save-time cleanup (`CampaignsForm.tsx`)

In `handleSubmit`, extend the existing cleanup block that already strips `toolIds`:

**Campaign-level prompt:**
If `agentConfig.conversationConfig.agent.prompt.llm` is defined and non-Claude, destructure `reasoningEffort` out before sending.

**Per workflow-node prompts:**
Iterate over `agentConfig.workflow.nodes`. For each node, if `node.conversationConfig?.agent?.prompt` exists and its `llm` is defined and non-Claude, strip `reasoningEffort` from that node's prompt config.

Rule (mirrors backend): only strip when `llm` is explicitly set to a non-Claude value. If `llm` is `undefined`, skip — ElevenLabs validates against its default model.

## Fix 2 — LLM-change cleanup (`GeneralTab.tsx`)

In the LLM `Select` `onChange` handler, before spreading `promptConfig` into the workflow node update:

```ts
const { reasoningEffort: _re, ...safePromptConfig } = promptConfig as Record<
	string,
	unknown
>;
const cleanPrompt = isClaudeLlm(value ?? undefined)
	? promptConfig
	: safePromptConfig;
```

Use `cleanPrompt` instead of the raw `promptConfig` spread in the `conversationConfig` update. This keeps local workflow state clean immediately when the user switches to a non-Claude model.

## Invariants

- If `llm` is `undefined` (node inherits campaign default), `reasoningEffort` is left as-is — consistent with backend behaviour.
- No user-visible feedback needed: the cleanup is silent and preventative.
- No new form fields, modals, or i18n keys required.

## Files Touched

| File                        | Change                                                  |
| --------------------------- | ------------------------------------------------------- |
| `src/.../formConfig.ts`     | Add `isClaudeLlm` export                                |
| `src/.../CampaignsForm.tsx` | Strip `reasoningEffort` at save time (campaign + nodes) |
| `src/.../GeneralTab.tsx`    | Strip `reasoningEffort` on LLM select change            |
