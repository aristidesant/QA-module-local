# Rendering, Invariants, and Debugging

## Rendering And Performance Rules

Current design rules:

- workflow persistence lives in the form;
- canvas state is derived and synchronized, not independently authoritative;
- drawer rendering lives with the editable nodes;
- drawer coordination lives in `WorkflowNodeEditorContext`;
- edge action state is local to the canvas;
- node editor content is derived at render time, not stored as JSX in the global store.

The `campaignsStore.rightComponent` remains in the codebase for compatibility with other modules, but workflow should not depend on it.

## Known Invariants

- `edgeOrder` on each node must stay consistent with the actual edge list.
- A deleted node must not remain referenced by the drawer.
- A deleted edge must not remain referenced in `edgeOrder`.
- External workflows must not be replaced by `buildDefaultWorkflow()`.
- New campaigns may initialize with the default start-only workflow.

## Debugging Checklist

When workflow behavior looks wrong, verify in this order:

1. API payload workflow node/edge counts.
2. Form state workflow node/edge counts in `CampaignsForm`.
3. Hydration counts in `useWorkflowSync`.
4. Mapped React Flow node/edge counts.
5. Drawer `openedNodeId` and whether the node still exists.

If any count drops unexpectedly between layers, the bug is in that boundary.
