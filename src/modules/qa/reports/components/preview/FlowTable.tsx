import React from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Text } from '@mantine/core';
import type { FlowItem, FlowRow } from './pagination';
import styles from '../../Reports.module.css';

type TableItem = Extract<FlowItem, { kind: 'table' }>;

interface FlowTableProps {
	item: TableItem;
	/** The slice of rows that belongs on this page (all rows when measuring). */
	rows: FlowRow[];
	/** The table started on an earlier page: show the caption above the repeated header. */
	continued?: boolean;
}

/**
 * One table (or one page's slice of it). The measuring layer and the pages both render
 * this, so what is measured is exactly what is shown. Heights are read from the
 * `data-flow-head` and `data-flow-row` markers.
 */
export const FlowTable: React.FC<FlowTableProps> = ({
	item,
	rows,
	continued = false,
}) => {
	const { t } = useTranslation('qa.reports');
	return (
		<div>
			{continued && (
				<Text className={styles.continued}>
					{t('preview.pagination.continued', { section: item.title })}
				</Text>
			)}
			<Table
				striped
				withTableBorder
				verticalSpacing='xs'
				className={styles.pageTable}
			>
				<Table.Thead data-flow-head>{item.head}</Table.Thead>
				<Table.Tbody>
					{rows.map((row) =>
						React.isValidElement(row.node)
							? React.cloneElement(
									row.node as React.ReactElement<Record<string, unknown>>,
									{ key: row.id, 'data-flow-row': row.id }
								)
							: row.node
					)}
				</Table.Tbody>
			</Table>
		</div>
	);
};

export default FlowTable;
