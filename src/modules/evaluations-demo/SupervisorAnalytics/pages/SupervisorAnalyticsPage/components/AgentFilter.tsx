import React from 'react';
import { MultiSelect, Stack, Text } from '@mantine/core';

interface AgentFilterProps {
	selectedAgents: string[];
	onAgentsChange: (agents: string[]) => void;
	availableAgents: string[];
}

const AgentFilter: React.FC<AgentFilterProps> = ({
	selectedAgents,
	onAgentsChange,
	availableAgents,
}) => {
	const handleChange = (values: string[]) => {
		// If "All" is selected, clear other selections
		if (values.includes('All')) {
			if (selectedAgents.includes('All')) {
				// Remove "All" and keep only specific agents
				onAgentsChange(values.filter((v) => v !== 'All'));
			} else {
				// Select only "All"
				onAgentsChange(['All']);
			}
		} else {
			onAgentsChange(values);
		}
	};

	return (
		<Stack gap='sm'>
			<Text fw={600} size='sm'>
				Filter by Team Member
			</Text>
			<MultiSelect
				placeholder='Select team members'
				data={[
					{ value: 'All', label: 'All' },
					...availableAgents.map((agent) => ({
						value: agent,
						label: agent,
					})),
				]}
				value={selectedAgents}
				onChange={handleChange}
				searchable
				clearable
			/>
		</Stack>
	);
};

export default AgentFilter;
