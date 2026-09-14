import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Badge, Group, Menu, Text } from '@mantine/core';
import { IconCopy, IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { createColumnHelper } from '@tanstack/react-table';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type { ReportDefinition } from '~/models/qa/reportBuilder';
import { fromMockNow } from '../helpers';
import styles from '../Reports.module.css';

interface SavedTabProps {
	definitions: ReportDefinition[];
	onLoad: (definition: ReportDefinition) => void;
	onDuplicate: (definition: ReportDefinition) => void;
	onDelete: (definition: ReportDefinition) => void;
}

const column = createColumnHelper<ReportDefinition>();

/** Every report definition the role can open, with its schedule at a glance. */
export const SavedTab: React.FC<SavedTabProps> = ({
	definitions,
	onLoad,
	onDuplicate,
	onDelete,
}) => {
	const { t } = useTranslation('qa.reports');

	const columns = useMemo(
		() =>
			[
				column.accessor('name', {
					header: t('saved.columns.name'),
					cell: ({ row }) => (
						<div>
							<Group gap='xs' wrap='nowrap'>
								<Text size='sm' fw={500} lineClamp={1}>
									{row.original.name}
								</Text>
								{row.original.builtIn && (
									<Badge size='xs' variant='light' color='gray' tt='none'>
										{t('saved.builtInBadge')}
									</Badge>
								)}
							</Group>
							<Text size='xs' c='dimmed' lineClamp={1}>
								{row.original.description}
							</Text>
						</div>
					),
				}),
				column.accessor('audience', {
					header: t('saved.columns.audience'),
					cell: ({ getValue, row }) => (
						<Badge
							variant='light'
							color={getValue() === 'client' ? 'grape' : 'blue'}
							tt='none'
							className={styles.badgeColumn}
						>
							{getValue() === 'client'
								? (row.original.clientName ?? t('audience.client'))
								: t('audience.internal')}
						</Badge>
					),
				}),
				column.accessor((definition) => definition.sections.length, {
					id: 'sections',
					header: t('saved.columns.sections'),
					cell: ({ getValue }) => (
						<Text size='sm' c='dimmed'>
							{getValue()}
						</Text>
					),
				}),
				column.accessor('groupBy', {
					header: t('saved.columns.groupBy'),
					cell: ({ getValue }) => (
						<Text size='sm' c='dimmed'>
							{t(`scope.groupByOptions.${getValue()}`)}
						</Text>
					),
				}),
				column.accessor((definition) => definition.schedule?.frequency ?? '', {
					id: 'schedule',
					header: t('saved.columns.schedule'),
					cell: ({ row }) => {
						const { schedule } = row.original;
						if (!schedule) {
							return (
								<Text size='sm' c='dimmed'>
									{t('saved.noSchedule')}
								</Text>
							);
						}
						return (
							<Badge
								variant='light'
								color={schedule.enabled ? 'teal' : 'gray'}
								tt='none'
								className={styles.badgeColumn}
							>
								{t(`output.frequencies.${schedule.frequency}`)}
							</Badge>
						);
					},
				}),
				column.accessor('lastGeneratedAt', {
					header: t('saved.columns.lastGenerated'),
					cell: ({ getValue }) => (
						<Text size='sm' c='dimmed'>
							{getValue() ? fromMockNow(getValue()!) : t('kpis.never')}
						</Text>
					),
				}),
				column.display({
					id: 'actions',
					header: '',
					cell: ({ row }) => (
						<Menu position='bottom-end' withinPortal>
							<Menu.Target>
								<ActionIcon
									variant='subtle'
									color='gray'
									onClick={(event) => event.stopPropagation()}
								>
									<IconDots size={16} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									leftSection={<IconPencil size={14} />}
									onClick={() => onLoad(row.original)}
								>
									{t('saved.load')}
								</Menu.Item>
								<Menu.Item
									leftSection={<IconCopy size={14} />}
									onClick={() => onDuplicate(row.original)}
								>
									{t('saved.duplicate')}
								</Menu.Item>
								<Menu.Item
									color='red'
									disabled={row.original.builtIn}
									leftSection={<IconTrash size={14} />}
									onClick={() => onDelete(row.original)}
								>
									{t('saved.delete')}
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					),
				}),
			] as BaseTableColumnDef<ReportDefinition>[],
		[t, onLoad, onDuplicate, onDelete]
	);

	return (
		<BaseTable<ReportDefinition>
			data={definitions}
			columns={columns}
			getRowId={(definition) => definition.id}
			density='compact'
			onRowClick={onLoad}
			emptyMessage={t('saved.empty')}
		/>
	);
};

export default SavedTab;
