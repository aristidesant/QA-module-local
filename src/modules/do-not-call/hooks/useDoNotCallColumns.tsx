import { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Text, Badge, Group, Tooltip } from '@mantine/core';
import {
	IconTrash,
	IconEdit,
	IconAlertCircle,
	IconUser,
	IconShieldCheck,
	IconBan,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';
import type { DoNotCallModel, DoNotCallReason } from '~/models/DoNotCallModel';
import styles from './useDoNotCallColumns.module.css';
import { useTranslation } from 'react-i18next';

type IconComponent = ComponentType<{ size?: number }>;

const reasonConfig: Record<
	DoNotCallReason,
	{ icon: IconComponent; color: string; labelKey: string }
> = {
	CUSTOMER_REQUEST: {
		icon: IconUser,
		color: 'blue',
		labelKey: 'reasons.customerRequest',
	},
	DISPOSITION_OUTCOME: {
		icon: IconAlertCircle,
		color: 'orange',
		labelKey: 'reasons.dispositionOutcome',
	},
	REGULATORY_COMPLIANCE: {
		icon: IconShieldCheck,
		color: 'green',
		labelKey: 'reasons.regulatoryCompliance',
	},
	MANUAL_ADMIN_BLOCK: {
		icon: IconBan,
		color: 'red',
		labelKey: 'reasons.manualAdminBlock',
	},
};

interface UseDoNotCallColumnsProps {
	onEdit: (entry: DoNotCallModel) => void;
	onDelete: (entry: DoNotCallModel) => void;
}

export const useDoNotCallColumns = ({
	onEdit,
	onDelete,
}: UseDoNotCallColumnsProps): ColumnDef<DoNotCallModel, unknown>[] => {
	const { t } = useTranslation('do-not-call');

	return [
		{
			accessorKey: 'phoneNumber',
			header: t('table.headers.phoneNumber'),
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
			header: t('table.headers.reason'),
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
						{t(config.labelKey)}
					</Badge>
				);
			},
			size: 200,
		},
		{
			accessorKey: 'isActive',
			header: t('table.headers.status'),
			cell: ({ row }) => {
				const entry = row.original;
				return (
					<Badge
						variant='light'
						color={entry.isActive ? 'green' : 'gray'}
						size='sm'
					>
						{entry.isActive ? t('statuses.active') : t('statuses.expired')}
					</Badge>
				);
			},
			size: 100,
		},
		{
			accessorKey: 'expiresAt',
			header: t('table.headers.expiresAt'),
			cell: ({ row }) => {
				const entry = row.original;
				if (!entry.expiresAt) {
					return (
						<Text size='sm' c='dimmed'>
							{t('table.expiresAt.never')}
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
			header: t('table.headers.createdAt'),
			cell: ({ row }) => {
				const entry = row.original;
				const createdAt = new Date(entry.createdAt);
				return <Text size='sm'>{createdAt.toLocaleDateString()}</Text>;
			},
			size: 120,
		},
		{
			id: 'actions',
			header: t('table.headers.actions'),
			meta: {
				cellClassName: styles.actionsCell,
			},
			cell: ({ row }) => {
				const entry = row.original;
				return (
					<Group gap='xs'>
						<Tooltip label={t('table.actions.edit')} withArrow>
							<ActionIcon
								size='xs'
								variant='light'
								aria-label={t('table.actions.edit')}
								title={t('table.actions.edit')}
								onClick={(e) => {
									e.stopPropagation();
									onEdit(entry);
								}}
							>
								<IconEdit size={14} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('table.actions.delete')} withArrow>
							<ActionIcon
								size='xs'
								variant='light'
								color='red'
								aria-label={t('table.actions.delete')}
								title={t('table.actions.delete')}
								onClick={(e) => {
									e.stopPropagation();
									onDelete(entry);
								}}
							>
								<IconTrash size={14} />
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
