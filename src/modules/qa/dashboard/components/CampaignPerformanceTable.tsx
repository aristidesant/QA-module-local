import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, Text } from '@mantine/core';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import {
	SCORE_BAND_TONE,
	isExceptionBand,
} from '~/modules/qa/constants/badgeColors';
import { bandFor } from '~/modules/qa/settings/helpers';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import type { CampaignPerformanceRow } from '../operationManagerMetrics';

interface CampaignPerformanceTableProps {
	rows: CampaignPerformanceRow[];
	/** The campaign the dashboard is filtered to, highlighted in the table. */
	activeId?: string | null;
	onRowClick?: (row: CampaignPerformanceRow) => void;
}

/** Label of each score band, in `qa.dashboard`. */
const BAND_LABEL_KEY = {
	good: 'bands.onTarget',
	warning: 'bands.watch',
	critical: 'bands.atRisk',
} as const;

/** Every campaign with calls in the window, with its quality, compliance, sentiment and conversion. */
export const CampaignPerformanceTable: React.FC<
	CampaignPerformanceTableProps
> = ({ rows, activeId = null, onRowClick }) => {
	const { t } = useTranslation('qa.dashboard');
	const thresholds = useSettingsStore(selectThresholds);

	const columns = useMemo<BaseTableColumnDef<CampaignPerformanceRow>[]>(
		() => [
			{
				accessorKey: 'name',
				header: t('operationManager.campaigns.column.campaign'),
				cell: ({ row }) => (
					<Text size='sm' fw={500}>
						{row.original.name}
					</Text>
				),
			},
			{
				accessorKey: 'lineOfBusiness',
				header: t('operationManager.campaigns.column.lineOfBusiness'),
				cell: ({ row }) => (
					<Text size='sm' c='dimmed'>
						{row.original.lineOfBusiness ?? '—'}
					</Text>
				),
			},
			{
				accessorKey: 'calls',
				header: t('operationManager.campaigns.column.calls'),
				cell: ({ row }) => <Text size='sm'>{row.original.calls}</Text>,
			},
			{
				accessorKey: 'qaScore',
				header: t('operationManager.campaigns.column.qa'),
				cell: ({ row }) => {
					const band = bandFor(row.original.qaScore, thresholds.qa.scoreBands);
					return (
						<Group gap='xs' wrap='nowrap'>
							<Text size='sm' fw={600}>
								{row.original.qaScore}
							</Text>
							{isExceptionBand(band) && (
								<Badge size='xs' variant='light' color={SCORE_BAND_TONE[band]}>
									{t(BAND_LABEL_KEY[band])}
								</Badge>
							)}
						</Group>
					);
				},
			},
			{
				accessorKey: 'compliance',
				header: t('operationManager.campaigns.column.compliance'),
				cell: ({ row }) => <Text size='sm'>{row.original.compliance}%</Text>,
			},
			{
				accessorKey: 'customerSentiment',
				header: t('operationManager.campaigns.column.customerSentiment'),
				cell: ({ row }) => (
					<Text size='sm'>{row.original.customerSentiment.toFixed(1)}</Text>
				),
			},
			{
				accessorKey: 'autoFails',
				header: t('operationManager.campaigns.column.autoFails'),
				cell: ({ row }) => (
					<Text
						size='sm'
						fw={row.original.autoFails > 0 ? 600 : undefined}
						c={row.original.autoFails > 0 ? 'danger.7' : undefined}
					>
						{row.original.autoFails}
					</Text>
				),
			},
			{
				accessorKey: 'conversionRate',
				header: t('operationManager.campaigns.column.conversion'),
				cell: ({ row }) => (
					<Text size='sm'>
						{row.original.conversionRate === null
							? '—'
							: `${row.original.conversionRate}%`}
					</Text>
				),
			},
		],
		[t, thresholds]
	);

	return (
		<BaseTable<CampaignPerformanceRow>
			columns={columns}
			data={rows}
			getRowId={(row) => row.id}
			selectedRowId={activeId}
			onRowClick={onRowClick}
			emptyMessage={t('operationManager.campaigns.empty')}
		/>
	);
};

export default CampaignPerformanceTable;
