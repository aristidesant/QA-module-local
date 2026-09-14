import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Badge, Text, Tooltip } from '@mantine/core';
import { IconDownload, IconPrinter } from '@tabler/icons-react';
import { createColumnHelper } from '@tanstack/react-table';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type { GeneratedReportRecord } from '~/models/qa/reportBuilder';
import { FORMAT_COLOR } from '../constants';
import { fromMockNow } from '../helpers';
import styles from '../Reports.module.css';

interface GeneratedTabProps {
	generated: GeneratedReportRecord[];
	onDownload: (record: GeneratedReportRecord) => void;
}

const column = createColumnHelper<GeneratedReportRecord>();

/** History of every export, manual or scheduled. */
export const GeneratedTab: React.FC<GeneratedTabProps> = ({
	generated,
	onDownload,
}) => {
	const { t } = useTranslation('qa.reports');

	const columns = useMemo(
		() =>
			[
				column.accessor('definitionName', {
					header: t('generated.columns.report'),
					cell: ({ getValue, row }) => (
						<div>
							<Text size='sm' fw={500} lineClamp={1}>
								{getValue()}
							</Text>
							<Text size='xs' c='dimmed'>
								{row.original.definitionId === 'unsaved'
									? t('generated.unsaved')
									: row.original.definitionId}
							</Text>
						</div>
					),
				}),
				column.accessor('audience', {
					header: t('generated.columns.audience'),
					cell: ({ getValue }) => (
						<Badge
							variant='light'
							color={getValue() === 'client' ? 'grape' : 'blue'}
							tt='none'
							className={styles.badgeColumn}
						>
							{t(`audience.${getValue()}`)}
						</Badge>
					),
				}),
				column.accessor('format', {
					header: t('generated.columns.format'),
					cell: ({ getValue }) => (
						<Badge
							variant='light'
							color={FORMAT_COLOR[getValue()]}
							className={styles.badgeColumn}
						>
							{getValue()}
						</Badge>
					),
				}),
				column.accessor('generatedAt', {
					header: t('generated.columns.generatedAt'),
					cell: ({ getValue }) => (
						<Text size='sm' c='dimmed'>
							{fromMockNow(getValue())}
						</Text>
					),
				}),
				column.accessor('trigger', {
					header: t('generated.columns.trigger'),
					cell: ({ getValue }) => (
						<Badge
							variant='outline'
							color={getValue() === 'SCHEDULED' ? 'teal' : 'gray'}
							tt='none'
							className={styles.badgeColumn}
						>
							{t(`generated.triggers.${getValue()}`)}
						</Badge>
					),
				}),
				column.accessor('sizeKb', {
					header: t('generated.columns.size'),
					cell: ({ getValue }) => (
						<Text size='sm' c='dimmed' className={styles.numeric}>
							{getValue()} KB
						</Text>
					),
				}),
				column.accessor('status', {
					header: t('generated.columns.status'),
					cell: ({ getValue, row }) => (
						<div>
							<Badge
								variant='light'
								color={getValue() === 'SENT' ? 'teal' : 'gray'}
								tt='none'
								className={styles.badgeColumn}
							>
								{t(`generated.statuses.${getValue()}`)}
							</Badge>
							{row.original.recipients.length > 0 && (
								<Text size='xs' c='dimmed' mt={2}>
									{row.original.recipients.join(', ')}
								</Text>
							)}
						</div>
					),
				}),
				column.display({
					id: 'actions',
					header: '',
					cell: ({ row }) => (
						<Tooltip
							label={
								row.original.format === 'PDF'
									? t('generated.print')
									: t('generated.download')
							}
							withArrow
						>
							<ActionIcon
								variant='subtle'
								color='gray'
								onClick={(event) => {
									event.stopPropagation();
									onDownload(row.original);
								}}
							>
								{row.original.format === 'PDF' ? (
									<IconPrinter size={16} />
								) : (
									<IconDownload size={16} />
								)}
							</ActionIcon>
						</Tooltip>
					),
				}),
			] as BaseTableColumnDef<GeneratedReportRecord>[],
		[t, onDownload]
	);

	return (
		<BaseTable<GeneratedReportRecord>
			data={generated}
			columns={columns}
			getRowId={(record) => record.id}
			density='compact'
			emptyMessage={t('generated.empty')}
		/>
	);
};

export default GeneratedTab;
