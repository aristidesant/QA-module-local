import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import styles from './PhoneNumberList.module.css';
import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from '@mantine/core';
import {
	IconEdit,
	IconTrash,
	IconPhoneIncoming,
	IconPhoneOutgoing,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { PhoneNumber } from '~/models/PhoneNumber';

interface UsePhoneNumberTableColumnsProps {
	onEdit: (phoneNumber: PhoneNumber) => void;
	onDelete: (phoneNumber: PhoneNumber) => void;
}

const TYPE_COLOR: Record<string, string> = {
	INBOUND: 'blue',
	OUTBOUND: 'violet',
	HYBRID: 'teal',
};

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
				size: 220,
				cell: ({ row }) => (
					<Stack gap={2} className={styles.cellStack}>
						<Text
							size='sm'
							fw={600}
							ff='monospace'
							className={styles.phoneNumberText}
						>
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
				size: 150,
				cell: ({ row }) => {
					const type = row.original.type;
					const inbound =
						row.original.supportsInbound ??
						(type === 'INBOUND' || type === 'HYBRID');
					const outbound =
						row.original.supportsOutbound ??
						(type === 'OUTBOUND' || type === 'HYBRID');
					return (
						<Stack gap={5} align='flex-start'>
							<Badge
								variant='light'
								color={TYPE_COLOR[type] ?? 'gray'}
								radius='sm'
								size='sm'
							>
								{type}
							</Badge>
							<Group gap={4}>
								<Tooltip
									label={t('form.fields.supportsInbound')}
									withArrow
									fz='xs'
								>
									<Badge
										size='xs'
										variant={inbound ? 'light' : 'outline'}
										color={inbound ? 'blue' : 'gray'}
										leftSection={<IconPhoneIncoming size={9} />}
										radius='sm'
										className={
											inbound
												? styles.capabilityBadge
												: styles.capabilityBadgeDimmed
										}
									>
										In
									</Badge>
								</Tooltip>
								<Tooltip
									label={t('form.fields.supportsOutbound')}
									withArrow
									fz='xs'
								>
									<Badge
										size='xs'
										variant={outbound ? 'light' : 'outline'}
										color={outbound ? 'violet' : 'gray'}
										leftSection={<IconPhoneOutgoing size={9} />}
										radius='sm'
										className={
											outbound
												? styles.capabilityBadge
												: styles.capabilityBadgeDimmed
										}
									>
										Out
									</Badge>
								</Tooltip>
							</Group>
						</Stack>
					);
				},
			},
			{
				accessorKey: 'provider',
				header: t('columns.provider'),
				size: 130,
				cell: ({ getValue }) => {
					const val = getValue() as string;
					const isSip = val === 'sip_trunk';
					return (
						<Badge
							variant='light'
							color={isSip ? 'indigo' : 'blue'}
							radius='sm'
						>
							{isSip ? t('form.provider.sipTrunk') : t('form.provider.twilio')}
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
							variant={isActive ? 'filled' : 'light'}
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
								color='blue'
								radius='md'
								size='md'
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
								onClick={() => onDelete(row.original)}
							>
								<IconTrash size={15} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
			},
		],
		[onEdit, onDelete, t]
	);
}
