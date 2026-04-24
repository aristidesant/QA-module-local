import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Group, Stack, Text, Tooltip } from '@mantine/core';
import {
	IconChevronRight,
	IconDownload,
	IconRefresh,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { PronunciationDictionary } from '~/models/PronunciationDictionaryModel';

interface UseDictionaryTableColumnsProps {
	onOpen: (dictionary: PronunciationDictionary) => void;
	onSync: (dictionary: PronunciationDictionary) => void;
	onDelete: (dictionary: PronunciationDictionary) => void;
	onExport: (dictionary: PronunciationDictionary) => void;
	isSyncing: boolean;
	isExporting: boolean;
}

export function useDictionaryTableColumns({
	onOpen,
	onSync,
	onDelete,
	onExport,
	isSyncing,
	isExporting,
}: UseDictionaryTableColumnsProps) {
	const { t } = useTranslation('dictionary-rules');

	return useMemo<ColumnDef<PronunciationDictionary>[]>(
		() => [
			{
				accessorKey: 'name',
				header: t('dictionaryColumns.name'),
				cell: ({ row }) => (
					<Stack gap={2}>
						<Text size='sm' fw={600}>
							{row.original.name}
						</Text>
						{row.original.description ? (
							<Text size='xs' c='dimmed' lineClamp={1}>
								{row.original.description}
							</Text>
						) : null}
					</Stack>
				),
			},
			{
				accessorKey: 'createdAt',
				header: t('dictionaryColumns.createdAt'),
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{new Date(row.original.createdAt).toLocaleDateString()}
					</Text>
				),
			},
			{
				id: 'actions',
				header: t('dictionaryColumns.actions'),
				meta: { align: 'right' },
				cell: ({ row }) => (
					<Group gap='xs' justify='flex-end'>
						<Tooltip label={t('dictionary.sync')}>
							<ActionIcon
								variant='light'
								color='blue'
								radius='md'
								size='sm'
								loading={isSyncing}
								onClick={(e) => {
									e.stopPropagation();
									onSync(row.original);
								}}
							>
								<IconRefresh size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('dictionary.delete')}>
							<ActionIcon
								variant='light'
								color='red'
								radius='md'
								size='sm'
								onClick={(e) => {
									e.stopPropagation();
									onDelete(row.original);
								}}
							>
								<IconTrash size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('export.buttonLabel')}>
							<ActionIcon
								variant='light'
								color='teal'
								radius='md'
								size='sm'
								loading={isExporting}
								onClick={(e) => {
									e.stopPropagation();
									onExport(row.original);
								}}
							>
								<IconDownload size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('dictionary.viewRules')}>
							<ActionIcon
								variant='light'
								color='gray'
								radius='md'
								size='sm'
								onClick={() => onOpen(row.original)}
							>
								<IconChevronRight size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
			},
		],
		[onOpen, onSync, onDelete, onExport, isSyncing, isExporting, t]
	);
}
