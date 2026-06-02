# CLAUDE.md Overhaul Design

**Date:** 2026-06-01  
**Goal:** Fix correctness errors and reduce per-session token cost ~70% by splitting CLAUDE.md into a lean hub + topical convention docs.

---

## Problem

Current `CLAUDE.md` is 230 lines and fully loaded every conversation, even when the task is unrelated to most of its content. It also contains stale data:

| Issue                 | Detail                                                                                |
| --------------------- | ------------------------------------------------------------------------------------- |
| Mantine version wrong | States v8; actual package is v9.2.0                                                   |
| Broken skill path     | `.agents/skills/nai-agent-service-front-operational-frontend/SKILL.md` does not exist |
| Missing dependency    | `@tanstack/react-table v8` used in codebase but not listed in stack                   |
| Redundant content     | Section 13 (Do/Don't) repeats rules already stated in earlier sections                |

---

## Solution: Lean Hub + Topical Docs

### Structure

```
CLAUDE.md                              ← ~45 lines, always loaded
docs/conventions/
  component-conventions.md            ← folder pattern, naming, barrel exports
  ui-styling.md                       ← Mantine rules, dark mode, shadows
  routing.md                          ← React Router, ModuleGuard, lazy loading
  i18n.md                             ← namespace rules, key updates
  permissions.md                      ← architecture, usePermissions helpers, hooks discipline
  data-forms-state.md                 ← React Query, Mantine Form, Zustand, API
  testing.md                          ← Vitest, RTL, commands, conventions
  typescript.md                       ← strict typing, ~/imports, models
```

### CLAUDE.md content (lean hub)

Contains only what is relevant in every session:

1. **Precedence order** — user request > CLAUDE.md > repo patterns
2. **Critical rules** — skill check, English, no tests, interactive prompts
3. **Plan mode** — 2 bullets
4. **Stack table** — corrected versions, all active libraries
5. **Shared UI primitives** — SectionCard, AppDrawer, BaseTable (always applied)
6. **Convention pointers** — links to each topical doc

### Convention docs

Each file directly corresponds to one section of the current CLAUDE.md. Content migrates as-is (lightly formatted for standalone reading). Files are 20–40 lines each.

---

## Correctness Fixes

| What                       | Before              | After                             |
| -------------------------- | ------------------- | --------------------------------- |
| Mantine version            | v8                  | v9                                |
| Project UI skill reference | broken path         | removed (no project skill exists) |
| Stack listing              | missing react-table | adds TanStack React Table v8      |
| Section 13 Do/Don't        | redundant recap     | deleted                           |

---

## Token Impact

| Metric                                | Before | After          |
| ------------------------------------- | ------ | -------------- |
| Lines always loaded                   | ~230   | ~45            |
| Estimated token reduction per session | —      | ~70%           |
| Convention doc load                   | always | on-demand only |

---

## Out of Scope

- Content changes within convention docs (migrate as-is; refine separately)
- Removing or adding new conventions (separate decision)
- Automating doc loading (Claude reads on-demand via file path)
