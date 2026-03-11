# Workflow Editor – Introduction

## Purpose

The workflow editor lets users:

- visualize the current campaign workflow as a node graph;
- create, connect, reconnect, clone, and delete nodes;
- edit node configuration from a local drawer;
- edit edge conditions from a modal;
- keep the graph synchronized with `form.values.agentConfig.workflow`.

## Source Of Truth

The workflow source of truth is:

- `form.values.agentConfig.workflow` inside `WorkflowSection`

This means:

- the form owns the persisted workflow model;
- `WorkflowCanvas` renders a controlled graph derived from that model;
- user interactions inside the canvas are translated back into a new `AgentWorkflow`;
- the drawer content is derived from the current form state, not from a cached React node.

## Main Components

### `WorkflowSection.tsx`

Responsibilities:

- reads the current workflow from the campaign form;
- writes workflow changes back through `handleWorkflowChange`;
- provides `WorkflowNodeEditorProvider` with:
  - the live workflow from the form;
  - `handleWorkflowChange`;
  - `campaignAgentConfig`;
- passes `onNodeSelect` into `WorkflowCanvas`.

### `WorkflowCanvas.tsx`

Responsibilities:

- keeps React Flow local state for `nodes` and `edges`;
- translates canvas interactions into graph mutations;
- exposes node and edge actions through `WorkflowCanvasActionsContext`;
- opens the edge condition modal for edge-specific configuration;
- delegates synchronization with the form model to `useWorkflowSync`.

### `WorkflowNodeEditorContext.tsx`

Responsibilities:

- exposes the current workflow and `onWorkflowChange` to node-owned editors;
- coordinates which node drawer is currently open;
- preserves the single-drawer behavior across the workflow;
- closes the drawer when the open node disappears from the workflow.

### `useWorkflowSync.ts`

Responsibilities:

- hydrate the canvas from an external `workflow`;
- emit workflow changes from canvas state back to the parent form;
- fit the viewport after hydration;
- recompute edge handles when node layout changes.

### `useWorkflowNodes.ts`

Responsibilities:

- create new nodes and companion edges;
- clone nodes;
- delete nodes and clean edge references;
- maintain `edgeOrder` on source nodes.
