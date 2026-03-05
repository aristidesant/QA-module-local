import { useState } from 'react';
import { ActionIcon, Button, Group, Menu, Text, Tooltip } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import {
	IconAlertTriangle,
	IconChevronDown,
	IconCircleCheck,
	IconDownload,
	IconFileSpreadsheet,
	IconFileTypeCsv,
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
import reportValuesApi from '~/api/reportValuesApi';
import { getErrorMessage } from '~/utils/httpClient';
import ExtendWavesModal from '~/modules/campaigns/components/ExtendWavesModal';

type ReportExportFormat = 'csv' | 'xlsx';

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
	const { t } = useTranslation('campaign.contact-list');
	const extendMutation = useExtendContactGroupWaves();
	const completeMutation = useCompleteContactGroup();
	const isActionLoading =
		extendMutation.isPending || completeMutation.isPending;

	const [isExportingGroup, setIsExportingGroup] = useState(false);
	const [isExportingCampaign, setIsExportingCampaign] = useState(false);
	const [campaignStartDate, setCampaignStartDate] = useState<string | null>(
		null
	);
	const [campaignEndDate, setCampaignEndDate] = useState<string | null>(null);

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

	const handleExportGroup = async (format: ReportExportFormat) => {
		setIsExportingGroup(true);
		try {
			const api = reportValuesApi();
			const response = await api.exportReport(contactGroup.id, format);

			if (response.status === 204) {
				notifications.show({
					message: t('reportValues.noDataToExport'),
					color: 'yellow',
				});
				return;
			}

			if (response.status !== 200) {
				notifications.show({
					message: t('reportValues.exportError'),
					color: 'red',
				});
				return;
			}

			const mimeType =
				format === 'xlsx'
					? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					: 'text/csv';
			const blob = new Blob([response.data as BlobPart], { type: mimeType });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `report-${contactGroup.id}.${format}`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			notifications.show({
				message: getErrorMessage(error),
				color: 'red',
			});
		} finally {
			setIsExportingGroup(false);
		}
	};

	const handleExportCampaign = async (format: ReportExportFormat) => {
		if (!campaignStartDate || !campaignEndDate) {
			notifications.show({
				message: t('exportCampaign.datesRequired'),
				color: 'yellow',
			});
			return;
		}

		setIsExportingCampaign(true);
		try {
			const api = reportValuesApi();
			const response = await api.exportCampaignReport(
				campaignId,
				new Date(campaignStartDate).toISOString(),
				new Date(campaignEndDate).toISOString(),
				format
			);

			if (response.status === 204) {
				notifications.show({
					message: t('exportCampaign.noData'),
					color: 'yellow',
				});
				return;
			}

			if (response.status === 404) {
				notifications.show({
					message: t('exportCampaign.noColumns'),
					color: 'red',
				});
				return;
			}

			if (response.status !== 200) {
				notifications.show({
					message: t('reportValues.exportError'),
					color: 'red',
				});
				return;
			}

			const mimeType =
				format === 'xlsx'
					? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					: 'text/csv';
			const blob = new Blob([response.data as BlobPart], { type: mimeType });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `campaign-report-${campaignId}.${format}`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			notifications.show({
				message: getErrorMessage(error),
				color: 'red',
			});
		} finally {
			setIsExportingCampaign(false);
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
					<Menu shadow='md' width={160} position='bottom-end' withArrow>
						<Menu.Target>
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
									loading={isExportingGroup}
									disabled={isActionLoading || isExportingGroup}
								>
									<IconDownload size={16} strokeWidth={2} />
								</ActionIcon>
							</Tooltip>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>{t('reportValues.exportFormatLabel')}</Menu.Label>
							<Menu.Item
								leftSection={<IconFileTypeCsv size={14} />}
								onClick={() => void handleExportGroup('csv')}
								disabled={isExportingGroup}
							>
								{t('reportValues.exportFormatCsv')}
							</Menu.Item>
							<Menu.Item
								leftSection={<IconFileSpreadsheet size={14} />}
								onClick={() => void handleExportGroup('xlsx')}
								disabled={isExportingGroup}
							>
								{t('reportValues.exportFormatXlsx')}
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
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

			<div className={classes.divider} />

			<Group align='flex-end' gap='sm' wrap='wrap'>
				<Text size='xs' fw={600} c='dimmed' style={{ alignSelf: 'center' }}>
					{t('exportCampaign.title')}
				</Text>
				<DateInput
					placeholder={t('exportCampaign.startDate')}
					value={campaignStartDate}
					onChange={setCampaignStartDate}
					size='xs'
					clearable
					maxDate={campaignEndDate ? new Date(campaignEndDate) : undefined}
					style={{ width: 150 }}
				/>
				<DateInput
					placeholder={t('exportCampaign.endDate')}
					value={campaignEndDate}
					onChange={setCampaignEndDate}
					size='xs'
					clearable
					minDate={campaignStartDate ? new Date(campaignStartDate) : undefined}
					style={{ width: 150 }}
				/>
				<Menu shadow='md' width={160} position='bottom-end' withArrow>
					<Menu.Target>
						<Button
							leftSection={<IconDownload size={14} />}
							rightSection={<IconChevronDown size={12} />}
							variant='light'
							size='xs'
							loading={isExportingCampaign}
							disabled={isExportingCampaign}
						>
							{t('exportCampaign.export')}
						</Button>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>{t('reportValues.exportFormatLabel')}</Menu.Label>
						<Menu.Item
							leftSection={<IconFileTypeCsv size={14} />}
							onClick={() => void handleExportCampaign('csv')}
							disabled={isExportingCampaign}
						>
							{t('reportValues.exportFormatCsv')}
						</Menu.Item>
						<Menu.Item
							leftSection={<IconFileSpreadsheet size={14} />}
							onClick={() => void handleExportCampaign('xlsx')}
							disabled={isExportingCampaign}
						>
							{t('reportValues.exportFormatXlsx')}
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		</section>
	);
};

export default ContactListInformation;
