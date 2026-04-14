import { useMemo } from 'react';
import { Badge, Group, HoverCard, Text } from '@mantine/core';
import {
	IconCheckbox,
	IconDecimal,
	IconHash,
	IconInfoCircle,
	IconSparkles,
	IconTextSize,
} from '@tabler/icons-react';
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
					size: 200,
					minSize: 160,
					maxSize: 280,
					cell: ({ row }) => {
						const { identifier, isNew, source } = row.original;
						return (
							<Group gap='xs' wrap='nowrap'>
								<Text
									size='sm'
									className={styles.identifier}
									lineClamp={1}
									title={identifier}
								>
									{identifier || '-'}
								</Text>
								{isNew && (
									<Badge
										size='xs'
										variant='filled'
										color='teal'
										className={styles.newBadge}
									>
										{t('form.analytics.editor.states.draft', {
											ns: 'campaign.form.analytics',
										})}
									</Badge>
								)}
								{source === 'custom-variable' && (
									<Badge
										size='xs'
										variant='light'
										color='grape'
										className={styles.sourceBadge}
										title={t('form.analytics.table.sources.customVariable')}
									>
										<IconSparkles size={10} />
									</Badge>
								)}
							</Group>
						);
					},
				},
				{
					accessorKey: 'type',
					header: t('form.analytics.table.type'),
					size: 140,
					minSize: 120,
					maxSize: 160,
					meta: {
						headerClassName: styles.typeColumnHeader,
						cellClassName: styles.typeColumnCell,
					},
					cell: ({ row }) => {
						const typeConfig: Record<
							AnalyticsDataCollectionRow['type'],
							{ color: string; icon: typeof IconCheckbox; label: string }
						> = {
							boolean: {
								color: 'orange',
								icon: IconCheckbox,
								label: t('form.analytics.types.boolean'),
							},
							integer: {
								color: 'blue',
								icon: IconHash,
								label: t('form.analytics.types.integer'),
							},
							number: {
								color: 'cyan',
								icon: IconDecimal,
								label: t('form.analytics.types.number'),
							},
							string: {
								color: 'violet',
								icon: IconTextSize,
								label: t('form.analytics.types.string'),
							},
						};

						const config = typeConfig[row.original.type];
						const Icon = config.icon;

						return (
							<Badge
								size='sm'
								variant='light'
								color={config.color}
								leftSection={<Icon size={12} />}
								className={styles.typeBadge}
							>
								{config.label}
							</Badge>
						);
					},
				},
				{
					accessorKey: 'description',
					header: t('form.analytics.table.description'),
					size: 320,
					minSize: 200,
					maxSize: 480,
					cell: ({ row }) => {
						const description = row.original.description?.trim() || '';
						const hasDescription = Boolean(description);
						const enumCount = row.original.enum?.length ?? 0;
						const hasEnum = enumCount > 0;

						if (!hasDescription && !hasEnum) {
							return (
								<Text size='sm' c='dimmed' className={styles.emptyDescription}>
									{t('form.analytics.table.descriptionEmpty')}
								</Text>
							);
						}

						const tooltipContent = (
							<div className={styles.tooltipContent}>
								{description && (
									<Text size='sm' className={styles.tooltipDescription}>
										{description}
									</Text>
								)}
								{hasEnum && (
									<div className={styles.tooltipEnum}>
										<Text
											size='xs'
											fw={600}
											c='dimmed'
											className={styles.tooltipEnumLabel}
										>
											{t('form.analytics.table.enumCount', {
												count: enumCount,
											})}
										</Text>
										<Group gap={4} className={styles.tooltipEnumValues}>
											{row.original.enum?.slice(0, 5).map((val, i) => (
												<Badge key={i} size='xs' variant='outline' color='gray'>
													{val}
												</Badge>
											))}
											{enumCount > 5 && (
												<Text size='xs' c='dimmed'>
													+{enumCount - 5}
												</Text>
											)}
										</Group>
									</div>
								)}
							</div>
						);

						return (
							<HoverCard
								width={380}
								openDelay={100}
								closeDelay={60}
								shadow='md'
								radius='md'
								position='top-start'
								withArrow
							>
								<HoverCard.Target>
									<div className={styles.descriptionTarget}>
										<Text
											size='sm'
											lineClamp={1}
											className={styles.descriptionText}
										>
											{description}
										</Text>
										{hasEnum && (
											<Badge
												size='xs'
												variant='light'
												color='gray'
												className={styles.enumBadge}
											>
												{hasDescription
													? t('form.analytics.table.enumCount', {
															count: enumCount,
														})
													: t('form.analytics.table.enum', {
															count: enumCount,
														})}
											</Badge>
										)}
										{hasDescription && (
											<IconInfoCircle
												size={14}
												className={styles.descriptionIcon}
											/>
										)}
									</div>
								</HoverCard.Target>
								<HoverCard.Dropdown className={styles.descriptionDropdown}>
									{tooltipContent}
								</HoverCard.Dropdown>
							</HoverCard>
						);
					},
				},
				{
					accessorKey: 'isSystemProvided',
					header: t('form.analytics.fields.isSystemProvided'),
					size: 100,
					minSize: 80,
					maxSize: 120,
					cell: ({ row }) => {
						const isSystem = row.original.isSystemProvided;
						return (
							<Badge
								size='sm'
								variant={isSystem ? 'filled' : 'light'}
								color={isSystem ? 'red' : 'gray'}
								className={styles.systemBadge}
							>
								{isSystem
									? t('form.analytics.table.yes')
									: t('form.analytics.table.no')}
							</Badge>
						);
					},
				},
			],
			[t]
		);
	};

export default useAnalyticsTableColumns;
