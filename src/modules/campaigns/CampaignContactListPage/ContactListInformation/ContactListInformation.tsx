import { Fragment, useMemo } from 'react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import type ContactGroup from '~/models/ContactGroup';
import classes from './ContactListInformation.module.css';
import { formatWaveDateTime, formatWaveDelaySeconds } from '~/utils/waveUtils';
import ContactListActions from '../ContactListActions';

interface ContactListInformationProps {
	contactGroup: ContactGroup;
	campaignId: number;
	onReload: () => void | Promise<unknown>;
}

export const ContactListInformation = ({
	contactGroup,
	campaignId,
	onReload,
}: ContactListInformationProps) => {
	const { t, i18n } = useTranslation(['campaign.contact-list', 'common']);

	type StatusKey =
		| 'PENDING'
		| 'RUNNING'
		| 'WAITING'
		| 'PAUSED'
		| 'EXECUTED'
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
			label: t('status.pending'),
			description: t('status.pendingDesc'),
			accentClass: 'statusPending',
			StatusIcon: IconAlertTriangle,
		},
		RUNNING: {
			label: t('status.running'),
			description: t('status.runningDesc'),
			accentClass: 'statusRunning',
			StatusIcon: IconCircleCheck,
		},
		WAITING: {
			label: t('status.waiting'),
			description: t('status.waitingDesc'),
			accentClass: 'statusWaiting',
			StatusIcon: IconAlertTriangle,
		},
		PAUSED: {
			label: t('status.paused'),
			description: t('status.pausedDesc'),
			accentClass: 'statusPaused',
			StatusIcon: IconAlertTriangle,
		},
		COMPLETED: {
			label: t('status.complete'),
			description: t('status.completeDesc'),
			accentClass: 'statusComplete',
			StatusIcon: IconCircleCheck,
		},
		FAILED: {
			label: t('status.failed'),
			description: t('status.failedDesc'),
			accentClass: 'statusFailed',
			StatusIcon: IconAlertTriangle,
		},
		EXECUTED: {
			label: t('status.executed'),
			description: t('contacts.details.messages.allWavesDone'),
			accentClass: 'statusComplete',
			StatusIcon: IconAlertTriangle,
		},
		UNKNOWN: {
			label: t('status.unknown'),
			description: t('status.unknownDesc'),
			accentClass: 'statusUnknown',
			StatusIcon: IconAlertTriangle,
		},
	};

	const statusKey =
		(contactGroup.queueStatus?.toUpperCase() as StatusKey) ?? 'UNKNOWN';
	const status = statusConfig[statusKey] ?? statusConfig.UNKNOWN;

	const quickMetrics = useMemo(
		() => [
			{
				label: t('summary.compact.contacts'),
				value: (contactGroup.contactCount || 0).toLocaleString(),
				emphasized: false,
			},
			{
				label: t('summary.compact.maxCallsPerContact'),
				value:
					contactGroup.maxCallsPerContact?.toLocaleString() ??
					t('summary.notSet'),
			},
			{
				label: t('summary.compact.waves'),
				value:
					contactGroup.maxWaves && contactGroup.maxWaves > 0
						? `${Math.max(contactGroup.currentWave ?? 1, 1)} / ${
								contactGroup.maxWaves
							}`
						: t('summary.notSet'),
			},
			{
				label: t('summary.compact.humanEquivalent'),
				value: Math.round(contactGroup.humanEquivalent).toLocaleString(),
			},
			{
				label: t('summary.compact.expirationDate'),
				value: contactGroup.expirationDate
					? new Date(contactGroup.expirationDate).toLocaleDateString()
					: t('summary.notSet'),
			},
		],
		[
			contactGroup.contactCount,
			contactGroup.maxCallsPerContact,
			contactGroup.maxWaves,
			contactGroup.currentWave,
			contactGroup.humanEquivalent,
			contactGroup.expirationDate,
			t,
		]
	);

	const scheduleMetrics = useMemo(
		() => [
			{
				label: t('summary.compact.delayBetweenWaves'),
				value: formatWaveDelaySeconds(contactGroup.waveExecutionDelaySeconds, {
					day: t('units.day', { ns: 'common' }),
					hour: t('units.hour', { ns: 'common' }),
					minute: t('units.minute', { ns: 'common' }),
					second: t('units.second', { ns: 'common' }),
					noDelay: t('summary.noDelayBetweenWaves'),
					notSet: t('summary.notSet'),
				}),
			},
			{
				label: t('summary.compact.lastWaveStarted'),
				value: formatWaveDateTime(
					contactGroup.lastWaveStartedAt,
					i18n.language,
					t('summary.notSet')
				),
			},
			{
				label: t('summary.compact.lastWaveCompleted'),
				value: formatWaveDateTime(
					contactGroup.lastWaveCompletedAt,
					i18n.language,
					t('summary.notSet')
				),
			},
			{
				label: t('summary.compact.nextWaveScheduled'),
				value: formatWaveDateTime(
					contactGroup.nextWaveScheduledAt,
					i18n.language,
					t('summary.notSet')
				),
			},
		],
		[
			contactGroup.waveExecutionDelaySeconds,
			contactGroup.lastWaveStartedAt,
			contactGroup.lastWaveCompletedAt,
			contactGroup.nextWaveScheduledAt,
			i18n.language,
			t,
		]
	);

	const StatusIcon = status.StatusIcon;

	return (
		<section className={classes.root}>
			<div className={classes.headerRow}>
				<div className={classes.statusStrip}>
					<div
						className={`${classes.statusBadge} ${classes[status.accentClass]}`}
					>
						<StatusIcon size={14} strokeWidth={2.4} />
						<Text size='xs' fw={700} className={classes.statusLabel}>
							{status.label}
						</Text>
					</div>
					<Text
						size='sm'
						c='dimmed'
						className={classes.statusDescription}
						title={status.description}
					>
						{status.description}
					</Text>
				</div>
			</div>

			<ContactListActions
				contactGroup={contactGroup}
				campaignId={campaignId}
				onActionComplete={onReload}
			/>

			<div className={classes.statsStrip}>
				{quickMetrics.map((metric) => (
					<div
						key={metric.label}
						title={metric.value}
						className={`${classes.statCell} ${
							metric.emphasized ? classes.statCellEmphasized : ''
						}`}
					>
						<span className={classes.statValue}>{metric.value}</span>
						<span className={classes.statLabel}>{metric.label}</span>
					</div>
				))}
			</div>

			<div className={classes.scheduleRow}>
				{scheduleMetrics.map((metric, i) => (
					<Fragment key={metric.label}>
						{i > 0 && (
							<span aria-hidden='true' className={classes.separator}>
								·
							</span>
						)}
						<div className={classes.scheduleItem}>
							<span className={classes.scheduleLabel}>{metric.label}:</span>
							<span className={classes.scheduleValue}>{metric.value}</span>
						</div>
					</Fragment>
				))}
			</div>
		</section>
	);
};

export default ContactListInformation;
