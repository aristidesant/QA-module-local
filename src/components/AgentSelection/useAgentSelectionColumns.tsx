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
	IconArrowRight,
} from '@tabler/icons-react';
import classes from './AgentSelection.module.css';

interface UseAgentSelectionColumnsOptions {
	onAdd: (agent: AgentWithCampaignListItem) => void;
	onPlay: (agent: AgentWithCampaignListItem) => void;
	isDisabled: (agent: AgentWithCampaignListItem) => boolean;
	isPlaying: (agent: AgentWithCampaignListItem) => boolean;
}

const useAgentSelectionColumns = ({
	onAdd,
	onPlay,
	isDisabled,
	isPlaying,
}: UseAgentSelectionColumnsOptions): ColumnDef<AgentWithCampaignListItem>[] => {
	return useMemo(
		() => [
			{
				accessorKey: 'name',
				header: 'Agent',
				cell: ({ row }) => {
					const agent = row.original;

					return (
						<Group gap='sm' className={classes.agentCellContent}>
							<Tooltip label={agent.campaignName || 'No campaign'} withArrow>
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
				header: 'Type',
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
				header: 'Voice',
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
				header: 'Actions',
				cell: ({ row }) => (
					<Group gap={'xs'}>
						<ActionIcon
							variant='subtle'
							color='blue'
							onClick={() => onAdd(row.original)}
							disabled={isDisabled(row.original)}
						>
							<IconArrowRight size={16} />
						</ActionIcon>
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
					</Group>
				),
				meta: {
					cellClassName: classes.alignCenter,
					headerClassName: classes.alignCenter,
				},
			},
		],
		[onAdd, onPlay, isDisabled, isPlaying]
	);
};

export default useAgentSelectionColumns;
