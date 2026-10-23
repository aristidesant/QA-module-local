import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Stack, Text } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import type { TeamRole } from '~/modules/qa/team/types';
import { participantCount } from '../helpers';
import MetricChips from './MetricChips';

const helper = createColumnHelper<RankingProgram>();

interface PastRankingsTableProps {
	role: TeamRole;
	programs: RankingProgram[];
	onView: (program: RankingProgram) => void;
	/** Copies the ranking as a draft so it can be run again. */
	onReuse: (program: RankingProgram) => void;
}

/** Every ranking that has finished: when it ran, who won, and a way to run it again. */
export const PastRankingsTable: React.FC<PastRankingsTableProps> = ({
	role,
	programs,
	onView,
	onReuse,
}) => {
	const { t } = useTranslation('qa.rankings');

	const columns = useMemo(() => {
		const cols: BaseTableColumnDef<RankingProgram>[] = [
			helper.accessor('name', {
				header: t('past.columns.name'),
				cell: (info) => (
					<Stack gap={4}>
						<Text size='sm' fw={500}>
							{info.getValue()}
						</Text>
						<MetricChips program={info.row.original} size='xs' />
					</Stack>
				),
			}) as BaseTableColumnDef<RankingProgram>,
			helper.accessor('startDate', {
				header: t('past.columns.period'),
				cell: (info) => (
					<Text size='sm'>
						{dayjs(info.getValue()).format('DD MMM')} →{' '}
						{dayjs(info.row.original.endDate).format('DD MMM YYYY')}
					</Text>
				),
			}) as BaseTableColumnDef<RankingProgram>,
		];
		if (role === 'qa-manager') {
			cols.push(
				helper.accessor('teams', {
					header: t('past.columns.teams'),
					cell: (info) => <Text size='sm'>{info.getValue().join(', ')}</Text>,
				}) as BaseTableColumnDef<RankingProgram>
			);
		}
		cols.push(
			helper.accessor('winnerName', {
				header: t('past.columns.winner'),
				cell: (info) => <Text size='sm'>{info.getValue() ?? '—'}</Text>,
			}) as BaseTableColumnDef<RankingProgram>,
			helper.display({
				id: 'participants',
				header: t('past.columns.participants'),
				cell: (info) => (
					<Text size='sm'>{participantCount([info.row.original])}</Text>
				),
			}) as BaseTableColumnDef<RankingProgram>,
			helper.display({
				id: 'actions',
				header: '',
				cell: (info) => (
					<Group gap={4} justify='flex-end' wrap='nowrap'>
						<Button
							size='xs'
							variant='subtle'
							onClick={(e) => {
								e.stopPropagation();
								onReuse(info.row.original);
							}}
						>
							{t('card.reuse')}
						</Button>
					</Group>
				),
			}) as BaseTableColumnDef<RankingProgram>
		);
		return cols;
	}, [role, onReuse, t]);

	return (
		<BaseTable<RankingProgram>
			data={programs}
			columns={columns}
			getRowId={(program) => program.id}
			density='compact'
			emptyMessage={t('empty.past')}
			onRowClick={onView}
		/>
	);
};

export default PastRankingsTable;
