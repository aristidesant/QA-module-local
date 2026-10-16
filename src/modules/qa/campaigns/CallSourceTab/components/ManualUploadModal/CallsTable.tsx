import { Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import { formatCallDuration } from '../../callSource.helpers';
import type { UploadedCall } from '../../callSource.types';

export interface CallsTableProps {
	calls: UploadedCall[];
}

const DEFAULT_PAGE_SIZE = 10;

/** One row per call (ID, agent, duration), paginated because uploads can be long. */
export default function CallsTable({ calls }: CallsTableProps) {
	const { t } = useTranslation('qa.campaigns');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

	const totalPages = Math.max(1, Math.ceil(calls.length / pageSize));
	// Stay on a valid page if the list shrinks.
	const currentPage = Math.min(page, totalPages);
	const rows = calls.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	const columns: BaseTableColumnDef<UploadedCall>[] = [
		{
			id: 'id',
			header: t('callSource.upload.columns.callId'),
			enableSorting: false,
			cell: ({ row: { original: call } }) => (
				<Text fw={600} size='sm'>
					{call.id}
				</Text>
			),
		},
		{
			id: 'agent',
			header: t('callSource.upload.columns.agent'),
			enableSorting: false,
			cell: ({ row: { original: call } }) => (
				<Text size='sm'>{call.agent}</Text>
			),
		},
		{
			id: 'duration',
			header: t('callSource.upload.columns.duration'),
			enableSorting: false,
			cell: ({ row: { original: call } }) => (
				<Text size='sm'>{formatCallDuration(call.durationSeconds)}</Text>
			),
		},
	];

	return (
		<Stack gap='sm'>
			<BaseTable<UploadedCall>
				columns={columns}
				data={rows}
				getRowId={(call) => call.id}
			/>
			<PaginationControls
				currentPage={currentPage}
				itemLabel={t('callSource.upload.itemLabel')}
				itemsPerPage={pageSize}
				onItemsPerPageChange={(value) => {
					setPageSize(Number(value) || DEFAULT_PAGE_SIZE);
					setPage(1);
				}}
				onPageChange={setPage}
				totalItems={calls.length}
				totalPages={totalPages}
			/>
		</Stack>
	);
}
