import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Box, Group, Menu, Text } from '@mantine/core';
import {
	IconDotsVertical,
	IconEdit,
	IconCopy,
	IconArrowsRightLeft,
	IconTrash,
	IconGripVertical,
} from '@tabler/icons-react';
import type { ReportValue } from '~/models/ReportValue';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import { ORIGIN_TYPE_COLORS, DATA_TYPE_COLORS } from './reportTemplateUtils';

type ColumnActionHandlers = {
	onMoveClick: (reportValue: ReportValue) => void;
	onDuplicateClick: (reportValue: ReportValue) => void;
	onEditClick: (reportValue: ReportValue) => void;
	onDeleteClick: (reportValue: ReportValue) => void;
	isDeleting: (id: number) => boolean;
};

export const useReportTemplateColumns = (
	handlers: ColumnActionHandlers,
	styles: Record<string, string>
) => {
	const { t } = useTranslation(['report-templates', 'common']);

	return useMemo<BaseTableColumnDef<ReportValue>[]>(
		() => [
			{
				id: 'label',
				header: t('columns.label'),
				meta: {
					headerClassName: styles.labelHeader,
					cellClassName: styles.labelColumn,
				},
				cell: ({ row }) => (
					<Group gap='sm' wrap='nowrap' className={styles.labelCell}>
						<Box className={styles.gripIcon}>
							<IconGripVertical size={16} />
						</Box>
						<Text size='xs' fw={700} c='dimmed' className={styles.orderPill}>
							{row.original.order + 1}
						</Text>
						<Box className={styles.labelContent}>
							<Text size='sm' fw={600} className={styles.labelValue}>
								{row.original.label}
							</Text>
							<Text
								size='xs'
								c='dimmed'
								ff='monospace'
								className={styles.keyValue}
							>
								{row.original.key}
							</Text>
						</Box>
					</Group>
				),
			},
			{
				id: 'originType',
				header: t('columns.originType'),
				meta: {
					headerClassName: styles.originHeader,
					cellClassName: styles.originColumn,
				},
				cell: ({ row }) => (
					<Badge
						color={ORIGIN_TYPE_COLORS[row.original.originType] ?? 'gray'}
						variant='light'
						size='xs'
					>
						{t(`originType.${row.original.originType}`)}
					</Badge>
				),
			},
			{
				id: 'dataType',
				header: t('columns.dataType'),
				meta: {
					headerClassName: styles.dataTypeHeader,
					cellClassName: styles.dataTypeColumn,
				},
				cell: ({ row }) => (
					<Badge
						color={DATA_TYPE_COLORS[row.original.dataType] ?? 'gray'}
						variant='dot'
						size='xs'
					>
						{t(`dataType.${row.original.dataType}`)}
					</Badge>
				),
			},
			{
				id: 'actions',
				header: t('columns.actions'),
				meta: {
					headerClassName: styles.actionsHeader,
					cellClassName: styles.actionsColumn,
				},
				cell: ({ row }) => (
					<Menu shadow='sm' position='bottom-end'>
						<Menu.Target>
							<Box className={styles.menuTarget}>
								<IconDotsVertical size={16} />
							</Box>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								leftSection={<IconArrowsRightLeft size={14} />}
								onClick={() => handlers.onMoveClick(row.original)}
							>
								{t('columns.moveToSheet')}
							</Menu.Item>
							<Menu.Item
								leftSection={<IconCopy size={14} />}
								onClick={() => handlers.onDuplicateClick(row.original)}
							>
								{t('columns.duplicateToSheet')}
							</Menu.Item>
							<Menu.Item
								leftSection={<IconEdit size={14} />}
								onClick={() => handlers.onEditClick(row.original)}
							>
								{t('actions.edit', { ns: 'common' })}
							</Menu.Item>
							<Menu.Item
								color='red'
								leftSection={<IconTrash size={14} />}
								onClick={() => handlers.onDeleteClick(row.original)}
								disabled={handlers.isDeleting(row.original.id)}
							>
								{t('actions.delete', { ns: 'common' })}
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				),
			},
		],
		[t, handlers, styles]
	);
};
