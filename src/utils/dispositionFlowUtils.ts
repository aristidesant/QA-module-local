import type { DispositionFlowModel } from '~/models/DispositionFlowModel';
import type { DispositionCatalogModel } from '~/models/DispositionCatalogModels';

/**
 * Validates and normalizes a DispositionFlowModel to ensure it has the correct structure
 * for restoration in the disposition builder
 */
export function validateAndNormalizeDispositionFlow(
	flow: DispositionFlowModel
): DispositionFlowModel {
	console.log('Validating disposition flow:', {
		id: flow.id,
		campaignId: flow.campaignId,
		hasFlowJson: !!flow.flowJson,
		flowJsonType: typeof flow.flowJson,
	});

	if (!flow.flowJson) {
		throw new Error('DispositionFlowModel is missing flowJson property');
	}

	// Handle potential nested flowJson structures
	let normalizedCatalog = flow.flowJson;
	let unwrapCount = 0;
	const maxUnwraps = 5;

	while (
		normalizedCatalog &&
		typeof normalizedCatalog === 'object' &&
		'flowJson' in normalizedCatalog &&
		normalizedCatalog.flowJson &&
		unwrapCount < maxUnwraps
	) {
		console.warn(
			`Unwrapping nested flowJson (attempt ${unwrapCount + 1})`,
			normalizedCatalog
		);
		normalizedCatalog = (normalizedCatalog as any).flowJson;
		unwrapCount++;
	}

	if (unwrapCount >= maxUnwraps) {
		throw new Error(
			'Too many nested flowJson levels, possible circular reference'
		);
	}

	// Validate the final structure
	if (!normalizedCatalog || typeof normalizedCatalog !== 'object') {
		throw new Error(
			`Invalid flowJson structure: expected object, got ${typeof normalizedCatalog}`
		);
	}

	// Check for dispositionNodes (new structure)
	if (!('dispositionNodes' in normalizedCatalog)) {
		console.warn('No dispositionNodes found in catalog, creating empty array');
		normalizedCatalog = {
			...normalizedCatalog,
			dispositionNodes: [],
		};
	}

	// Validate structure
	const catalog = normalizedCatalog as DispositionCatalogModel;
	if (catalog.dispositionNodes && !Array.isArray(catalog.dispositionNodes)) {
		throw new Error(
			'Invalid flowJson structure: dispositionNodes must be an array'
		);
	}

	// Ensure all required properties exist
	const validatedCatalog = {
		id: catalog.id,
		clientId: catalog.clientId,
		campaignId: catalog.campaignId,
		name: catalog.name || 'Outcome Catalog',
		description: catalog.description || '',
		dispositionNodes: catalog.dispositionNodes || [],
		type: (catalog as any).type ?? 'OUTBOUND',
		isActive: catalog.isActive ?? true,
		isDefault: catalog.isDefault ?? false,
		createdAt: catalog.createdAt || new Date().toISOString(),
		updatedAt: catalog.updatedAt || new Date().toISOString(),
	};

	console.log('Validated disposition catalog:', {
		name: validatedCatalog.name,
		nodesCount: validatedCatalog.dispositionNodes?.length || 0,
	});

	return {
		...flow,
		flowJson: validatedCatalog as any,
	};
}

/**
 * Safely extracts and validates a disposition catalog for restoration
 */
export function extractDispositionCatalog(
	flowJson: any
): DispositionCatalogModel {
	if (!flowJson) {
		throw new Error('No flowJson provided');
	}

	// Handle nested flowJson
	let catalog = flowJson;
	let unwrapCount = 0;
	const maxUnwraps = 5;

	while (
		catalog &&
		typeof catalog === 'object' &&
		'flowJson' in catalog &&
		catalog.flowJson &&
		unwrapCount < maxUnwraps
	) {
		catalog = catalog.flowJson;
		unwrapCount++;
	}

	if (unwrapCount >= maxUnwraps) {
		throw new Error('Circular reference detected in flowJson');
	}

	if (!catalog || typeof catalog !== 'object' || !('id' in catalog)) {
		throw new Error('Invalid catalog structure');
	}

	return catalog as DispositionCatalogModel;
}
