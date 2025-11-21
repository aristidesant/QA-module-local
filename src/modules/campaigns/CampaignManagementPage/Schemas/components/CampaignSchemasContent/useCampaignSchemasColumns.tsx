import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
	Text,
	Badge,
	Group,
	Tooltip,
	ActionIcon,
	Box,
	ThemeIcon,
	Code,
	CopyButton,
} from '@mantine/core';
import {
	IconEdit,
	IconTrash,
	IconDatabase,
	IconCheck,
	IconCopy,
} from '@tabler/icons-react';
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
	return useMemo<ColumnDef<CampaignContactSchema>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Schema Details',
				size: 300,
				cell: ({ row }) => (
					<Group gap='md' wrap='nowrap'>
						<ThemeIcon size={42} radius='md' variant='light' color='blue'>
							<IconDatabase size={22} stroke={1.5} />
						</ThemeIcon>
						<Box>
							<Text size='sm' fw={600} c='dark.3' style={{ lineHeight: 1.3 }}>
								{row.original.name}
							</Text>
							{row.original.description && (
								<Tooltip
									label={row.original.description}
									multiline
									w={300}
									withArrow
									position='bottom-start'
								>
									<Text
										size='xs'
										c='dimmed'
										lineClamp={1}
										mt={2}
										style={{ cursor: 'help' }}
									>
										{row.original.description}
									</Text>
								</Tooltip>
							)}
						</Box>
					</Group>
				),
			},
			{
				accessorKey: 'code',
				header: 'Code',
				size: 140,
				cell: ({ row }) => (
					<Group gap={8} wrap='nowrap'>
						<Code
							c='dark.3'
							bg='gray.1'
							fw={600}
							style={{
								fontSize: '11px',
								borderRadius: '6px',
								padding: '4px 8px',
								border: '1px solid var(--mantine-color-gray-2)',
							}}
						>
							{row.original.code}
						</Code>
						<CopyButton value={row.original.code} timeout={2000}>
							{({ copied, copy }) => (
								<Tooltip
									label={copied ? 'Copied' : 'Copy code'}
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
				header: 'Objective',
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
				header: 'Status',
				size: 100,
				cell: ({ row }) => (
					<Tooltip
						label={`Last updated: ${new Date(
							row.original.updatedAt
						).toLocaleDateString(undefined, {
							year: 'numeric',
							month: 'short',
							day: 'numeric',
						})}`}
						withArrow
					>
						<Badge
							variant='light'
							color={row.original.isActive ? 'teal' : 'gray'}
							size='md'
							radius='sm'
							tt='uppercase'
							fw={600}
						>
							{row.original.isActive ? 'Active' : 'Inactive'}
						</Badge>
					</Tooltip>
				),
			},
			{
				id: 'actions',
				header: 'Actions',
				size: 100,
				cell: ({ row }) => (
					<Group gap={8} justify='flex-end' className={styles.actionsGroup}>
						<Tooltip label='Edit schema' withArrow>
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
						<Tooltip label='Delete schema' withArrow>
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
		[onEdit, onDelete, isDeletePending]
	);
};
