# Project Guideline Violations Report

**Generated:** 2025-12-09  
**Project:** nai-agent-service-front

---

## 🚨 Critical Violations

### 1. TypeScript `any` Type Usage (CRITICAL)

**Guideline:** "Never use `any` - always define proper types"

**Current Status:** ~1.3k matches remain (many in utilities and tests). Several previously flagged spots were fixed (e.g., `BaseTable` now uses `unknown`, `AddNewCampaignForm` uses `ConversationAgentConfig`), but production usages still exist.

**Notable production examples:**

- [`PromptGeneratorContainer.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptGeneratorContainer/PromptGeneratorContainer.tsx#L112): `values: Record<string, string> | any`
- [`PromptGeneratorContent.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompter/PromptGeneratorContent/PromptGeneratorContent.tsx#L102): `values as any`
- [`PromptModel.ts`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/models/PromptModel.ts#L13): `deletedAt: any;`
- [`useCampaignsColumns.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignsList/useCampaignsColumns.tsx#L71): `ColumnDef<Campaign, any>[]`
- [`httpClient.ts`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/utils/httpClient.ts#L88): `details?: any;` and other helpers (`error: any`, `getErrorMessage(error: any)`)

**Impact:** Loss of type safety, runtime error risk, harder maintenance.

**Recommendation:** Replace with explicit interfaces/types; refactor shared utilities (`httpClient`, `stringUtils`, `formUtils`) to be generic and typed.

---

## ⚠️ Design Guideline Violations

### 2. Use of Shadows (Violates Flat Design Principle)

**Guideline:** "Clean and Simple: Use flat design. NO shadows, NO gradients, NO 3D effects."

**Current Status:** ~70 `box-shadow`/shadow occurrences remain (down from the earlier report). Mantine components now avoid shadow props in key spots (e.g., `useUsersColumns` and `useCampaignsColumns` use `shadow='none'`), but CSS shadows persist.

**Examples:**

- [`PromptOutputDisplay.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptOutputDisplay/PromptOutputDisplay.module.css#L11): `box-shadow: 0 4px 6px ...`
- [`ContactsList.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/contacts/ContactsList/ContactsList.module.css#L1): `box-shadow: 0 4px 24px ...`
- [`PromptTypeSelector.module.cssss`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptGeneratorContainer/PromptTypeSelector.module.cssss#L30): multiple shadows (appears to be an old/duplicate stylesheet still in repo)

**Recommendation:** Remove remaining shadows; delete or clean up unused shadowed stylesheets (e.g., `PromptTypeSelector.module.cssss`) to prevent regressions.

---

### 3. Use of Gradients (Violates Flat Design Principle)

**Guideline:** "Clean and Simple: Use flat design. NO shadows, NO gradients, NO 3D effects."

**Current Status:** ~24 gradient usages remain (reduced from prior count). Several components still ship gradients.

**Examples:**

- [`VoiceMiniPlayer.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/components/VoiceMiniPlayer/VoiceMiniPlayer.module.css#L22): `background: linear-gradient(...)`
- [`CampaignContactOutcomeSummary.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignPreview/CampaignContactOutcomeSummary/CampaignContactOutcomeSummary.module.css#L100): gradient background
- [`PromptTypeSelector.module.cssss`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptGeneratorContainer/PromptTypeSelector.module.cssss#L51): gradient backgrounds

**Recommendation:** Replace gradients with flat colors from the Mantine palette; remove gradient assets from unused/duplicate stylesheets.

---

## 📁 Component Structure Violations

### 4. Missing `index.ts` Export Files

**Guideline:** "Each component gets its own folder with an index.ts file containing: `export { default } from './ComponentName';`"

**Current Status:** Component folders previously flagged (`RouteGuards`, `KnowledgeBaseSelector`) now have `index.ts`. Most module folders now have an index; the remaining gap is:

- ❌ [`src/modules/queries`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/queries) (missing `index.ts`)

**Recommendation:** Add `src/modules/queries/index.ts` to align module exports.

---

## 📝 Code Quality Follow-Ups

### 5. Folder naming typo

**Status:** ✅ Fixed. `src/constants` exists; `src/contants` no longer present.

### 6. Quote style consistency in `index.ts`

**Status:** ✅ Example in `Logo/index.ts` now uses single quotes.

---

## 🎨 Size & Spacing

No new violations found during this pass; continue to prefer `size="sm"` and `gap="xs"` per guidelines when adding/updating UI.

---

## 🧪 Test File Organization

**Status:** ✅ Test naming remains compliant (`*.test.tsx` alongside components).

---

## 📊 Summary

| Category                  | Current Status                             | Severity    |
| ------------------------- | ------------------------------------------ | ----------- |
| TypeScript `any` usage    | ~1.3k matches; key production spots remain | 🚨 Critical |
| Shadow usage (CSS)        | ~70 occurrences                            | ⚠️ High     |
| Gradient usage (CSS)      | ~24 occurrences                            | ⚠️ High     |
| Missing `index.ts` files  | `src/modules/queries` only                 | ⚠️ Medium   |
| Folder naming typo        | Resolved                                   | ✅          |
| Quote style inconsistency | Resolved                                   | ✅          |

---

## 🎯 Recommended Actions

### Priority 1 (Critical)

1. Eliminate remaining production `any` types (Prompt generator flows, shared utils, table column defs).
2. Remove remaining shadows; delete or refactor shadowed CSS (especially unused `PromptTypeSelector.module.cssss`).
3. Replace gradients with flat Mantine colors across components and CSS modules.

### Priority 2 (High)

4. Add `src/modules/queries/index.ts` to complete module exports.

### Priority 3 (Medium)

5. Continue auditing new UI for compact sizing (`sm`/`xs`) and flat design compliance.

---

## 📝 Notes

- Several earlier violations are now fixed (BaseTable typing, AddNewCampaignForm typing, shadow props in hover cards, missing component indexes).
- Design debt now centers on CSS shadows/gradients and an unused duplicate stylesheet.
- Type safety debt is concentrated in utilities and prompt-related flows; tackling shared helpers will retire many `any` uses at once.
