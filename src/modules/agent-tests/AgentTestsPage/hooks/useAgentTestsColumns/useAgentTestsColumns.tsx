import { useMemo } from 'react';
import { ActionIcon, Group, ThemeIcon, Text, Tooltip } from '@mantine/core';
import {
	IconMessageCircle,
	IconPencil,
	IconPlayerPlay,
	IconTool,
	IconTrash,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import type { AgentTest } from '~/models/AgentTestModel';
import { useAgentTestsPage } from '../../context/AgentTestsPageContext';
import styles from '../../AgentTestsPage.module.css';
import { formatAgentTestName } from '../../utils/formatAgentTestName';

interface UseAgentTestsColumnsProps {
	canUpdate: boolean;
	canDelete: boolean;
	canRun: boolean;
	agentOptions: Array<{ value: string; label: string }>;
	editingTestLoadingId: string | null;
	runningTestIds: string[];
}

export const useAgentTestsColumns = ({
	canUpdate,
	canDelete,
	canRun,
	agentOptions,
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
					const option = agentOptions.find(
						(agent) => agent.value === row.original.agentId
					);

					return (
						<Text size='sm'>
							{creatorName || option?.label || row.original.agentId || '-'}
						</Text>
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
					const formatted = dateValue
						? new Date(dateValue).toLocaleString()
						: t('table.notAvailable');
					return (
						<Text size='xs' c='dimmed'>
							{formatted}
						</Text>
					);
				},
			},
			{
				id: 'actions',
				header: t('table.columns.actions'),
				cell: ({ row }) => (
					<Group gap='xs' wrap='nowrap'>
						{canRun && (
							<Tooltip label={t('table.actions.run')} withArrow>
								<ActionIcon
									size='sm'
									variant='subtle'
									color='green'
									loading={runningTestIds.includes(row.original.id)}
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
									<IconPlayerPlay size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{canUpdate && (
							<Tooltip label={t('table.actions.edit')} withArrow>
								<ActionIcon
									size='sm'
									variant='subtle'
									color='blue'
									loading={editingTestLoadingId === row.original.id}
									disabled={editingTestLoadingId === row.original.id}
									onClick={() => openEditModalWithReload(row.original.id)}
								>
									<IconPencil size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{canDelete && (
							<Tooltip label={t('table.actions.delete')} withArrow>
								<ActionIcon
									size='sm'
									variant='subtle'
									color='red'
									onClick={() => handleDelete(row.original)}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
						)}
					</Group>
				),
			},
		],
		[
			agentOptions,
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
