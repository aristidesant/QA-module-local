# Workflow Node Groups — Backend Requirements

## Why

The workflow canvas lets users group related nodes into labeled clusters (e.g. all
agents that belong to a sub-flow). These groups are purely a **canvas-level**
concern — they must not appear in `agentConfig.workflow.nodes` because the node
type `"group"` is not a valid enum value the agent engine understands.

We need a dedicated place to persist the group configuration so it survives
round-trips (save → reload → render) without polluting the workflow data.

---

## Where to store it

**As a dedicated top-level column on the campaign record**, not inside `agentConfig`.

`agentConfig` is an opaque JSON blob validated against a strict schema by the
agent engine. Adding unknown node types there causes `400` errors on save. A
separate top-level column keeps the concern clean and independently evolvable.

| Option                           | Verdict                                                               |
| -------------------------------- | --------------------------------------------------------------------- |
| Inside `agentConfig.workflow`    | ❌ Strict enum validation rejects `type: "group"`                     |
| Top-level column on the campaign | ✅ Clean separation, easy to patch independently, no validation clash |

---

## Schema change

Add a new **optional top-level column** `nodeGroups` to the campaign table:

```jsonc
// Campaign record (top level)
{
	"id": 42,
	"name": "My Campaign",
	"agentConfig": {
		/* unchanged */
	},

	// NEW — optional top-level column, stored as JSON
	"nodeGroups": {
		"<group_id>": {
			"label": "Escalation Flow", // optional display label
			"position": { "x": 120, "y": 80 }, // canvas position (top-left corner)
			"width": 480, // optional canvas width in px
			"height": 320, // optional canvas height in px
			"color": "#74c0fc", // optional CSS hex color for group border/tint
			"childNodeIds": ["agent_A1", "agent_A2"], // IDs of member nodes
		},
	},
}
```

### `nodeGroups`

- **Type:** `Record<string, NodeGroup>` — stored as a JSON column on the campaign table
- **Optional:** yes — if missing or empty, the canvas renders no groups (no breaking change)

### `NodeGroup` object

| Field          | Type                       | Required | Description                                           |
| -------------- | -------------------------- | -------- | ----------------------------------------------------- |
| `label`        | `string`                   | no       | Human-readable display name shown as the group header |
| `position`     | `{ x: number; y: number }` | yes      | Canvas coordinates of the group's top-left corner     |
| `width`        | `number`                   | no       | Canvas width of the group container in pixels         |
| `height`       | `number`                   | no       | Canvas height of the group container in pixels        |
| `childNodeIds` | `string[]`                 | yes      | IDs of workflow nodes that belong to this group       |

### Position format

`position.x` and `position.y` are floating-point numbers representing canvas
pixel coordinates. They can be negative (canvas has an infinite viewport).

---

## Affected endpoints

| Endpoint               | What changes                             |
| ---------------------- | ---------------------------------------- |
| `POST /campaigns`      | Accept `nodeGroups` as a top-level field |
| `PATCH /campaigns/:id` | Accept `nodeGroups` as a top-level field |
| `GET /campaigns/:id`   | Return `nodeGroups` as a top-level field |

No changes to any other fields or existing behavior.

---

## Validation rules

1. **`position`** is required per `NodeGroup` entry and must contain numeric `x` and `y` fields → `400` if missing or non-numeric.
2. **`childNodeIds`** is required per `NodeGroup` entry and must be a non-empty array of strings → `400` if missing or empty.
3. **`label`**, **`width`**, **`height`**, and **`color`** are optional. If `width`/`height` are present they must be positive numbers → `400` if zero or negative. If `color` is present it must be a valid CSS hex code (`#rgb` or `#rrggbb`) → `400` if invalid.
4. **Orphan cleanup:** on save, strip any `childNodeIds` entry whose ID doesn't exist in `agentConfig.workflow.nodes`. If the resulting `childNodeIds` array becomes empty, remove the group entry entirely. (The UI also performs this cleanup, but the backend is the safety net.)
5. **`nodeGroups` is fully optional.** Omitting it or sending `{}` is valid.

---

## Node deletion side-effect

When a node is removed from `agentConfig.workflow.nodes`, its ID should be
removed from every `childNodeIds` array in `nodeGroups` on save (part of rule 4
above). Any group left with an empty `childNodeIds` should also be removed.

---

## Example payloads

### PATCH — user saves a workflow with two groups

```json
{
	"nodeGroups": {
		"group-abc123": {
			"label": "Escalation Flow",
			"position": { "x": 120, "y": 80 },
			"width": 480,
			"height": 320,
			"color": "#74c0fc",
			"childNodeIds": ["agent_A1", "agent_A2"]
		},
		"group-def456": {
			"label": "",
			"position": { "x": 700, "y": 200 },
			"width": 360,
			"height": 260,
			"childNodeIds": ["agent_B1", "tool_B1", "agent_B2"]
		}
	}
}
```

### GET — workflow with no groups

```json
{
  "id": 42,
  "name": "My Campaign",
  "agentConfig": { "..." },
  "nodeGroups": {}
}
```

> `nodeGroups` can also be `undefined`/absent — the UI treats `undefined`, `null`,
> and `{}` identically (no groups rendered).

### GET — workflow with one group (label is optional)

```json
{
  "id": 42,
  "name": "My Campaign",
  "agentConfig": { "..." },
  "nodeGroups": {
    "group-abc123": {
      "position": { "x": 120, "y": 80 },
      "childNodeIds": ["agent_A1", "agent_A2"]
    }
  }
}
```

---

## Relationship with `nodeStyles`

`nodeGroups` and `nodeStyles` are independent columns. The backend must treat
them as silos — a PATCH that only includes `nodeGroups` must not touch `nodeStyles`
and vice versa.

Group colors are stored directly in the `color` field of each `NodeGroup` entry —
group IDs do **not** appear as keys in `nodeStyles`. Only regular workflow nodes
(agents, tools, etc.) use `nodeStyles` for style overrides.

---

## Migration

**None needed.** `node_groups` is additive and optional. Existing campaigns without
it keep working exactly as before.

---

## Checklist

| #   | Task                                                                          | Priority    |
| --- | ----------------------------------------------------------------------------- | ----------- |
| 1   | Add `nodeGroups` as a top-level JSON column on the campaign table/DTO         | Required    |
| 2   | Validate `position` (required, numeric `x`/`y`) per entry                     | Required    |
| 3   | Validate `childNodeIds` is a non-empty string array per entry                 | Required    |
| 4   | Validate `width`/`height` are positive numbers if present                     | Required    |
| 5   | Validate `color` is a valid CSS hex code if present                           | Required    |
| 6   | Return `nodeGroups` in GET responses                                          | Required    |
| 7   | Strip orphan `childNodeIds` (IDs not in `agentConfig.workflow.nodes`) on save | Recommended |
| 8   | Remove groups whose `childNodeIds` becomes empty after orphan cleanup         | Recommended |
| 9   | No changes to existing fields, `agentConfig` schema, or behavior              | Required    |
