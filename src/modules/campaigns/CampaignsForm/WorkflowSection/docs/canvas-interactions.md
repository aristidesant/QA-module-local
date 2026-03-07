# Canvas Interaction Flows

### Add Node

When the user adds a node:

1. a node action triggers `addNode`, `addNodeWithType`, or `addNodeWithVariant`;
2. `useWorkflowNodes` creates:
   - a new node id;
   - a new edge id;
   - a new node positioned below the source node;
   - a new edge from the source node to the new node;
3. the source node `edgeOrder` is updated;
4. `nodes` and `edges` are updated in the canvas;
5. `useWorkflowSync` emits the new `AgentWorkflow` to the form.

### Delete Node

When the user deletes a node:

1. `useWorkflowNodes.handleDeleteNode()` removes the node;
2. all connected edges are removed;
3. all remaining nodes clean their `edgeOrder`;
4. if the deleted node is open in the drawer, `WorkflowNodeEditorContext` closes it on the next render because the node no longer exists.

### Copy Node

When the user clones a node:

1. the source node is copied with a new id;
2. the new node is offset from the original position;
3. `edgeOrder` is reset to an empty array;
4. no edges are duplicated automatically.

### Connect Edge

When the user creates an edge:

1. `handleConnect()` validates the connection;
2. a new edge is created with type `condition`, or the existing `start` edge is replaced in place when `start` is already connected;
3. the source node `edgeOrder` is updated, or preserved when the existing `start` edge id is reused;
4. the canvas emits the new workflow back to the form.

Special rule for `start`:

- `start` can only connect to `standalone_agent`;
- `start` can only have one outgoing edge.
- dragging a new valid connection from `start` to another agent replaces the previous target.

### Reconnect Edge

When the user reconnects an edge:

1. reconnection is validated;
2. if the source changes, old and new source nodes update `edgeOrder`;
3. the edge is reattached with the same id;
4. if reconnection is cancelled or dropped on an invalid target, the original edge remains attached.

### Delete Edge

When the user deletes an edge:

1. the edge is removed from `edges`;
2. the source node removes that edge id from `edgeOrder`;
3. if the edge modal is open for that edge, it closes.
