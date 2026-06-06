import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
	ActionIcon,
	Badge,
	Group,
	Menu,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconChevronRight,
	IconDownload,
	IconDotsVertical,
	IconRefresh,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { timeAgo } from '~/utils/dateUtils';
import type { PronunciationDictionary } from '~/models/PronunciationDictionaryModel';

function dateTooltip(iso: string) {
	return new Date(iso).toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

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
						<Group gap='xs'>
							<Text size='sm' fw={600}>
								{row.original.name}
							</Text>
							<Badge variant='outline' color='gray' radius='sm' size='xs'>
								v{row.original.elevenLabsVersionId.slice(0, 7)}
							</Badge>
						</Group>
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
					<Tooltip
						label={dateTooltip(row.original.createdAt)}
						withArrow
						withinPortal
					>
						<Text size='sm'>{timeAgo(row.original.createdAt)}</Text>
					</Tooltip>
				),
			},
			{
				accessorKey: 'updatedAt',
				header: t('dictionaryColumns.updatedAt'),
				cell: ({ row }) => (
					<Tooltip
						label={dateTooltip(row.original.updatedAt)}
						withArrow
						withinPortal
					>
						<Text size='sm'>{timeAgo(row.original.updatedAt)}</Text>
					</Tooltip>
				),
			},
			{
				id: 'actions',
				header: t('dictionaryColumns.actions'),
				size: 60,
				cell: ({ row }) => (
					<Group justify='flex-end'>
						<Menu shadow='sm' position='bottom-end' withinPortal>
							<Menu.Target>
								<ActionIcon
									variant='subtle'
									size='sm'
									onClick={(e) => e.stopPropagation()}
								>
									<IconDotsVertical size={15} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									leftSection={<IconChevronRight size={15} stroke={1.5} />}
									onClick={() => onOpen(row.original)}
								>
									{t('dictionary.viewRules')}
								</Menu.Item>
								<Menu.Item
									leftSection={<IconRefresh size={15} stroke={1.5} />}
									disabled={isSyncing}
									onClick={(e) => {
										e.stopPropagation();
										onSync(row.original);
									}}
								>
									{t('dictionary.sync')}
								</Menu.Item>
								<Menu.Item
									leftSection={<IconDownload size={15} stroke={1.5} />}
									disabled={isExporting}
									onClick={(e) => {
										e.stopPropagation();
										onExport(row.original);
									}}
								>
									{t('export.buttonLabel')}
								</Menu.Item>
								<Menu.Divider />
								<Menu.Item
									leftSection={<IconTrash size={15} stroke={1.5} />}
									color='red'
									onClick={(e) => {
										e.stopPropagation();
										onDelete(row.original);
									}}
								>
									{t('dictionary.delete')}
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				),
			},
		],
		[onOpen, onSync, onDelete, onExport, isSyncing, isExporting, t]
	);
}
