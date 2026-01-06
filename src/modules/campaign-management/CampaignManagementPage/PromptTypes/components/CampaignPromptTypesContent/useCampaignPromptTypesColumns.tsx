import { useMemo } from 'react';
import {
	ActionIcon,
	Badge,
	Button,
	Group,
	HoverCard,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconEdit,
	IconTrash,
	IconClock,
	IconListNumbers,
	IconInfoCircle,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import styles from './CampaignPromptTypesContent.module.css';

interface UseCampaignPromptTypesColumnsProps {
	onEdit: (promptType: CampaignPromptTypeModel) => void;
	onDelete: (id: number) => void;
	isDeletePending: boolean;
	canUpdate: boolean;
	canDelete: boolean;
}

export const useCampaignPromptTypesColumns = ({
	onEdit,
	onDelete,
	isDeletePending,
	canUpdate,
	canDelete,
}: UseCampaignPromptTypesColumnsProps) => {
	const { t, i18n } = useTranslation('campaign-management');

	return useMemo<ColumnDef<CampaignPromptTypeModel>[]>(
		() => [
			{
				accessorKey: 'order',
				header: t('setup.promptTypes.table.headers.order'),
				size: 90,
				cell: ({ row }) => (
					<Group gap='xs'>
						<IconListNumbers size={14} stroke={1.5} />
						<Text size='sm' fw={600} className={styles.orderValue}>
							{row.original.order ?? t('setup.promptTypes.table.empty.order')}
						</Text>
					</Group>
				),
			},
			{
				accessorKey: 'name',
				header: t('setup.promptTypes.table.headers.name'),
				cell: ({ row }) => (
					<Text className={styles.typeName} size='sm'>
						{row.original.name}
					</Text>
				),
			},
			{
				id: 'info',
				header: t('setup.promptTypes.table.headers.info'),
				size: 70,
				cell: ({ row }) => {
					const orderValue =
						row.original.order ?? t('setup.promptTypes.table.empty.order');
					const iconValue =
						row.original.icon || t('setup.promptTypes.table.empty.icon');
					const descriptionValue =
						row.original.description ||
						t('setup.promptTypes.table.empty.description');

					return (
						<HoverCard width={260} shadow='none' withArrow openDelay={150}>
							<HoverCard.Target>
								<ActionIcon
									variant='subtle'
									color='blue'
									size='sm'
									className={styles.infoButton}
									aria-label={t('setup.promptTypes.table.info.aria')}
								>
									<IconInfoCircle size={14} />
								</ActionIcon>
							</HoverCard.Target>
							<HoverCard.Dropdown className={styles.infoDropdown}>
								<Stack gap='xs'>
									<Group justify='space-between' wrap='nowrap'>
										<Text size='sm' fw={600}>
											{row.original.name}
										</Text>
										<Badge size='xs' variant='light' color='gray'>
											{t('setup.promptTypes.table.info.orderLabel', {
												order: orderValue,
											})}
										</Badge>
									</Group>
									<Group gap='xs' wrap='nowrap' className={styles.infoRow}>
										<Text size='xs' c='dimmed'>
											{t('setup.promptTypes.table.info.iconLabel')}
										</Text>
										<Badge
											variant='outline'
											size='xs'
											className={styles.iconBadge}
										>
											{iconValue}
										</Badge>
									</Group>
									<Text
										size='xs'
										c='dimmed'
										lineClamp={3}
										className={styles.infoDescription}
									>
										{descriptionValue}
									</Text>
								</Stack>
							</HoverCard.Dropdown>
						</HoverCard>
					);
				},
			},
			{
				accessorKey: 'icon',
				header: t('setup.promptTypes.table.headers.icon'),
				cell: ({ row }) => (
					<Badge variant='outline' size='sm' className={styles.iconBadge}>
						{row.original.icon || t('setup.promptTypes.table.empty.icon')}
					</Badge>
				),
			},
			{
				accessorKey: 'createdAt',
				header: t('setup.promptTypes.table.headers.created'),
				cell: ({ row }) => (
					<Group gap='xs'>
						<IconClock size={14} stroke={1.5} />
						<Text size='xs' className={styles.createdAt}>
							{row.original.createdAt
								? new Date(row.original.createdAt).toLocaleDateString(
										i18n.language,
										{
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										}
									)
								: t('setup.promptTypes.table.empty.created')}
						</Text>
					</Group>
				),
			},
			{
				id: 'actions',
				header: t('setup.promptTypes.table.headers.actions'),
				cell: ({ row }) => (
					<Group gap='xs' className={styles.actionsGroup}>
						{canUpdate && (
							<Tooltip
								label={t('setup.promptTypes.table.actions.edit')}
								withArrow
							>
								<Button
									size='xs'
									variant='light'
									onClick={() => onEdit(row.original)}
									className={styles.actionButton}
								>
									<IconEdit size={14} />
								</Button>
							</Tooltip>
						)}
						{canDelete && (
							<Tooltip
								label={t('setup.promptTypes.table.actions.delete')}
								withArrow
							>
								<Button
									size='xs'
									variant='light'
									color='red'
									onClick={() => onDelete(row.original.id)}
									loading={isDeletePending}
									className={styles.actionButton}
								>
									<IconTrash size={14} />
								</Button>
							</Tooltip>
						)}
					</Group>
				),
			},
		],
		[canDelete, canUpdate, i18n.language, isDeletePending, onDelete, onEdit, t]
	);
};
