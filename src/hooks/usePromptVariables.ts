import { useMemo } from 'react';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useGetSchemaByObjectiveId } from '~/queries/campaignContactSchemasQueries';
import { useGetClientConfig } from '~/queries/clientConfigQueries';

export type PromptVariable = {
	name: string;
	description?: string;
	source: 'schema' | 'system';
};

export const usePromptVariables = (campaignId: number) => {
	const { data: campaign } = useGetCampaign(String(campaignId));

	const objectiveId = campaign?.objectiveId;

	const { data: schemaResponse } = useGetSchemaByObjectiveId(
		objectiveId!,
		!!objectiveId
	);

	const { data: contactColumnsConfig } = useGetClientConfig('contact_columns');

	const dynamicVariables = useMemo<PromptVariable[]>(() => {
		if (!schemaResponse?.data || schemaResponse.data.length === 0) return [];

		// Flatten fields from all schemas found for the objective
		const fields = schemaResponse.data.flatMap(
			(schema) => schema.schemaFields || []
		);

		return fields.map((field) => ({
			name: field.name,
			description: field.description || field.label,
			source: 'schema' as const,
		}));
	}, [schemaResponse]);

	const systemVariables = useMemo<PromptVariable[]>(() => {
		if (!contactColumnsConfig?.value) return [];
		try {
			const parsed = JSON.parse(contactColumnsConfig.value) as Array<{
				name: string;
				label?: string;
				description?: string;
			}>;
			return parsed.map((column) => ({
				name: column.name,
				description: column.label || column.description,
				source: 'system' as const,
			}));
		} catch (error) {
			void error;
			return [];
		}
	}, [contactColumnsConfig]);

	const allVariables = useMemo(
		() => [...systemVariables, ...dynamicVariables],
		[dynamicVariables, systemVariables]
	);

	return allVariables;
};
