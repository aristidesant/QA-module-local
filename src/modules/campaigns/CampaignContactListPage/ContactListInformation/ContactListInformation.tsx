import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconAlertTriangle,
	IconCircleCheck,
	IconDownload,
	IconRefresh,
	IconRepeat,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import type ContactGroup from '~/models/ContactGroup';
import { MetricInfoCard } from '~/components/MetricInfoCard';
import classes from './ContactListInformation.module.css';
import {
	useCompleteContactGroup,
	useExtendContactGroupWaves,
} from '~/queries/contactGroupQueries';
import { useExportCallResultsCsv } from '~/queries/conversationsQueries';
import { downloadBlob } from '~/utils/fileUtils';
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
	const { t } = useTranslation('campaign.contact-list');
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

	const metrics = [
		{
			label: t('summary.contacts'),
			value: contactGroup.contactCount || 0,
		},
		{
			label: t('summary.maxCallsPerContact'),
			value: contactGroup.maxCallsPerContact,
		},
		{
			label: t('summary.waves'),
			value:
				contactGroup.maxWaves && contactGroup.maxWaves > 0
					? `${Math.max(contactGroup.currentWave ?? 1, 1)} / ${
							contactGroup.maxWaves
						}`
					: t('summary.notSet'),
		},

		{
			label: t('summary.humanEquivalent'),
			value: Math.round(contactGroup.humanEquivalent),
		},
		{
			label: t('summary.expirationDate'),
			value: contactGroup.expirationDate
				? new Date(contactGroup.expirationDate).toLocaleDateString()
				: t('summary.notSet'),
		},
	];

	const StatusIcon = status.StatusIcon;

	const handleExtendWaves = () => {
		if (statusKey !== 'EXECUTED') return;

		modals.open({
			title: t('contacts.details.actions.extendWaves'),
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
								title: t('contacts.details.notifications.wavesExtended.title'),
								message: t(
									'contacts.details.notifications.wavesExtended.message',
									{ count: wavesToAdd }
								),
								color: 'green',
							});
							onReload();
							modals.closeAll();
						} catch (error) {
							notifications.show({
								title: t('actions.error'),
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
			title: t('contacts.details.actions.completeList'),
			children: <Text size='sm'>{t('status.confirmCompleteList')}</Text>,
			labels: {
				confirm: t('contacts.details.confirm.complete'),
				cancel: t('contacts.details.confirm.cancel'),
			},
			confirmProps: { color: 'green', loading: completeMutation.isPending },
			onConfirm: async () => {
				try {
					await completeMutation.mutateAsync(contactGroup.id);
					notifications.show({
						title: t('contacts.details.notifications.completed.title'),
						message: t('contacts.details.notifications.completed.message'),
						color: 'green',
					});
					onReload();
				} catch (error) {
					notifications.show({
						title: t('actions.error'),
						message: getErrorMessage(error),
						color: 'red',
					});
				}
			},
		});
	};

	const exportMutation = useExportCallResultsCsv();

	const handleDownloadResults = async () => {
		try {
			const { blob, filename } = await exportMutation.mutateAsync(
				contactGroup.id
			);
			downloadBlob(blob, filename);
			notifications.show({
				title: t('actions.success'),
				message: t('contactsTable.notifications.exportSuccessMessage'),
				color: 'green',
			});
		} catch (error) {
			notifications.show({
				title: t('actions.error'),
				message: getErrorMessage(error),
				color: 'red',
			});
		}
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
					<Tooltip
						label={t('contacts.details.actions.downloadResults')}
						withArrow
						position='left'
					>
						<ActionIcon
							variant='light'
							color='blue'
							size='sm'
							aria-label={t('contacts.details.actions.downloadResults')}
							onClick={handleDownloadResults}
							loading={exportMutation.isPending}
							disabled={isActionLoading}
						>
							<IconDownload size={16} strokeWidth={2} />
						</ActionIcon>
					</Tooltip>
					{statusKey === 'EXECUTED' && (
						<>
							<Tooltip
								label={t('contacts.details.actions.extendWaves')}
								withArrow
								position='left'
							>
								<ActionIcon
									variant='light'
									color='blue'
									size='sm'
									aria-label={t('contacts.details.actions.extendWaves')}
									onClick={handleExtendWaves}
									loading={extendMutation.isPending}
									disabled={isActionLoading}
								>
									<IconRepeat size={16} strokeWidth={2} />
								</ActionIcon>
							</Tooltip>
							<Tooltip
								label={t('contacts.details.actions.completeList')}
								withArrow
								position='left'
							>
								<ActionIcon
									variant='light'
									color='green'
									size='sm'
									aria-label={t('contacts.details.actions.completeList')}
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
						label={t('contacts.tooltips.reload')}
						withArrow
						position='left'
					>
						<ActionIcon
							variant='light'
							color='gray'
							size='sm'
							aria-label={t('contacts.tooltips.reload')}
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
