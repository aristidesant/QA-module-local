import React from 'react';
import { MultiSelect, Stack, Text } from '@mantine/core';

interface DisputeFilterProps {
	selectedDisputes: string[];
	onDisputesChange: (disputes: string[]) => void;
}

const DISPUTE_OPTIONS = ['All', 'Open', 'Resolved', 'Pending Review'];

const DisputeFilter: React.FC<DisputeFilterProps> = ({
	selectedDisputes,
	onDisputesChange,
}) => {
	return (
		<Stack gap='sm'>
			<Text fw={600} size='sm'>
				Filter by Dispute
			</Text>
			<MultiSelect
				placeholder='Select dispute status'
				data={DISPUTE_OPTIONS.map((option) => ({
					value: option,
					label: option,
				}))}
				value={selectedDisputes}
				onChange={onDisputesChange}
				searchable
				clearable
			/>
		</Stack>
	);
};

export default DisputeFilter;
