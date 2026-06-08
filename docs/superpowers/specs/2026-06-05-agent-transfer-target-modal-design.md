# Agent Transfer Target Modal Design

## Context

The workflow editor supports six user-facing node actions:

- Agent
- Transfer Agent
- Update State
- Tool
- Phone Number Transfer
- End

The persisted workflow model uses backend node types, not the same labels shown in the UI. Normal conversational agent steps are stored as `override_agent` nodes. Agent transfers are stored as `standalone_agent` nodes with an `agent_id` pointing to the target campaign agent.

The current failure mode happens when the app creates a `standalone_agent` transfer node before a target agent is selected. That produces an invalid node with an empty `agent_id`. The node can render and open a form, but the saved workflow is not a valid transfer. The attached workflow also showed a missing `edge_order` entry for the edge into the app-created transfer node, which means save-time repair is needed as a safety layer.

## Goal

When the user selects `Transfer Agent`, require a target campaign agent before creating the graph node. If the user cancels, the graph must remain unchanged.

The workflow should never intentionally create a blank transfer node.

## Non-Goals

- Do not redesign the full workflow editor.
- Do not change the backend workflow schema.
- Do not remove support for imported ElevenLabs workflows.
- Do not replace `AgentTransferForm`; it remains the editor for an existing configured transfer.
- Do not add automated tests unless explicitly requested by the user.

## Options Considered

### Option 1: Required modal before creation

Selecting `Transfer Agent` opens a target-selection modal. The node and edge are created only after the user selects a target and confirms.

Pros:

- Prevents invalid blank transfer nodes.
- Cancel is clean and leaves no graph artifacts.
- Matches user intent: choosing a transfer requires choosing the destination.
- Reduces save-time failures.

Cons:

- Adds one modal step to node creation.
- Requires deferring canvas mutation until after modal confirmation.

### Option 2: Draft node plus immediate drawer

Selecting `Transfer Agent` creates a blank transfer node and opens the transfer form immediately.

Pros:

- Keeps the existing add-node flow mostly intact.
- User sees the node on the canvas immediately.

Cons:

- Creates invalid graph state.
- Cancel behavior is ambiguous.
- Requires stronger validation and cleanup flows.
- This is close to the current failure mode.

### Option 3: Create disabled placeholder node

Selecting `Transfer Agent` creates a visibly invalid placeholder node that cannot be saved until configured.

Pros:

- Makes the missing target visible in the graph.
- Can support longer draft workflows.

Cons:

- Still creates invalid graph state.
- Adds visual and validation complexity.
- Requires additional disabled-node semantics that do not exist today.

## Decision

Use Option 1: required modal before creation.

This is the simplest behavior that keeps the workflow valid by default. Save-time validation and normalization still remain necessary as backstops for imported workflows, older saved drafts, and direct data edits.

## UX Flow

1. User selects `Transfer Agent` from a node add menu, context menu, or group add menu.
2. The app opens a required `Select transfer target` modal.
3. The modal loads eligible campaign agents using the existing `useGetCampaignAgentTransferTargets(campaignId, currentAgentId)` query.
4. User selects one target agent.
5. User confirms.
6. The editor creates the `standalone_agent` node and connecting edge in one operation, with `agent_id` already populated.
7. If the user cancels, no node or edge is created.

## Modal Behavior

The modal should be compact and operational:

- Title: `Select transfer target`
- Description: explain that this agent will receive the call when the transfer node runs.
- Primary field: searchable select of eligible campaign agents.
- Primary action: `Create transfer`
- Secondary action: `Cancel`

States:

- Loading: disable confirm while agents load.
- Empty: show `No agents available` and keep confirm disabled.
- Error: show a compact error message and allow close. If a retry pattern exists for similar query modals, follow it.
- Selected: enable confirm only when a target agent is selected.

## Data Flow

The add action must carry the pending placement request without mutating the graph:

- parent node id
- parent node position
- requested node type: `standalone_agent`
- variant: `transfer`
- optional group id when launched from a group menu

After confirmation, the graph mutation should use the selected target agent id to create the node.

The created transfer node should use the canonical transfer shape:

```json
{
	"type": "standalone_agent",
	"position": { "x": 0, "y": 0 },
	"edge_order": [],
	"agent_id": "agent_xxx",
	"delay_ms": 0,
	"transfer_message": null,
	"enable_transferred_agent_first_message": false,
	"additional_tool_ids": [],
	"additional_knowledge_base": [],
	"conversation_config": {}
}
```

The saved transfer node should not include `subagent` or UI-only metadata. A display label may be derived by the renderer instead of persisted.

## Integration Points

The modal should be used by all transfer creation entry points:

- `WorkflowNodeActions`
- `WorkflowContextMenu`
- `GroupNode` new-node menu

Existing `AgentTransferForm` remains responsible for editing:

- target agent
- delay
- transfer message
- transferred agent first-message toggle

## Validation And Safety

Add workflow validation for transfer nodes:

- Any `standalone_agent` node must have a non-empty `agent_id`.
- Invalid transfer nodes should block save with a clear message.

Before save, repair `edge_order` by normalizing it against actual outgoing edges. Clipboard import already does this through `normalizeWorkflowEdgeOrder`; the save path should use the same behavior or a shared helper.

The modal prevents normal invalid creation, while validation protects against:

- imported invalid workflows
- older app-created drafts
- direct JSON edits
- future regressions

## Error Handling

If the target list cannot load, the user should not be able to create the transfer. The modal should show a compact error state and allow the user to close it. The graph remains unchanged.

If a target agent becomes invalid after selection but before save, save-time validation or backend validation may still fail. The frontend should keep the selected `agent_id` and surface the save error using existing notification behavior.

## Testing And Verification

Manual verification should cover:

- Selecting `Transfer Agent` opens the modal and does not create a node before confirm.
- Cancel leaves nodes and edges unchanged.
- Confirm creates a `standalone_agent` with the selected `agent_id`.
- The created edge appears in the source node `edge_order` after emission/save normalization.
- Save validation blocks an imported transfer with empty `agent_id`.
- Existing ElevenLabs transfer nodes still render as transfer nodes and open `AgentTransferForm`.
- Existing normal agent nodes still render and open `AgentForm`.

No automated tests are included unless the user explicitly requests them.

## Open Decisions

There are no open product decisions in this design. The selected behavior is modal-first transfer creation with cancellation leaving the graph unchanged.
