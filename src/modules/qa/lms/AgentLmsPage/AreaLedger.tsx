import { Button, Group, Progress, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type { LmsArea, LmsAssignment, LmsContent } from '~/models/qa';
import type { AgentProfile } from '~/modules/qa/team/types';
import { AreaMark } from '../components/AreaMark';
import { AreaScoreTile } from '../components/AreaScoreTile';
import { FormatIcon } from '../components/FormatIcon';
import { LMS_FORMAT_META } from '../constants';
import { areaEvidence, areaOrder, dueLabel, effectiveStatus } from '../helpers';
import classes from './AreaLedger.module.css';

/** One table row: an open item, or an area with nothing assigned. */
interface LedgerRow {
	id: string;
	area: LmsArea;
	/** First row of its area: the only one that names the area and its score. */
	first: boolean;
	assignment?: LmsAssignment;
}

const helper = createColumnHelper<LedgerRow>();

interface AreaLedgerProps {
	open: LmsAssignment[];
	completed: LmsAssignment[];
	contentById: Record<string, LmsContent>;
	profile: AgentProfile | undefined;
	onOpen: (contentId: string) => void;
}

/** The areas the agent is scored on, weakest first, each with its score and the open material that targets it. */
export function AreaLedger({
	open,
	completed,
	contentById,
	profile,
	onOpen,
}: AreaLedgerProps) {
	const { t } = useTranslation('qa.lms');

	const rows: LedgerRow[] = areaOrder(profile).flatMap((area): LedgerRow[] => {
		const items = open.filter((a) => contentById[a.contentId]?.area === area);
		const finished = completed.some(
			(a) => contentById[a.contentId]?.area === area
		);
		if (area === 'GENERAL' && items.length === 0 && !finished) return [];
		if (items.length === 0) return [{ id: `${area}-none`, area, first: true }];
		return items.map((assignment, i) => ({
			id: assignment.id,
			area,
			first: i === 0,
			assignment,
		}));
	});

	const evidenceLine = (area: LmsArea) => {
		const e = areaEvidence(area, completed, contentById);
		if (e.finished === 0) return t('agent.areas.evidenceNone');
		if (e.measured === 0)
			return t('agent.areas.evidenceUnmeasured', { count: e.finished });
		return t('agent.areas.evidence', {
			count: e.finished,
			improved: e.improved,
		});
	};

	const columns: BaseTableColumnDef<LedgerRow>[] = [
		helper.display({
			id: 'area',
			header: t('agent.areas.columns.area'),
			enableSorting: false,
			cell: ({ row }) =>
				row.original.first ? (
					<Stack gap={4}>
						<AreaMark area={row.original.area} size='sm' />
						<Text size='xs' c='dimmed'>
							{evidenceLine(row.original.area)}
						</Text>
					</Stack>
				) : null,
		}) as BaseTableColumnDef<LedgerRow>,
		helper.display({
			id: 'score',
			header: t('agent.areas.columns.score'),
			enableSorting: false,
			cell: ({ row }) =>
				row.original.first ? (
					<div className={classes.score}>
						<AreaScoreTile
							area={row.original.area}
							profile={profile}
							compact
							showLabel={false}
						/>
					</div>
				) : null,
		}) as BaseTableColumnDef<LedgerRow>,
		helper.display({
			id: 'material',
			header: t('agent.areas.columns.material'),
			enableSorting: false,
			cell: ({ row }) => {
				const { assignment } = row.original;
				const content = assignment
					? contentById[assignment.contentId]
					: undefined;
				if (!assignment || !content) {
					return (
						<Text size='sm' c='dimmed'>
							{t('agent.areas.nothingHere')}
						</Text>
					);
				}
				return (
					<Stack gap={2}>
						<Group gap='xs' wrap='nowrap'>
							<FormatIcon format={content.format} size={14} />
							<Text size='sm' fw={600}>
								{content.title}
							</Text>
						</Group>
						<Text size='sm'>{assignment.reason}</Text>
						<Text size='xs' c='dimmed'>
							{t('common.minutes', { count: content.durationMin })}
							{assignment.mandatory
								? ''
								: `, ${t('agent.assignments.optional').toLowerCase()}`}
						</Text>
					</Stack>
				);
			},
		}) as BaseTableColumnDef<LedgerRow>,
		helper.display({
			id: 'due',
			header: t('agent.areas.columns.due'),
			enableSorting: false,
			cell: ({ row }) => {
				const { assignment } = row.original;
				if (!assignment) return null;
				const overdue = effectiveStatus(assignment) === 'OVERDUE';
				return (
					<Text
						size='sm'
						c={overdue ? undefined : 'dimmed'}
						className={overdue ? classes.due : undefined}
					>
						{dueLabel(t, assignment)}
					</Text>
				);
			},
		}) as BaseTableColumnDef<LedgerRow>,
		helper.display({
			id: 'progress',
			header: t('agent.areas.columns.progress'),
			enableSorting: false,
			cell: ({ row }) => {
				const { assignment } = row.original;
				if (!assignment) return null;
				if (assignment.progress === 0)
					return (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					);
				const overdue = effectiveStatus(assignment) === 'OVERDUE';
				return (
					<Stack gap={4} className={classes.progress}>
						<Progress
							value={assignment.progress}
							size='sm'
							radius='xl'
							color={overdue ? 'danger' : undefined}
						/>
						<Text size='xs' c='dimmed'>
							{t('agent.assignments.progress', { value: assignment.progress })}
						</Text>
					</Stack>
				);
			},
		}) as BaseTableColumnDef<LedgerRow>,
		helper.display({
			id: 'action',
			header: '',
			enableSorting: false,
			cell: ({ row }) => {
				const { assignment } = row.original;
				const content = assignment
					? contentById[assignment.contentId]
					: undefined;
				if (!assignment || !content) return null;
				const inProgress = assignment.progress > 0;
				return (
					<Button size='xs' variant='subtle' onClick={() => onOpen(content.id)}>
						{t(
							inProgress
								? 'cta.continue'
								: LMS_FORMAT_META[content.format].ctaKey
						)}
					</Button>
				);
			},
		}) as BaseTableColumnDef<LedgerRow>,
	];

	return (
		<SectionCard
			title={t('agent.areas.title')}
			description={t('agent.areas.description')}
		>
			<BaseTable<LedgerRow>
				data={rows}
				columns={columns}
				getRowId={(r) => r.id}
				emptyMessage={t('agent.assignments.empty')}
			/>
		</SectionCard>
	);
}
