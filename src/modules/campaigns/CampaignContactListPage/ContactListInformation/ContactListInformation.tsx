import { ActionIcon, Text, Tooltip } from '@mantine/core';
import {
	IconAlertTriangle,
	IconCircleCheck,
	IconRefresh,
} from '@tabler/icons-react';
import type ContactGroup from '~/models/ContactGroup';
import { MetricInfoCard } from '~/modules/campaigns/CampaignLiveMetricPage/components/MetricInfoCard/MetricInfoCard';
import classes from './ContactListInformation.module.css';

interface ContactListInformationProps {
	contactGroup: ContactGroup;
	onReload: () => void | Promise<unknown>;
}

export const ContactListInformation = ({
	contactGroup,
	onReload,
}: ContactListInformationProps) => {
	type StatusKey =
		| 'PENDING'
		| 'RUNNING'
		| 'PAUSED'
		| 'COMPLETED'
		| 'FAILED'
		| 'UNKNOWN';

	const statusConfig: Record<
		StatusKey,
		{
			label: string;
			description: string;
			accentClass: string;
			StatusIcon: typeof IconCircleCheck;
		}
	> = {
		PENDING: {
			label: 'Pending',
			description: 'Waiting to start. Review settings before launching.',
			accentClass: 'statusPending',
			StatusIcon: IconAlertTriangle,
		},
		RUNNING: {
			label: 'Running',
			description: 'Contacts are currently being dialed.',
			accentClass: 'statusRunning',
			StatusIcon: IconCircleCheck,
		},
		PAUSED: {
			label: 'Paused',
			description: 'Processing halted. Resume when ready.',
			accentClass: 'statusPaused',
			StatusIcon: IconAlertTriangle,
		},
		COMPLETED: {
			label: 'Complete',
			description: 'All contacts processed for this list.',
			accentClass: 'statusComplete',
			StatusIcon: IconCircleCheck,
		},
		FAILED: {
			label: 'Failed',
			description: 'An error stopped the campaign. Try restarting.',
			accentClass: 'statusFailed',
			StatusIcon: IconAlertTriangle,
		},
		UNKNOWN: {
			label: 'Unknown',
			description: 'Status unavailable. Reload for the latest update.',
			accentClass: 'statusUnknown',
			StatusIcon: IconAlertTriangle,
		},
	};

	const statusKey =
		(contactGroup.queueStatus?.toUpperCase() as StatusKey) ?? 'UNKNOWN';
	const status = statusConfig[statusKey] ?? statusConfig.UNKNOWN;

	const metrics = [
		{
			label: 'Contacts',
			value: contactGroup.contactCount || 0,
		},
		{
			label: 'Max Calls / Contact',
			value: contactGroup.maxCallsPerContact,
		},

		{
			label: 'Human Equivalent',
			value: Math.round(contactGroup.humanEquivalent),
		},
		{
			label: 'Expiration',
			value: contactGroup.expirationDate
				? new Date(contactGroup.expirationDate).toLocaleDateString()
				: 'Not set',
		},
	];

	const StatusIcon = status.StatusIcon;

	return (
		<section className={classes.panel}>
			<div className={classes.header}>
				<div className={classes.statusSection}>
					<div
						className={`${classes.statusBadge} ${classes[status.accentClass]}`}
					>
						<StatusIcon size={14} strokeWidth={2.5} />
						<Text size='xs' fw={600} className={classes.statusLabel}>
							{status.label}
						</Text>
					</div>
					<Text size='xs' c='dimmed' className={classes.statusDescription}>
						{status.description}
					</Text>
				</div>
				<Tooltip label='Reload' withArrow position='left'>
					<ActionIcon
						variant='light'
						color='gray'
						size='sm'
						aria-label='Reload contact list'
						onClick={() => {
							void onReload();
						}}
					>
						<IconRefresh size={16} strokeWidth={2} />
					</ActionIcon>
				</Tooltip>
			</div>

			<div className={classes.divider} />

			<div className={classes.metricsGrid}>
				{metrics.map((metric) => (
					<MetricInfoCard
						key={metric.label}
						label={metric.label}
						value={
							typeof metric.value === 'number'
								? metric.value.toLocaleString()
								: metric.value
						}
					/>
				))}
			</div>
		</section>
	);
};

export default ContactListInformation;
