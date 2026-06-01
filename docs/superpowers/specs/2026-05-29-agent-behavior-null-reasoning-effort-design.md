# Agent Behavior — Null Reasoning Effort Support

**Date:** 2026-05-29
**Status:** Draft

## Problem

When applying an agent behavior to a campaign's agent config, fields in the behavior's
`conversationConfig` can only be **set** to a value, never **unset** (returned to a null/default state).
This is because `pruneNullishValues` strips `null`/`undefined` from the behavior config before
`deepMergeConfig` merges it with the target.

For `reasoningEffort`, once a campaign's agent has a value like `"high"`, no behavior can
clear it — the field is effectively stuck.

## Scope

This spec covers:

- Storing explicit `null` in an agent behavior's `reasoningEffort` field
- Loading a behavior back into the form (edit mode) and pre-selecting "Default" when null
- Applying the behavior so that `reasoningEffort: null` in the behavior results in
  `reasoningEffort: null` in the target config

Future nullable fields (e.g., `voiceId`, `expressiveMode`, `pronunciationDictionaryLocators`,
`suggestedAudioTags`) will follow the same pattern but are out of scope here.

## Design

### Save Side — `AgentBehaviorsForm.tsx`

#### `buildConversationConfig`

When the user selects "Default" in the reasoning effort Select (value `''`), the saved
behavior config should contain `reasoningEffort: null` (not omit the key):

```ts
reasoningEffort: values.agentPromptReasoningEffort === '' ? null
  : values.agentPromptReasoningEffort || undefined,
```

Value mapping:
| Select value | Saved in behavior |
|-------------|-------------------|
| `''` (Default) | `null` |
| `'high'` (or any API value) | `'high'` |
| `null` (no selection/cleared) | `undefined` (key omitted) |

#### Initial values (edit mode load)

When loading a behavior that has `{ reasoningEffort: null }`, the "Default" option
(value `''`) should be pre-selected. When the key is not present, nothing should be selected.

```ts
const promptConfig = conversationConfig?.agent?.prompt;
agentPromptReasoningEffort:
  promptConfig && 'reasoningEffort' in promptConfig
    ? (promptConfig.reasoningEffort ?? '')
    : null,
```

Same pattern in the `useEffect` that syncs values.

### Select Options — `AgentSection.tsx`

The reasoning effort Select has two sources of options:

1. **"Default"** (always visible, hardcoded) — value `''`, maps to `null` in the stored behavior
2. **API values** (dynamic, from `reasoningEffortsByModel[selectedModel]`) — the LLM-specific
   available reasoning efforts

```
┌──────────────────────┐
│ Default              │  ← siempre visible, value='', setea null
├──────────────────────┤
│ None                 │  ← solo si API lo incluye
│ Minimal              │  ← solo si API lo incluye
│ Low                  │  ← solo si API lo incluye
│ Medium               │  ← solo si API lo incluye
│ High                 │  ← solo si API lo incluye
└──────────────────────┘
```

No hardcoded magic — all API values come from the `llm` client config and reflect
what the selected model actually supports.

### Translation keys

New key in `campaign-predefined-params.json` (both en/es):

```
form.agent.reasoningEffort.options.default → "Default"
```

### Apply Side — `campaignBehaviorConfig.ts` + `objectUtils.ts`

#### `pruneNullishValues` (in `campaignBehaviorConfig.ts`)

Add an early return so that `null` values pass through the pruning as a "delete signal":

```ts
const pruneNullishValues = (value: unknown): unknown => {
	if (value === null) return null; // ← NEW

	if (Array.isArray(value)) {
		const nextValue = value
			.map((item) => pruneNullishValues(item))
			.filter((item): item is unknown => item !== undefined && item !== null);
		return nextValue.length > 0 ? nextValue : undefined;
	}
	if (!isRecord(value)) {
		return isMergeablePrimitive(value) ? value : undefined;
	}
	const nextValue: Record<string, unknown> = {};
	for (const [key, nestedValue] of Object.entries(value)) {
		const sanitizedValue = pruneNullishValues(nestedValue);
		if (sanitizedValue !== undefined) {
			// ← allow null in output
			nextValue[key] = sanitizedValue;
		}
	}
	return Object.keys(nextValue).length > 0 ? nextValue : undefined;
};
```

#### `deepMergeConfig` (in `objectUtils.ts`)

When the source value is `null`, set the key to `null` in the merged result:

```ts
Object.entries(source).forEach(([key, value]) => {
	if (value === null) {
		// ← NEW: null = set target to null
		result[key] = null;
		return;
	}
	if (isValidValue(value)) {
		/*…existing…*/
	}
});
```

#### Merge example

| Behavior                        | Target                                          | Result                                        |
| ------------------------------- | ----------------------------------------------- | --------------------------------------------- |
| `{ reasoningEffort: null }`     | `{ reasoningEffort: "high", temperature: 0.7 }` | `{ reasoningEffort: null, temperature: 0.7 }` |
| `{ reasoningEffort: "medium" }` | `{ reasoningEffort: "high" }`                   | `{ reasoningEffort: "medium" }`               |
| _(key absent)_                  | `{ reasoningEffort: "high" }`                   | `{ reasoningEffort: "high" }` (no change)     |

### Files Changed

| File                                                                                                        | Change                                                                   |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/modules/configurations/AgentBehaviorsPage/AgentBehaviorsForm/AgentBehaviorsForm.tsx`                   | `buildConversationConfig`, initial values, useEffect — map `''` ↔ `null` |
| `src/modules/configurations/AgentBehaviorsPage/AgentBehaviorsForm/components/AgentSection/AgentSection.tsx` | "Default" option in reasoning effort Select                              |
| `src/modules/campaigns/utils/campaignBehaviorConfig.ts`                                                     | `pruneNullishValues` passes `null` through                               |
| `src/utils/objectUtils.ts`                                                                                  | `deepMergeConfig` sets key to `null` when source is `null`               |
| `src/locales/en/campaign-predefined-params.json`                                                            | Translation for `options.default`                                        |
| `src/locales/es/campaign-predefined-params.json`                                                            | Translation for `options.default`                                        |

### Not in Scope

- Other nullable fields (`voiceId`, `expressiveMode`, etc.) — same pattern applies later
- Backend changes — the API already accepts `null` in the JSON body
