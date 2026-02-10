import { useMemo } from 'react';
import {
	ActionIcon,
	Checkbox,
	Group,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconPencil, IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import type { AgentTest } from '~/models/AgentTestModel';
import { useAgentTestsPage } from '../../context/AgentTestsPageContext';
import styles from '../../AgentTestsPage.module.css';

interface UseAgentTestsColumnsProps {
	canUpdate: boolean;
	canDelete: boolean;
	canRun: boolean;
	agentOptions: Array<{ value: string; label: string }>;
	tests: AgentTest[];
}

export const useAgentTestsColumns = ({
	canUpdate,
	canDelete,
	canRun,
	agentOptions,
	tests,
}: UseAgentTestsColumnsProps) => {
	const { t } = useTranslation('agent-tests');
	const {
		selectedTestIds,
		allCurrentPageSelected,
		someCurrentPageSelected,
		toggleRowSelection,
		toggleAllCurrentPage,
		openEditModal,
		handleDelete,
		runTests,
		setPendingRunTests,
		setIsAgentSelectOpen,
	} = useAgentTestsPage();

	return useMemo<ColumnDef<AgentTest>[]>(
		() => [
			{
				id: 'select',
				header: () => (
					<Checkbox
						checked={allCurrentPageSelected(tests)}
						indeterminate={someCurrentPageSelected(tests)}
						onChange={(event) =>
							toggleAllCurrentPage(tests, event.currentTarget.checked)
						}
						aria-label={t('table.selectAll')}
						size='sm'
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={selectedTestIds.includes(row.original.id)}
						onChange={(event) =>
							toggleRowSelection(row.original.id, event.currentTarget.checked)
						}
						aria-label={t('table.selectRow', { name: row.original.name })}
						size='sm'
					/>
				),
			},
			{
				accessorKey: 'name',
				header: t('table.columns.name'),
				cell: ({ row }) => (
					<Text size='sm' fw={600} className={styles.nameCell}>
						{row.original.name}
					</Text>
				),
			},
			{
				accessorKey: 'agentId',
				header: t('table.columns.agent'),
				cell: ({ row }) => {
					const option = agentOptions.find(
						(agent) => agent.value === row.original.agentId
					);

					return (
						<Stack gap={2}>
							<Text size='sm'>{option?.label ?? row.original.agentId}</Text>
							<Text size='xs' c='dimmed'>
								{row.original.agentId}
							</Text>
						</Stack>
					);
				},
			},
			{
				accessorKey: 'prompt',
				header: t('table.columns.prompt'),
				cell: ({ row }) => {
					const firstUserMessage = row.original.chatHistory?.find(
						(item) => item.role === 'user'
					)?.message;

					return (
						<Text size='sm' lineClamp={2} className={styles.textCell}>
							{firstUserMessage ?? row.original.prompt ?? '-'}
						</Text>
					);
				},
			},
			{
				id: 'successCondition',
				header: t('table.columns.successCondition'),
				cell: ({ row }) => (
					<Text size='sm' lineClamp={2} className={styles.textCell}>
						{row.original.successCondition ??
							row.original.expectedResponse ??
							'-'}
					</Text>
				),
			},
			{
				id: 'updatedAt',
				header: t('table.columns.updatedAt'),
				cell: ({ row }) => {
					const dateValue = row.original.updatedAt ?? row.original.createdAt;
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
									onClick={() => {
										const testAgentId = row.original.agentId;
										if (!testAgentId) {
											setPendingRunTests([row.original.id]);
											setIsAgentSelectOpen(true);
											return;
										}
										runTests([row.original.id], testAgentId);
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
									onClick={() => openEditModal(row.original)}
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
			selectedTestIds,
			t,
			tests,
			allCurrentPageSelected,
			someCurrentPageSelected,
			toggleRowSelection,
			toggleAllCurrentPage,
			openEditModal,
			handleDelete,
			runTests,
			setPendingRunTests,
			setIsAgentSelectOpen,
		]
	);
};
