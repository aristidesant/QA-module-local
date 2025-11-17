import { useMemo } from 'react';
import { Badge, Divider, Stack, Text, SimpleGrid } from '@mantine/core';
import { IconInfoCircle, IconChartBar } from '@tabler/icons-react';
import RightSectionCard from '~/components/RightSectionCard';
import styles from './ContactGroupSummary.module.css';
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
		<Stack gap='md' className={styles.root}>
			<RightSectionCard
				title='Details'
				description='Contact list metadata'
				icon={IconInfoCircle}
				rightSection={
					<div className={styles.headerBadges}>
						<Badge
							variant='light'
							color={contactGroup.isActive ? 'blue' : 'gray'}
							size='sm'
							className={styles.badge}
						>
							{contactGroup.isActive ? 'Active' : 'Inactive'}
						</Badge>
						<Badge
							variant='light'
							color={statusConfig.color}
							size='sm'
							className={styles.badge}
						>
							{statusConfig.label}
						</Badge>
					</div>
				}
			>
				<div className={styles.headerRow}>
					<div className={styles.headerMain}>
						<Text size='lg' className={styles.titleText} fw={700}>
							{contactGroup.name || '#' + contactGroup.id}
						</Text>
						<Text size='xs' c='dimmed' className={styles.smallText}>
							{contactGroup.description?.trim() || 'No description provided.'}
						</Text>
					</div>
					{/* status badges moved to header rightSection */}
				</div>
				<Divider className={styles.dividerTop} />
				<SimpleGrid
					cols={{ base: 1, sm: 2 }}
					spacing='sm'
					className={styles.metaGrid}
				>
					<div>
						<Text size='xs' c='dimmed'>
							Campaign
						</Text>
						<Text size='sm'>
							{contactGroup.campaignId ? `#${contactGroup.campaignId}` : '-'}
						</Text>
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
					{/* removed source field; model doesn't have source */}
				</SimpleGrid>
			</RightSectionCard>
			<RightSectionCard
				title='Metrics'
				description='Contact list performance metrics'
				icon={IconChartBar}
			>
				<div className={styles.metricsGrid}>
					{metrics.map((metric) => (
						<div key={metric.label} className={styles.metricItem}>
							<Text size='xs' c='dimmed' className={styles.metricLabel}>
								{metric.label}
							</Text>
							<Text size='sm' fw={700} className={styles.metricValue}>
								{metric.value}
							</Text>
						</div>
					))}
				</div>
			</RightSectionCard>
		</Stack>
	);
};

export default ContactGroupSummary;
