import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
	ActionIcon,
	Badge,
	Loader,
	Text,
	ThemeIcon,
	Tooltip,
} from '@mantine/core';
import { IconFileText, IconFileXFilled } from '@tabler/icons-react';
import type { AgentKnowledgeBase } from '~/models/AgentKnowledgeBase';
import styles from './AgentKnowledgeBase.module.css';

const statusColorMap: Record<string, string> = {
	active: 'green',
	pending: 'yellow',
	failed: 'red',
	inactive: 'gray',
};

const assignedFormatter = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
});

const formatAssignedAt = (value?: string | null) => {
	if (!value) {
		return '—';
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '—';
	}

	return assignedFormatter.format(date);
};

interface UseAgentKnowledgeBaseColumnsProps {
	onUnassign: (knowledgeBase: AgentKnowledgeBase) => void;
	unassigningId: number | null;
}

export const useAgentKnowledgeBaseColumns = ({
	onUnassign,
	unassigningId,
}: UseAgentKnowledgeBaseColumnsProps): ColumnDef<AgentKnowledgeBase, any>[] =>
	React.useMemo(
		() => [
			{
				accessorKey: 'knowledgeBaseName',
				header: 'Knowledge Base',
				cell: ({ row }) => {
					const kb = row.original;

					return (
						<div className={styles.nameCell}>
							<ThemeIcon variant='light' color='gray' size='sm'>
								<IconFileText size={16} />
							</ThemeIcon>
							<div className={styles.nameContent}>
								<Text size='sm' fw={500} className={styles.nameTitle}>
									{kb.knowledgeBaseName}
								</Text>
								<Text size='xs' c='dimmed' className={styles.nameMeta}>
									ID #{kb.knowledgeBaseId}
								</Text>
							</div>
						</div>
					);
				},
				meta: {
					cellClassName: styles.nameCellWrapper,
				},
			},
			{
				accessorKey: 'knowledgeBaseStatus',
				header: 'Status',
				cell: ({ row }) => {
					const status = row.original.knowledgeBaseStatus ?? '';
					const badgeColor = statusColorMap[status.toLowerCase()] ?? 'gray';

					return (
						<Badge
							className={styles.statusBadge}
							color={badgeColor}
							variant='light'
							size='sm'
						>
							{status}
						</Badge>
					);
				},
				meta: {
					cellClassName: styles.statusCell,
				},
			},
			{
				accessorKey: 'assignedAt',
				header: 'Assigned',
				cell: ({ row }) => (
					<Text size='sm' className={styles.assignedCell}>
						{formatAssignedAt(row.original.assignedAt)}
					</Text>
				),
				meta: {
					cellClassName: styles.assignedCell,
				},
			},
			{
				id: 'actions',
				header: '',
				enableSorting: false,
				cell: ({ row }) => {
					const kb = row.original;
					const isProcessing = unassigningId === kb.knowledgeBaseId;
					const isDisabled =
						unassigningId !== null && unassigningId !== kb.knowledgeBaseId;

					return (
						<div className={styles.actionCellContent}>
							<Tooltip label='Unassign knowledge base' position='left'>
								<ActionIcon
									variant='subtle'
									color='red'
									onClick={() => onUnassign(kb)}
									disabled={isDisabled}
									aria-label={`Unassign ${kb.knowledgeBaseName}`}
								>
									{isProcessing ? (
										<Loader size='xs' color='red' />
									) : (
										<IconFileXFilled size={16} />
									)}
								</ActionIcon>
							</Tooltip>
						</div>
					);
				},
				meta: {
					cellClassName: styles.actionCell,
				},
			},
		],
		[onUnassign, unassigningId]
	);

export default useAgentKnowledgeBaseColumns;
