# Drawer Flow

The workflow drawer is rendered from the node layer and coordinated by `WorkflowNodeEditorContext`.

### Open Drawer

1. a node UI action triggers `openNodeDrawer(nodeId)` from the node itself;
2. `WorkflowNodeEditorContext` records `openedNodeId`;
3. the matching node renders its own `AppDrawer` through `WorkflowNodeDrawer`;
4. the drawer content is derived from the live workflow in context, not cached JSX.

### Drawer Content Resolution

The drawer form depends on the node type:

- `standalone_agent`
  - `AgentTransferForm` when the node represents a transfer
  - otherwise `AgentForm`
- `override_agent`
  - `AgentForm`
- `phone_number`
  - `PhoneNumberForm`
- `tool`
  - `ToolNodeForm`
- `start` / `end`
  - `StartEndForm`

The drawer content is always derived from the latest workflow in the form.

This means:

- no editor JSX is stored in Zustand;
- each editable node mounts a local drawer host;
- only one node drawer is open at a time because `openedNodeId` is shared;
- changes in node data are reflected by rerendering from current form state.

### Close Drawer

The drawer closes when:

- the user explicitly closes it;
- `closeNodeDrawer()` runs;
- the open node disappears from the workflow.

Current behavior:

- changing canvas selection does not automatically close the drawer.
