import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from '@mantine/core';
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
				cell: ({ row }) => (
					<Stack gap={2}>
						<Text size='sm' fw={600} c='dark.8'>
							{row.original.phoneNumber}
						</Text>
						<Text size='xs' c='dimmed'>
							{row.original.identifier}
						</Text>
					</Stack>
				),
			},
			{
				accessorKey: 'label',
				header: t('columns.label'),
				cell: ({ row }) => (
					<Stack gap={2}>
						<Text size='sm' fw={500} c='dark.8'>
							{row.original.label}
						</Text>
						<Text size='xs' c='dimmed'>
							{row.original.description || t('list.noDescription')}
						</Text>
					</Stack>
				),
			},
			{
				accessorKey: 'type',
				header: t('columns.type'),
				cell: ({ getValue }) => {
					const val = getValue() as string;
					return (
						<Badge variant='light' color='gray' radius='sm'>
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
						<Badge
							variant='light'
							color={val === 'sip_trunk' ? 'indigo' : 'blue'}
							radius='sm'
						>
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
						<Badge variant='dot' color={color} radius='sm'>
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
								variant='light'
								color='blue'
								radius='md'
								size='sm'
								onClick={() => onEdit(row.original)}
							>
								<IconEdit size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('list.deleteModal.confirm')}>
							<ActionIcon
								variant='light'
								color='red'
								radius='md'
								size='sm'
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
