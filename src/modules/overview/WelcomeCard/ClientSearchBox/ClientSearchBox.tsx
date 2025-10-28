import { TextInput, Button, Modal } from '@mantine/core';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useClientStore } from '~/stores/clientStore';
import ClientForm from '~/components/ClientForm';
import classes from './ClientSearchBox.module.css';

export default function ClientSearchBox() {
	const { searchQuery, setSearchQuery } = useClientStore();
	const [opened, { open, close }] = useDisclosure(false);
	const queryClient = useQueryClient();

	const handleModalClose = () => {
		close();
	};

	const handleSuccess = () => {
		// Refresh the client list when a new client is created
		queryClient.invalidateQueries({ queryKey: ['clients'] });
	};

	return (
		<>
			<div className={classes.searchContainer}>
				<TextInput
					placeholder='Search client'
					value={searchQuery}
					onChange={(event) => setSearchQuery(event.currentTarget.value)}
					leftSection={<IconSearch size={16} />}
					classNames={{
						root: classes.searchRoot,
						input: classes.searchInput,
					}}
				/>
				<Button
					variant='filled'
					color='blue'
					className={classes.addButton}
					leftSection={<IconPlus size={16} />}
					onClick={open}
				>
					Add Client
				</Button>
			</div>

			<Modal
				opened={opened}
				onClose={handleModalClose}
				title='Create New Client'
				size='90%'
				centered
			>
				<ClientForm onClose={handleModalClose} onSuccess={handleSuccess} />
			</Modal>
		</>
	);
}
