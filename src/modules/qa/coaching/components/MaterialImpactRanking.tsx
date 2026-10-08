import { Badge, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconTrophy } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import {
	AreaBadge,
	FormatBadge,
	ImpactBadge,
} from '~/modules/qa/lms/components/Badges';
import { ImpactSparkline } from '~/modules/qa/lms/components/ImpactSparkline';
import type { MaterialImpactRow } from '../postCoaching';

const helper = createColumnHelper<MaterialImpactRow>();

const signed = (delta: number) => `${delta > 0 ? '+' : ''}${delta}`;
const deltaColor = (delta: number) =>
	delta > 0 ? 'green' : delta < 0 ? 'red' : undefined;

interface MaterialImpactRankingProps {
	rows: MaterialImpactRow[];
}

/** The agent's measured materials, best delta first: top 3 with sparklines, then every row. */
export function MaterialImpactRanking({ rows }: MaterialImpactRankingProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.triggers']);
	const top = rows.filter((r) => r.measured).slice(0, 3);

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
		helper.accessor((r) => r.assignment.completedAt ?? '', {
			id: 'completed',
			header: t('agents.impactRanking.columns.completed'),
			cell: (info) => (
				<Text size='sm'>
					{info.getValue() ? dayjs(info.getValue()).format('D MMM YYYY') : '—'}
				</Text>
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
		helper.accessor((r) => r.delta ?? Number.NEGATIVE_INFINITY, {
			id: 'delta',
			header: t('agents.impactRanking.columns.delta'),
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
			icon={IconTrophy}
			title={t('agents.impactRanking.title')}
			description={t('agents.impactRanking.description')}
		>
			<Stack gap='md'>
				{top.length > 0 && (
					<SimpleGrid cols={{ base: 1, md: 3 }} spacing='sm'>
						{top.map((r, i) => (
							<Paper key={r.assignment.id} withBorder p='md' radius='md'>
								<Stack gap='xs'>
									<Group justify='space-between' wrap='nowrap'>
										<Badge size='sm' variant='light' color='blue'>
											{t('agents.impactRanking.rank', { rank: i + 1 })}
										</Badge>
										<ImpactBadge impact={r.assignment.impact} size='xs' />
									</Group>
									<Text size='sm' fw={600} lineClamp={2}>
										{r.content?.title ?? r.assignment.contentId}
									</Text>
									{r.content && (
										<Group gap={4}>
											<FormatBadge format={r.content.format} size='xs' />
											<AreaBadge area={r.content.area} size='xs' />
										</Group>
									)}
									<Text size='xs' c='dimmed'>
										{t(`metrics.${r.assignment.impact!.metricId}`, {
											ns: 'qa.triggers',
										})}
									</Text>
									<Text size='xl' fw={700} c={deltaColor(r.delta ?? 0)}>
										{signed(r.delta ?? 0)}
									</Text>
									<ImpactSparkline
										impact={r.assignment.impact!}
										height={70}
										withCheckpoints={false}
									/>
								</Stack>
							</Paper>
						))}
					</SimpleGrid>
				)}
				<BaseTable<MaterialImpactRow>
					data={rows}
					columns={columns}
					getRowId={(r) => r.assignment.id}
					density='compact'
					emptyMessage={t('agents.drawer.noImpact')}
				/>
			</Stack>
		</SectionCard>
	);
}
