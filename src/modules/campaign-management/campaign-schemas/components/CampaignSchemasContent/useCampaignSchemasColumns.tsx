import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
	Text,
	Badge,
	Group,
	Tooltip,
	ActionIcon,
	CopyButton,
} from '@mantine/core';
import { IconEdit, IconTrash, IconCheck, IconCopy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CampaignContactSchema } from '~/models/CampaignContactSchemaModel';
import styles from './CampaignSchemasContent.module.css';

interface UseCampaignSchemasColumnsProps {
	onEdit: (schema: CampaignContactSchema) => void;
	onDelete: (id: number) => void;
	isDeletePending: boolean;
}

export const useCampaignSchemasColumns = ({
	onEdit,
	onDelete,
	isDeletePending,
}: UseCampaignSchemasColumnsProps) => {
	const { t } = useTranslation('campaign-management');
	return useMemo<ColumnDef<CampaignContactSchema>[]>(
		() => [
			{
				accessorKey: 'name',
				header: t('setup.schemas.table.headers.details'),
				cell: ({ row }) => (
					<Tooltip
						label={
							row.original.description ||
							t('setup.schemas.table.empty.description')
						}
						withArrow
					>
						<Text fz='xs' fw={600}>
							{row.original.name}
						</Text>
					</Tooltip>
				),
			},
			{
				accessorKey: 'code',
				header: t('setup.schemas.table.headers.code'),
				size: 140,
				cell: ({ row }) => (
					<Group gap={8} wrap='nowrap'>
						<Badge tt='none' size='sm' variant='outline' color='green'>
							{row.original.code}
						</Badge>
						<CopyButton value={row.original.code} timeout={2000}>
							{({ copied, copy }) => (
								<Tooltip
									label={t(
										copied
											? 'setup.schemas.table.actions.copied'
											: 'setup.schemas.table.actions.copyCode'
									)}
									withArrow
									position='right'
								>
									<ActionIcon
										color={copied ? 'teal' : 'gray'}
										variant='transparent'
										onClick={copy}
										size='sm'
										className='copy-icon'
									>
										{copied ? (
											<IconCheck size={14} />
										) : (
											<IconCopy size={14} stroke={1.5} />
										)}
									</ActionIcon>
								</Tooltip>
							)}
						</CopyButton>
					</Group>
				),
			},
			{
				accessorKey: 'objective',
				header: t('setup.schemas.table.headers.objective'),
				cell: ({ row }) =>
					row.original.objective ? (
						<Badge
							variant='light'
							color='indigo'
							radius='sm'
							tt='none'
							fw={500}
							size='md'
						>
							{row.original.objective.name}
						</Badge>
					) : (
						<Text size='sm' c='dimmed' fs='italic'>
							--
						</Text>
					),
			},

			{
				accessorKey: 'isActive',
				header: t('setup.schemas.table.headers.status'),
				size: 100,
				cell: ({ row }) => (
					<Tooltip
						label={t('setup.schemas.table.info.lastUpdated', {
							date: new Date(row.original.updatedAt).toLocaleDateString(
								undefined,
								{
									year: 'numeric',
									month: 'short',
									day: 'numeric',
								}
							),
						})}
						withArrow
					>
						<Badge
							variant='dot'
							color={row.original.isActive ? 'teal' : 'gray'}
							size='xs'
							tt='uppercase'
							fw={600}
						>
							{t(
								row.original.isActive
									? 'setup.schemas.table.status.active'
									: 'setup.schemas.table.status.inactive'
							)}
						</Badge>
					</Tooltip>
				),
			},
			{
				id: 'actions',
				header: t('setup.schemas.table.headers.actions'),
				size: 100,
				cell: ({ row }) => (
					<Group gap={8} justify='flex-end' className={styles.actionsGroup}>
						<Tooltip label={t('setup.schemas.table.actions.edit')} withArrow>
							<ActionIcon
								variant='light'
								color='blue'
								size='md'
								radius='md'
								onClick={() => onEdit(row.original)}
							>
								<IconEdit size={16} stroke={1.5} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('setup.schemas.table.actions.delete')} withArrow>
							<ActionIcon
								variant='light'
								color='red'
								size='md'
								radius='md'
								onClick={() => onDelete(row.original.id)}
								loading={isDeletePending}
							>
								<IconTrash size={16} stroke={1.5} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
			},
		],
		[onEdit, onDelete, isDeletePending, t]
	);
};
