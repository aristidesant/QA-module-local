import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
	Badge,
	Group,
	Text,
	ThemeIcon,
	Tooltip,
	ActionIcon,
} from '@mantine/core';
import type { AgentWithCampaignListItem } from '~/models/AgentListObject';
import {
	IconInfoCircle,
	IconPlayerPlay,
	IconPlayerPause,
	IconPlus,
	IconCopy,
} from '@tabler/icons-react';
import classes from './AgentCampaignAdd.module.css';
import { useTranslation } from 'react-i18next';

interface UseAgentSelectionColumnsOptions {
	onAdd: (agent: AgentWithCampaignListItem) => void;
	onPlay: (agent: AgentWithCampaignListItem) => void;
	onClone: (agent: AgentWithCampaignListItem) => void;
	isDisabled: (agent: AgentWithCampaignListItem) => boolean;
	isPlaying: (agent: AgentWithCampaignListItem) => boolean;
}

const useAgentSelectionColumns = ({
	onAdd,
	onPlay,
	onClone,
	isDisabled,
	isPlaying,
}: UseAgentSelectionColumnsOptions): ColumnDef<AgentWithCampaignListItem>[] => {
	const { t } = useTranslation('campaigns');

	return useMemo(
		() => [
			{
				accessorKey: 'name',
				header: t('form.agent.columns.name'),
				cell: ({ row }) => {
					const agent = row.original;

					return (
						<Group gap='sm' className={classes.agentCellContent}>
							<Tooltip
								label={agent.campaignName || t('form.agent.columns.noCampaign')}
								withArrow
							>
								<ThemeIcon variant='subtle' size={20} radius='xl'>
									<IconInfoCircle size={16} />
								</ThemeIcon>
							</Tooltip>
							<div className={classes.agentDetails}>
								<Text component='span' className={classes.agentName}>
									{agent.name}
								</Text>
							</div>
						</Group>
					);
				},
				meta: {
					cellClassName: classes.agentCell,
					headerClassName: classes.alignLeft,
				},
			},

			{
				accessorKey: 'type',
				header: t('form.agent.columns.type'),
				cell: ({ row }) => (
					<Badge
						size='sm'
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
						<Text className={classes.inlineText}>
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
						<Tooltip label={t('form.agent.columns.add')} withArrow>
							<ActionIcon
								variant='subtle'
								color='blue'
								onClick={() => onAdd(row.original)}
								disabled={isDisabled(row.original)}
							>
								<IconPlus size={16} />
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
		[onAdd, onPlay, onClone, isDisabled, isPlaying, t]
	);
};

export default useAgentSelectionColumns;
