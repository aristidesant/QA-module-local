import { useMemo, useState } from 'react';
import { Button, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconHistory } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import { AppDrawer } from '~/components/AppDrawer';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import { FormatBadge, ImpactBadge } from '../../components/Badges';
import { ImpactSparkline } from '../../components/ImpactSparkline';

const helper = createColumnHelper<LmsAssignment>();

interface HistoryTabProps {
	assignments: LmsAssignment[];
	contentById: Record<string, LmsContent>;
	onReview: (contentId: string) => void;
}

export function HistoryTab({ assignments, contentById, onReview }: HistoryTabProps) {
	const { t } = useTranslation(['qa.lms', 'qa.triggers']);
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const completed = useMemo(
		() =>
			assignments
				.filter((a) => a.status === 'COMPLETED')
				.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
		[assignments]
	);

	const scored = completed.filter((a) => a.score !== null);
	const improved = completed.filter((a) => a.impact?.verdict === 'IMPROVED').length;
	const declined = completed.filter((a) => a.impact?.verdict === 'DECLINED').length;
	const selected = selectedId ? completed.find((a) => a.id === selectedId) : undefined;
	const selectedContent = selected ? contentById[selected.contentId] : undefined;

	const metricLabel = (a: LmsAssignment) =>
		a.impact ? t(`metrics.${a.impact.metricId}`, { ns: 'qa.triggers' }) : '—';

	const columns: BaseTableColumnDef<LmsAssignment>[] = [
		helper.accessor('contentId', {
			id: 'material',
			header: t('agent.history.columns.material'),
			cell: (info) => {
				const c = contentById[info.getValue()];
				return (
					<Group gap='xs' wrap='nowrap'>
						<Text size='sm'>{c?.title ?? info.getValue()}</Text>
						{c && <FormatBadge format={c.format} size='xs' />}
					</Group>
				);
			},
		}) as BaseTableColumnDef<LmsAssignment>,
		helper.accessor('completedAt', {
			id: 'completed',
			header: t('agent.history.columns.completed'),
			cell: (info) => <Text size='sm'>{info.getValue() ?? '—'}</Text>,
		}) as BaseTableColumnDef<LmsAssignment>,
		helper.accessor('score', {
			id: 'score',
			header: t('agent.history.columns.score'),
			cell: (info) => <Text size='sm'>{info.getValue() === null ? '—' : `${info.getValue()}%`}</Text>,
		}) as BaseTableColumnDef<LmsAssignment>,
		helper.display({
			id: 'metric',
			header: t('agent.history.columns.metric'),
			cell: (info) => (
				<Text size='sm' c='dimmed'>
					{metricLabel(info.row.original)}
				</Text>
			),
		}) as BaseTableColumnDef<LmsAssignment>,
		helper.display({
			id: 'before',
			header: t('agent.history.columns.before'),
			cell: (info) => <Text size='sm'>{info.row.original.impact?.baseline ?? '—'}</Text>,
		}) as BaseTableColumnDef<LmsAssignment>,
		helper.display({
			id: 'after',
			header: t('agent.history.columns.after'),
			cell: (info) => <Text size='sm'>{info.row.original.impact?.checkpoint30 ?? '—'}</Text>,
		}) as BaseTableColumnDef<LmsAssignment>,
		helper.display({
			id: 'impact',
			header: t('agent.history.columns.impact'),
			cell: (info) => <ImpactBadge impact={info.row.original.impact} size='xs' />,
		}) as BaseTableColumnDef<LmsAssignment>,
	];

	return (
		<>
			<Stack gap='md'>
				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
					<StatCard title={t('agent.history.kpi.completed')} value={completed.length} variant='compact' />
					<StatCard
						title={t('agent.history.kpi.averageScore')}
						value={
							scored.length
								? `${Math.round(scored.reduce((s, a) => s + (a.score ?? 0), 0) / scored.length)}%`
								: '—'
						}
						variant='compact'
					/>
					<StatCard
						title={t('agent.history.kpi.improved')}
						value={improved}
						color={improved > 0 ? 'var(--mantine-color-green-7)' : undefined}
						variant='compact'
					/>
					<StatCard
						title={t('agent.history.kpi.declined')}
						value={declined}
						color={declined > 0 ? 'var(--mantine-color-red-7)' : undefined}
						variant='compact'
					/>
				</SimpleGrid>

				<SectionCard
					title={t('agent.history.title')}
					description={t('agent.history.description')}
					icon={IconHistory}
					headerActions={
						<Text size='xs' c='dimmed'>
							{t('agent.history.impactHint')}
						</Text>
					}
				>
					<BaseTable<LmsAssignment>
						data={completed}
						columns={columns}
						getRowId={(r) => r.id}
						density='compact'
						emptyMessage={t('agent.history.empty')}
						onRowClick={(r) => setSelectedId(r.id)}
					/>
				</SectionCard>
			</Stack>

			<AppDrawer
				opened={selectedId !== null}
				onClose={() => setSelectedId(null)}
				size='md'
				title={selectedContent?.title ?? ''}
				description={selected?.completedAt ? t('agent.history.columns.completed') + ': ' + selected.completedAt : undefined}
			>
				{selected && (
					<Stack gap='md'>
						{selected.impact ? (
							<>
								<Group gap='xs'>
									<ImpactBadge impact={selected.impact} />
									<Text size='sm' c='dimmed'>
										{metricLabel(selected)}
									</Text>
								</Group>
								<ImpactSparkline impact={selected.impact} />
							</>
						) : (
							<Text size='sm' c='dimmed'>
								{t('player.completed.noImpact')}
							</Text>
						)}
						<Button variant='light' onClick={() => onReview(selected.contentId)}>
							{t('cta.review')}
						</Button>
					</Stack>
				)}
			</AppDrawer>
		</>
	);
}
