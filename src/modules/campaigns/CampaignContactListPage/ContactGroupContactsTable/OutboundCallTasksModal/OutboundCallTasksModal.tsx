import { Modal, Title, Text, Stack, Group, Badge } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { Contact, OutboundCallTask } from '~/models/ContactsModel';
import BaseTable from '~/components/BaseTable';
import { getFullName } from '../contactHelpers';
import styles from './OutboundCallTasksModal.module.css';

interface OutboundCallTasksModalProps {
	opened: boolean;
	onClose: () => void;
	contact: Contact | null;
}

const OutboundCallTasksModal = ({
	opened,
	onClose,
	contact,
}: OutboundCallTasksModalProps) => {
	const { t } = useTranslation('campaign.contact-list');
	const tasks = contact?.outboundCallTasks ?? [];
	const fullName = contact ? getFullName(contact) : '';
	const displayName = contact
		? fullName || t('contactsTable.unnamedContact')
		: '';

	const columns = useMemo<ColumnDef<OutboundCallTask>[]>(
		() => [
			{
				accessorKey: 'status',
				header: t('contactsTable.outboundTasks.columns.status'),
				size: 120,
				cell: ({ getValue }) => (
					<Badge size='sm' variant='light' className={styles.statusBadge}>
						{getValue() as string}
					</Badge>
				),
			},
			{
				accessorKey: 'waveNumber',
				header: t('contactsTable.outboundTasks.columns.wave'),
				size: 80,
				cell: ({ getValue }) => (
					<Text size='xs' fw={500}>
						{getValue() as number}
					</Text>
				),
			},
			{
				accessorKey: 'errorMessage',
				header: t('contactsTable.outboundTasks.columns.errorMessage'),
				size: 280,
				cell: ({ getValue }) => {
					const message = getValue() as string | null;
					return (
						<Text size='xs' c='dimmed' className={styles.errorMessage}>
							{message || t('contactsTable.outboundTasks.noErrorMessage')}
						</Text>
					);
				},
			},
		],
		[t]
	);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			centered
			size='xl'
			title={
				<Group gap='xs'>
					<IconInfoCircle size={18} />
					<Title order={4}>{t('contactsTable.outboundTasks.title')}</Title>
				</Group>
			}
		>
			<Stack gap='sm' className={styles.modalContent}>
				{contact && (
					<Text size='xs' c='dimmed'>
						{t('contactsTable.outboundTasks.subtitle', {
							name: displayName,
						})}
					</Text>
				)}
				<BaseTable
					data={tasks}
					columns={columns}
					emptyMessage={t('contactsTable.outboundTasks.empty')}
					enablePagination={false}
					density='compact'
				/>
			</Stack>
		</Modal>
	);
};

export default OutboundCallTasksModal;
