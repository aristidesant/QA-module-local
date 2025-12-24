import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconAlertTriangle,
	IconCircleCheck,
	IconRefresh,
	IconRepeat,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import type ContactGroup from '~/models/ContactGroup';
import { MetricInfoCard } from '~/modules/campaigns/CampaignLiveMetricPage/components/MetricInfoCard/MetricInfoCard';
import classes from './ContactListInformation.module.css';
import {
	useCompleteContactGroup,
	useExtendContactGroupWaves,
} from '~/queries/contactGroupQueries';
import ExtendWavesModal from '~/modules/campaigns/components/ExtendWavesModal';
import { getErrorMessage } from '~/utils/httpClient';

interface ContactListInformationProps {
	contactGroup: ContactGroup;
	onReload: () => void | Promise<unknown>;
}

export const ContactListInformation = ({
	contactGroup,
	onReload,
}: ContactListInformationProps) => {
	const { t } = useTranslation();
	const extendMutation = useExtendContactGroupWaves();
	const completeMutation = useCompleteContactGroup();
	const isActionLoading =
		extendMutation.isPending || completeMutation.isPending;

	type StatusKey =
		| 'PENDING'
		| 'RUNNING'
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
		EXECUTED: {
			label: 'Executed',
			description: t('campaigns.form.contacts.details.messages.allWavesDone'),
			accentClass: 'statusComplete',
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
			label: 'Waves',
			value:
				contactGroup.maxWaves && contactGroup.maxWaves > 0
					? `${Math.max(contactGroup.currentWave ?? 1, 1)} / ${
							contactGroup.maxWaves
						}`
					: 'Not set',
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

	const handleExtendWaves = () => {
		if (statusKey !== 'EXECUTED') return;

		modals.open({
			title: t('campaigns.form.contacts.details.actions.extendWaves'),
			centered: true,
			withCloseButton: false,
			children: (
				<ExtendWavesModal
					onSubmit={async (wavesToAdd) => {
						try {
							await extendMutation.mutateAsync({
								id: contactGroup.id,
								additionalWaves: wavesToAdd,
							});
							notifications.show({
								title: t(
									'campaigns.form.contacts.details.notifications.wavesExtended.title'
								),
								message: t(
									'campaigns.form.contacts.details.notifications.wavesExtended.message',
									{ count: wavesToAdd }
								),
								color: 'green',
							});
							onReload();
							modals.closeAll();
						} catch (error) {
							notifications.show({
								title: 'Error',
								message: getErrorMessage(error),
								color: 'red',
							});
						}
					}}
					onCancel={() => modals.closeAll()}
					loading={extendMutation.isPending}
				/>
			),
		});
	};

	const handleCompleteList = () => {
		if (statusKey !== 'EXECUTED') return;

		modals.openConfirmModal({
			title: t('campaigns.form.contacts.details.actions.completeList'),
			children: (
				<Text size='sm'>
					Mark this contact list as completed? No additional waves will run.
				</Text>
			),
			labels: {
				confirm: t('campaigns.form.contacts.details.confirm.complete'),
				cancel: t('campaigns.form.contacts.details.confirm.cancel'),
			},
			confirmProps: { color: 'green', loading: completeMutation.isPending },
			onConfirm: async () => {
				try {
					await completeMutation.mutateAsync(contactGroup.id);
					notifications.show({
						title: t(
							'campaigns.form.contacts.details.notifications.completed.title'
						),
						message: t(
							'campaigns.form.contacts.details.notifications.completed.message'
						),
						color: 'green',
					});
					onReload();
				} catch (error) {
					notifications.show({
						title: 'Error',
						message: getErrorMessage(error),
						color: 'red',
					});
				}
			},
		});
	};

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
				<Group gap='xs'>
					{statusKey === 'EXECUTED' && (
						<>
							<Tooltip
								label={t('campaigns.form.contacts.details.actions.extendWaves')}
								withArrow
								position='left'
							>
								<ActionIcon
									variant='light'
									color='blue'
									size='sm'
									aria-label={t(
										'campaigns.form.contacts.details.actions.extendWaves'
									)}
									onClick={handleExtendWaves}
									loading={extendMutation.isPending}
									disabled={isActionLoading}
								>
									<IconRepeat size={16} strokeWidth={2} />
								</ActionIcon>
							</Tooltip>
							<Tooltip
								label={t(
									'campaigns.form.contacts.details.actions.completeList'
								)}
								withArrow
								position='left'
							>
								<ActionIcon
									variant='light'
									color='green'
									size='sm'
									aria-label={t(
										'campaigns.form.contacts.details.actions.completeList'
									)}
									onClick={handleCompleteList}
									loading={completeMutation.isPending}
									disabled={isActionLoading}
								>
									<IconCircleCheck size={16} strokeWidth={2} />
								</ActionIcon>
							</Tooltip>
						</>
					)}
					<Tooltip
						label={t('campaigns.form.contacts.tooltips.reload')}
						withArrow
						position='left'
					>
						<ActionIcon
							variant='light'
							color='gray'
							size='sm'
							aria-label={t('campaigns.form.contacts.tooltips.reload')}
							onClick={() => {
								void onReload();
							}}
						>
							<IconRefresh size={16} strokeWidth={2} />
						</ActionIcon>
					</Tooltip>
				</Group>
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
