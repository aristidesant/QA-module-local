import React from 'react';
import { MultiSelect, Stack, Text } from '@mantine/core';

interface CampaignFilterProps {
	selectedCampaigns: string[];
	onCampaignsChange: (campaigns: string[]) => void;
	availableCampaigns: string[];
}

const CampaignFilter: React.FC<CampaignFilterProps> = ({
	selectedCampaigns,
	onCampaignsChange,
	availableCampaigns,
}) => {
	const handleChange = (values: string[]) => {
		// If "All" is selected, clear other selections
		if (values.includes('All')) {
			if (selectedCampaigns.includes('All')) {
				// Remove "All" and keep only specific campaigns
				onCampaignsChange(values.filter((v) => v !== 'All'));
			} else {
				// Select only "All"
				onCampaignsChange(['All']);
			}
		} else {
			onCampaignsChange(values);
		}
	};

	return (
		<Stack gap='sm'>
			<Text fw={600} size='sm'>
				Filter by Campaign
			</Text>
			<MultiSelect
				placeholder='Select campaigns or select All'
				data={[
					{ value: 'All', label: 'All' },
					...availableCampaigns.map((campaign) => ({
						value: campaign,
						label: campaign,
					})),
				]}
				value={selectedCampaigns}
				onChange={handleChange}
				searchable
				clearable
			/>
		</Stack>
	);
};

export default CampaignFilter;
