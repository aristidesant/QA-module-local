import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
	Badge,
	Group,
	Text,
	Tooltip,
	ActionIcon,
} from '@mantine/core';
import type { AgentWithCampaignListItem } from '~/models/AgentListObject';
import {
	IconPlayerPlay,
	IconPlayerPause,
	IconCopy,
} from '@tabler/icons-react';
import classes from './AgentCampaignAdd.module.css';
import { useTranslation } from 'react-i18next';

interface UseAgentSelectionColumnsOptions {
	onPlay: (agent: AgentWithCampaignListItem) => void;
	onClone: (agent: AgentWithCampaignListItem) => void;
	isPlaying: (agent: AgentWithCampaignListItem) => boolean;
}

const useAgentSelectionColumns = ({
	onPlay,
	onClone,
	isPlaying,
}: UseAgentSelectionColumnsOptions): ColumnDef<AgentWithCampaignListItem>[] => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);

	return useMemo(
		() => [
			{
				accessorKey: 'name',
				header: t('form.agent.columns.name'),
				cell: ({ row }) => {
					return (
						<Group gap='xs' className={classes.agentCellContent} wrap='nowrap'>
							<Text component='span' className={classes.agentName} truncate>
								{row.original.name}
							</Text>
						</Group>
					);
				},
				meta: {
					cellClassName: classes.agentCell,
					headerClassName: classes.alignLeft,
				},
			},
			{
				accessorKey: 'campaignName',
				header: t('form.agent.columns.campaign'),
				cell: ({ row }) => {
					const campaignName =
						row.original.campaignName || t('form.agent.columns.noCampaign');
					const isMissingCampaign = !row.original.campaignName;

					return (
						<Tooltip label={campaignName} withArrow disabled={!campaignName}>
							<Badge
								variant={isMissingCampaign ? 'outline' : 'light'}
								className={
									isMissingCampaign
										? classes.campaignBadgeEmpty
										: classes.campaignBadge
								}
								radius='xl'
								size='sm'
							>
								<span className={classes.campaignBadgeLabel}>{campaignName}</span>
							</Badge>
						</Tooltip>
					);
				},
				meta: {
					cellClassName: classes.alignLeft,
					headerClassName: classes.alignLeft,
				},
			},

			{
				accessorKey: 'type',
				header: t('form.agent.columns.type'),
				cell: ({ row }) => (
					<Badge
						size='xs'
						className={
							row.original.type === 'OUTBOUND'
								? classes.typeBadgeOutbound
								: classes.typeBadgeInbound
						}
					>
						{row.original.type}
					</Badge>
				),
				meta: {
					cellClassName: classes.alignLeft,
					headerClassName: classes.alignLeft,
				},
			},

			{
				accessorKey: 'voiceName',
				header: t('form.agent.columns.voice'),
				cell: ({ row }) => {
					const voiceName = row.original.voiceName ?? '—';
					const voiceLanguage = row.original.voiceLanguage;

					return (
						<Text className={classes.inlineText} truncate>
							{voiceName}
							{voiceLanguage ? (
								<Text component='span' className={classes.subText}>
									· {voiceLanguage}
								</Text>
							) : null}
						</Text>
					);
				},
				meta: {
					cellClassName: classes.alignLeft,
					headerClassName: classes.alignLeft,
				},
			},
			{
				id: 'actions',
				header: t('form.agent.columns.actions'),
				cell: ({ row }) => (
					<Group gap={'xs'}>
						<Tooltip
							label={
								isPlaying(row.original)
									? t('form.agent.columns.pausePreview')
									: t('form.agent.columns.playPreview')
							}
							withArrow
						>
							<ActionIcon
								variant='subtle'
								color='green'
								onClick={() => onPlay(row.original)}
								disabled={!row.original.voicePreviewUrl}
							>
								{isPlaying(row.original) ? (
									<IconPlayerPause size={16} />
								) : (
									<IconPlayerPlay size={16} />
								)}
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('form.agent.columns.clone')} withArrow>
							<ActionIcon
								variant='subtle'
								color='blue'
								onClick={() => onClone(row.original)}
							>
								<IconCopy size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
				meta: {
					cellClassName: classes.alignCenter,
					headerClassName: classes.alignCenter,
				},
			},
		],
		[onPlay, onClone, isPlaying, t]
	);
};

export default useAgentSelectionColumns;
