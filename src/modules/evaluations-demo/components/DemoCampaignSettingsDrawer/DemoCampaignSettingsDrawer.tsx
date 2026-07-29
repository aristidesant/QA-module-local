import React from 'react';
import { Badge, Divider, Stack, Text } from '@mantine/core';
import AppDrawer from '~/components/AppDrawer';
import type { DemoCampaign, DemoCampaignType } from '../../mockData';

interface DemoCampaignSettingsDrawerProps {
	campaign: DemoCampaign;
	opened: boolean;
	onClose: () => void;
}

const CAMPAIGN_TYPE_COLORS: Record<DemoCampaignType, string> = {
	Inbound: 'blue',
	Outbound: 'teal',
	Mixed: 'grape',
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
	label,
	children,
}) => (
	<Stack gap={4}>
		<Text size='xs' fw={600} tt='uppercase' c='dimmed'>
			{label}
		</Text>
		{children}
	</Stack>
);

const DemoCampaignSettingsDrawer: React.FC<DemoCampaignSettingsDrawerProps> = ({
	campaign,
	opened,
	onClose,
}) => {
	return (
		<AppDrawer opened={opened} onClose={onClose} title='Campaign Settings'>
			<Stack gap='md'>
				<Field label='Campaign Name'>
					<Text size='sm' fw={600}>
						{campaign.name}
					</Text>
				</Field>

				<Divider />

				<Field label='Campaign Type'>
					<Badge color={CAMPAIGN_TYPE_COLORS[campaign.campaignType]} variant='light'>
						{campaign.campaignType}
					</Badge>
				</Field>

				<Divider />

				<Field label='Campaign Source'>
					<Badge color='grape' variant='light'>
						{campaign.source}
					</Badge>
				</Field>

				<Divider />

				<Field label='Description'>
					<Text size='sm' c='dimmed'>
						{campaign.description}
					</Text>
				</Field>
			</Stack>
		</AppDrawer>
	);
};

export default DemoCampaignSettingsDrawer;
