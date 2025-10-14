import { ColumnDef } from '@tanstack/react-table';
import { Button, Text, Badge, Group, Tooltip } from '@mantine/core';
import {
	IconTrash,
	IconEdit,
	IconAlertCircle,
	IconUser,
	IconShieldCheck,
	IconBan,
} from '@tabler/icons-react';
import type { DoNotCallModel, DoNotCallReason } from '~/models/DoNotCallModel';
import styles from './useDoNotCallColumns.module.css';

const reasonConfig: Record<
	DoNotCallReason,
	{ icon: any; color: string; label: string }
> = {
	CUSTOMER_REQUEST: {
		icon: IconUser,
		color: 'blue',
		label: 'Customer Request',
	},
	DISPOSITION_OUTCOME: {
		icon: IconAlertCircle,
		color: 'orange',
		label: 'Outcome',
	},
	REGULATORY_COMPLIANCE: {
		icon: IconShieldCheck,
		color: 'green',
		label: 'Regulatory Compliance',
	},
	MANUAL_ADMIN_BLOCK: {
		icon: IconBan,
		color: 'red',
		label: 'Manual Admin Block',
	},
};

interface UseDoNotCallColumnsProps {
	onEdit: (entry: DoNotCallModel) => void;
	onDelete: (entry: DoNotCallModel) => void;
}

export const useDoNotCallColumns = ({
	onEdit,
	onDelete,
}: UseDoNotCallColumnsProps): ColumnDef<DoNotCallModel, any>[] => {
	return [
		{
			accessorKey: 'phoneNumber',
			header: 'Phone Number',
			cell: ({ row }) => {
				const entry = row.original;
				return (
					<div>
						<Text size='sm' fw={500}>
							{entry.phoneNumber}
						</Text>
						{entry.notes && (
							<Text size='xs' c='dimmed' lineClamp={1}>
								{entry.notes}
							</Text>
						)}
					</div>
				);
			},
			size: 200,
		},
		{
			accessorKey: 'reason',
			header: 'Reason',
			cell: ({ row }) => {
				const entry = row.original;
				const config = reasonConfig[entry.reason];
				const Icon = config.icon;
				return (
					<Badge
						variant='light'
						color={config.color}
						size='sm'
						leftSection={<Icon size={14} />}
					>
						{config.label}
					</Badge>
				);
			},
			size: 200,
		},
		{
			accessorKey: 'isActive',
			header: 'Status',
			cell: ({ row }) => {
				const entry = row.original;
				return (
					<Badge
						variant='light'
						color={entry.isActive ? 'green' : 'gray'}
						size='sm'
					>
						{entry.isActive ? 'Active' : 'Expired'}
					</Badge>
				);
			},
			size: 100,
		},
		{
			accessorKey: 'expiresAt',
			header: 'Expires At',
			cell: ({ row }) => {
				const entry = row.original;
				if (!entry.expiresAt) {
					return (
						<Text size='sm' c='dimmed'>
							Never
						</Text>
					);
				}
				const expiresAt = new Date(entry.expiresAt);
				return <Text size='sm'>{expiresAt.toLocaleDateString()}</Text>;
			},
			size: 120,
		},
		{
			accessorKey: 'createdAt',
			header: 'Created At',
			cell: ({ row }) => {
				const entry = row.original;
				const createdAt = new Date(entry.createdAt);
				return <Text size='sm'>{createdAt.toLocaleDateString()}</Text>;
			},
			size: 120,
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => {
				const entry = row.original;
				return (
					<Group gap='xs' className={styles.actionsGroup}>
						<Tooltip label='Edit entry' withArrow>
							<Button
								size='xs'
								variant='subtle'
								onClick={(e) => {
									e.stopPropagation();
									onEdit(entry);
								}}
								className={styles.actionButton}
							>
								<IconEdit size={14} />
							</Button>
						</Tooltip>
						<Tooltip label='Delete entry' withArrow>
							<Button
								size='xs'
								variant='subtle'
								color='red'
								onClick={(e) => {
									e.stopPropagation();
									onDelete(entry);
								}}
								className={styles.actionButton}
							>
								<IconTrash size={14} />
							</Button>
						</Tooltip>
					</Group>
				);
			},
			size: 100,
			enableSorting: false,
		},
	];
};
