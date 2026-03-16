import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconGitCompare, IconRotate2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AgentVersionSummary } from '~/models/AgentVersioningModel';
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
}

const useVersionHistoryColumns = ({
	onCompare,
	onRevert,
	isReverting,
	activeVersionId,
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
				cell: ({ row }) => (
					<Stack gap={2}>
						<Text size='sm'>
							{row.original.accessInfo?.creatorName ||
								t('history.unknownAuthor')}
						</Text>
						<Text size='xs' c='dimmed'>
							{row.original.accessInfo?.creatorEmail || '—'}
						</Text>
					</Stack>
				),
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
		[activeVersionId, isReverting, onCompare, onRevert, t]
	);
};

export default useVersionHistoryColumns;
