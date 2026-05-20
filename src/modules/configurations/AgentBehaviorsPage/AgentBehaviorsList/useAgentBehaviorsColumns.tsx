import { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import {
	IconCopy,
	IconLifebuoy,
	IconRefresh,
	IconRestore,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AgentBehavior } from '~/models/AgentBehavior';
import {
	getAgentBehaviorType,
	isBackupBehavior,
	isPrimaryBehavior,
} from '../utils/agentBehaviorHelpers';
import styles from './AgentBehaviorsList.module.css';

interface UseAgentBehaviorsColumnsProps {
	allBehaviors?: AgentBehavior[];
	onClone?: (param: AgentBehavior) => void;
	onDelete?: (param: AgentBehavior) => void;
	onReplace?: (param: AgentBehavior) => void;
	onReplaceWithBackup?: (param: AgentBehavior) => void;
	onRestoreFromBackup?: (param: AgentBehavior) => void;
}

const useAgentBehaviorsColumns = ({
	allBehaviors = [],
	onClone,
	onDelete,
	onReplace,
	onReplaceWithBackup,
	onRestoreFromBackup,
}: UseAgentBehaviorsColumnsProps = {}) => {
	const { t } = useTranslation('campaign-predefined-params');
	const getBackupName = (backupBehaviorId?: string | null) =>
		allBehaviors.find((behavior) => behavior.id === backupBehaviorId)?.name;

	const columns: ColumnDef<AgentBehavior>[] = [
		{
			accessorKey: 'name',
			header: t('list.columns.name', 'Name'),
		},
		{
			accessorKey: 'isBackup',
			header: t('list.columns.type', 'Type'),
			cell: ({ row }) => {
				const behaviorType = getAgentBehaviorType(row.original);

				return (
					<Badge
						size='sm'
						variant='light'
						color={behaviorType === 'BACKUP' ? 'blue' : 'gray'}
					>
						{behaviorType === 'BACKUP'
							? t('list.type.backup', 'Backup')
							: t('list.type.primary', 'Primary')}
					</Badge>
				);
			},
		},
		{
			accessorKey: 'backupBehaviorId',
			header: t('list.columns.backup', 'Backup'),
			cell: ({ row }) => {
				if (isBackupBehavior(row.original)) {
					return (
						<Text size='sm' c='dimmed'>
							{t('list.backup.notApplicable', 'N/A')}
						</Text>
					);
				}

				const backupName = getBackupName(row.original.backupBehaviorId);

				return backupName ? (
					<Badge size='sm' variant='light' color='teal'>
						{backupName}
					</Badge>
				) : (
					<Text size='sm' c='dimmed'>
						{t('list.backup.none', 'None')}
					</Text>
				);
			},
		},
		{
			accessorKey: 'params.conversationConfig.agent.prompt.llm',
			header: t('list.columns.llmModel', 'LLM Model'),
		},
		{
			accessorKey: 'params.conversationConfig.tts.agentOutputAudioFormat',
			header: t('list.columns.audioFormat', 'Audio Format'),
		},
		{
			id: 'actions',
			header: t('list.columns.actions', 'Actions'),
			meta: {
				headerClassName: styles.actionsHeader,
				cellClassName: styles.actionsCell,
			},
			cell: ({ row }) => {
				const isPrimary = isPrimaryBehavior(row.original);
				const canReplaceWithBackup =
					isPrimary && !!row.original.backupBehaviorId && !!onReplaceWithBackup;

				return (
					<Group gap={8} wrap='nowrap' justify='flex-end'>
						<Tooltip label={t('list.actions.clone', 'Clone')} withArrow>
							<ActionIcon
								variant='light'
								color='gray'
								aria-label={t('list.actions.cloneAria', 'Clone behavior')}
								onClick={(e) => {
									e.stopPropagation();
									onClone?.(row.original);
								}}
								size='sm'
								radius='md'
								disabled={!onClone}
							>
								<IconCopy size={14} />
							</ActionIcon>
						</Tooltip>
						{canReplaceWithBackup && (
							<Tooltip
								label={t(
									'list.actions.replaceWithBackup',
									'Replace with backup'
								)}
								withArrow
							>
								<ActionIcon
									variant='light'
									color='teal'
									aria-label={t(
										'list.actions.replaceWithBackupAria',
										'Replace campaigns with backup'
									)}
									onClick={(e) => {
										e.stopPropagation();
										onReplaceWithBackup?.(row.original);
									}}
									size='sm'
									radius='md'
								>
									<IconLifebuoy size={14} />
								</ActionIcon>
							</Tooltip>
						)}
						{isPrimary && onRestoreFromBackup && (
							<Tooltip
								label={t(
									'list.actions.restoreFromBackup',
									'Restore from backup'
								)}
								withArrow
							>
								<ActionIcon
									variant='light'
									color='green'
									aria-label={t(
										'list.actions.restoreFromBackupAria',
										'Restore campaigns from backup'
									)}
									onClick={(e) => {
										e.stopPropagation();
										onRestoreFromBackup?.(row.original);
									}}
									size='sm'
									radius='md'
								>
									<IconRestore size={14} />
								</ActionIcon>
							</Tooltip>
						)}
						<Tooltip
							label={t('list.actions.replace', 'Sync / Replace')}
							withArrow
						>
							<ActionIcon
								variant='light'
								color='blue'
								aria-label={t('list.actions.replaceAria', 'Replace behavior')}
								onClick={(e) => {
									e.stopPropagation();
									onReplace?.(row.original);
								}}
								size='sm'
								radius='md'
								disabled={!onReplace}
							>
								<IconRefresh size={14} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('list.actions.delete', 'Delete')} withArrow>
							<ActionIcon
								variant='light'
								color='red'
								aria-label={t('list.actions.deleteAria', 'Delete behavior')}
								onClick={(e) => {
									e.stopPropagation();
									onDelete?.(row.original);
								}}
								size='sm'
								radius='md'
								disabled={!onDelete}
							>
								<IconTrash size={14} />
							</ActionIcon>
						</Tooltip>
					</Group>
				);
			},
		},
	];

	return columns;
};

export default useAgentBehaviorsColumns;
