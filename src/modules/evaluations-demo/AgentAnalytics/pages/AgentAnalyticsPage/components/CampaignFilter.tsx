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
	return (
		<Stack gap='sm'>
			<Text fw={600} size='sm'>
				Filter by Campaign
			</Text>
			<MultiSelect
				placeholder='Select campaigns or select All'
				data={availableCampaigns.map((campaign) => ({
					value: campaign,
					label: campaign,
				}))}
				value={selectedCampaigns}
				onChange={onCampaignsChange}
				searchable
				clearable
			/>
		</Stack>
	);
};

export default CampaignFilter;
