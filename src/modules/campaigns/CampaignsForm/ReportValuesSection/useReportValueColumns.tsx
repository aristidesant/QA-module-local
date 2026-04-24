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
import { ORIGIN_TYPE_COLORS, DATA_TYPE_COLORS } from './reportValueUtils';

type ColumnActionHandlers = {
	onMoveClick: (reportValue: ReportValue) => void;
	onDuplicateClick: (reportValue: ReportValue) => void;
	onEditClick: (reportValue: ReportValue) => void;
	onDeleteClick: (reportValue: ReportValue) => void;
	isDeleting: (id: number) => boolean;
};

export const useReportValueColumns = (
	handlers: ColumnActionHandlers,
	styles: Record<string, string>
) => {
	const { t } = useTranslation([
		'campaign.form.report-values',
		'campaign.contact-list',
		'common',
	]);

	return useMemo<BaseTableColumnDef<ReportValue>[]>(
		() => [
			{
				id: 'label',
				header: t('reportValues.columns.label', {
					ns: 'campaign.contact-list',
				}),
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
				header: t('reportValues.columns.originType', {
					ns: 'campaign.contact-list',
				}),
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
						{t(`reportValues.originType.${row.original.originType}`, {
							ns: 'campaign.contact-list',
						})}
					</Badge>
				),
			},
			{
				id: 'dataType',
				header: t('reportValues.columns.dataType', {
					ns: 'campaign.contact-list',
				}),
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
						{t(`reportValues.dataType.${row.original.dataType}`, {
							ns: 'campaign.contact-list',
						})}
					</Badge>
				),
			},
			{
				id: 'actions',
				header: t('reportValues.columns.actions', {
					ns: 'campaign.contact-list',
				}),
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
								{t('reportValues.actions.moveToSheet', {
									ns: 'campaign.contact-list',
								})}
							</Menu.Item>
							<Menu.Item
								leftSection={<IconCopy size={14} />}
								onClick={() => handlers.onDuplicateClick(row.original)}
							>
								{t('reportValues.actions.duplicateToSheet', {
									ns: 'campaign.contact-list',
								})}
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
