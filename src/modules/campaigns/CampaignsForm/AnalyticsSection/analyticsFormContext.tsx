import { createFormContext } from '@mantine/form';

export type DataCollectionType = 'boolean' | 'integer' | 'number' | 'string';

export interface DataCollectionItem {
	type: DataCollectionType;
	description: string;
	enum?: string[]; // Only include for type="string"; omit for other types
	constantValue: string;
	dynamicVariable: string;
	isSystemProvided: boolean;
}

export interface AnalyticsDataCollectionRow extends DataCollectionItem {
	id: string;
	identifier: string;
	isNew: boolean;
	isSystemDefault?: boolean;
	source?: 'manual' | 'custom-variable';
	linkedCustomVariableId?: number;
	linkedTemplateId?: number;
}

export interface AnalyticsFormValues {
	rows: AnalyticsDataCollectionRow[];
	selectedRowId: string | null;
}

export const [
	AnalyticsFormProvider,
	useAnalyticsFormContext,
	useAnalyticsForm,
] = createFormContext<AnalyticsFormValues>();

export const createEmptyAnalyticsRow = (): AnalyticsDataCollectionRow => ({
	id: crypto.randomUUID(),
	identifier: '',
	type: 'string',
	description: '',
	enum: [],
	constantValue: '',
	dynamicVariable: '',
	isSystemProvided: false,
	isSystemDefault: false,
	isNew: true,
	source: 'manual',
});

export const getDataCollectionFromAgentConfig = (
	agentConfig: unknown
): Record<string, unknown> => {
	if (!agentConfig || typeof agentConfig !== 'object') {
		return {};
	}

	const normalizedAgentConfig = agentConfig as Record<string, unknown>;

	// Prefer platformSettings.dataCollection because the backend enriches it
	// with read-only fields like isSystemDefault that the top-level
	// (ElevenLabs-native) dataCollection does not include.
	const platformSettings = normalizedAgentConfig.platformSettings;
	if (platformSettings && typeof platformSettings === 'object') {
		const platformDataCollection = (platformSettings as Record<string, unknown>)
			.dataCollection;

		if (
			platformDataCollection &&
			typeof platformDataCollection === 'object' &&
			Object.keys(platformDataCollection as Record<string, unknown>).length > 0
		) {
			return platformDataCollection as Record<string, unknown>;
		}
	}

	const directDataCollection = normalizedAgentConfig.dataCollection;
	if (
		directDataCollection &&
		typeof directDataCollection === 'object' &&
		Object.keys(directDataCollection as Record<string, unknown>).length > 0
	) {
		return directDataCollection as Record<string, unknown>;
	}

	return (directDataCollection as Record<string, unknown>) ?? {};
};

export const normalizeDataCollectionRows = (
	dataCollection: unknown
): AnalyticsDataCollectionRow[] => {
	if (!dataCollection || typeof dataCollection !== 'object') {
		return [];
	}

	return Object.entries(dataCollection as Record<string, unknown>).map(
		([identifier, value]) => {
			const item =
				value && typeof value === 'object'
					? (value as Record<string, unknown>)
					: {};

			const type = item.type;
			const normalizedType: DataCollectionType =
				type === 'boolean' ||
				type === 'integer' ||
				type === 'number' ||
				type === 'string'
					? type
					: 'string';

			// Support both camelCase (new backend) and snake_case (legacy backend data)
			const constantValue =
				typeof item.constantValue === 'string'
					? item.constantValue
					: typeof item.constant_value === 'string'
						? item.constant_value
						: '';

			const dynamicVariable =
				typeof item.dynamicVariable === 'string'
					? item.dynamicVariable
					: typeof item.dynamic_variable === 'string'
						? item.dynamic_variable
						: '';

			const isSystemProvided =
				typeof item.isSystemProvided === 'boolean'
					? item.isSystemProvided
					: typeof item.is_system_provided === 'boolean'
						? item.is_system_provided
						: false;

			const isSystemDefault =
				typeof item.isSystemDefault === 'boolean'
					? item.isSystemDefault
					: false;

			return {
				id: crypto.randomUUID(),
				identifier,
				type: normalizedType,
				description:
					typeof item.description === 'string' ? item.description : '',
				enum: Array.isArray(item.enum)
					? item.enum.filter(
							(entry): entry is string => typeof entry === 'string'
						)
					: [],
				constantValue,
				dynamicVariable,
				isSystemProvided,
				isSystemDefault,
				isNew: false,
				source: 'manual',
			};
		}
	);
};

export const mapRowsToDataCollection = (
	rows: AnalyticsDataCollectionRow[]
): Record<string, DataCollectionItem> => {
	return rows.reduce<Record<string, DataCollectionItem>>((acc, row) => {
		const trimmedIdentifier = row.identifier.trim();
		if (!trimmedIdentifier) {
			return acc;
		}

		const item: DataCollectionItem = {
			type: row.type,
			description: row.description,
			constantValue: row.constantValue ?? '',
			dynamicVariable: row.dynamicVariable ?? '',
			isSystemProvided: row.isSystemProvided ?? false,
		};

		// Only include enum for string type; ElevenLabs returns 400 for other types
		if (row.type === 'string') {
			item.enum = Array.isArray(row.enum)
				? row.enum.filter((entry) => entry.trim().length > 0)
				: [];
		}

		acc[trimmedIdentifier] = item;

		return acc;
	}, {});
};
