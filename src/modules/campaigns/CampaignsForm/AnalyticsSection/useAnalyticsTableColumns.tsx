import { useMemo } from 'react';
import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
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
					cell: ({ row }) => {
						const description = row.original.description?.trim() || '';
						const hasDescription = Boolean(description);

						return (
							<Group justify='center' gap={0}>
								<Tooltip
									label={
										hasDescription
											? description
											: t('form.analytics.table.descriptionEmpty')
									}
									multiline
									w={300}
									openDelay={150}
									withArrow
								>
									<ActionIcon
										size='sm'
										variant='subtle'
										color={hasDescription ? 'blue' : 'gray'}
										aria-label={t('form.analytics.table.descriptionIconAria')}
									>
										<IconInfoCircle size={15} />
									</ActionIcon>
								</Tooltip>
							</Group>
						);
					},
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
				{
					id: 'source',
					header: t('form.analytics.table.source'),
					cell: ({ row }) => (
						<Badge
							size='sm'
							variant='light'
							radius='sm'
							color={
								row.original.source === 'custom-variable' ? 'grape' : 'gray'
							}
						>
							{row.original.source === 'custom-variable'
								? t('form.analytics.table.sources.customVariable')
								: t('form.analytics.table.sources.manual')}
						</Badge>
					),
				},
			],
			[t]
		);
	};

export default useAnalyticsTableColumns;
