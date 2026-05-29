---
target: src/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationDynamicVariables
total_score: 25
p0_count: 0
p1_count: 1
timestamp: 2026-05-29T01-46-09Z
slug: agentsection-campaignconfigurationdynamicvariables
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Badge count updates; no feedback when Apply fires |
| 2 | Match System / Real World | 3 | "Dynamic variables" is jargon, but audience-appropriate for IT admins |
| 3 | User Control and Freedom | 3 | Modal Cancel exists; no undo for deleted rows inside modal |
| 4 | Consistency and Standards | 2 | teal badge deviates from Newtech palette; modal header pattern slightly off |
| 5 | Error Prevention | 3 | Duplicate-key detection + disabled Apply on errors — solid |
| 6 | Recognition Rather Than Recall | 3 | Column headers in modal; preview shows current state |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcut to add entries, no bulk delete, no paste-from-JSON |
| 8 | Aesthetic and Minimalist Design | 2 | "Read only" label is redundant noise; both empty states are anemic |
| 9 | Error Recovery | 3 | Inline key errors, disabled Apply — clear recovery path |
| 10 | Help and Documentation | 1 | No contextual help explaining what dynamic variables are or how to use them |
| **Total** | | **25/40** | **Acceptable — improvements needed** |

## Anti-Patterns Verdict

Not AI-generated. Structure is domain-specific and purposeful. No gradient text, no side-stripe borders, no hero metrics, no nested cards.

CLI detector unavailable (bundled detector not found). Browser visualization skipped.

## Overall Impression

Functionally solid. Progressive disclosure is correct pattern. Key validation is genuinely useful. Dark mode support is explicit. What drags it down: two empty states that communicate nothing, badge color that breaks brand identity, and zero contextual help.

## What's Working

1. Progressive disclosure is correct — read-only preview in card, editor behind modal.
2. Duplicate key validation is real error prevention — Apply disabled until clean.
3. Dark mode explicitly handled via CSS selector overrides.

## Priority Issues

**[P2] "Read Only" label is pure noise** — dimmed Text adds nothing; remove it.

**[P2] Badge color teal breaks Newtech brand identity** — not in the design system palette; use green or gray.

**[P2] Both empty states are below DESIGN.md standard** — need icon (40px, #C3CAD4) + descriptive title + action CTA per DESIGN.md.

**[P1] No contextual help for "dynamic variables"** — first-time admin has no idea what keys/values to use or how they map to agent config.

**[P3] No apply success feedback** — modal closes, badge updates, no explicit confirmation.

## Persona Red Flags

**Alex (Power User):** No keyboard shortcut to add variables. No import/paste path for bulk entry. One-click delete with no undo.

**Sam (Accessibility):** Badge + "read only" text reads as run-on to screen readers. Preview rows are plain divs with no ARIA role for key-value pairs.

**Campaign Operator (project-specific):** Opens modal, sees blank columns, has no idea what keys to enter or what values are valid. No examples, no docs link, no validation that keys match agent script.

## Minor Observations

- keyErrors() not memoized — trivial useMemo([entries]) fix.
- previewHeader CSS class defined but never used.
- previewRow grid 0.9fr/1.1fr biases toward values; 1fr/1fr is more natural.
- mah={220} is a magic number.
- useEffect omits placeholders from deps intentionally — needs a comment to prevent future regressions.
