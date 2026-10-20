import { createColumnHelper } from '@tanstack/react-table';
import { ActionIcon, Avatar, Badge, Group, Stack, Text } from '@mantine/core';
import { IconArrowsExchange } from '@tabler/icons-react';
import type { TFunction } from 'i18next';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { AgentStatus, RosterAgent } from '../../types';
import styles from '../TeamConfigPage.module.css';
import { MoveToMenu, type MoveTarget } from './MoveToMenu';

const STATUS_COLOR: Record<AgentStatus, string> = {
	active: 'green',
	'on-leave': 'gray',
	training: 'blue',
};

const helper = createColumnHelper<RosterAgent>();

/** Columns of the members table: agent, shift, status and the hover-revealed move action. */
export function useMemberColumns(
	t: TFunction<'qa.team'>,
	targets: MoveTarget[],
	currentTargetId: string,
	onMove: (agentId: string, targetId: string) => void
): BaseTableColumnDef<RosterAgent>[] {
	return [
		helper.accessor('name', {
			header: t('teamConfig.columns.agent'),
			cell: (info) => {
				const agent = info.row.original;
				return (
					<Group gap='sm' wrap='nowrap'>
						<Avatar
							name={agent.name}
							color={agent.avatarColor}
							radius='xl'
							size='sm'
						/>
						<Stack gap={0}>
							<Text size='sm' fw={600}>
								{agent.name}
							</Text>
							<Text size='xs' c='dimmed'>
								{agent.id} · {agent.email}
							</Text>
						</Stack>
					</Group>
				);
			},
		}) as BaseTableColumnDef<RosterAgent>,
		helper.accessor('shift', {
			header: t('teamConfig.columns.shift'),
			cell: (info) => <Text size='sm'>{t(`shift.${info.getValue()}`)}</Text>,
		}) as BaseTableColumnDef<RosterAgent>,
		helper.accessor('status', {
			header: t('teamConfig.columns.status'),
			cell: (info) => (
				<Badge variant='dot' color={STATUS_COLOR[info.getValue()]}>
					{t(`status.${info.getValue()}`)}
				</Badge>
			),
		}) as BaseTableColumnDef<RosterAgent>,
		helper.display({
			id: 'actions',
			header: '',
			cell: (info) => (
				<Group
					justify='flex-end'
					className={styles.rowActions}
					onClick={(event) => event.stopPropagation()}
				>
					<MoveToMenu
						targets={targets}
						currentTargetId={currentTargetId}
						onSelect={(targetId) => onMove(info.row.original.id, targetId)}
					>
						<ActionIcon
							variant='subtle'
							color='gray'
							size='md'
							aria-label={t('teamConfig.row.moveTo')}
						>
							<IconArrowsExchange size={16} />
						</ActionIcon>
					</MoveToMenu>
				</Group>
			),
		}) as BaseTableColumnDef<RosterAgent>,
	];
}
