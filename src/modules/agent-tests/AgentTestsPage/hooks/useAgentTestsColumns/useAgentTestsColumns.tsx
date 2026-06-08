import { useMemo } from 'react';
import { ActionIcon, Group, Menu, ThemeIcon, Text } from '@mantine/core';
import {
	IconDotsVertical,
	IconMessageCircle,
	IconPencil,
	IconPlayerPlay,
	IconTool,
	IconTrash,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { timeAgo } from '~/utils/dateUtils';
import type { AgentTest } from '~/models/AgentTestModel';
import { useAgentTestsPage } from '../../context/AgentTestsPageContext';
import styles from '../../AgentTestsPage.module.css';
import { formatAgentTestName } from '../../utils/formatAgentTestName';

interface UseAgentTestsColumnsProps {
	canUpdate: boolean;
	canDelete: boolean;
	canRun: boolean;
	editingTestLoadingId: string | null;
	runningTestIds: string[];
}

function dateTooltip(iso?: string | Date | null) {
	if (!iso) return '—';
	const date = typeof iso === 'string' ? new Date(iso) : iso;
	if (Number.isNaN(date.getTime())) return '—';
	return date.toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export const useAgentTestsColumns = ({
	canUpdate,
	canDelete,
	canRun,
	editingTestLoadingId,
	runningTestIds,
}: UseAgentTestsColumnsProps) => {
	const { t } = useTranslation('agent-tests');
	const {
		openEditModalWithReload,
		handleDelete,
		runTests,
		setPendingRunTests,
		setIsAgentSelectOpen,
		setAgentSelectSource,
	} = useAgentTestsPage();

	return useMemo<ColumnDef<AgentTest>[]>(
		() => [
			{
				accessorKey: 'name',
				header: t('table.columns.name'),
				cell: ({ row }) => (
					<Group gap='xs' wrap='nowrap'>
						<ThemeIcon
							size={24}
							variant='light'
							color={row.original.type === 'tool' ? 'blue' : 'gray'}
						>
							{row.original.type === 'tool' ? (
								<IconTool size={14} />
							) : (
								<IconMessageCircle size={14} />
							)}
						</ThemeIcon>
						<Text size='sm' fw={600} className={styles.nameCell}>
							{formatAgentTestName(row.original.name)}
						</Text>
					</Group>
				),
			},
			{
				id: 'type',
				header: t('table.columns.testType'),
				cell: ({ row }) => (
					<Text size='sm'>
						{row.original.type === 'tool'
							? t('table.type.toolInvocation')
							: t('table.type.nextReply')}
					</Text>
				),
			},
			{
				accessorKey: 'agentId',
				header: t('table.columns.createdBy'),
				cell: ({ row }) => {
					const creatorName = row.original.accessInfo?.creatorName?.trim();
					return (
						<Text size='sm'>{creatorName || row.original.agentId || '-'}</Text>
					);
				},
			},
			{
				id: 'updatedAt',
				header: t('table.columns.updatedAt'),
				cell: ({ row }) => {
					const unixSecs =
						row.original.lastUpdatedAtUnixSecs ??
						row.original.createdAtUnixSecs;
					const dateValue =
						typeof unixSecs === 'number'
							? new Date(unixSecs * 1000).toISOString()
							: (row.original.updatedAt ?? row.original.createdAt);
					return (
						<Text size='sm' title={dateTooltip(dateValue)}>
							{dateValue ? timeAgo(dateValue) : t('table.notAvailable')}
						</Text>
					);
				},
				size: 100,
			},
			{
				id: 'actions',
				header: t('table.columns.actions'),
				cell: ({ row }) => (
					<Group justify='flex-end' onClick={(e) => e.stopPropagation()}>
						<Menu shadow='sm' position='bottom-end' withinPortal>
							<Menu.Target>
								<ActionIcon
									variant='subtle'
									size='sm'
									aria-label={t('table.columns.actions')}
								>
									<IconDotsVertical size={15} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								{canRun && (
									<Menu.Item
										leftSection={<IconPlayerPlay size={15} stroke={1.5} />}
										disabled={runningTestIds.includes(row.original.id)}
										onClick={() => {
											const runTestId = row.original.testId || row.original.id;
											const testAgentId = row.original.agentId;
											if (!testAgentId) {
												setPendingRunTests([runTestId]);
												setAgentSelectSource('table');
												setIsAgentSelectOpen(true);
												return;
											}
											runTests([runTestId], testAgentId);
										}}
									>
										{runningTestIds.includes(row.original.id)
											? t('table.actions.running')
											: t('table.actions.run')}
									</Menu.Item>
								)}
								{canUpdate && (
									<Menu.Item
										leftSection={<IconPencil size={15} stroke={1.5} />}
										disabled={editingTestLoadingId === row.original.id}
										onClick={() => openEditModalWithReload(row.original.id)}
									>
										{t('table.actions.edit')}
									</Menu.Item>
								)}
								{canDelete && (
									<>
										{(canRun || canUpdate) && <Menu.Divider />}
										<Menu.Item
											leftSection={<IconTrash size={15} stroke={1.5} />}
											color='red'
											onClick={() => handleDelete(row.original)}
										>
											{t('table.actions.delete')}
										</Menu.Item>
									</>
								)}
							</Menu.Dropdown>
						</Menu>
					</Group>
				),
				size: 60,
			},
		],
		[
			canDelete,
			canRun,
			canUpdate,
			editingTestLoadingId,
			t,
			openEditModalWithReload,
			handleDelete,
			runTests,
			runningTestIds,
			setPendingRunTests,
			setIsAgentSelectOpen,
		]
	);
};
