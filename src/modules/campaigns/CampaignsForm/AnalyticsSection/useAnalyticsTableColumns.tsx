import { useMemo } from 'react';
import { Badge, HoverCard, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { AnalyticsDataCollectionRow } from './analyticsFormContext';
import styles from './useAnalyticsTableColumns.module.css';

const useAnalyticsTableColumns =
	(): BaseTableColumnDef<AnalyticsDataCollectionRow>[] => {
		const { t } = useTranslation(['campaign.form.analytics', 'common']);

		return useMemo(
			() => [
				{
					accessorKey: 'identifier',
					header: t('form.analytics.table.identifier'),
					cell: ({ row }) => (
						<Text size='sm' fw={600} lineClamp={1}>
							{row.original.identifier || '-'}
						</Text>
					),
				},
				{
					accessorKey: 'type',
					header: t('form.analytics.table.type'),
					meta: {
						headerClassName: styles.typeColumn,
						cellClassName: styles.typeColumn,
					},
					cell: ({ row }) => {
						const typeColorMap: Record<
							AnalyticsDataCollectionRow['type'],
							string
						> = {
							boolean: 'orange',
							integer: 'blue',
							number: 'cyan',
							string: 'violet',
						};

						return (
							<Badge
								size='sm'
								variant='light'
								radius='sm'
								color={typeColorMap[row.original.type]}
							>
								{t(`form.analytics.types.${row.original.type}`)}
							</Badge>
						);
					},
				},
				{
					accessorKey: 'description',
					header: t('form.analytics.table.description'),
					cell: ({ row }) => {
						const description = row.original.description?.trim() || '';
						const hasDescription = Boolean(description);

						if (!hasDescription) {
							return (
								<Text size='xs' c='dimmed' fs='italic'>
									{t('form.analytics.table.descriptionEmpty')}
								</Text>
							);
						}

						return (
							<HoverCard
								width={420}
								openDelay={120}
								closeDelay={80}
								shadow='sm'
								radius='md'
								position='top-start'
								withArrow
							>
								<HoverCard.Target>
									<Text
										size='sm'
										c='dimmed'
										lineClamp={1}
										className={styles.descriptionPreview}
									>
										{description}
									</Text>
								</HoverCard.Target>
								<HoverCard.Dropdown className={styles.descriptionDropdown}>
									<Text size='sm' className={styles.descriptionDropdownText}>
										{description}
									</Text>
								</HoverCard.Dropdown>
							</HoverCard>
						);
					},
				},
			],
			[t]
		);
	};

export default useAnalyticsTableColumns;
