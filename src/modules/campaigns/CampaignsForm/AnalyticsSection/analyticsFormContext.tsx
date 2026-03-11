import { createFormContext } from '@mantine/form';

export type DataCollectionType = 'boolean' | 'integer' | 'number' | 'string';

export interface DataCollectionItem {
	type: DataCollectionType;
	description: string;
	enum?: string[];
	value_type?: string;
	constant_value?: string;
	dynamic_variable?: string;
	is_system_provided?: boolean;
}

export interface AnalyticsDataCollectionRow extends DataCollectionItem {
	id: string;
	identifier: string;
	isNew: boolean;
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
	const directDataCollection = normalizedAgentConfig.dataCollection;

	if (
		directDataCollection &&
		typeof directDataCollection === 'object' &&
		Object.keys(directDataCollection as Record<string, unknown>).length > 0
	) {
		return directDataCollection as Record<string, unknown>;
	}

	const platformSettings = normalizedAgentConfig.platformSettings;
	if (!platformSettings || typeof platformSettings !== 'object') {
		return (directDataCollection as Record<string, unknown>) ?? {};
	}

	const platformDataCollection = (platformSettings as Record<string, unknown>)
		.dataCollection;

	if (platformDataCollection && typeof platformDataCollection === 'object') {
		return platformDataCollection as Record<string, unknown>;
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
					? (value as Partial<DataCollectionItem>)
					: {};

			const type = item.type;
			const normalizedType: DataCollectionType =
				type === 'boolean' ||
				type === 'integer' ||
				type === 'number' ||
				type === 'string'
					? type
					: 'string';

			return {
				id: crypto.randomUUID(),
				identifier,
				type: normalizedType,
				description: item.description ?? '',
				enum: Array.isArray(item.enum)
					? item.enum.filter(
							(entry): entry is string => typeof entry === 'string'
						)
					: [],
				value_type: item.value_type,
				constant_value: item.constant_value,
				dynamic_variable: item.dynamic_variable,
				is_system_provided: item.is_system_provided,
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

		acc[trimmedIdentifier] = {
			type: row.type,
			description: row.description,
			enum:
				row.type === 'string' && Array.isArray(row.enum)
					? row.enum.filter((entry) => entry.trim().length > 0)
					: undefined,
			...(row.value_type !== undefined && { value_type: row.value_type }),
			...(row.constant_value !== undefined && {
				constant_value: row.constant_value,
			}),
			...(row.dynamic_variable !== undefined && {
				dynamic_variable: row.dynamic_variable,
			}),
			...(row.is_system_provided !== undefined && {
				is_system_provided: row.is_system_provided,
			}),
		};

		return acc;
	}, {});
};
