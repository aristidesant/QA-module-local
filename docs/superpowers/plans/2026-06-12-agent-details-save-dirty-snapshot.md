# Agent Details Save Dirty Snapshot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable the `/campaign/:campaignId/agent/:campaignAgentId` header save button whenever either campaign-level fields or agent-config fields change, including prompt, firstMessage, language, and other persisted agent details, without involving Analytics in the dirty check.

**Architecture:** Keep save-state ownership in `src/modules/agent-details/AgentDetailPage.tsx`. Add a small pure helper that normalizes and serializes `agentConfigForm.values` into a stable snapshot, cache the last saved snapshot in a ref, and derive `canSave` from `form.isDirty()` OR `isAgentConfigDirty`. Preserve the existing workflow save path and the current tab structure; the new logic only changes when the shared header save button becomes enabled.

**Tech Stack:** React 19, TypeScript, Mantine v9, React Router v7, TanStack React Query v5, react-i18next, `@tabler/icons-react`

---

### Task 1: Add a pure agent-detail dirty snapshot helper

**Files:**

- Create: `src/modules/agent-details/utils/agentDetailDirty.ts`
- Reference only: `src/utils/agentVersioning.ts`

- [ ] **Step 1: Add the snapshot normalization helper**

Implement a helper that accepts `Partial<AgentConfigModel> | null | undefined`, recursively normalizes it, and returns a stable object snapshot for comparison.

```ts
import type { AgentConfigModel } from '~/models/AgentListObject';

type DirtySnapshotValue =
	| null
	| boolean
	| number
	| string
	| DirtySnapshotValue[]
	| { [key: string]: DirtySnapshotValue };

const sortJsonValue = (value: unknown): DirtySnapshotValue | undefined => {
	if (value === undefined) return undefined;

	if (value === null) return null;

	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : undefined;
	}

	if (typeof value === 'boolean' || typeof value === 'number') {
		return value;
	}

	if (Array.isArray(value)) {
		return value
			.map(sortJsonValue)
			.filter((item): item is DirtySnapshotValue => item !== undefined);
	}

	if (typeof value === 'object') {
		return Object.keys(value as Record<string, unknown>)
			.sort((left, right) => left.localeCompare(right))
			.reduce<Record<string, DirtySnapshotValue>>((accumulator, key) => {
				const normalized = sortJsonValue(
					(value as Record<string, unknown>)[key]
				);
				if (normalized !== undefined) {
					accumulator[key] = normalized;
				}
				return accumulator;
			}, {});
	}

	return undefined;
};

export const normalizeAgentDetailSnapshot = (
	snapshot?: Partial<AgentConfigModel> | null
) => (sortJsonValue(snapshot) ?? {}) as Record<string, DirtySnapshotValue>;

export const hasAgentDetailSnapshotChanges = (
	currentSnapshot?: Partial<AgentConfigModel> | null,
	savedSnapshot?: Partial<AgentConfigModel> | null
) =>
	JSON.stringify(normalizeAgentDetailSnapshot(currentSnapshot), null, 2) !==
	JSON.stringify(normalizeAgentDetailSnapshot(savedSnapshot), null, 2);
```

- [ ] **Step 2: Keep the normalization rules explicit in the helper**

Preserve object key ordering, trim strings, collapse empty strings to `undefined`, keep `null` only when the backend may care, and keep array order intact so we do not accidentally mask meaningful backend changes.

- [ ] **Step 3: Run a local typecheck for the new helper**

Run: `npm run typecheck`

Expected: no TypeScript errors from the new utility module.

### Task 2: Wire the composite dirty state into `AgentDetailPage`

**Files:**

- Modify: `src/modules/agent-details/AgentDetailPage.tsx`

- [ ] **Step 1: Capture the last saved agent-config snapshot**

Add a `useRef` baseline for the agent config snapshot and initialize it when `selectedAgent` hydrates.

```ts
const savedAgentConfigSnapshotRef = useRef<Partial<AgentConfigModel> | null>(
	null
);
```

Inside the hydration effect, after `agentConfigForm.setValues(selectedAgent.config ?? {})`, set the ref from the same source value so the header save button reflects the saved backend state rather than the transient form state.

```ts
const nextAgentConfig = selectedAgent.config ?? {};

agentConfigForm.setValues(nextAgentConfig);
savedAgentConfigSnapshotRef.current = nextAgentConfig;
```

- [ ] **Step 2: Derive the agent-config dirty flag from the snapshot helper**

Compute `isAgentConfigDirty` from the current `agentConfigForm.values` versus the saved baseline ref. This keeps prompt, firstMessage, language, and any future persisted agent-config fields inside the same comparison without touching Analytics.

```ts
const isAgentConfigDirty = hasAgentDetailSnapshotChanges(
	agentConfigForm.values,
	savedAgentConfigSnapshotRef.current
);

const canSave = form.isDirty() || isAgentConfigDirty;
```

- [ ] **Step 3: Update the shared header save button to use the composite dirty state**

Replace the current `disabled={!form.isDirty()}` check with the composite `canSave` flag so the save affordance turns on for either campaign edits or agent-detail edits.

```tsx
disabled={!canSave}
```

- [ ] **Step 4: Refresh the agent-config baseline after a successful setup save**

In `submitSaveRequest`, when `request.source === 'setup'`, refresh the saved snapshot ref after `updateCampaignAgentConfig.mutateAsync(...)` succeeds so the header button returns to disabled immediately after save.

```ts
if (request.source === 'setup') {
	form.resetDirty();
	agentConfigForm.resetDirty();
	savedAgentConfigSnapshotRef.current = agentConfigForm.values;
}
```

- [ ] **Step 5: Keep the existing workflow and Analytics flows unchanged**

Do not change `src/modules/agent-details/AgentDetailTabs.tsx`, `src/modules/agent-details/WorkflowSection/WorkflowSection.tsx`, `src/modules/agent-details/AdvancedTab/AdvancedTab.tsx`, or the Analytics section wiring. The save-state fix must stay local to the shared header button.

- [ ] **Step 6: Re-run typecheck after the page wiring changes**

Run: `npm run typecheck`

Expected: the page compiles cleanly with the new dirty-state wiring.

### Task 3: Smoke-test the save affordance in the browser

**Files:**

- No code changes expected

- [ ] **Step 1: Start the app and open the agent-details route**

Run: `npm run dev`

Open `/campaign/:campaignId/agent/:campaignAgentId` for a campaign-agent record that has editable prompt, language, and firstMessage data.

- [ ] **Step 2: Verify each edited field enables save**

Edit each of the following and confirm the shared save button becomes enabled immediately:

```text
prompt
firstMessage
language
at least one other persisted agent-config field already owned by AgentConfigFormProvider
```

- [ ] **Step 3: Verify save resets the dirty state**

Save the changes and confirm the header button returns to disabled after the request succeeds.

- [ ] **Step 4: Verify Analytics does not participate in the dirty check**

Switch to the Analytics tab, make a change there, and confirm the header save button does not activate because of Analytics-only state.

---

## Acceptance Criteria

- The header save button enables when prompt changes
- The header save button enables when firstMessage changes
- The header save button enables when language changes
- The header save button enables for other persisted agent-config changes
- Campaign-level dirty behavior still enables save
- Analytics changes do not affect the header save button
- A successful setup save clears the dirty state

## Notes

- This plan intentionally keeps the change localized to `AgentDetailPage`.
- The prompt modal, basic config section, and workflow section should keep writing to the same form state they already own.
- No automated tests are required unless the implementation uncovers a regression that needs one.
