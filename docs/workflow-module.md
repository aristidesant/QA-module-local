# Workflow Module

## Overview

The workflow module renders the campaign flow builder canvas. It maps workflow data (nodes + edges) to React Flow nodes, renders node cards for each node type, and displays edge condition labels as compact pills.

## Data Model

Workflow data is a structure with:

- `nodes`: keyed by node id, each with `type`, `position`, and node-specific fields.
- `edges`: keyed by edge id, each with `source`, `target`, and optional `forwardCondition`/`backwardCondition`.

Key references:

- `src/models/AgentWorkflowModel.ts` for node/edge types and condition shapes.

## Node Rendering

Node types are mapped in `WorkflowCanvas` and rendered with specialized node components.

### Agent Nodes (standalone_agent + override_agent)

Both agent types use the **same card layout** in `SubagentNode`.
The only visual difference is the icon:

- `standalone_agent`: user icon (`IconUserCircle`)
- `override_agent`: transfer icon (`IconPlugConnected`)
- `standalone_agent` with `agentId`: transfer icon (`IconPlugConnected`)

Card structure:

- Header: icon + label (single line)
- Prompt preview: single line, truncated with ellipsis if present
- Metadata strip: optional badges for tool count and knowledge base count

Prompt preview source (first non-empty):

1. For transfer nodes (`standalone_agent` with `agentId`): `transferMessage`
2. `subagent.prompt`
3. `additionalPrompt`
4. `transferMessage` (fallback for non-transfer agents)

Labels:

- Use `node.label` when available
- Fall back to translated node name when missing

Files:

- `src/modules/campaigns/CampaignsForm/WorkflowSection/nodes/SubagentNode/SubagentNode.tsx`
- `src/modules/campaigns/CampaignsForm/WorkflowSection/nodes/SubagentNode/SubagentNode.module.css`

### Tool Nodes

Tool nodes use `ToolNode` and render a two-part card:

- Header: tool icon + label
- Bottom section: list of tool badges

Tool badges render the `toolId` values in `tools`.

Files:

- `src/modules/campaigns/CampaignsForm/WorkflowSection/nodes/ToolNode/ToolNode.tsx`
- `src/modules/campaigns/CampaignsForm/WorkflowSection/nodes/ToolNode/ToolNode.module.css`

### Other Nodes

- Start: `StartNode`
- End: `EndNode`
- Phone transfer: `WorkflowNodeWrapper` (default node styling)

Node type mapping is defined in:

- `src/modules/campaigns/CampaignsForm/WorkflowSection/WorkflowCanvas/WorkflowCanvas.tsx`

## Edge Label Rendering

Edge labels are rendered by `ConditionEdge` and computed in `WorkflowCanvas`.

Rules:

- Start-node outgoing edges never show a label.
- LLM conditions show the exact `condition` string (including user-entered text like "Nothing").
- Result conditions render a label using:
  - `form.workflow.edge.results.success`
  - `form.workflow.edge.results.failure`
- Unconditional edges show **no label** unless a label is explicitly set in the condition.
- If both forward and backward labels exist, they render as a stacked label with directional arrows.

Files:

- `src/modules/campaigns/CampaignsForm/WorkflowSection/WorkflowCanvas/WorkflowCanvas.tsx`
- `src/modules/campaigns/CampaignsForm/WorkflowSection/edges/ConditionEdge/ConditionEdge.tsx`
- `src/modules/campaigns/CampaignsForm/WorkflowSection/edges/ConditionEdge/ConditionEdge.module.css`

## Label Precedence

Node labels and edge labels follow these priorities:

- Node label: `node.label` first, then translation fallback
- Edge label: condition label string first, then condition-derived text

## Localization

Workflow UI strings live in:

- `src/locales/en/campaigns.json`
- `src/locales/es/campaigns.json`

Important keys:

- `form.workflow.nodes.*`
- `form.workflow.edge.results.*`
- `form.workflow.edge.conditions.*`

## Quick Code Map

- Canvas + mapping logic: `src/modules/campaigns/CampaignsForm/WorkflowSection/WorkflowCanvas/WorkflowCanvas.tsx`
- Agent nodes: `src/modules/campaigns/CampaignsForm/WorkflowSection/nodes/SubagentNode/SubagentNode.tsx`
- Tool nodes: `src/modules/campaigns/CampaignsForm/WorkflowSection/nodes/ToolNode/ToolNode.tsx`
- Edge renderer: `src/modules/campaigns/CampaignsForm/WorkflowSection/edges/ConditionEdge/ConditionEdge.tsx`
