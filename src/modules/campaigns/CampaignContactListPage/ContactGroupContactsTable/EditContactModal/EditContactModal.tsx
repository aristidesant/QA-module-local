import { Modal, Title, Group } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import ContactsForm from '~/modules/contacts/ContactsForm/ContactsForm';
import { useQueryClient } from '@tanstack/react-query';
import styles from './EditContactModal.module.css';

interface EditContactModalProps {
	opened: boolean;
	onClose: () => void;
	contactId: number | null;
	contactGroupId: number;
}

function EditContactModal({
	opened,
	onClose,
	contactId,
	contactGroupId,
}: EditContactModalProps) {
	const queryClient = useQueryClient();

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			size='lg'
			title={
				<Group gap='xs'>
					<IconPencil size={18} />
					<Title order={5}>Edit Contact</Title>
				</Group>
			}
		>
			<div className={styles.modalBody}>
				{contactId != null && (
					<ContactsForm
						mode='edit'
						contactId={contactId}
						onSuccess={() => {
							// Ensure table refreshes
							queryClient.invalidateQueries({
								queryKey: ['contactGroupContacts', contactGroupId],
							});
							onClose();
						}}
					/>
				)}
			</div>
		</Modal>
	);
}

export default EditContactModal;
