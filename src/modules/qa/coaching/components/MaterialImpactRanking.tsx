import { Group, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { FormatBadge, ImpactBadge } from '~/modules/qa/lms/components/Badges';
import type { MaterialImpactRow } from '../postCoaching';

const helper = createColumnHelper<MaterialImpactRow>();

const signed = (delta: number) => `${delta > 0 ? '+' : ''}${delta}`;
const deltaColor = (delta: number) =>
	delta > 0 ? 'green' : delta < 0 ? 'red' : undefined;

interface MaterialImpactRankingProps {
	rows: MaterialImpactRow[];
}

/**
 * Every material the agent has a measurement for, in one table: the greatest
 * change first by default, the worst one click away on the Change header.
 * Materials still being measured always sit last.
 */
export function MaterialImpactRanking({ rows }: MaterialImpactRankingProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.triggers']);

	if (rows.length === 0) {
		return (
			<Text size='sm' c='dimmed'>
				{t('agents.drawer.noImpact')}
			</Text>
		);
	}

	const columns: BaseTableColumnDef<MaterialImpactRow>[] = [
		helper.accessor((r) => r.content?.title ?? r.assignment.contentId, {
			id: 'material',
			header: t('agents.impactRanking.columns.material'),
			cell: (info) => (
				<Group gap='xs' wrap='nowrap'>
					<Text size='sm'>{info.getValue()}</Text>
					{info.row.original.content && (
						<FormatBadge format={info.row.original.content.format} size='xs' />
					)}
				</Group>
			),
		}) as BaseTableColumnDef<MaterialImpactRow>,
		helper.display({
			id: 'metric',
			header: t('agents.impactRanking.columns.metric'),
			cell: (info) => (
				<Text size='xs' c='dimmed'>
					{t(`metrics.${info.row.original.assignment.impact!.metricId}`, {
						ns: 'qa.triggers',
					})}
				</Text>
			),
		}) as BaseTableColumnDef<MaterialImpactRow>,
		helper.display({
			id: 'before',
			header: t('agents.impactRanking.columns.before'),
			cell: (info) => (
				<Text size='sm'>{info.row.original.assignment.impact!.baseline}</Text>
			),
		}) as BaseTableColumnDef<MaterialImpactRow>,
		helper.display({
			id: 'after',
			header: t('agents.impactRanking.columns.after'),
			cell: (info) => (
				<Text size='sm'>
					{info.row.original.assignment.impact!.checkpoint30 ?? '—'}
				</Text>
			),
		}) as BaseTableColumnDef<MaterialImpactRow>,
		helper.accessor((r) => r.delta ?? undefined, {
			id: 'delta',
			header: t('agents.impactRanking.columns.delta'),
			// A material still being measured has no change yet: it stays last in either direction.
			sortUndefined: 'last',
			sortDescFirst: true,
			cell: (info) => {
				const d = info.row.original.delta;
				return d === null ? (
					<Text size='xs' c='dimmed'>
						{t('agents.impactRanking.pending')}
					</Text>
				) : (
					<Text size='sm' fw={600} c={deltaColor(d)}>
						{signed(d)}
					</Text>
				);
			},
		}) as BaseTableColumnDef<MaterialImpactRow>,
		helper.display({
			id: 'verdict',
			header: t('agents.impactRanking.columns.verdict'),
			cell: (info) => (
				<ImpactBadge impact={info.row.original.assignment.impact} size='xs' />
			),
		}) as BaseTableColumnDef<MaterialImpactRow>,
	];

	return (
		<SectionCard
			title={t('agents.impactRanking.title')}
			description={t('agents.impactRanking.description')}
		>
			<BaseTable<MaterialImpactRow>
				data={rows}
				columns={columns}
				getRowId={(r) => r.assignment.id}
				initialSort={[{ id: 'delta', desc: true }]}
				density='compact'
				emptyMessage={t('agents.drawer.noImpact')}
			/>
		</SectionCard>
	);
}
