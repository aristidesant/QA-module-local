import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
	ActionIcon,
	Badge,
	Checkbox,
	Group,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconGitCompare, IconRotate2, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type {
	AgentVersionCommit,
	AgentVersionSummary,
} from '~/models/AgentVersioningModel';
import {
	findCommitForVersion,
	formatCommittedAgo,
	formatCommittedAt,
} from './VersioningSection.helpers';
import classes from './VersioningSection.module.css';

interface UseVersionHistoryColumnsOptions {
	onCompare: (version: AgentVersionSummary) => void;
	onRevert: (version: AgentVersionSummary) => void;
	onDelete: (version: AgentVersionSummary) => void;
	isReverting: boolean;
	isDeleting: boolean;
	activeVersionId?: string | null;
	versionCommits: AgentVersionCommit[];
	selectedVersionIds: Set<string>;
	onToggleSelect: (versionId: string) => void;
	onSelectAll: () => void;
	onDeselectAll: () => void;
	allSelected: boolean;
	someSelected: boolean;
}

const useVersionHistoryColumns = ({
	onCompare,
	onRevert,
	onDelete,
	isReverting,
	isDeleting,
	activeVersionId,
	versionCommits,
	selectedVersionIds,
	onToggleSelect,
	onSelectAll,
	onDeselectAll,
	allSelected,
	someSelected,
}: UseVersionHistoryColumnsOptions): ColumnDef<AgentVersionSummary>[] => {
	const { t } = useTranslation('campaign.form.versioning');

	return useMemo(
		() => [
			{
				id: 'select',
				header: () => (
					<Checkbox
						size='xs'
						checked={allSelected}
						indeterminate={someSelected}
						onChange={() => (allSelected ? onDeselectAll() : onSelectAll())}
						aria-label={t('history.selectAll')}
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						size='xs'
						checked={selectedVersionIds.has(row.original.id)}
						onChange={() => onToggleSelect(row.original.id)}
						onClick={(e) => e.stopPropagation()}
						aria-label={t('history.selectVersion', {
							version: row.original.seqNoInBranch,
						})}
					/>
				),
				size: 40,
				meta: {
					cellClassName: classes.selectCell,
					headerClassName: classes.selectCell,
				},
			},
			{
				id: 'version',
				header: t('history.columns.version'),
				cell: ({ row }) => (
					<Badge variant='light' color='blue' radius='sm'>
						{t('history.versionBadge', {
							version: row.original.seqNoInBranch,
						})}
					</Badge>
				),
				size: 80,
			},
			{
				id: 'commit',
				header: t('history.columns.commit'),
				cell: ({ row }) => (
					<Text size='xs' c='dimmed' style={{ fontFamily: 'monospace' }}>
						{row.original.id}
					</Text>
				),
			},
			{
				id: 'author',
				header: t('history.columns.author'),
				cell: ({ row }) => {
					const { appUser, accessInfo } = row.original;

					// Prefer the embedded app user (internal DB record), fall back to
					// a versionCommits timestamp match, then ElevenLabs accessInfo.
					const commit = !appUser
						? findCommitForVersion(row.original, versionCommits)
						: undefined;

					const name =
						appUser?.userName ||
						appUser?.userEmail ||
						commit?.userName ||
						commit?.userEmail ||
						accessInfo?.creatorName ||
						t('history.unknownAuthor');

					const email =
						appUser?.userEmail || commit?.userEmail || accessInfo?.creatorEmail;

					return (
						<Stack gap={2}>
							<Text size='sm'>{name}</Text>
							{email ? (
								<Text size='xs' c='dimmed'>
									{email}
								</Text>
							) : null}
						</Stack>
					);
				},
			},
			{
				id: 'committedAt',
				header: t('history.columns.committedAt'),
				cell: ({ row }) => (
					<Stack gap={2}>
						<Text size='sm'>
							{formatCommittedAgo(row.original.timeCommittedSecs)}
						</Text>
						<Text size='xs' c='dimmed'>
							{formatCommittedAt(row.original.timeCommittedSecs)}
						</Text>
					</Stack>
				),
			},
			{
				id: 'actions',
				header: '',
				cell: ({ row }) => {
					const hasCommit = Boolean(
						findCommitForVersion(row.original, versionCommits)
					);

					return (
						<Group gap='xs' justify='flex-end' wrap='nowrap'>
							<Tooltip label={t('history.actions.compare')} withArrow>
								<ActionIcon
									variant='subtle'
									color='blue'
									onClick={() => onCompare(row.original)}
								>
									<IconGitCompare size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label={t('history.actions.revert')} withArrow>
								<ActionIcon
									variant='subtle'
									color='orange'
									loading={isReverting && activeVersionId === row.original.id}
									onClick={() => onRevert(row.original)}
								>
									<IconRotate2 size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip
								label={
									hasCommit
										? t('history.actions.delete')
										: t('delete.noCommitError')
								}
								withArrow
							>
								<ActionIcon
									variant='subtle'
									color='red'
									disabled={!hasCommit}
									loading={
										isDeleting && selectedVersionIds.has(row.original.id)
									}
									onClick={() => onDelete(row.original)}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
						</Group>
					);
				},
				meta: {
					cellClassName: classes.actionsCell,
					headerClassName: classes.actionsCell,
				},
				size: 100,
			},
		],
		[
			activeVersionId,
			allSelected,
			someSelected,
			isDeleting,
			isReverting,
			onCompare,
			onDelete,
			onDeselectAll,
			onRevert,
			onSelectAll,
			onToggleSelect,
			selectedVersionIds,
			t,
			versionCommits,
		]
	);
};

export default useVersionHistoryColumns;
