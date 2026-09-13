import { createColumnHelper } from '@tanstack/react-table';
import { ActionIcon, Badge, Group, Text } from '@mantine/core';
import { IconCheck, IconExternalLink, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { EvaluationHistoryRow } from '../types';
import { formatDateTime, formatSeconds, getScoreColor, sentimentColor } from '../helpers';

const helper = createColumnHelper<EvaluationHistoryRow>();

interface EvaluationHistoryTableProps {
	rows: EvaluationHistoryRow[];
}

export function EvaluationHistoryTable({ rows }: EvaluationHistoryTableProps) {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();

	const columns: BaseTableColumnDef<EvaluationHistoryRow>[] = [
		helper.accessor('date', {
			header: t('qa.historyColumns.date'),
			cell: (info) => <Text size='sm'>{formatDateTime(info.getValue())}</Text>,
		}) as BaseTableColumnDef<EvaluationHistoryRow>,
		helper.accessor('campaignName', {
			header: t('qa.historyColumns.campaign'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<EvaluationHistoryRow>,
		helper.accessor('durationSeconds', {
			header: t('qa.historyColumns.duration'),
			cell: (info) => <Text size='sm'>{formatSeconds(info.getValue())}</Text>,
		}) as BaseTableColumnDef<EvaluationHistoryRow>,
		helper.accessor('qaScore', {
			header: t('qa.historyColumns.qa'),
			cell: (info) => {
				const row = info.row.original;
				return (
					<Group gap={6} wrap='nowrap'>
						<Badge color={getScoreColor(info.getValue())} variant='light'>{info.getValue()}%</Badge>
						{row.autoFail && <Badge color='red' variant='filled'>{t('qa.autoFail')}</Badge>}
					</Group>
				);
			},
		}) as BaseTableColumnDef<EvaluationHistoryRow>,
		helper.accessor('customerSentiment', {
			header: t('qa.historyColumns.sentiment'),
			cell: (info) => <Text size='sm' c={sentimentColor(info.getValue())}>{info.getValue().toFixed(1)}/5</Text>,
		}) as BaseTableColumnDef<EvaluationHistoryRow>,
		helper.accessor('complianceScore', {
			header: t('qa.historyColumns.compliance'),
			cell: (info) => <Text size='sm' c={getScoreColor(info.getValue())}>{info.getValue()}%</Text>,
		}) as BaseTableColumnDef<EvaluationHistoryRow>,
		helper.accessor('converted', {
			header: t('qa.historyColumns.converted'),
			cell: (info) => (info.getValue()
				? <IconCheck size={16} color='var(--mantine-color-green-6)' />
				: <IconX size={16} color='var(--mantine-color-gray-5)' />),
		}) as BaseTableColumnDef<EvaluationHistoryRow>,
		helper.accessor('evaluatedBy', {
			header: t('qa.historyColumns.evaluatedBy'),
			cell: (info) => <Badge variant='outline'>{info.getValue()}</Badge>,
		}) as BaseTableColumnDef<EvaluationHistoryRow>,
		helper.display({
			id: 'open',
			header: t('qa.historyColumns.open'),
			cell: (info) => (
				<ActionIcon variant='subtle' onClick={() => navigate(`/qa/campaigns/1/calls/${info.row.original.callId}`)}>
					<IconExternalLink size={16} />
				</ActionIcon>
			),
		}) as BaseTableColumnDef<EvaluationHistoryRow>,
	];

	return (
		<BaseTable<EvaluationHistoryRow>
			data={rows}
			columns={columns}
			getRowId={(r) => r.id}
			enablePagination
			pageSize={6}
			density='compact'
		/>
	);
}
