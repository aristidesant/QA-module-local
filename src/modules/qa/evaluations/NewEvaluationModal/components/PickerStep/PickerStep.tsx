import { Group, Pagination, Stack, Text, TextInput } from '@mantine/core';
import { IconClipboardCheck, IconSearch } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import SelectableTable from '~/modules/qa/components/SelectableTable';
import { PAGE_SIZE } from '../../NewEvaluationModal.constants';

export interface PickerStepProps<T> {
	columns: BaseTableColumnDef<T>[];
	data: T[];
	getRowKey: (row: T) => string;
	selectedKey: string | null;
	onSelect: (row: T) => void;
	isLoading: boolean;
	search: string;
	onSearchChange: (value: string) => void;
	total: number;
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	emptyTitle: string;
	/** Trailing extras rendered below the table (e.g. a transcript alert). */
	children?: ReactNode;
}

export default function PickerStep<T>({
	columns,
	data,
	getRowKey,
	selectedKey,
	onSelect,
	isLoading,
	search,
	onSearchChange,
	total,
	page,
	totalPages,
	onPageChange,
	emptyTitle,
	children,
}: PickerStepProps<T>) {
	const { t } = useTranslation('qa.evaluations');

	return (
		<Stack gap='sm'>
			<Group gap='sm' justify='space-between' wrap='nowrap'>
				<TextInput
					flex={1}
					leftSection={<IconSearch size={16} />}
					onChange={(event) => onSearchChange(event.currentTarget.value)}
					placeholder={t('modal.searchPlaceholder')}
					size='sm'
					value={search}
				/>
				<Text c='dimmed' fw={600} size='xs'>
					{t('modal.resultCount', { count: total })}
				</Text>
			</Group>
			<SelectableTable
				columns={columns}
				data={data}
				emptyState={
					<EmptyState
						icon={<IconClipboardCheck size={32} />}
						message={emptyTitle}
					/>
				}
				getRowKey={getRowKey}
				isLoading={isLoading}
				loadingRowCount={PAGE_SIZE}
				onSelect={onSelect}
				selectedKey={selectedKey}
			/>
			{totalPages > 1 ? (
				<Group justify='center'>
					<Pagination
						onChange={onPageChange}
						size='sm'
						total={totalPages}
						value={page}
					/>
				</Group>
			) : null}
			{children}
		</Stack>
	);
}
