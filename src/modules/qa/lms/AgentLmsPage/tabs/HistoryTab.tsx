import { useMemo, useState } from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconArrowRight, IconHistory } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { AppDrawer } from '~/components/AppDrawer';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import { AreaMark } from '../../components/AreaMark';
import { FormatIcon } from '../../components/FormatIcon';
import { ImpactBadge } from '../../components/Badges';
import { ImpactSparkline } from '../../components/ImpactSparkline';
import { formatDay } from '../../helpers';

const helper = createColumnHelper<LmsAssignment>();

interface HistoryTabProps {
	assignments: LmsAssignment[];
	contentById: Record<string, LmsContent>;
	onReview: (contentId: string) => void;
}

export function HistoryTab({
	assignments,
	contentById,
	onReview,
}: HistoryTabProps) {
	const { t } = useTranslation(['qa.lms', 'qa.triggers']);
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const completed = useMemo(
		() =>
			assignments
				.filter((a) => a.status === 'COMPLETED')
				.sort((a, b) =>
					(b.completedAt ?? '').localeCompare(a.completedAt ?? '')
				),
		[assignments]
	);

	const verdictCount = (verdict: string) =>
		completed.filter((a) => a.impact?.verdict === verdict).length;
	const improved = verdictCount('IMPROVED');
	const same = verdictCount('SAME');
	const declined = verdictCount('DECLINED');
	const selected = selectedId
		? completed.find((a) => a.id === selectedId)
		: undefined;
	const selectedContent = selected
		? contentById[selected.contentId]
		: undefined;

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
						{c && <FormatIcon format={c.format} size={14} />}
						<Text size='sm'>{c?.title ?? info.getValue()}</Text>
					</Group>
				);
			},
		}) as BaseTableColumnDef<LmsAssignment>,
		helper.display({
			id: 'area',
			header: t('agent.history.columns.area'),
			cell: (info) => {
				const c = contentById[info.row.original.contentId];
				return c ? <AreaMark area={c.area} /> : null;
			},
		}) as BaseTableColumnDef<LmsAssignment>,
		helper.accessor('completedAt', {
			id: 'completed',
			header: t('agent.history.columns.completed'),
			cell: (info) => (
				<Text size='sm'>
					{info.getValue() ? formatDay(info.getValue() as string) : '—'}
				</Text>
			),
		}) as BaseTableColumnDef<LmsAssignment>,
		helper.accessor('score', {
			id: 'score',
			header: t('agent.history.columns.score'),
			cell: (info) => (
				<Text size='sm'>
					{info.getValue() === null ? '—' : `${info.getValue()}%`}
				</Text>
			),
		}) as BaseTableColumnDef<LmsAssignment>,
		helper.display({
			id: 'change',
			header: t('agent.history.columns.change'),
			cell: (info) => {
				const impact = info.row.original.impact;
				if (!impact)
					return (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					);
				return (
					<Group gap={4} wrap='nowrap'>
						<Text size='sm'>{impact.baseline}</Text>
						<IconArrowRight size={12} color='var(--mantine-color-dimmed)' />
						<Text size='sm' fw={600}>
							{impact.checkpoint30 ?? '—'}
						</Text>
						<Text size='xs' c='dimmed'>
							{metricLabel(info.row.original)}
						</Text>
					</Group>
				);
			},
		}) as BaseTableColumnDef<LmsAssignment>,
		helper.display({
			id: 'impact',
			header: t('agent.history.columns.impact'),
			cell: (info) => (
				<ImpactBadge impact={info.row.original.impact} size='xs' />
			),
		}) as BaseTableColumnDef<LmsAssignment>,
	];

	return (
		<>
			<Stack gap='md'>
				<Text size='sm'>
					{completed.length === 0
						? t('agent.history.summaryNone')
						: t('agent.history.summary', {
								count: completed.length,
								improved,
								same,
								declined,
							})}
				</Text>

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
				description={
					selected?.completedAt
						? `${t('agent.history.columns.completed')}: ${formatDay(selected.completedAt)}`
						: undefined
				}
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
						<Button
							variant='light'
							onClick={() => onReview(selected.contentId)}
						>
							{t('cta.review')}
						</Button>
					</Stack>
				)}
			</AppDrawer>
		</>
	);
}
