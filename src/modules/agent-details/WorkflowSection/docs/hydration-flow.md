# Hydration Flow

## Existing Campaign

For an existing campaign:

1. `CampaignsForm` loads campaign data into the form.
2. `WorkflowSection` reads `form.values.agentConfig.workflow`.
3. `WorkflowCanvas` receives that workflow as prop.
4. `useWorkflowSync` classifies hydration mode as `external`.
5. `mapWorkflowToNodes()` converts workflow nodes and edges into React Flow data.
6. `setNodes()` and `setEdges()` populate the canvas.
7. once the React Flow instance is ready, `fitView()` runs for the hydrated workflow.

Important rule:

- if `workflow` exists, it must be used as-is;
- `buildDefaultWorkflow()` must not replace an external workflow.

## New Campaign

For a new campaign:

1. there is no external workflow yet;
2. `allowDefaultInit` is `true`;
3. `useWorkflowSync` classifies hydration mode as `default-init`;
4. `buildDefaultWorkflow()` creates the initial start-only graph;
5. the default workflow is emitted back to the parent form.
