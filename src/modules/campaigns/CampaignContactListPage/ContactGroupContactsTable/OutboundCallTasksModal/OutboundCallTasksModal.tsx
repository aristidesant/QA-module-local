import { Badge, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Contact, OutboundCallTask } from '~/models/ContactsModel';
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

	const formatEventDate = (date: string | null): string => {
		if (!date) {
			return t('contactsTable.outboundTasks.noEventDate');
		}

		const parsedDate = new Date(date);
		if (Number.isNaN(parsedDate.getTime())) {
			return t('contactsTable.outboundTasks.noEventDate');
		}

		return parsedDate.toLocaleString();
	};

	const getPrimaryEventDate = (task: OutboundCallTask): string | null => {
		return (
			task.completedAt ??
			task.cancelledAt ??
			task.pausedAt ??
			task.startedAt ??
			task.scheduledAt ??
			task.createdAt ??
			null
		);
	};

	const sortedTasks = useMemo(() => {
		return [...tasks].sort((a, b) => {
			const aDate = getPrimaryEventDate(a);
			const bDate = getPrimaryEventDate(b);

			const aTime = aDate ? new Date(aDate).getTime() : 0;
			const bTime = bDate ? new Date(bDate).getTime() : 0;

			return bTime - aTime;
		});
	}, [tasks]);

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
				{tasks.length === 0 ? (
					<Text size='sm' c='dimmed' className={styles.emptyState}>
						{t('contactsTable.outboundTasks.empty')}
					</Text>
				) : (
					<Stack gap='xs'>
						{sortedTasks.map((task) => (
							<div key={task.id} className={styles.taskCard}>
								<Group justify='space-between' align='flex-start' gap='xs'>
									<Group gap={6}>
										<Badge
											size='sm'
											variant='light'
											className={styles.statusBadge}
										>
											{task.status}
										</Badge>
										<Text size='xs' fw={500} c='dimmed'>
											{t('contactsTable.outboundTasks.waveLabel', {
												wave: task.waveNumber,
											})}
										</Text>
									</Group>
									<Stack gap={2} align='flex-end'>
										<Text size='xs' c='dimmed'>
											{t('contactsTable.outboundTasks.eventDate')}
										</Text>
										<Text size='xs' fw={600} className={styles.dateValue}>
											{formatEventDate(getPrimaryEventDate(task))}
										</Text>
									</Stack>
								</Group>

								<Text size='xs' c='dimmed' className={styles.errorMessage}>
									{task.errorMessage ||
										t('contactsTable.outboundTasks.noErrorMessage')}
								</Text>
							</div>
						))}
					</Stack>
				)}
			</Stack>
		</Modal>
	);
};

export default OutboundCallTasksModal;
