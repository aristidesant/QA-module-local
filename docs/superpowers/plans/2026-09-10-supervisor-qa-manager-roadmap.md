# Supervisor / QA Manager Roadmap — Plan Index & Execution Order

Seven plans cover the Supervisor and QA Manager role previews (identical privileges for now; trim later) plus the Agent-role fixes. Execute them **in this order** — later plans import components, mock rosters and store actions created by earlier ones.

| # | Plan | Delivers | Depends on |
|---|---|---|---|
| 1 | [Triggers & Auto-driven Recognition](2026-09-10-triggers-auto-driven-recognition.md) | `/qa/<role>/triggers`: alert rules, recognition rules, badge catalog (10 badges), message templates, activity log; `notificationStore.addNotification` | — |
| 2 | [Dashboard Evaluation Views](2026-09-10-dashboard-evaluation-views.md) | Segmented views (Overview · QA · Compliance · S&E · Business Insights) on the Agent, Supervisor and QA Manager dashboards; new area widgets; `BurnoutRiskTable` | — (links to #3) |
| 3 | [Team Analytics](2026-09-10-team-analytics.md) | `/qa/<role>/analytics`: team-scoped evaluation tabs, Business Insights, Agent Finder, Burnout Risk detail + actions (LMS, coaching, check-in, workload, mentor) | #2 (widgets, burnout rows); #1 optional |
| 4 | [Manager Inbox](2026-09-10-manager-inbox.md) | `/qa/<role>/inbox`: alerts + agent messages/replies, filters by agent/supervisor, detail thread, compose; sidebar unread counters for all three roles | — |
| 5 | [Disputes Review](2026-09-10-disputes-review.md) | Role-aware disputes list, call-detail-style dispute detail (player, transcript, four evaluation tabs, agent statement), item-level decisions, open-disputes counter | #2 (breakdown widgets) |
| 6 | [Agent Rankings Drawer Refinement](2026-09-10-agent-rankings-drawer-refinement.md) | Monochrome, contextual leaderboard drawer; hardening; `qa.rankings` namespace | — |
| 7 | [Manager Rankings](2026-09-10-manager-rankings.md) | `/qa/<role>/rankings`: create/run rankings on any evaluation method with dates, badges and winner; agent page follows the active ranking | #1 (badge catalog), #6 (namespace, reactive hook) |

Already implemented before this roadmap (see git history): burnout widget on the agent dashboard, analytics campaign filter, disputes dashboard list refinement, team rankings phase 2.

## Shared conventions every plan relies on

- **Roster & personas** — Supervisor *Maria García* (`SUP-001`, Team 1: AGT-001 Sarah Johnson … AGT-007 Lisa Wong), *Juan Pérez* (`SUP-002`, Team 2), *Laura Gómez* (`SUP-003`, Team 3); QA Manager *Elena Ruiz* (`QAM-001`); Agent persona *John Smith* (`AGT-004`). Campaigns `camp-001` Q3 Customer Service · `camp-002` Sales Training · `camp-003` Q4 Compliance · `camp-004` Tech Support. Today = `2026-09-10`.
- **Routes** — role prefix `/qa/supervisor/*` and `/qa/qa-manager/*` (legacy `qamanager/*` paths redirect). Deep links: `?view=`, `?tab=`, `?agentId=`, `?programId=`, `?messageId=`.
- **Sidebar** — one entry per section per role (`rolePreviewNav` in `Sidebar.tsx`); counters via `badge: 'disputes' | 'inbox'`.
- **Stores** — one Zustand store per section under `src/stores/qa/`; cross-section demos write into the agent `notificationStore` (`addNotification`, guarded in every plan that needs it).
- **i18n** — one namespace per section (`qa.triggers`, `qa.dashboard`, `qa.teamAnalytics`, `qa.inbox`, `qa.disputes`, `qa.rankings`), always en + es.
- **Design-session rules** — mock only, no dev server / tests / commits unless the user asks; `npm run typecheck` after every task; Mantine tokens + `light-dark()`; shared primitives `SectionCard`, `AppDrawer`, `BaseTable`.

## Running a plan with Haiku

```bash
claude --model haiku
```
First message: `Execute docs/superpowers/plans/<plan>.md task by task using superpowers:subagent-driven-development. Run npm run typecheck after each task. Do not commit.`
