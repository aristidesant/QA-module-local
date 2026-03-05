import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Menu, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
	IconChevronDown,
	IconDownload,
	IconFileSpreadsheet,
	IconFileTypeCsv,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import reportValuesApi from '~/api/reportValuesApi';
import { getErrorMessage } from '~/utils/httpClient';
import SectionCard from '~/components/SectionCard';

type ReportExportFormat = 'csv' | 'xlsx';

interface CampaignReportExportProps {
	campaignId: number;
}

const CampaignReportExport = ({ campaignId }: CampaignReportExportProps) => {
	const { t } = useTranslation('campaign.view');
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
		<SectionCard
			title={t('reportExport.title')}
			description={t('reportExport.description')}
		>
			<Group align='flex-end' gap='sm' wrap='wrap'>
				<div>
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
						style={{ width: 170 }}
					/>
				</div>
				<div>
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
						style={{ width: 170 }}
					/>
				</div>
				<Menu shadow='md' width={160} position='bottom-end' withArrow>
					<Menu.Target>
						<Button
							leftSection={<IconDownload size={16} />}
							rightSection={<IconChevronDown size={14} />}
							variant='light'
							size='sm'
							loading={isExporting}
							disabled={isExporting}
						>
							{t('reportExport.export')}
						</Button>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>{t('reportExport.formatLabel')}</Menu.Label>
						<Menu.Item
							leftSection={<IconFileTypeCsv size={14} />}
							onClick={() => void handleExport('csv')}
							disabled={isExporting}
						>
							CSV
						</Menu.Item>
						<Menu.Item
							leftSection={<IconFileSpreadsheet size={14} />}
							onClick={() => void handleExport('xlsx')}
							disabled={isExporting}
						>
							XLSX
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		</SectionCard>
	);
};

export default CampaignReportExport;
