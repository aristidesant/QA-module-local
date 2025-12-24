import { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Text, Badge, Group, Tooltip, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconCheck, IconEye, IconClock, IconUser } from '@tabler/icons-react';
import type { CampaignPromptHistoryItem } from '~/models/CampaignPromptHistoryModel';
import { timeAgo } from '~/utils/dateUtils';
import dayjs from 'dayjs';
import styles from './useCampaignPromptHistoryColumns.module.css';

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
	const { t } = useTranslation('campaigns');
	return [
		{
			accessorKey: 'version',
			header: t('promptHistory.columns.version'),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<Badge
						variant='filled'
						color='blue'
						size='lg'
						className={styles.versionBadge}
					>
						v{item.version}
					</Badge>
				);
			},
			size: 100,
		},
		{
			accessorKey: 'createdAt',
			header: t('promptHistory.columns.modified'),
			cell: ({ row }) => {
				const item = row.original;
				const fullDateTime = dayjs(item.createdAt).format(
					t('promptHistory.dateFormat')
				);
				return (
					<Tooltip label={fullDateTime} withArrow>
						<Box className={styles.dateCell}>
							<IconClock size={14} className={styles.cellIcon} />
							<Text size='sm' c='dimmed'>
								{timeAgo(item.createdAt)}
							</Text>
						</Box>
					</Tooltip>
				);
			},
			size: 140,
		},
		{
			accessorKey: 'user',
			header: t('promptHistory.columns.modifiedBy'),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<Box className={styles.userCell}>
						<IconUser size={14} className={styles.cellIcon} />
						<Text size='sm' fw={500}>
							{item.user.username}
						</Text>
					</Box>
				);
			},
			size: 150,
		},
		{
			accessorKey: 'promptText',
			header: t('promptHistory.columns.promptPreview'),
			cell: ({ row }) => {
				const item = row.original;
				const truncatedText =
					item.promptText.length > 50
						? `${item.promptText.substring(0, 50)}...`
						: item.promptText;
				return (
					<Text
						size='sm'
						c='dimmed'
						lineClamp={1}
						className={styles.previewText}
						title={item.promptText}
					>
						{truncatedText}
					</Text>
				);
			},
			size: 350,
		},
		{
			id: 'actions',
			header: '',
			cell: ({ row }) => {
				const item = row.original;
				return (
					<Group gap='xs' justify='flex-end'>
						<Tooltip
							label={t('promptHistory.columns.viewFullPrompt')}
							withArrow
						>
							<ActionIcon
								variant='subtle'
								color='gray'
								size='md'
								onClick={() => onViewPrompt(item)}
								className={styles.actionButton}
							>
								<IconEye size={18} />
							</ActionIcon>
						</Tooltip>
						<Tooltip
							label={t('promptHistory.columns.restoreVersion')}
							withArrow
						>
							<ActionIcon
								variant='subtle'
								color='green'
								size='md'
								onClick={() => onSelect(item.promptText)}
								className={styles.actionButton}
							>
								<IconCheck size={18} />
							</ActionIcon>
						</Tooltip>
					</Group>
				);
			},
			size: 100,
			enableSorting: false,
		},
	];
};
