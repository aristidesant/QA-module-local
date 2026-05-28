import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Badge, Checkbox, Group, Stack, Text, Tooltip } from '@mantine/core';
import styles from './PhoneNumberList.module.css';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { PhoneNumber } from '~/models/PhoneNumber';

interface UsePhoneNumberTableColumnsProps {
	onEdit: (phoneNumber: PhoneNumber) => void;
	onDelete: (phoneNumber: PhoneNumber) => void;
	selectedIds: Set<number>;
	onToggleSelect: (id: number) => void;
	onSelectAll: () => void;
	allVisibleSelected: boolean;
	someVisibleSelected: boolean;
}

export function usePhoneNumberTableColumns({
	onEdit,
	onDelete,
	selectedIds,
	onToggleSelect,
	onSelectAll,
	allVisibleSelected,
	someVisibleSelected,
}: UsePhoneNumberTableColumnsProps) {
	const { t } = useTranslation('phone-numbers');

	return useMemo<ColumnDef<PhoneNumber>[]>(
		() => [
			{
				id: 'selection',
				header: () => (
					<Checkbox
						size='xs'
						checked={allVisibleSelected}
						indeterminate={someVisibleSelected && !allVisibleSelected}
						onChange={onSelectAll}
						aria-label='Select all rows'
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						size='xs'
						checked={selectedIds.has(row.original.id)}
						onChange={() => onToggleSelect(row.original.id)}
						aria-label={`Select row ${row.original.id}`}
					/>
				),
				size: 44,
				enableSorting: false,
			},
			{
				accessorKey: 'phoneNumber',
				header: t('columns.phoneNumber'),
				size: 220,
				cell: ({ row }) => (
					<Stack gap={2} className={styles.cellStack}>
						<Text size='sm' fw={600} className={styles.phoneNumberText}>
							{row.original.phoneNumber}
						</Text>
						<Text size='xs' c='dimmed' truncate='end'>
							{row.original.identifier}
						</Text>
					</Stack>
				),
			},
			{
				accessorKey: 'label',
				header: t('columns.label'),
				size: 200,
				cell: ({ row }) => (
					<Stack gap={2} className={styles.cellStack}>
						<Text size='sm' fw={500} truncate='end'>
							{row.original.label}
						</Text>
						<Text size='xs' c='dimmed' truncate='end'>
							{row.original.description || t('list.noDescription')}
						</Text>
					</Stack>
				),
			},
			{
				accessorKey: 'type',
				header: t('columns.type'),
				size: 120,
				cell: ({ getValue }) => {
					const val = getValue() as string;
					return (
						<Badge variant='light' color='gray' radius='sm' size='sm'>
							{val}
						</Badge>
					);
				},
			},
			{
				accessorKey: 'provider',
				header: t('columns.provider'),
				size: 130,
				cell: ({ getValue }) => {
					const val = getValue() as string;
					return (
						<Badge variant='light' color='gray' radius='sm'>
							{val === 'sip_trunk'
								? t('form.provider.sipTrunk')
								: t('form.provider.twilio')}
						</Badge>
					);
				},
			},
			{
				accessorKey: 'status',
				header: t('columns.status'),
				size: 110,
				cell: ({ getValue }) => {
					const val = getValue() as string;
					const isActive = val === 'Active';
					return (
						<Badge
							variant='light'
							color={isActive ? 'green' : 'gray'}
							radius='sm'
						>
							{val}
						</Badge>
					);
				},
			},
			{
				id: 'actions',
				header: t('columns.actions'),
				size: 90,
				cell: ({ row }) => (
					<Group gap={4} wrap='nowrap'>
						<Tooltip label={t('form.buttons.update')} withArrow fz='xs'>
							<ActionIcon
								variant='subtle'
								radius='md'
								size='md'
								aria-label={t('form.buttons.update')}
								onClick={() => onEdit(row.original)}
							>
								<IconEdit size={15} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('list.deleteModal.confirm')} withArrow fz='xs'>
							<ActionIcon
								variant='subtle'
								color='red'
								radius='md'
								size='md'
								aria-label={t('list.deleteModal.confirm')}
								onClick={() => onDelete(row.original)}
							>
								<IconTrash size={15} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
			},
		],
		[onEdit, onDelete, t, selectedIds, onToggleSelect, onSelectAll, allVisibleSelected, someVisibleSelected]
	);
}
