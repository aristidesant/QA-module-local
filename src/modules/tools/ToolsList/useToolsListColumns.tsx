import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Text, Group, ThemeIcon, Tooltip, Badge } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { ToolModel } from '~/models/ToolModel';
import { useTranslation } from 'react-i18next';

type StatusColor = 'green' | 'red' | 'gray';

const getStatusColor = (status: string): StatusColor => {
	switch (status.toLowerCase()) {
		case 'active':
			return 'green';
		case 'inactive':
			return 'red';
		default:
			return 'gray';
	}
};

const getDateLocale = (language: string) => {
	const normalized = language?.toLowerCase?.() ?? 'en';
	if (normalized.startsWith('en')) return 'en-US';
	if (normalized.startsWith('es')) return 'es-ES';
	return 'en-US';
};

const formatDate = (dateString: string, language: string) =>
	new Date(dateString).toLocaleDateString(getDateLocale(language), {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

function useToolsListColumns(): ColumnDef<ToolModel>[] {
	const { t, i18n } = useTranslation('tools');

	return useMemo<ColumnDef<ToolModel>[]>(() => {
		return [
			{
				accessorKey: 'name',
				header: t('columns.name'),
				cell: ({ row }) => {
					const tool = row.original;

					return (
						<Group gap='xs'>
							<Text fw={500} size='sm'>
								{tool.name}
							</Text>
							{tool.description ? (
								<Tooltip
									label={tool.description}
									withinPortal
									multiline
									w={280}
								>
									<ThemeIcon size='sm' radius='xl' variant='light' color='gray'>
										<IconInfoCircle size={14} />
									</ThemeIcon>
								</Tooltip>
							) : null}
						</Group>
					);
				},
			},
			{
				accessorKey: 'status',
				header: t('columns.status'),
				cell: ({ row }) => (
					<Badge
						color={getStatusColor(row.original.status)}
						variant='light'
						size='sm'
					>
						{t(`status.${row.original.status.toLowerCase()}`, {
							defaultValue: row.original.status,
						})}
					</Badge>
				),
			},
			{
				id: 'creator',
				header: t('columns.createdBy'),
				cell: ({ row }) => (
					<Text size='sm'>
						{row.original.config?.accessInfo?.creatorName ||
							t('columns.unknownCreator')}
					</Text>
				),
			},
			{
				accessorKey: 'createdAt',
				header: t('columns.created'),
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{formatDate(row.original.createdAt, i18n.language)}
					</Text>
				),
			},
		];
	}, [i18n.language, t]);
}

export default useToolsListColumns;
