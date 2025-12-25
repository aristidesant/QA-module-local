# Failing Tests Report

**Generated:** 2025-12-24
**Command:** `npm run test`
**Result:** Timed out after 120s (Vitest run --coverage --silent)

## Current Failing Test Files (from last run)

### Campaigns Module

- `src/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationPredefinedParams/CampaignConfigurationPredefinedParams.test.tsx` (13 failed)
- `src/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationPrompt/CampaignConfigurationPromptEditModal/CampaignConfigurationPromptEditModal.test.tsx` (9 failed)
- `src/modules/campaigns/CampaignPreview/CampaignOverview/CampaignOverview.test.tsx` (13 failed)
- `src/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationPrompt/CampaignConfigurationPromptEditModal/PromptTypeAccordionItem/PromptTypeAccordionItem.test.tsx` (16 failed)
- `src/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationPrompt/CampaignConfigurationPromptEditModal/PromptTypeAccordionItem/PromptAiActions/PromptAiActions.test.tsx` (34 failed)
- `src/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationPrompt/CampaignConfigurationPromptEditModal/PromptTypeAccordionItem/PromptAiActions/ReviewStep/ReviewStep.test.tsx` (12 failed)

### Components

✅ Fixed locally (targeted runs):

- `src/components/PaginationControls/PaginationControls.test.tsx` (now passing)
- `src/components/OutboundCallForm/OutboundCallForm.test.tsx` (now passing)

## Notes

- The run timed out before finishing the full suite, so additional failures may exist.
- If you want a complete synced list, re-run with a longer timeout or a non-coverage run.

## Progress

- Root cause for the two component failures: tests were not using the shared i18n/providers setup, so translation keys rendered instead of English strings.
- Remaining work: run and fix the Campaigns module failing files listed above.
