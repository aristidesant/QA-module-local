import { createColumnHelper } from '@tanstack/react-table';
import { Avatar, Group, Stack, Text } from '@mantine/core';
import type { TFunction } from 'i18next';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { TeamListRow } from '../types';
import { alertScoreColor } from '../helpers';

const helper = createColumnHelper<TeamListRow>();

/** The only colour the list uses: red text for what needs attention. Adapts to light and dark. */
const ALERT = 'var(--mantine-color-red-text)';
const VISIBLE_CAMPAIGNS = 2;

export function useTeamsColumns(
	t: TFunction<'qa.team'>
): BaseTableColumnDef<TeamListRow>[] {
	return [
		helper.accessor('team', {
			header: t('teams.list.columns.team'),
			cell: (info) => {
				const row = info.row.original;
				return (
					<Group gap='sm' wrap='nowrap'>
						<Avatar
							name={row.unassigned ? undefined : row.supervisorName}
							color='gray'
							radius='xl'
							size='sm'
						/>
						<Stack gap={0}>
							<Text
								size='sm'
								fw={600}
								c={row.unassigned ? 'dimmed' : undefined}
							>
								{row.team}
							</Text>
							<Text size='xs' c='dimmed'>
								{row.unassigned
									? t('teams.list.noSupervisor')
									: row.supervisorName}
							</Text>
						</Stack>
					</Group>
				);
			},
		}) as BaseTableColumnDef<TeamListRow>,
		helper.accessor('memberCount', {
			header: t('teams.list.columns.members'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<TeamListRow>,
		helper.accessor('averageOverall', {
			header: t('teams.list.columns.averageOverall'),
			cell: (info) => {
				const row = info.row.original;
				if (row.unassigned || row.memberCount === 0) {
					return (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					);
				}
				const alert = alertScoreColor(info.getValue());
				return (
					<Text size='sm' fw={600} c={alert ? ALERT : undefined}>
						{info.getValue()}
					</Text>
				);
			},
		}) as BaseTableColumnDef<TeamListRow>,
		helper.accessor('atRisk', {
			header: t('teams.list.columns.atRisk'),
			cell: (info) =>
				info.getValue() > 0 ? (
					<Text size='sm' fw={600} c={ALERT}>
						{info.getValue()}
					</Text>
				) : (
					<Text size='sm' c='dimmed'>
						—
					</Text>
				),
		}) as BaseTableColumnDef<TeamListRow>,
		helper.accessor('campaignNames', {
			header: t('teams.list.columns.campaigns'),
			enableSorting: false,
			cell: (info) => {
				const names = info.getValue();
				if (names.length === 0) {
					return (
						<Text size='sm' c='dimmed'>
							—
						</Text>
					);
				}
				const overflow = names.length - VISIBLE_CAMPAIGNS;
				return (
					<Text size='sm' c='dimmed'>
						{names.slice(0, VISIBLE_CAMPAIGNS).join(' · ')}
						{overflow > 0 && ` · +${overflow}`}
					</Text>
				);
			},
		}) as BaseTableColumnDef<TeamListRow>,
	];
}
