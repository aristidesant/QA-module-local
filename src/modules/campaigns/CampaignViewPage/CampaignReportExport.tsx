import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Button,
	Group,
	Modal,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
	IconDownload,
	IconFileSpreadsheet,
	IconFileTypeCsv,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import reportValuesApi from '~/api/reportValuesApi';
import { getErrorMessage } from '~/utils/httpClient';
import styles from './CampaignReportExport.module.css';

type ReportExportFormat = 'csv' | 'xlsx';

interface CampaignReportExportProps {
	campaignId: number;
}

const CampaignReportExport = ({ campaignId }: CampaignReportExportProps) => {
	const { t } = useTranslation('campaign.view');
	const [opened, setOpened] = useState(false);
	const [startDate, setStartDate] = useState<string | null>(null);
	const [endDate, setEndDate] = useState<string | null>(null);
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async (format: ReportExportFormat) => {
		if (!startDate || !endDate) {
			notifications.show({
				message: t('reportExport.datesRequired'),
				color: 'yellow',
			});
			return;
		}

		setIsExporting(true);
		try {
			const api = reportValuesApi();
			const response = await api.exportCampaignReport(
				campaignId,
				new Date(startDate).toISOString(),
				new Date(endDate).toISOString(),
				format
			);

			if (response.status === 204) {
				notifications.show({
					message: t('reportExport.noData'),
					color: 'yellow',
				});
				return;
			}

			if (response.status === 404) {
				notifications.show({
					message: t('reportExport.noColumns'),
					color: 'red',
				});
				return;
			}

			if (response.status !== 200) {
				notifications.show({
					message: t('reportExport.error'),
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
			setOpened(false);
		} catch (error) {
			notifications.show({
				message: getErrorMessage(error),
				color: 'red',
			});
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<>
			<Tooltip label={t('reportExport.actionLabel')} withArrow>
				<ActionIcon
					variant='light'
					size='lg'
					aria-label={t('reportExport.actionLabel')}
					onClick={() => setOpened(true)}
				>
					<IconDownload size={18} />
				</ActionIcon>
			</Tooltip>

			<Modal
				opened={opened}
				onClose={() => setOpened(false)}
				title={t('reportExport.modalTitle')}
				centered
				size='md'
			>
				<Stack gap='sm'>
					<Text size='sm' c='dimmed'>
						{t('reportExport.modalDescription')}
					</Text>
					<div className={styles.field}>
						<Text size='xs' c='dimmed' mb={4}>
							{t('reportExport.startDate')}
						</Text>
						<DateInput
							placeholder={t('reportExport.startDate')}
							value={startDate}
							onChange={setStartDate}
							size='sm'
							clearable
							maxDate={endDate ? new Date(endDate) : undefined}
							className={styles.dateInput}
						/>
					</div>
					<div className={styles.field}>
						<Text size='xs' c='dimmed' mb={4}>
							{t('reportExport.endDate')}
						</Text>
						<DateInput
							placeholder={t('reportExport.endDate')}
							value={endDate}
							onChange={setEndDate}
							size='sm'
							clearable
							minDate={startDate ? new Date(startDate) : undefined}
							className={styles.dateInput}
						/>
					</div>
					<Group justify='flex-end' gap='xs' className={styles.actions}>
						<Button
							size='sm'
							variant='default'
							leftSection={<IconFileTypeCsv size={16} />}
							onClick={() => void handleExport('csv')}
							loading={isExporting}
							disabled={isExporting}
						>
							{t('reportExport.exportCsv')}
						</Button>
						<Button
							size='sm'
							leftSection={<IconFileSpreadsheet size={16} />}
							onClick={() => void handleExport('xlsx')}
							loading={isExporting}
							disabled={isExporting}
						>
							{t('reportExport.exportXlsx')}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
};

export default CampaignReportExport;
