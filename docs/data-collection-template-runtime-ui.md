# Data Collection Template Runtime UI

## Summary

The frontend Analytics section now works with a campaign runtime model instead of editing only `agentConfig.dataCollection`.

- `campaign.dataCollectionVariables` is the authoring source of truth.
- `agentConfig.dataCollection` is still updated, but only with active rows.
- The catalog UI now uses the `data-collection-template-*` naming as the canonical surface.

## Analytics Authoring Model

Each analytics row now keeps runtime metadata in addition to the extraction definition.

```ts
type AnalyticsDataCollectionRow = {
	id: string;
	campaignVariableId?: number;
	agentId?: string | null;
	identifier: string;
	isActive: boolean;
	type: 'boolean' | 'integer' | 'number' | 'string';
	description: string;
	enum?: string[];
	constantValue: string;
	dynamicVariable: string;
	isSystemProvided: boolean;
	isSystemDefault?: boolean;
};
```

## Read Flow

When the Analytics tab opens:

1. The UI first checks `campaign.dataCollectionVariables`.
2. If runtime rows exist, they are normalized into table rows.
3. If runtime rows are absent, the UI falls back to `agentConfig.dataCollection` for backward compatibility.

## Write Flow

Every change in Analytics updates two payloads:

### Runtime payload

Stored in `campaignForm.values.dataCollectionVariables`.

- Includes active and inactive rows.
- Preserves campaign runtime row ids when available.

### Active mirror payload

Stored in both:

- `campaignForm.values.agentConfig.dataCollection`
- `campaignForm.values.agentConfig.platformSettings.dataCollection`

This mirror contains only rows where `isActive === true`.

## `isActive` Behavior

The Analytics table and editor now expose activation state.

- Active rows are shown with an `Active` badge.
- Inactive rows are shown with an `Inactive` badge.
- Toggling a row off keeps it in campaign state but removes it from the active provider mirror.

This lets operators temporarily disable capture without losing the variable definition.

## Catalog Rename

The catalog surface is now canonical under:

- `DataCollectionTemplateModel`
- `dataCollectionTemplateGroupsApi`
- `dataCollectionTemplateGroupsQueries`
- `data-collection-template-groups/`
- `data-collection-template-variables/`
- `DataCollectionTemplatesSetupTab`

Compatibility wrappers remain on old `customVariable*` paths to avoid breaking the rest of the workspace during the transition.

## UI Scope Included In This Change

- Campaign management tab label updated to `Data Collection Templates`.
- Analytics table now shows runtime status.
- Analytics editor now allows toggling active/inactive state.
- Import flows still default imported template variables to active.

## Integration Guidance

Any UI that needs all campaign variables, including inactive ones, must read `campaign.dataCollectionVariables`.

Any UI that only needs currently active runtime keys can continue using `agentConfig.dataCollection`.
