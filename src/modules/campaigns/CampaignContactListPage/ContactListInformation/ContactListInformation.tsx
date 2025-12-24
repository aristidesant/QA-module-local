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
	const { t } = useTranslation('campaigns');
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
			label: t('contactListPage.status.pending'),
			description: t('contactListPage.status.pendingDesc'),
			accentClass: 'statusPending',
			StatusIcon: IconAlertTriangle,
		},
		RUNNING: {
			label: t('contactListPage.status.running'),
			description: t('contactListPage.status.runningDesc'),
			accentClass: 'statusRunning',
			StatusIcon: IconCircleCheck,
		},
		PAUSED: {
			label: t('contactListPage.status.paused'),
			description: t('contactListPage.status.pausedDesc'),
			accentClass: 'statusPaused',
			StatusIcon: IconAlertTriangle,
		},
		COMPLETED: {
			label: t('contactListPage.status.complete'),
			description: t('contactListPage.status.completeDesc'),
			accentClass: 'statusComplete',
			StatusIcon: IconCircleCheck,
		},
		FAILED: {
			label: t('contactListPage.status.failed'),
			description: t('contactListPage.status.failedDesc'),
			accentClass: 'statusFailed',
			StatusIcon: IconAlertTriangle,
		},
		EXECUTED: {
			label: t('contactListPage.status.executed'),
			description: t('form.contacts.details.messages.allWavesDone'),
			accentClass: 'statusComplete',
			StatusIcon: IconAlertTriangle,
		},
		UNKNOWN: {
			label: t('contactListPage.status.unknown'),
			description: t('contactListPage.status.unknownDesc'),
			accentClass: 'statusUnknown',
			StatusIcon: IconAlertTriangle,
		},
	};

	const statusKey =
		(contactGroup.queueStatus?.toUpperCase() as StatusKey) ?? 'UNKNOWN';
	const status = statusConfig[statusKey] ?? statusConfig.UNKNOWN;

	const metrics = [
		{
			label: t('contactListPage.summary.contacts'),
			value: contactGroup.contactCount || 0,
		},
		{
			label: t('contactListPage.summary.maxCallsPerContact'),
			value: contactGroup.maxCallsPerContact,
		},
		{
			label: t('contactListPage.summary.waves'),
			value:
				contactGroup.maxWaves && contactGroup.maxWaves > 0
					? `${Math.max(contactGroup.currentWave ?? 1, 1)} / ${
							contactGroup.maxWaves
						}`
					: t('contactListPage.summary.notSet'),
		},

		{
			label: t('contactListPage.summary.humanEquivalent'),
			value: Math.round(contactGroup.humanEquivalent),
		},
		{
			label: t('contactListPage.summary.expirationDate'),
			value: contactGroup.expirationDate
				? new Date(contactGroup.expirationDate).toLocaleDateString()
				: t('contactListPage.summary.notSet'),
		},
	];

	const StatusIcon = status.StatusIcon;

	const handleExtendWaves = () => {
		if (statusKey !== 'EXECUTED') return;

		modals.open({
			title: t('form.contacts.details.actions.extendWaves'),
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
									'form.contacts.details.notifications.wavesExtended.title'
								),
								message: t(
									'form.contacts.details.notifications.wavesExtended.message',
									{ count: wavesToAdd }
								),
								color: 'green',
							});
							onReload();
							modals.closeAll();
						} catch (error) {
							notifications.show({
								title: t('contactListPage.actions.error'),
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
			title: t('form.contacts.details.actions.completeList'),
			children: (
				<Text size='sm'>{t('contactListPage.status.confirmCompleteList')}</Text>
			),
			labels: {
				confirm: t('form.contacts.details.confirm.complete'),
				cancel: t('form.contacts.details.confirm.cancel'),
			},
			confirmProps: { color: 'green', loading: completeMutation.isPending },
			onConfirm: async () => {
				try {
					await completeMutation.mutateAsync(contactGroup.id);
					notifications.show({
						title: t('form.contacts.details.notifications.completed.title'),
						message: t('form.contacts.details.notifications.completed.message'),
						color: 'green',
					});
					onReload();
				} catch (error) {
					notifications.show({
						title: t('contactListPage.actions.error'),
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
								label={t('form.contacts.details.actions.extendWaves')}
								withArrow
								position='left'
							>
								<ActionIcon
									variant='light'
									color='blue'
									size='sm'
									aria-label={t('form.contacts.details.actions.extendWaves')}
									onClick={handleExtendWaves}
									loading={extendMutation.isPending}
									disabled={isActionLoading}
								>
									<IconRepeat size={16} strokeWidth={2} />
								</ActionIcon>
							</Tooltip>
							<Tooltip
								label={t('form.contacts.details.actions.completeList')}
								withArrow
								position='left'
							>
								<ActionIcon
									variant='light'
									color='green'
									size='sm'
									aria-label={t('form.contacts.details.actions.completeList')}
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
						label={t('form.contacts.tooltips.reload')}
						withArrow
						position='left'
					>
						<ActionIcon
							variant='light'
							color='gray'
							size='sm'
							aria-label={t('form.contacts.tooltips.reload')}
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
