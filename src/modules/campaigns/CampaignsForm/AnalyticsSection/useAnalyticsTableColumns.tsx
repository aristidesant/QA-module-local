import { useMemo } from 'react';
import { Badge, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { AnalyticsDataCollectionRow } from './analyticsFormContext';

const useAnalyticsTableColumns =
	(): BaseTableColumnDef<AnalyticsDataCollectionRow>[] => {
		const { t } = useTranslation('campaigns');

		return useMemo(
			() => [
				{
					accessorKey: 'identifier',
					header: t('form.analytics.table.identifier'),
					cell: ({ row }) => (
						<Text size='sm' fw={500}>
							{row.original.identifier || '-'}
						</Text>
					),
				},
				{
					accessorKey: 'type',
					header: t('form.analytics.table.type'),
					cell: ({ row }) => (
						<Badge size='sm' variant='light' radius='sm'>
							{t(`form.analytics.types.${row.original.type}`)}
						</Badge>
					),
				},
				{
					accessorKey: 'description',
					header: t('form.analytics.table.description'),
					cell: ({ row }) => (
						<Text size='sm' c='dimmed' lineClamp={1}>
							{row.original.description || '-'}
						</Text>
					),
				},
				{
					accessorKey: 'enum',
					header: t('form.analytics.table.enum'),
					cell: ({ row }) =>
						row.original.type === 'string' &&
						(row.original.enum?.length ?? 0) > 0 ? (
							<Badge size='sm' variant='light' radius='sm'>
								{t('form.analytics.table.enumCount', {
									count: row.original.enum?.length ?? 0,
								})}
							</Badge>
						) : (
							<Text size='sm' c='dimmed'>
								-
							</Text>
						),
				},
			],
			[t]
		);
	};

export default useAnalyticsTableColumns;
