// CampaignConfigurationTools.tsx
import { Stack, Switch } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import SectionCard from '~/components/SectionCard';
import { useToolCategories } from '~/queries/toolCategoryQueries';
import { useToolsByCategory } from '~/queries/toolQueries';

/**
 * CampaignConfigurationTools Component
 *
 * This component allows users to select tools for the campaign agent.
 * Selected tools are stored in the campaign form's agentConfig.toolIds.
 */
const CampaignConfigurationTools: React.FC = () => {
	const form = useCampaignFormContext();
	const { data: toolCategories } = useToolCategories();
	const { data: tools } = useToolsByCategory(
		toolCategories?.find((cat) => cat.name === 'webhook')?.id
	);

	// Local state to track selected tool identifiers
	const [selectedToolIds, setSelectedToolIds] = useState<string[]>(
		(form.values.agentConfig as any)?.toolIds || []
	);

	// Sync with form when form values change
	useEffect(() => {
		setSelectedToolIds((form.values.agentConfig as any)?.toolIds || []);
	}, [(form.values.agentConfig as any)?.toolIds]);

	const handleToolToggle = useCallback(
		(toolIdentifier: string, isCurrentlySelected: boolean) => {
			const newSelectedToolIds = isCurrentlySelected
				? selectedToolIds.filter((id) => id !== toolIdentifier)
				: [...selectedToolIds, toolIdentifier];

			setSelectedToolIds(newSelectedToolIds);
			form.setFieldValue('agentConfig.toolIds', newSelectedToolIds);
		},
		[selectedToolIds, form]
	);

	const isToolSelected = useCallback(
		(toolIdentifier: string) => {
			return selectedToolIds.includes(toolIdentifier);
		},
		[selectedToolIds]
	);

	return (
		<SectionCard
			title='Agent Tools'
			description='Tools to enhance agent functionality'
		>
			<Stack>
				{tools?.map((tool) => {
					const isSelected = isToolSelected(tool.identifier);
					return (
						<Switch
							key={tool.identifier}
							label={tool.name}
							description={tool.description}
							checked={isSelected}
							onChange={() => {
								handleToolToggle(tool.identifier, isSelected);
							}}
						/>
					);
				})}
			</Stack>
		</SectionCard>
	);
};

export default CampaignConfigurationTools;
