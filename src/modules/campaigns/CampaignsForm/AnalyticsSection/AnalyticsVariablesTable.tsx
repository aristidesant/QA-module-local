import { Button, Group, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable';
import { useAnalyticsFormContext } from './analyticsFormContext';
import useAnalyticsTableColumns from './useAnalyticsTableColumns';

interface AnalyticsVariablesTableProps {
	onAddRow: () => void;
}

const AnalyticsVariablesTable = ({
	onAddRow,
}: AnalyticsVariablesTableProps) => {
	const { t } = useTranslation('campaigns');
	const form = useAnalyticsFormContext();
	const columns = useAnalyticsTableColumns();

	return (
		<Stack gap='xs'>
			<Group justify='space-between' align='center'>
				<Text size='sm'>
					{t('form.analytics.totalVariables', {
						count: form.values.rows.length,
					})}
				</Text>
				<Button
					size='sm'
					variant='light'
					leftSection={<IconPlus size={14} />}
					onClick={onAddRow}
				>
					{t('form.analytics.actions.addVariable')}
				</Button>
			</Group>

			<BaseTable
				data={form.values.rows}
				columns={columns}
				density='compact'
				emptyMessage={t('form.analytics.empty')}
				selectedRowId={form.values.selectedRowId}
				getRowId={(row) => row.id}
				onRowClick={(row) => form.setFieldValue('selectedRowId', row.id)}
			/>
		</Stack>
	);
};

export default AnalyticsVariablesTable;
