import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Group, Switch, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type { ReportDefinition } from '~/models/qa/reportBuilder';
import styles from '../Reports.module.css';

const MAX_VISIBLE_RECIPIENTS = 2;

interface SchedulesTabProps {
	definitions: ReportDefinition[];
	onToggle: (definition: ReportDefinition) => void;
	onRunNow: (definition: ReportDefinition) => void;
}

const column = createColumnHelper<ReportDefinition>();

/** Definitions that deliver themselves, with their next run. */
export const SchedulesTab: React.FC<SchedulesTabProps> = ({
	definitions,
	onToggle,
	onRunNow,
}) => {
	const { t } = useTranslation('qa.reports');

	const columns = useMemo(
		() =>
			[
				column.accessor('name', {
					header: t('schedules.columns.report'),
					cell: ({ getValue }) => (
						<Text size='sm' fw={500} lineClamp={1}>
							{getValue()}
						</Text>
					),
				}),
				column.accessor('audience', {
					header: t('schedules.columns.audience'),
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
				column.accessor((definition) => definition.schedule?.frequency ?? '', {
					id: 'frequency',
					header: t('schedules.columns.frequency'),
					cell: ({ row }) => (
						<Text size='sm'>
							{t(
								`output.frequencies.${row.original.schedule?.frequency ?? 'WEEKLY'}`
							)}
						</Text>
					),
				}),
				column.accessor((definition) => definition.schedule?.nextRunAt ?? '', {
					id: 'nextRun',
					header: t('schedules.columns.nextRun'),
					cell: ({ getValue }) => (
						<Text size='sm' c='dimmed'>
							{getValue()
								? dayjs(getValue()).format('DD MMM YYYY · HH:mm')
								: '—'}
						</Text>
					),
				}),
				column.display({
					id: 'recipients',
					header: t('schedules.columns.recipients'),
					cell: ({ row }) => {
						const recipients = row.original.schedule?.recipients ?? [];
						const visible = recipients.slice(0, MAX_VISIBLE_RECIPIENTS);
						const hidden = recipients.length - visible.length;
						return (
							<Group gap={4} wrap='nowrap'>
								{visible.map((email) => (
									<Badge key={email} variant='outline' tt='none' size='sm'>
										{email}
									</Badge>
								))}
								{hidden > 0 && (
									<Text size='xs' c='dimmed'>
										{t('schedules.more', { count: hidden })}
									</Text>
								)}
							</Group>
						);
					},
				}),
				column.display({
					id: 'enabled',
					header: t('schedules.columns.enabled'),
					cell: ({ row }) => (
						<Switch
							checked={row.original.schedule?.enabled ?? false}
							onChange={() => onToggle(row.original)}
							onClick={(event) => event.stopPropagation()}
							aria-label={t('schedules.columns.enabled')}
						/>
					),
				}),
				column.display({
					id: 'actions',
					header: '',
					cell: ({ row }) => (
						<Button
							size='xs'
							variant='light'
							onClick={(event) => {
								event.stopPropagation();
								onRunNow(row.original);
							}}
						>
							{t('schedules.runNow')}
						</Button>
					),
				}),
			] as BaseTableColumnDef<ReportDefinition>[],
		[t, onToggle, onRunNow]
	);

	return (
		<BaseTable<ReportDefinition>
			data={definitions}
			columns={columns}
			getRowId={(definition) => definition.id}
			density='compact'
			emptyMessage={t('schedules.empty')}
		/>
	);
};

export default SchedulesTab;
