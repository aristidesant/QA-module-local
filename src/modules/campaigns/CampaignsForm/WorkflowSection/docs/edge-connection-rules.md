# Workflow Edge Connection Rules

This document extracts the workflow edge connection rules from the workflow specs and validates them against the current implementation.

## Validation Sources

These rules were verified against the current code, primarily in:

- `WorkflowCanvas/WorkflowCanvas.tsx`
- `WorkflowNode/WorkflowNode.tsx`
- `WorkflowCanvas/useWorkflowNodes/useWorkflowNodes.ts`

## Connection Validation Rules

### Base validation

An edge connection is valid only when:

- `source` exists;
- `target` exists;
- both referenced nodes are present in the current canvas state.

If either endpoint is missing, the connection is rejected.

### `start` node restrictions

The `start` node has stricter rules than every other node type.

- `start` can connect only to a `standalone_agent` or `override_agent` node.
- `start` can have only one outgoing edge at a time.
- a new valid drag from `start` replaces its existing outgoing edge instead of creating a second one.

These restrictions are enforced in two places:

- validation in `WorkflowCanvas.tsx` rejects invalid new connections and invalid reconnections;
- `WorkflowNode.tsx` keeps the `start` source handle connectable so the user can replace the existing target.

### Other node types

For non-`start` source nodes, there is currently no additional type-based connection restriction in `validateConnection()`.

That means the current implementation does not enforce any extra source/target type matrix beyond:

- both nodes must exist;
- `start` must target `standalone_agent` or `override_agent`;
- `start` cannot have more than one outgoing edge.

## Edge Creation Rules

When a valid edge is created:

- the edge id is generated as `edge-<uuid>`;
- the edge type is `condition`;
- the edge label is initialized to `Not configured` through i18n fallback;
- the source node appends the new edge id to `edgeOrder`.

When the source node is `start` and it already has an outgoing edge:

- a new valid connection replaces the existing edge in place;
- the existing edge id is preserved;
- the existing edge data is preserved;
- `edgeOrder` keeps the same edge id.

The canvas also prevents inserting an exact duplicate edge when another edge already exists with the same:

- `source`;
- `target`;
- `sourceHandle`;
- `targetHandle`.

## Reconnection Rules

When an existing edge is reconnected:

- the new connection is validated with the same rules as a new connection;
- the current edge id is ignored during the `start` single-outgoing-edge check so a valid reconnect does not block itself;
- the edge keeps the same id;
- if the source changes, the old source removes the edge id from `edgeOrder` and the new source appends it.

If reconnection starts but is not completed successfully:

- the existing edge stays attached to its previous source and target;
- the source node keeps that edge id in `edgeOrder`;
- an invalid target or a cancelled drag must not leave `start` disconnected.

This matters for `start` specifically because `start` can only have one outgoing edge. Reconnecting that existing edge is the only valid way to move `start` to a different `standalone_agent` or `override_agent` without first deleting the edge.

The same replacement outcome also applies when React Flow routes the interaction through a new `handleConnect()` event instead of an explicit edge-reconnect gesture.

## Edge Removal Rules

When an edge is deleted, or removed through React Flow edge changes:

- the edge is removed from `edges`;
- all affected nodes remove that edge id from `edgeOrder`;
- if the edge condition modal is open for that edge, it is closed.

## Invariants

These edge-related invariants are enforced by the current implementation:

- `edgeOrder` must stay aligned with the actual edge list;
- a removed edge must not remain in any node `edgeOrder`;
- `start` must never end up with more than one outgoing edge;
- `start` must never connect to a target outside `standalone_agent` and `override_agent`.
- a failed reconnect attempt must not silently remove the existing edge.

## Explicit Non-Rules

The current implementation does not validate the following at connection time:

- a broader target/source compatibility matrix for non-`start` nodes;
- self-loop prevention;
- cycle prevention through general edge validation.

If any of those constraints are needed, they must be added explicitly to `validateConnection()`.
