import { Badge, Button, Text } from '@mantine/core';
import { IconArrowRight, IconClipboardCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import type { Evaluation } from '~/models/qa';
import { formatScorePct } from '~/modules/qa/utils/format';

export interface RecentEvaluationsCardProps {
	evaluations: Evaluation[];
	loading: boolean;
	resolveAgentName: (evaluation: Evaluation) => string;
	className?: string;
}

export default function RecentEvaluationsCard({
	evaluations,
	loading,
	resolveAgentName,
	className,
}: RecentEvaluationsCardProps) {
	const { t } = useTranslation('qa.dashboard');
	const navigate = useNavigate();
	const dateFormatter = useDateFormatter('dateTime');

	const columns: BaseTableColumnDef<Evaluation>[] = [
		{
			id: 'agent',
			header: t('recent.columns.agent'),
			enableSorting: false,
			cell: ({ row }) => (
				<Text fw={600} size='sm'>
					{resolveAgentName(row.original)}
				</Text>
			),
		},
		{
			id: 'form',
			header: t('recent.columns.form'),
			enableSorting: false,
			cell: ({ row }) => <Text size='sm'>{row.original.formName}</Text>,
		},
		{
			id: 'evaluatorType',
			header: t('recent.columns.evaluator'),
			enableSorting: false,
			cell: ({ row }) => (
				<Badge
					color={row.original.evaluatorType === 'AI' ? 'blue' : 'gray'}
					variant='light'
				>
					{t(`evaluatorType.${row.original.evaluatorType.toLowerCase()}`)}
				</Badge>
			),
		},
		{
			id: 'status',
			header: t('recent.columns.status'),
			enableSorting: false,
			cell: ({ row }) => (
				<Badge
					color={row.original.status === 'COMPLETED' ? 'green' : 'yellow'}
					variant='light'
				>
					{t(`status.${row.original.status.toLowerCase()}`)}
				</Badge>
			),
		},
		{
			id: 'score',
			header: t('recent.columns.score'),
			enableSorting: false,
			cell: ({ row }) => (
				<Text
					c={row.original.overallScorePct == null ? 'dimmed' : undefined}
					fw={row.original.overallScorePct == null ? 400 : 700}
					size='sm'
					ta='right'
				>
					{row.original.overallScorePct == null
						? t('recent.notAvailable')
						: t('recent.scoreValue', {
								score: formatScorePct(row.original.overallScorePct),
							})}
				</Text>
			),
		},
		{
			id: 'createdAt',
			header: t('recent.columns.created'),
			enableSorting: false,
			cell: ({ row }) => (
				<Text c='dimmed' size='sm'>
					{row.original.createdAt
						? dateFormatter.format(new Date(row.original.createdAt))
						: t('recent.notAvailable')}
				</Text>
			),
		},
	];

	return (
		<SectionCard
			className={className}
			description={t('recent.description')}
			headerActions={
				<Button
					component={RouterLink}
					rightSection={<IconArrowRight size={14} />}
					size='xs'
					to='/qa/evaluations'
					variant='subtle'
				>
					{t('recent.viewAll')}
				</Button>
			}
			icon={IconClipboardCheck}
			title={t('recent.title')}
		>
			{!loading && evaluations.length === 0 ? (
				<EmptyState
					description={t('recent.emptyDescription')}
					icon={<IconClipboardCheck size={32} />}
					message={t('recent.empty')}
				/>
			) : (
				<BaseTable<Evaluation>
					columns={columns}
					data={evaluations}
					getRowId={(evaluation) => String(evaluation.id)}
					isLoading={loading}
					onRowClick={(evaluation) =>
						navigate(`/qa/evaluations/${evaluation.id}`)
					}
					skeletonRowsCount={5}
				/>
			)}
		</SectionCard>
	);
}
