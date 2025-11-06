import { Fragment, useMemo } from 'react';
import { Badge, Divider, Group, Stack, Text } from '@mantine/core';
import { IconInfoCircle, IconChartBar } from '@tabler/icons-react';
import RightSectionCard from '~/components/RightSectionCard';
import type ContactGroup from '~/models/ContactGroup';
import { formatExpirationDate } from '~/utils/dateUtils';
import { getQueueStatusConfig } from '~/modules/campaigns/CampaignsForm/ContactSection/ContactList/queueStatusConfig';

export interface ContactGroupSummaryProps {
	contactGroup: ContactGroup;
}

const ContactGroupSummary = ({ contactGroup }: ContactGroupSummaryProps) => {
	const statusConfig = useMemo(
		() => getQueueStatusConfig(contactGroup.queueStatus),
		[contactGroup.queueStatus]
	);

	const metrics = useMemo(
		() => [
			{
				label: 'Contacts',
				value: contactGroup.contactCount?.toLocaleString() ?? 'N/A',
			},
			{
				label: 'Max calls per contact',
				value: contactGroup.maxCallsPerContact ?? 'N/A',
			},
			{
				label: 'Max calls per list',
				value: contactGroup.maxCallsPerList ?? 'N/A',
			},
			{
				label: 'Human equivalent',
				value: contactGroup.humanEquivalent ?? 'N/A',
			},
		],
		[
			contactGroup.contactCount,
			contactGroup.maxCallsPerContact,
			contactGroup.maxCallsPerList,
			contactGroup.humanEquivalent,
		]
	);

	return (
		<Stack gap='md'>
			<RightSectionCard
				title='Details'
				description='Contact list metadata'
				icon={IconInfoCircle}
			>
				<Stack gap='sm'>
					<div>
						<Text size='xs' c='dimmed'>
							Description
						</Text>
						<Text size='sm'>
							{contactGroup.description?.trim() || 'No description provided.'}
						</Text>
					</div>
					<Group gap='xs'>
						<Badge
							variant='light'
							color={contactGroup.isActive ? 'blue' : 'gray'}
							size='sm'
						>
							{contactGroup.isActive ? 'Active' : 'Inactive'}
						</Badge>
						<Badge variant='light' color={statusConfig.color} size='sm'>
							{statusConfig.label}
						</Badge>
					</Group>
					<div>
						<Text size='xs' c='dimmed'>
							Campaign
						</Text>
						<Text size='sm'>#{contactGroup.campaignId}</Text>
					</div>
					<div>
						<Text size='xs' c='dimmed'>
							Schedule
						</Text>
						<Text size='sm'>
							{contactGroup.scheduleId
								? `#${contactGroup.scheduleId}`
								: 'Not set'}
						</Text>
					</div>
					<div>
						<Text size='xs' c='dimmed'>
							Expiration date
						</Text>
						<Text size='sm'>
							{contactGroup.expirationDate
								? formatExpirationDate(contactGroup.expirationDate)
								: 'No expiration defined'}
						</Text>
					</div>
				</Stack>
			</RightSectionCard>
			<RightSectionCard
				title='Metrics'
				description='Contact list performance metrics'
				icon={IconChartBar}
			>
				<Stack gap='sm'>
					{metrics.map((metric, index) => (
						<Fragment key={metric.label}>
							{index > 0 && <Divider />}
							<Group justify='space-between'>
								<Text size='xs' c='dimmed'>
									{metric.label}
								</Text>
								<Text size='sm' fw={500}>
									{metric.value}
								</Text>
							</Group>
						</Fragment>
					))}
				</Stack>
			</RightSectionCard>
		</Stack>
	);
};

export default ContactGroupSummary;
