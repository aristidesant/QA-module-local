import { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Text, Badge, Group, Tooltip } from '@mantine/core';
import { IconCheck, IconEye } from '@tabler/icons-react';
import type { CampaignPromptHistoryItem } from '~/models/CampaignPromptHistoryModel';
import { timeAgo } from '~/utils/dateUtils';
import dayjs from 'dayjs';

interface UseCampaignPromptHistoryColumnsProps {
	onSelect: (promptText: string) => void;
	onViewPrompt: (item: CampaignPromptHistoryItem) => void;
}

export const useCampaignPromptHistoryColumns = ({
	onSelect,
	onViewPrompt,
}: UseCampaignPromptHistoryColumnsProps): ColumnDef<
	CampaignPromptHistoryItem,
	any
>[] => {
	return [
		{
			accessorKey: 'version',
			header: 'Version',
			cell: ({ row }) => {
				const item = row.original;
				return (
					<Badge variant='light' color='blue' size='sm'>
						v{item.version}
					</Badge>
				);
			},
			size: 80,
		},
		{
			accessorKey: 'createdAt',
			header: 'When',
			cell: ({ row }) => {
				const item = row.original;
				const fullDateTime = `${dayjs(item.createdAt).format('YYYY-MM-DD hh:mm:ss A')}`;
				return (
					<Tooltip label={fullDateTime}>
						<Text size='sm' fw={500}>
							{timeAgo(item.createdAt)}
						</Text>
					</Tooltip>
				);
			},
			size: 120,
		},
		{
			accessorKey: 'user',
			header: 'User',
			cell: ({ row }) => {
				const item = row.original;
				return <Text size='sm'>{item.user.username}</Text>;
			},
			size: 100,
		},

		{
			accessorKey: 'promptText',
			header: 'Prompt Preview',
			cell: ({ row }) => {
				const item = row.original;
				const preview =
					item.promptText.length > 100
						? `${item.promptText.substring(0, 100)}...`
						: item.promptText;
				return (
					<Text size='sm' lineClamp={1}>
						{preview}
					</Text>
				);
			},
			size: 300,
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => {
				const item = row.original;
				return (
					<Group gap='xs'>
						<ActionIcon
							variant='light'
							color='blue'
							size='sm'
							onClick={() => onViewPrompt(item)}
							title='View full prompt'
						>
							<IconEye size={16} />
						</ActionIcon>
						<ActionIcon
							variant='light'
							color='green'
							size='sm'
							onClick={() => onSelect(item.promptText)}
							title='Select this version'
						>
							<IconCheck size={16} />
						</ActionIcon>
					</Group>
				);
			},
			size: 80,
			enableSorting: false,
		},
	];
};
