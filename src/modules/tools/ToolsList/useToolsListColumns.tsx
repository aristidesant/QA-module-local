import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Text } from '@mantine/core';
import type { ToolModel } from '~/models/ToolModel';
import { useTranslation } from 'react-i18next';
import styles from '../ToolsList/ToolsList.module.css';

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
						<div className={styles.nameCell}>
							<Text fz='sm' fw={600} className={styles.nameText}>
								{tool.name}
							</Text>
							<Text
								fz='xs'
								c='dimmed'
								className={styles.nameDescription}
								fs={tool.description ? undefined : 'italic'}
							>
								{tool.description || t('columns.noDescription')}
							</Text>
						</div>
					);
				},
			},
			{
				accessorKey: 'status',
				header: t('columns.status'),
				cell: ({ row }) => {
					const statusKey = row.original.status.toLowerCase();
					const cls =
						statusKey === 'active'
							? styles.statusActive
							: styles.statusInactive;
					return (
						<span className={cls}>
							<span className={styles.statusDot} />
							{t(`status.${statusKey}`, { defaultValue: row.original.status })}
						</span>
					);
				},
			},
			{
				id: 'creator',
				header: t('columns.createdBy'),
				cell: ({ row }) => (
					<Text fz='sm' c='dimmed'>
						{row.original.config?.accessInfo?.creatorName ||
							t('columns.unknownCreator')}
					</Text>
				),
			},
			{
				accessorKey: 'createdAt',
				header: t('columns.created'),
				cell: ({ row }) => (
					<Text fz='xs' c='dimmed'>
						{formatDate(row.original.createdAt, i18n.language)}
					</Text>
				),
			},
		];
	}, [i18n.language, t]);
}

export default useToolsListColumns;
