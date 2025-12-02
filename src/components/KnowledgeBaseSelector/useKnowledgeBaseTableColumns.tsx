import { Group, Text, ThemeIcon } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import { IconLink, IconFile, IconTextRecognition } from '@tabler/icons-react';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import styles from './KnowledgeBaseSelector.module.css';

// No status column per requirements

const typeBadge = (type?: string) => {
	const t = (type || '').toUpperCase();
	switch (t) {
		case 'URL':
			return (
				<Group gap={4} wrap='nowrap'>
					<ThemeIcon variant='subtle' color='blue' size='sm'>
						<IconLink size={14} />
					</ThemeIcon>
					<Text size='xs'>URL</Text>
				</Group>
			);
		case 'TEXT':
			return (
				<Group gap={4} wrap='nowrap'>
					<ThemeIcon variant='subtle' color='grape' size='sm'>
						<IconTextRecognition size={14} />
					</ThemeIcon>
					<Text size='xs'>Text</Text>
				</Group>
			);
		case 'FILE':
		default:
			return (
				<Group gap={4} wrap='nowrap'>
					<ThemeIcon variant='subtle' color='teal' size='sm'>
						<IconFile size={14} />
					</ThemeIcon>
					<Text size='xs'>File</Text>
				</Group>
			);
	}
};

export const useKnowledgeBaseTableColumns = (): ColumnDef<
	KnowledgeBaseModel,
	any
>[] => {
	const columns: ColumnDef<KnowledgeBaseModel, any>[] = [
		{
			id: 'name',
			header: 'Name',
			accessorFn: (row) => row.name,
			cell: ({ row }) => {
				const kb = row.original;
				return (
					<div className={styles.nameCell}>
						<Text size='sm' fw={500} truncate>
							{kb.name}
						</Text>
					</div>
				);
			},
		},
		{
			id: 'description',
			header: 'Description',
			accessorFn: (row) => row.description ?? '',
			cell: ({ row }) => {
				const kb = row.original;
				const fallback =
					kb.type === 'URL'
						? kb.sourceUrl
						: kb.type === 'TEXT'
							? 'Text snippet'
							: kb.file?.name || 'File';
				return (
					<Text
						size='xs'
						className={styles.description}
						title={kb.description || fallback || ''}
					>
						{kb.description || fallback || ''}
					</Text>
				);
			},
		},
		{
			id: 'type',
			header: 'Type',
			accessorFn: (row) => row.type,
			cell: ({ row }) => typeBadge(row.original.type),
			meta: { headerClassName: styles.typeBadge },
		},
	];

	return columns;
};

export default useKnowledgeBaseTableColumns;
