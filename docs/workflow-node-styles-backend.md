# Workflow Node Styles — Backend Requirements

## Why

Right now, node colors in the workflow editor are calculated on-the-fly from the node label (e.g. `"A1.2"` → blue, depth 1). If the user renames a node, colors change unpredictably. We want users to **set colors explicitly** and have them **persist in the database**.

---

## Where to store it

**As a dedicated top-level column on the campaign record**, not inside `agent_config`.

`agent_config` is an opaque JSON blob — burying styles in there makes them hard to validate, query, or evolve independently. A separate column keeps the concern clean.

| Option                           | Verdict                                          |
| -------------------------------- | ------------------------------------------------ |
| Inside `agent_config.workflow`   | ❌ Opaque blob, harder to validate and migrate   |
| Top-level column on the campaign | ✅ Clean separation, easy to patch independently |

The field is a flat map keyed by `node_id`, so it stays tightly coupled to the workflow without being buried inside it.

---

## Schema change

Add a new **optional top-level column** `node_styles` to the campaign table:

```jsonc
// Campaign record (top level)
{
	"id": 42,
	"name": "My Campaign",
	"agent_config": {
		/* unchanged */
	},

	// NEW — optional top-level column, stored as JSON
	"node_styles": {
		"<node_id>": {
			"background_color": "#74c0fc",
			"border_color": "#228be6",
			"text_color": "#1c3a5c",
		},
	},
}
```

### `node_styles`

- **Type:** `Record<string, NodeStyle>` — stored as a JSON column on the campaign table
- **Optional:** yes — if missing or empty, the UI falls back to automatic colors (no breaking change)

### `NodeStyle` object

| Field              | Type     | Required | Description                           |
| ------------------ | -------- | -------- | ------------------------------------- |
| `background_color` | `string` | yes      | CSS hex color for the node background |
| `border_color`     | `string` | no       | CSS hex color for the node border     |
| `text_color`       | `string` | no       | CSS hex color for the node label text |

### Color format

All color values must be **valid CSS hex codes** — either 3-digit (`#rgb`) or 6-digit (`#rrggbb`), case-insensitive. Reject with `400` if the format is invalid.

> The backend stores and returns these values as opaque strings. It has no knowledge of what palette or picker the UI used — that is entirely a frontend concern.

---

## Affected endpoints

| Endpoint               | What changes                              |
| ---------------------- | ----------------------------------------- |
| `POST /campaigns`      | Accept `node_styles` as a top-level field |
| `PATCH /campaigns/:id` | Accept `node_styles` as a top-level field |
| `GET /campaigns/:id`   | Return `node_styles` as a top-level field |

No changes to any other fields or existing behavior.

---

## Validation rules

1. **`background_color`** is required per `NodeStyle` entry and must be a valid CSS hex code → `400` if not.
2. **`border_color`** and **`text_color`** are optional, but if present must also be valid CSS hex codes → `400` if not.
3. **Orphan cleanup:** on save, strip any key in `node_styles` whose `node_id` doesn't exist in `agent_config.workflow.nodes`. (The UI will also clean up, but the backend should be the final safety net.)
4. **`node_styles` is fully optional.** Omitting it or sending `{}` is valid.

---

## Node deletion side-effect

When a node is removed from `agent_config.workflow.nodes`, any matching entry in the top-level `node_styles` column should also be removed on save (part of rule 3 above).

---

## Example payloads

### PATCH — user sets styles for two nodes

```json
{
	"node_styles": {
		"start_node": {
			"background_color": "#b2f2bb",
			"border_color": "#2f9e44",
			"text_color": "#1a3d26"
		},
		"agent_A1": {
			"background_color": "#d0bfff",
			"border_color": "#7048e8",
			"text_color": "#2c1a5c"
		}
	}
}
```

### GET — workflow with no custom styles

```json
{
  "id": 42,
  "name": "My Campaign",
  "agent_config": { "..." },
  "node_styles": {}
}
```

> `node_styles` can also be `undefined`/absent — the UI treats `undefined`, `null`, and `{}` the same way.

---

## Migration

**None needed.** `node_styles` is additive and optional. Existing campaigns without it keep working exactly as before.

---

## Checklist

| #   | Task                                                                          | Priority    |
| --- | ----------------------------------------------------------------------------- | ----------- |
| 1   | Add `node_styles` as a top-level JSON column on the campaign table/DTO        | Required    |
| 2   | Validate `background_color` is present and a valid CSS hex code               | Required    |
| 3   | Validate `border_color` / `text_color` are valid CSS hex codes if present     | Required    |
| 4   | Return `node_styles` in GET responses                                         | Required    |
| 5   | Strip orphan keys on save (keys not present in `agent_config.workflow.nodes`) | Recommended |
| 6   | No changes to existing fields or behavior                                     | Required    |
