# SegmentedControl Migration Plan

## Objective

Replace all Mantine `SegmentedControl` usages with the custom `AppSegmentedControl` component to ensure consistent styling and behavior across the application.

## Files to Migrate

### 1. Outcomes Module

- [ ] `src/modules/outcomes/components/DispositionCatalogList/DispositionCatalogList.tsx` (line 19, 341)
- [ ] `src/modules/outcomes/components/DispositionCatalogForm/DispositionCatalogForm.tsx` (line 7, 109)

### 2. Configurations Module

- [ ] `src/modules/configurations/PhoneNumbers/PhoneNumberForm.tsx` (line 16, 903)
- [ ] `src/modules/configurations/DictionaryRules/RuleForm.tsx` (line 10, 270)

### 3. Campaigns Module

- [ ] `src/modules/campaigns/CampaignsForm/WorkflowSection/forms/PhoneNumberForm/PhoneNumberForm.tsx` (line 6, 190)
- [ ] `src/modules/campaigns/CampaignWizard/StepThreeOutcomes/StepThreeOutcomes.tsx` (line 14, 345)
- [ ] `src/modules/campaigns/CampaignWizard/StepOneGeneral/StepOneGeneral.tsx` (line 10, 291)
- [ ] `src/modules/campaigns/AddNewCampaignForm/AddNewCampaignForm.tsx` (line 5, 235)

### 4. Components

- [ ] `src/components/KnowledgeBaseSelectionTable/KnowledgeBaseSelectionTable.tsx` (line 7, 297)

## Migration Steps

For each file:

1. **Update import**
   - Remove: `import { SegmentedControl } from '@mantine/core';`
   - Add: `import AppSegmentedControl from '~/components/ui/AppSegmentedControl';`

2. **Replace component usage**
   - Change `<SegmentedControl ... />` to `<AppSegmentedControl ... />`

3. **Adapt props if needed**
   - Mantine `SegmentedControl` props may differ from `AppSegmentedControl`:
     - `data` prop works similarly (array of strings or objects with `value`/`label`)
     - `value` and `onChange` work the same way
     - `fullWidth`, `size`, `disabled` props are supported

4. **Verify functionality**
   - Ensure controlled/uncontrolled behavior works correctly
   - Test styling in light and dark modes
   - Check responsive behavior

## Verification

After migration, run:

```bash
npm run typecheck
```

And manually verify the UI in both light and dark modes.
