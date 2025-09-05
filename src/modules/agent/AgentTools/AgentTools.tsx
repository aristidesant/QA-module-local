import { Stack, Switch } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import SectionCard from '~/components/SectionCard';
import { useToolCategories } from '~/queries/toolCategoryQueries';
import { useToolsByCategory, useAssignedTools } from '~/queries/toolQueries';

type AgentToolsProps = {
	agentId?: string;
	onAgentUpdated?: (details: { toolIds: string[] }) => void;
};

/**
 * AgentTools Component
 *
 * This component allows users to select tools for an agent but doesn't immediately
 * assign/unassign them. Instead, it builds a local array of selected tool IDs and
 * passes them to the parent via onAgentUpdated.
 */
const AgentTools: React.FC<AgentToolsProps> = ({ agentId, onAgentUpdated }) => {
	const { data: toolCategories } = useToolCategories();
	const { data: tools } = useToolsByCategory(
		toolCategories?.find((cat) => cat.name === 'webhook')?.id
	);
	const { data: assignedTools } = useAssignedTools(agentId);

	// Local state to track selected tool identifiers
	const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);

	// Initialize selected tools from assigned tools when data loads
	useEffect(() => {
		if (assignedTools) {
			const assignedToolIds = assignedTools.map(
				(assignedTool) => assignedTool.tool.identifier
			);
			setSelectedToolIds(assignedToolIds);
		}
	}, [assignedTools]);

	// Notify parent whenever selectedToolIds changes
	useEffect(() => {
		if (onAgentUpdated && selectedToolIds.length >= 0) {
			onAgentUpdated({
				toolIds: selectedToolIds,
			});
		}
	}, [selectedToolIds, onAgentUpdated]);

	const handleToolToggle = useCallback(
		(toolIdentifier: string, isCurrentlySelected: boolean) => {
			setSelectedToolIds((prev) => {
				if (isCurrentlySelected) {
					// Remove from selection
					return prev.filter((id) => id !== toolIdentifier);
				} else {
					// Add to selection
					return [...prev, toolIdentifier];
				}
			});
		},
		[]
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

export default AgentTools;
