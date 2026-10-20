import { createColumnHelper } from '@tanstack/react-table';
import { Avatar, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import type { TFunction } from 'i18next';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import type { AgentStatus, RosterAgent } from '../../types';
import styles from '../TeamConfigPage.module.css';
import { StatusMenu } from './StatusMenu';

const helper = createColumnHelper<RosterAgent>();

/** Columns of the members table: agent (opens the profile) and a status you can change. */
export function useMemberColumns(
	t: TFunction<'qa.team'>,
	onStatusChange: (agentId: string, status: AgentStatus) => void,
	onViewProfile: (agent: RosterAgent) => void
): BaseTableColumnDef<RosterAgent>[] {
	return [
		helper.accessor('name', {
			enableSorting: false,
			header: t('teamConfig.columns.agent'),
			cell: (info) => {
				const agent = info.row.original;
				return (
					<UnstyledButton
						className={styles.agentLink}
						aria-label={t('teamConfig.row.viewProfile', { name: agent.name })}
						onClick={() => onViewProfile(agent)}
					>
						<Group gap='sm' wrap='nowrap'>
							<Avatar name={agent.name} color='gray' radius='xl' size='sm' />
							<Stack gap={0}>
								<Text size='sm' fw={600} className={styles.agentName}>
									{agent.name}
								</Text>
								<Text size='xs' c='dimmed'>
									{agent.id} · {agent.email}
								</Text>
							</Stack>
						</Group>
					</UnstyledButton>
				);
			},
		}) as BaseTableColumnDef<RosterAgent>,
		helper.accessor('status', {
			enableSorting: false,
			header: t('teamConfig.columns.status'),
			cell: (info) => (
				<StatusMenu
					status={info.getValue()}
					onChange={(status) => onStatusChange(info.row.original.id, status)}
				/>
			),
		}) as BaseTableColumnDef<RosterAgent>,
	];
}
