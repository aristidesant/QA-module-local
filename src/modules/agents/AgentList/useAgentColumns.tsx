import { ColumnDef } from '@tanstack/react-table';
import {
	Avatar,
	Chip,
	Tooltip,
	ActionIcon,
	Group,
	Text,
	Badge,
} from '@mantine/core';
import { IconEdit, IconPhone } from '@tabler/icons-react';
import type AgentListObject from '~/models/AgentListObject';

// Helper to get flag emoji from language code
const getLanguageFlag = (language: string): string => {
	const flags: Record<string, string> = {
		en: '🇺🇸',
		es: '🇪🇸',
	};
	return flags[language] || '🌐';
};

// Helper to format time ago
const timeAgo = (date: Date): string => {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
	if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	return 'Just now';
};

interface UseAgentColumnsProps {
	onEdit: (agent: AgentListObject) => void;
	onTestCall: (agent: AgentListObject) => void;
}

export const useAgentColumns = ({
	onEdit,
	onTestCall,
}: UseAgentColumnsProps): ColumnDef<AgentListObject, any>[] => {
	return [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => {
				const agent = row.original;
				const avatar = agent.config?.platformSettings?.widget?.avatar;
				const agentName = agent.name || 'Unnamed Agent';
				return (
					<Group gap='sm' wrap='nowrap'>
						<Avatar size={32} radius='xl' color={avatar?.color1 || 'blue'}>
							{agentName.charAt(0).toUpperCase()}
						</Avatar>
						<div>
							<Text size='sm' fw={500} lineClamp={1}>
								{agentName}
							</Text>
						</div>
					</Group>
				);
			},
			size: 250,
		},
		{
			accessorKey: 'voice',
			header: 'Voice',
			cell: ({ row }) => {
				const agent = row.original;
				const voice = agent.voice;
				return (
					<Group gap='xs' wrap='nowrap'>
						<Text size='sm' lineClamp={1}>
							{voice ? voice.name : 'No voice assigned'}
						</Text>
						<Text size='xs' c='dimmed'>
							{getLanguageFlag(agent.voice?.language || 'en')}{' '}
							{agent.voice?.language.toUpperCase()}
						</Text>
					</Group>
				);
			},
			size: 200,
		},
		{
			accessorKey: 'campaign',
			header: 'Campaign',
			cell: ({ row }) => {
				const agent = row.original;
				const agentType = agent.type || 'UNKNOWN';
				return (
					<Badge
						size='xs'
						variant='light'
						color={agentType?.toUpperCase() === 'INBOUND' ? 'green' : 'blue'}
					>
						{agentType}
					</Badge>
				);
			},
			size: 120,
		},
		{
			accessorKey: 'updatedAt',
			header: 'Last Modified',
			cell: ({ row }) => {
				const date = row.original.updatedAt || row.original.createdAt;
				if (!date)
					return (
						<Text size='sm' c='dimmed'>
							Unknown
						</Text>
					);

				const dateObj = new Date(date);
				const timeAgoText = timeAgo(dateObj);

				return (
					<Tooltip label={dateObj.toLocaleString()}>
						<Text size='sm'>{timeAgoText}</Text>
					</Tooltip>
				);
			},
			size: 120,
		},
		{
			id: 'controls',
			header: '',
			cell: ({ row }) => {
				const agent = row.original;
				return (
					<Group gap='xs' wrap='nowrap'>
						<Tooltip label='Test Call'>
							<ActionIcon
								size='sm'
								variant='subtle'
								color='green'
								onClick={(e) => {
									e.stopPropagation();
									onTestCall(agent);
								}}
							>
								<IconPhone size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label='Edit'>
							<ActionIcon
								size='sm'
								variant='subtle'
								onClick={(e) => {
									e.stopPropagation();
									onEdit(agent);
								}}
							>
								<IconEdit size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				);
			},
			size: 120,
			enableSorting: false,
		},
	];
};
