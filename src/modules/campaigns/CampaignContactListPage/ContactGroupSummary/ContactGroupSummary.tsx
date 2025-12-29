import { useMemo } from 'react';
import { Badge, Divider, Stack, Text, SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation('campaign.contact-list');
	const statusConfig = useMemo(
		() => getQueueStatusConfig(contactGroup.queueStatus),
		[contactGroup.queueStatus]
	);

	const metrics = useMemo(
		() => [
			{
				label: t('summary.contacts'),
				value: contactGroup.contactCount?.toLocaleString() ?? 'N/A',
			},
			{
				label: t('summary.maxCallsPerContact'),
				value: contactGroup.maxCallsPerContact ?? 'N/A',
			},
			{
				label: t('summary.maxCallsPerList'),
				value: contactGroup.maxCallsPerList ?? 'N/A',
			},
			{
				label: t('summary.humanEquivalent'),
				value: contactGroup.humanEquivalent ?? 'N/A',
			},
			{
				label: t('summary.waves'),
				value:
					contactGroup.maxWaves && contactGroup.maxWaves > 0
						? `${contactGroup.currentWave ?? 1} / ${contactGroup.maxWaves}`
						: t('summary.notSet'),
			},
		],
		[
			contactGroup.contactCount,
			contactGroup.maxCallsPerContact,
			contactGroup.maxCallsPerList,
			contactGroup.humanEquivalent,
			contactGroup.currentWave,
			contactGroup.maxWaves,
			t,
		]
	);

	return (
		<Stack gap='md' className={styles.root}>
			<RightSectionCard
				title={t('summary.details')}
				description={t('summary.metadata')}
				icon={IconInfoCircle}
				rightSection={
					<div className={styles.headerBadges}>
						<Badge
							variant='light'
							color={contactGroup.isActive ? 'blue' : 'gray'}
							size='sm'
							className={styles.badge}
						>
							{contactGroup.isActive
								? t('summary.active')
								: t('summary.inactive')}
						</Badge>
						<Badge
							variant='light'
							color={statusConfig.color}
							size='sm'
							className={styles.badge}
						>
							{t(statusConfig.label)}
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
							{contactGroup.description?.trim() || t('summary.noDescription')}
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
							{t('summary.campaign')}
						</Text>
						<Text size='sm'>
							{contactGroup.campaignId ? `#${contactGroup.campaignId}` : '-'}
						</Text>
					</div>
					<div>
						<Text size='xs' c='dimmed'>
							{t('summary.schedule')}
						</Text>
						<Text size='sm'>
							{contactGroup.scheduleId
								? `#${contactGroup.scheduleId}`
								: t('summary.notSet')}
						</Text>
					</div>
					<div>
						<Text size='xs' c='dimmed'>
							{t('summary.expirationDate')}
						</Text>
						<Text size='sm'>
							{contactGroup.expirationDate
								? formatExpirationDate(contactGroup.expirationDate)
								: t('summary.noExpiration')}
						</Text>
					</div>
					{/* removed source field; model doesn't have source */}
				</SimpleGrid>
			</RightSectionCard>
			<RightSectionCard
				title={t('summary.metrics')}
				description={t('summary.performanceMetrics')}
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
