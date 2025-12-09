# Project Guideline Violations Report

**Generated:** 2025-12-08
**Project:** nai-agent-service-front

---

## 🚨 Critical Violations

### 1. TypeScript `any` Type Usage (CRITICAL)

**Guideline:** "Never use `any` - always define proper types"

**Violations Found:** 300+ instances across the codebase

**High-Impact Examples:**

- [`BaseTable.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/components/BaseTable/BaseTable.tsx#L37): `columns: ColumnDef<TData, any>[]`
- [`BaseTable.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/components/BaseTable/BaseTable.tsx#L148): `(updater: any)`
- [`BaseTable.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/components/BaseTable/BaseTable.tsx#L280): `(header.column.columnDef.meta as any)?.headerClassName`
- [`AddNewCampaignForm.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/AddNewCampaignForm/AddNewCampaignForm.tsx#L132): `const agentConfig: any = {`
- [`PromptGeneratorContainer/PromptList.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptGeneratorContainer/PromptList.tsx#L8): `prompts: any[];`
- [`PromptInputForm.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptInputForm/PromptInputForm.tsx#L165): `{fields.map((item: any) =>`

**Test Files:** While test files may use `any` for mocks, many production files violate this rule.

**Impact:** Loss of type safety, increased risk of runtime errors, reduced code maintainability.

**Recommendation:** Define proper TypeScript interfaces and types for all data structures.

---

## ⚠️ Design Guideline Violations

### 2. Use of Shadows (Violates Flat Design Principle)

**Guideline:** "Clean and Simple: Use flat design. NO shadows, NO gradients, NO 3D effects."

**Violations Found:** 100+ instances of `box-shadow` and `shadow` props

**Examples:**

#### CSS Files with box-shadow:

- [`PromptGeneratorContainer.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptGeneratorContainer/PromptGeneratorContainer.module.css#L5): `box-shadow: 0 2px 12px rgba(0,0,0,0.04);`
- [`PromptGeneratorContainer.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptGeneratorContainer/PromptGeneratorContainer.module.css#L58): `box-shadow: 0 2px 16px 0 rgba(60, 60, 60, 0.07);`
- [`PromptTypeSelector.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptGeneratorContainer/PromptTypeSelector.module.css#L50): `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);`
- [`PromptInputForm.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptInputForm/PromptInputForm.module.css#L5): `box-shadow: 0 2px 16px 0 rgba(60, 60, 60, 0.07);`
- [`UserInfoCard.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/profile/UserInfoCard/UserInfoCard.module.css#L29): `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);`
- [`CampaignsList.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignsList/CampaignsList.module.css#L97): `box-shadow: 0 1px 3px rgba(16, 24, 40, 0.04);`

#### Components using shadow props:

- [`PromptTypeSelector.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptGeneratorContainer/PromptTypeSelector.tsx#L60): `shadow={selectedType === type.id ? "md" : "sm"}`
- [`useCampaignsColumns.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignsList/useCampaignsColumns.tsx#L82): `<HoverCard width={280} shadow='md' withArrow position='right'>`
- [`useUsersColumns.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/users/hooks/useUsersColumns.tsx#L58): `<HoverCard width={280} shadow='md'>`

**Impact:** Violates the flat design aesthetic specified in guidelines.

**Recommendation:** Remove all shadows and use borders/spacing for visual hierarchy instead.

---

### 3. Use of Gradients (Violates Flat Design Principle)

**Guideline:** "Clean and Simple: Use flat design. NO shadows, NO gradients, NO 3D effects."

**Violations Found:** 40+ instances of `linear-gradient` and `radial-gradient`

**Examples:**

- [`PromptTypeSelector.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptGeneratorContainer/PromptTypeSelector.module.css#L19): `background: linear-gradient(90deg, #228be6 0%, #339af0 50%, #4dabf7 100%);`
- [`PromptTypeSelector.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/prompt-generator/PromptGeneratorContainer/PromptTypeSelector.module.css#L71): `background: linear-gradient(90deg, #339af0, #4dabf7);`
- [`CampaignsList.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/campaigns/CampaignsList/CampaignsList.module.css#L19): `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`
- [`VoicePlayer.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/components/VoicePlayer/VoicePlayer.module.css#L2): `background: linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-blue-7));`
- [`Header.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/components/Header/Header.module.css#L180): `background: linear-gradient(45deg, #60a5fa, #3b82f6);`
- [`UserInfoCard.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/profile/UserInfoCard/UserInfoCard.module.css#L17): `background: linear-gradient(...)`
- [`Layout.module.css`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/components/Layout/Layout.module.css#L131): `background-image: radial-gradient(...)`

**Impact:** Violates the flat design aesthetic specified in guidelines.

**Recommendation:** Replace gradients with solid colors from the Mantine color palette.

---

## 📁 Component Structure Violations

### 4. Missing `index.ts` Export Files

**Guideline:** "Each component gets its own folder with an index.ts file containing: `export { default } from './ComponentName';`"

**Missing index.ts in components:**

- [`RouteGuards`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/components/RouteGuards) - No `index.ts` file found
- [`KnowledgeBaseSelector`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/components/KnowledgeBaseSelector) - Has 3 files but missing `index.ts`

**Missing index.ts in modules:**

Most module folders are missing `index.ts` files. Only 4 out of 18 module folders have them:

- ✅ `profile/index.ts`
- ✅ `prompter/index.ts`
- ✅ `roles/index.ts`
- ✅ `users/index.ts`

**Missing in:**

- ❌ `auth/`
- ❌ `campaigns/`
- ❌ `client-configs/`
- ❌ `clients/`
- ❌ `configurations/`
- ❌ `contacts/`
- ❌ `conversations/`
- ❌ `do-not-call/`
- ❌ `knowledge-bases/`
- ❌ `overview/`
- ❌ `prompt-form/`
- ❌ `prompt-generator/`
- ❌ `tools/`

**Impact:** Inconsistent import patterns, harder to refactor.

**Recommendation:** Add `index.ts` files to all component and module folders for consistent exports.

---

## 📝 Code Quality Issues

### 5. Inconsistent Component Naming in index.ts

**Guideline:** "The index.ts file must contain: `export { default } from './ComponentName';`"

**Issue:** Some `index.ts` files use inconsistent quote styles.

**Example:**

- [`Logo/index.ts`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/components/Logo/index.ts#L1): Uses double quotes: `export { default } from "./Logo";`

**Recommendation:** Enforce consistent quote style (single quotes preferred based on codebase).

---

### 6. Typo in Folder Name

**Issue:** Folder named `contants` instead of `constants`

**Location:** [`/src/contants`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/contants)

**Impact:** Unprofessional, potential confusion.

**Recommendation:** Rename folder to `constants`.

---

## 🎨 Size & Spacing Violations

### 7. Non-Compact Sizing

**Guideline:**

- "Use small font sizes - prefer `size="sm"` for Text components"
- "Use smaller component variants - prefer `size="sm"` for Button, Input, Select, etc."
- "Default gap is `xs` - use `var(--mantine-spacing-xs)` or `gap="xs"` between elements"

**Potential Violations:**

While I cannot verify all instances without examining every component, the [`WelcomeCard.tsx`](file:///Users/ramonmena/Projects/nai-agent-service-front/src/modules/overview/WelcomeCard/WelcomeCard.tsx) component shows good adherence:

- ✅ Uses `size='sm'` for Text (line 111)
- ✅ Uses `size='xs'` for Text (line 141)
- ✅ Uses `gap='xs'` for Stack (line 106)
- ✅ Uses `spacing='xs'` for SimpleGrid (line 119)

**Recommendation:** Audit all components to ensure consistent use of compact sizing (`sm`/`xs`) and spacing (`xs` gaps).

---

## 🧪 Test File Organization

### 8. Test File Naming Convention

**Guideline:** "For each .tsx or .ts component, create a test. File should be named as the component file .test.tsx or .test.ts"

**Status:** ✅ **COMPLIANT** - Test files follow the correct naming pattern (e.g., `BaseTable.test.tsx`, `WelcomeCard.test.tsx`)

---

## 📊 Summary

| Category                  | Violations | Severity    |
| ------------------------- | ---------- | ----------- |
| TypeScript `any` usage    | 300+       | 🚨 Critical |
| Shadow usage (CSS)        | 100+       | ⚠️ High     |
| Gradient usage (CSS)      | 40+        | ⚠️ High     |
| Missing `index.ts` files  | 15+        | ⚠️ Medium   |
| Folder naming typo        | 1          | ⚠️ Low      |
| Quote style inconsistency | Multiple   | ⚠️ Low      |

---

## 🎯 Recommended Actions

### Priority 1 (Critical)

1. **Eliminate `any` types** - Create proper TypeScript interfaces for all data structures
2. **Remove all shadows** - Replace with borders and spacing for visual hierarchy
3. **Remove all gradients** - Use solid colors from Mantine palette

### Priority 2 (High)

4. **Add missing `index.ts` files** - Ensure all components and modules have proper export files
5. **Fix folder typo** - Rename `contants` to `constants`

### Priority 3 (Medium)

6. **Standardize quote style** - Use single quotes consistently in `index.ts` files
7. **Audit component sizing** - Ensure all components use compact sizing (`sm`/`xs`)

---

## 📝 Notes

- The codebase is generally well-structured with good separation of concerns
- Test coverage appears comprehensive with proper test file naming
- Component folder structure is mostly consistent
- The main issues are design-related (shadows/gradients) and type safety (`any` usage)
