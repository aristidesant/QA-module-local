import { Alert, Anchor, Badge, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconHistory } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import SectionCard from '~/components/SectionCard';
import { EVALUATION_STATUS_COLORS } from '~/modules/qa/constants/badgeColors';
import {
	useDateFormatter,
	useNumberFormatter,
} from '~/modules/qa/hooks/useFormatters';
import type { Evaluation } from '~/models/qa';
import classes from './AgentHistoryCard.module.css';

export interface AgentHistoryCardProps {
	history: Evaluation[];
	historyTotal: number;
	page: number;
	pageSize: string;
	totalPages: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (value: string) => void;
	isLoading: boolean;
	isError: boolean;
	errorMessage: string;
}

export default function AgentHistoryCard({
	history,
	historyTotal,
	page,
	pageSize,
	totalPages,
	onPageChange,
	onPageSizeChange,
	isLoading,
	isError,
	errorMessage,
}: AgentHistoryCardProps) {
	const { t } = useTranslation('qa.agents');
	const navigate = useNavigate();
	const dateTimeFormatter = useDateFormatter('dateTime');
	const numberFormatter = useNumberFormatter({ maximumFractionDigits: 2 });

	const historyColumns: BaseTableColumnDef<Evaluation>[] = [
		{
			id: 'form',
			header: t('history.form'),
			enableSorting: false,
			cell: ({ row }) => (
				<Stack gap={2}>
					<Anchor
						aria-label={t('history.openEvaluation', {
							formName: row.original.formName,
						})}
						className={classes.historyLink}
						component={RouterLink}
						fw={700}
						onClick={(event) => event.stopPropagation()}
						size='sm'
						to={`/qa/evaluations/${row.original.id}`}
					>
						{row.original.formName}
					</Anchor>
					{row.original.formCategory ? (
						<Text c='dimmed' size='xs'>
							{row.original.formCategory}
						</Text>
					) : null}
				</Stack>
			),
		},
		{
			id: 'interaction',
			header: t('history.interaction'),
			enableSorting: false,
			cell: ({ row }) => (
				<Text c={row.original.interactionRef ? undefined : 'dimmed'} size='sm'>
					{row.original.interactionRef || t('common.notProvided')}
				</Text>
			),
		},
		{
			id: 'status',
			header: t('history.status'),
			enableSorting: false,
			cell: ({ row }) => (
				<Badge
					color={EVALUATION_STATUS_COLORS[row.original.status]}
					variant='light'
				>
					{t(`evaluationStatus.${row.original.status.toLowerCase()}`)}
				</Badge>
			),
		},
		{
			id: 'score',
			header: t('history.score'),
			enableSorting: false,
			cell: ({ row }) => (
				<Text
					c={row.original.overallScorePct == null ? 'dimmed' : undefined}
					size='sm'
				>
					{row.original.overallScorePct == null
						? t('common.notAvailable')
						: `${numberFormatter.format(row.original.overallScorePct)}%`}
				</Text>
			),
		},
		{
			id: 'date',
			header: t('history.date'),
			enableSorting: false,
			cell: ({ row }) => {
				const date = row.original.evaluatedAt ?? row.original.createdAt;
				return (
					<Text c='dimmed' size='sm'>
						{date
							? dateTimeFormatter.format(new Date(date))
							: t('common.notAvailable')}
					</Text>
				);
			},
		},
	];

	return (
		<SectionCard
			headerActions={
				<Text c='dimmed' size='sm'>
					{t('history.count', { count: historyTotal })}
				</Text>
			}
			icon={IconHistory}
			title={t('history.title')}
		>
			<Stack gap='sm'>
				{isLoading ? (
					<Stack gap='sm'>
						<Skeleton height={36} />
						<Skeleton height={36} />
					</Stack>
				) : null}
				{isError ? (
					<Alert
						color='red'
						icon={<IconAlertTriangle size={16} />}
						title={t('states.errorTitle')}
						variant='light'
					>
						{errorMessage}
					</Alert>
				) : null}
				{!isLoading && !isError && history.length === 0 ? (
					<Text c='dimmed' size='sm'>
						{t('history.empty')}
					</Text>
				) : null}
				{history.length > 0 ? (
					<>
						<BaseTable<Evaluation>
							columns={historyColumns}
							data={history}
							getRowClassName={() => classes.historyRow}
							getRowId={(evaluation) => String(evaluation.id)}
							onRowClick={(evaluation) =>
								navigate(`/qa/evaluations/${evaluation.id}`)
							}
						/>
						<PaginationControls
							currentPage={page}
							itemsPerPage={Number(pageSize)}
							onItemsPerPageChange={(value) => {
								if (value) {
									onPageSizeChange(value);
								}
							}}
							onPageChange={onPageChange}
							totalItems={historyTotal}
							totalPages={totalPages}
						/>
					</>
				) : null}
			</Stack>
		</SectionCard>
	);
}
