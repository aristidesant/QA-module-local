import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconGitCompare, IconRotate2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type {
	AgentVersionCommit,
	AgentVersionSummary,
} from '~/models/AgentVersioningModel';
import {
	formatCommittedAgo,
	formatCommittedAt,
} from './VersioningSection.helpers';
import classes from './VersioningSection.module.css';

interface UseVersionHistoryColumnsOptions {
	onCompare: (version: AgentVersionSummary) => void;
	onRevert: (version: AgentVersionSummary) => void;
	isReverting: boolean;
	activeVersionId?: string | null;
	versionCommits: AgentVersionCommit[];
}

function findCommitForVersion(
	version: AgentVersionSummary,
	commits: AgentVersionCommit[]
): AgentVersionCommit | undefined {
	if (commits.length === 0) return undefined;

	// Prefer explicit versionId match when available
	const byId = commits.find(
		(c) => c.versionId != null && c.versionId === version.id
	);
	if (byId) return byId;

	// Fall back to closest timestamp match (no hard tolerance — system clock skew
	// between ElevenLabs and our backend can exceed 2 minutes)
	const versionTimeMs = version.timeCommittedSecs * 1000;
	let best: AgentVersionCommit | undefined;
	let bestDiff = Infinity;

	for (const commit of commits) {
		const diff = Math.abs(new Date(commit.createdAt).getTime() - versionTimeMs);
		if (diff < bestDiff) {
			bestDiff = diff;
			best = commit;
		}
	}

	return best;
}

const useVersionHistoryColumns = ({
	onCompare,
	onRevert,
	isReverting,
	activeVersionId,
	versionCommits,
}: UseVersionHistoryColumnsOptions): ColumnDef<AgentVersionSummary>[] => {
	const { t } = useTranslation('campaign.form.versioning');

	return useMemo(
		() => [
			{
				id: 'version',
				header: t('history.columns.version'),
				cell: ({ row }) => (
					<Group gap='xs' wrap='nowrap'>
						<Badge variant='light' color='blue' radius='sm'>
							{t('history.versionBadge', {
								version: row.original.seqNoInBranch,
							})}
						</Badge>
						<Stack gap={2}>
							<Text size='sm' fw={500}>
								{row.original.versionDescription ||
									t('history.descriptionFallback')}
							</Text>
							<Text size='xs' c='dimmed'>
								{row.original.id}
							</Text>
						</Stack>
					</Group>
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
				header: t('history.columns.actions'),
				cell: ({ row }) => (
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
					</Group>
				),
				meta: {
					cellClassName: classes.actionsCell,
					headerClassName: classes.actionsCell,
				},
			},
		],
		[activeVersionId, isReverting, onCompare, onRevert, t, versionCommits]
	);
};

export default useVersionHistoryColumns;
