import { ActionIcon, Menu, Tooltip } from '@mantine/core';
import {
	IconDownload,
	IconFileSpreadsheet,
	IconFileTypeCsv,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import classes from '../ContactListActions.module.css';

type ReportExportFormat = 'csv' | 'xlsx';

interface ExportResultsActionProps {
	tooltip: string;
	onExport: (format: ReportExportFormat) => void;
	loading?: boolean;
	disabled?: boolean;
}

const ExportResultsAction = ({
	tooltip,
	onExport,
	loading = false,
	disabled = false,
}: ExportResultsActionProps) => {
	const { t } = useTranslation('campaign.contact-list');

	return (
		<Menu shadow='md' width={180} position='bottom-start' withArrow>
			<Menu.Target>
				<Tooltip label={tooltip} withArrow>
					<span>
						<ActionIcon
							size='lg'
							variant='light'
							color='blue'
							loading={loading}
							disabled={disabled}
							aria-label={tooltip}
							className={classes.actionButton}
						>
							<IconDownload size={16} />
						</ActionIcon>
					</span>
				</Tooltip>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>{t('reportValues.exportFormatLabel')}</Menu.Label>
				<Menu.Item
					leftSection={<IconFileTypeCsv size={14} />}
					onClick={() => onExport('csv')}
					disabled={loading}
				>
					{t('reportValues.exportFormatCsv')}
				</Menu.Item>
				<Menu.Item
					leftSection={<IconFileSpreadsheet size={14} />}
					onClick={() => onExport('xlsx')}
					disabled={loading}
				>
					{t('reportValues.exportFormatXlsx')}
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};

export default ExportResultsAction;
