import { Modal, Title, Group } from '@mantine/core';
import { useEffect } from 'react';
import { IconPencil } from '@tabler/icons-react';
import ContactsForm from '~/modules/contacts/ContactsForm/ContactsForm';
import { useQueryClient } from '@tanstack/react-query';
import styles from './EditContactModal.module.css';
import { useContactEditStore } from '~/stores/contactEditStore';

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
	const { setContext, clear } = useContactEditStore();

	useEffect(() => {
		if (opened) {
			setContext({ contactId, contactGroupId });
		}
		// no cleanup here; we clear on modal close explicitly
	}, [opened, contactId, contactGroupId, setContext]);

	return (
		<Modal
			opened={opened}
			onClose={() => {
				clear();
				onClose();
			}}
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
							clear();
							onClose();
						}}
					/>
				)}
			</div>
		</Modal>
	);
}

export default EditContactModal;
