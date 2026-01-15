import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Group, ActionIcon, Tooltip, Badge } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { PhoneNumber } from '~/models/PhoneNumber';

interface UsePhoneNumberTableColumnsProps {
	onEdit: (phoneNumber: PhoneNumber) => void;
	onDelete: (phoneNumber: PhoneNumber) => void;
}

export function usePhoneNumberTableColumns({
	onEdit,
	onDelete,
}: UsePhoneNumberTableColumnsProps) {
	const { t } = useTranslation('phone-numbers');

	return useMemo<ColumnDef<PhoneNumber>[]>(
		() => [
			{
				accessorKey: 'phoneNumber',
				header: t('columns.phoneNumber'),
			},
			{
				accessorKey: 'label',
				header: t('columns.label'),
			},
			{
				accessorKey: 'type',
				header: t('columns.type'),
				cell: ({ getValue }) => {
					const val = getValue() as string;
					return (
						<Badge variant='outline' color='gray'>
							{val}
						</Badge>
					);
				},
			},
			{
				accessorKey: 'provider',
				header: t('columns.provider'),
				cell: ({ getValue }) => {
					const val = getValue() as string;
					return (
						<Badge variant='light' color='blue'>
							{val === 'sip_trunk' ? 'SIP Trunk' : 'Twilio'}
						</Badge>
					);
				},
			},
			{
				accessorKey: 'status',
				header: t('columns.status'),
				cell: ({ getValue }) => {
					const val = getValue() as string;
					const color = val === 'Active' ? 'green' : 'gray';
					return (
						<Badge variant='dot' color={color}>
							{val}
						</Badge>
					);
				},
			},
			{
				id: 'actions',
				header: t('columns.actions'),
				cell: ({ row }) => (
					<Group gap='xs'>
						<Tooltip label={t('form.buttons.update')}>
							<ActionIcon
								variant='subtle'
								color='blue'
								onClick={() => onEdit(row.original)}
							>
								<IconEdit size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('list.deleteModal.confirm')}>
							<ActionIcon
								variant='subtle'
								color='red'
								onClick={() => onDelete(row.original)}
							>
								<IconTrash size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
			},
		],
		[onEdit, onDelete, t]
	);
}
