import { createColumnHelper } from '@tanstack/react-table';
import { Avatar, Badge, Group, Stack, Text } from '@mantine/core';
import { IconAward, IconTrendingDown, IconTrendingUp, IconMinus } from '@tabler/icons-react';
import type { TFunction } from 'i18next';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { AgentProfile, TeamRole, TeamTableRow } from '../types';
import { formatDate, formatSeconds, getScoreColor, sentimentColor, trendColor } from '../helpers';

const STATUS_COLOR: Record<TeamTableRow['status'], string> = { active: 'green', 'on-leave': 'gray', training: 'blue' };
const BURNOUT_COLOR: Record<TeamTableRow['burnoutLevel'], string> = { low: 'green', medium: 'yellow', high: 'red' };

const helper = createColumnHelper<TeamTableRow>();

export function useTeamColumns(
	role: TeamRole,
	profiles: Record<string, AgentProfile>,
	t: TFunction<'qa.team'>,
): BaseTableColumnDef<TeamTableRow>[] {
	const columns: BaseTableColumnDef<TeamTableRow>[] = [
		helper.accessor('name', {
			header: t('team.columns.agent'),
			cell: (info) => {
				const row = info.row.original;
				const profile = profiles[row.id];
				return (
					<Group gap='sm' wrap='nowrap'>
						<Avatar name={row.name} color={profile?.agent.avatarColor} radius='xl' size='sm' />
						<Stack gap={0}>
							<Text size='sm' fw={600}>{row.name}</Text>
							<Text size='xs' c='dimmed'>{row.id}</Text>
						</Stack>
					</Group>
				);
			},
		}) as BaseTableColumnDef<TeamTableRow>,
	];

	if (role === 'qa-manager') {
		columns.push(
			helper.accessor('team', {
				header: t('team.columns.team'),
				cell: (info) => (
					<Stack gap={0}>
						<Text size='sm'>{info.getValue()}</Text>
						<Text size='xs' c='dimmed'>{info.row.original.supervisorName}</Text>
					</Stack>
				),
			}) as BaseTableColumnDef<TeamTableRow>,
		);
	}

	columns.push(
		helper.accessor('status', {
			header: t('team.columns.status'),
			cell: (info) => (
				<Badge variant='light' color={STATUS_COLOR[info.getValue()]}>{t(`status.${info.getValue()}`)}</Badge>
			),
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('overall', {
			header: t('team.columns.overall'),
			cell: (info) => {
				const row = info.row.original;
				const Icon = row.overallTrend === 'up' ? IconTrendingUp : row.overallTrend === 'down' ? IconTrendingDown : IconMinus;
				return (
					<Group gap={6} wrap='nowrap'>
						<Badge size='lg' variant='filled' color={getScoreColor(info.getValue())}>{info.getValue()}</Badge>
						<Icon size={14} color={`var(--mantine-color-${trendColor(row.overallTrend)}-6)`} />
					</Group>
				);
			},
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('qa', {
			header: t('team.columns.qa'),
			cell: (info) => <Text size='sm' c={getScoreColor(info.getValue())} fw={600}>{info.getValue()}%</Text>,
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('sentiment', {
			header: t('team.columns.sentiment'),
			cell: (info) => <Text size='sm' c={sentimentColor(info.getValue())} fw={600}>{info.getValue().toFixed(1)}/5</Text>,
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('compliance', {
			header: t('team.columns.compliance'),
			cell: (info) => <Text size='sm' c={getScoreColor(info.getValue())} fw={600}>{info.getValue()}%</Text>,
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('conversionRate', {
			header: t('team.columns.conversion'),
			cell: (info) => <Text size='sm'>{info.getValue()}%</Text>,
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('ahtSeconds', {
			header: t('team.columns.aht'),
			cell: (info) => <Text size='sm'>{formatSeconds(info.getValue())}</Text>,
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('burnoutLevel', {
			header: t('team.columns.burnout'),
			cell: (info) => <Badge variant='dot' color={BURNOUT_COLOR[info.getValue()]}>{t(`burnout.${info.getValue()}`)}</Badge>,
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('badges', {
			header: t('team.columns.badges'),
			cell: (info) => (
				<Group gap={4}>
					<IconAward size={14} />
					<Text size='sm'>{info.getValue()}</Text>
				</Group>
			),
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.display({
			id: 'followUps',
			header: t('team.columns.followUps'),
			cell: (info) => {
				const row = info.row.original;
				return (
					<Text size='xs' c={row.overdueLms > 0 ? 'orange' : undefined}>
						{t('team.followUpsCell', { coaching: row.openCoaching, lms: row.overdueLms })}
					</Text>
				);
			},
		}) as BaseTableColumnDef<TeamTableRow>,
		helper.accessor('lastEvaluationAt', {
			header: t('team.columns.lastEvaluation'),
			cell: (info) => <Text size='sm'>{formatDate(info.getValue())}</Text>,
		}) as BaseTableColumnDef<TeamTableRow>,
	);

	return columns;
}
