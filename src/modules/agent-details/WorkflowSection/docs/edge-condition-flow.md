# Edge Condition Flow

Edge configuration is not handled by the node drawer.

Instead:

1. edge UI actions open `EdgeConditionModalWrapper`;
2. the modal edits `forwardCondition` and `backwardCondition`;
3. `handleSaveEdgeCondition()` updates the workflow through `updateWorkflowEdge()`;
4. the parent form receives the new workflow.
