import { Table } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	formatMetricValue,
	resolveLabel,
} from '../../../CampaignDashboardViewer.helpers';
import DashboardWidgetCard from '../DashboardWidgetCard';
import type { GroupedWidgetContentProps } from '../widgetContent.types';
import styles from '../../CampaignDashboardViewerWidgetContent.module.css';

const TableWidgetContent = ({
	widget,
	accentColor,
	noDragClassName,
}: GroupedWidgetContentProps) => {
	const { t } = useTranslation('campaign.form.dashboards');

	return (
		<DashboardWidgetCard
			title={widget.title}
			accentColor={accentColor}
			liveLabel={t('dashboard.liveBadge')}
			groupByLabel={widget.result.meta.groupBy}
		>
			<div className={`${styles.tableWrapper} ${noDragClassName}`}>
				<Table striped highlightOnHover stickyHeader>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('dashboard.table.label')}</Table.Th>
							<Table.Th>{t('dashboard.table.value')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{widget.result.rows.map((row, rowIndex) => (
							<Table.Tr key={`${widget.widgetId}-${rowIndex}`}>
								<Table.Td>
									{resolveLabel(row.label, t('dashboard.unknownLabel'))}
								</Table.Td>
								<Table.Td>{formatMetricValue(row.value)}</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</div>
		</DashboardWidgetCard>
	);
};

export default TableWidgetContent;
