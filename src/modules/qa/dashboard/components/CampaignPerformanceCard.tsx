import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Text } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import { getScoreBandColor } from '~/modules/qa/constants/badgeColors';
import { bandsFor } from '~/modules/qa/settings/helpers';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import type { ScoreBands } from '~/modules/qa/settings/types';

export interface CampaignPerformanceEntry {
	id: string;
	name: string;
	status: 'active' | 'paused' | 'completed';
	qaScore: number;
	complianceScore: number;
	sentimentScore: number;
	businessScore: number;
	callsScored: number;
}

interface CampaignPerformanceCardProps {
	entries: CampaignPerformanceEntry[];
	subtitle?: string;
}

/** Only the active campaigns are shown, capped so the widget stays scannable. */
const MAX_CAMPAIGNS = 5;

const ScoreBadge: React.FC<{ score: number; bands: ScoreBands }> = ({
	score,
	bands,
}) => (
	<Badge size='sm' color={getScoreBandColor(score, bands)} variant='light'>
		{score}
	</Badge>
);

/** Snapshot of every running campaign's score across QA, Compliance, Sentiment and Business. */
export const CampaignPerformanceCard: React.FC<
	CampaignPerformanceCardProps
> = ({ entries, subtitle }) => {
	const { t } = useTranslation('qa.dashboard');
	const thresholds = useSettingsStore(selectThresholds);
	// Campaign scores are all 0-100 scores: QA and Compliance follow their own bands, Sentiment and Business reuse the QA bands.
	const qaBands = thresholds.qa.scoreBands;
	const complianceBands = bandsFor(thresholds, 'compliance', 'overall');
	const active = entries
		.filter((entry) => entry.status === 'active')
		.slice(0, MAX_CAMPAIGNS);

	const columns: BaseTableColumnDef<CampaignPerformanceEntry>[] = [
		{
			accessorKey: 'name',
			header: t('campaignPerformance.columns.campaign', 'Campaign'),
			cell: ({ row }) => (
				<Text size='sm' fw={500} lineClamp={1}>
					{row.original.name}
				</Text>
			),
		},
		{
			accessorKey: 'qaScore',
			header: t('campaignPerformance.columns.qa', 'QA'),
			cell: ({ row }) => (
				<ScoreBadge score={row.original.qaScore} bands={qaBands} />
			),
		},
		{
			accessorKey: 'complianceScore',
			header: t('campaignPerformance.columns.compliance', 'Compliance'),
			cell: ({ row }) => (
				<ScoreBadge
					score={row.original.complianceScore}
					bands={complianceBands}
				/>
			),
		},
		{
			accessorKey: 'sentimentScore',
			header: t('campaignPerformance.columns.sentiment', 'Sentiment'),
			cell: ({ row }) => (
				<ScoreBadge score={row.original.sentimentScore} bands={qaBands} />
			),
		},
		{
			accessorKey: 'businessScore',
			header: t('campaignPerformance.columns.business', 'Business'),
			cell: ({ row }) => (
				<ScoreBadge score={row.original.businessScore} bands={qaBands} />
			),
		},
		{
			accessorKey: 'callsScored',
			header: t('campaignPerformance.columns.calls', 'Calls Scored'),
			cell: ({ row }) => (
				<Text size='sm' c='dimmed'>
					{row.original.callsScored}
				</Text>
			),
		},
	];

	return (
		<SectionCard
			title={t('campaignPerformance.title', 'Campaign Performance')}
			description={
				subtitle ??
				t(
					'campaignPerformance.subtitle',
					"General status of every campaign that's currently running"
				)
			}
			fullHeight
			headerActions={
				<Badge size='lg' color='blue' variant='light'>
					{active.length}
				</Badge>
			}
		>
			<BaseTable<CampaignPerformanceEntry>
				columns={columns}
				data={active}
				getRowId={(entry) => entry.id}
				emptyMessage={t(
					'campaignPerformance.empty',
					'No active campaigns right now'
				)}
				density='compact'
			/>
		</SectionCard>
	);
};

export default CampaignPerformanceCard;
