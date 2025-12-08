import { useState, useCallback } from 'react';
import { Button, Group, TextInput, Text } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import classes from './ClientsPage.module.css';
import ClientsList from '../ClientsList/ClientsList';
import ClientForm from '../ClientForm/ClientForm';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useDeleteClient } from '~/queries/clientQueries';
import type { ClientModel } from '~/models/ClientModel';

const ClientsPage: React.FC = () => {
	const [search, setSearch] = useState('');
	const deleteMutation = useDeleteClient();

	const handleSearchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setSearch(event.currentTarget.value);
		},
		[]
	);

	const handleSuccess = useCallback(() => {
		modals.closeAll();
	}, []);

	const openCreateModal = useCallback(() => {
		modals.open({
			title: 'New Client',
			fullScreen: false,
			size: 'xl',
			radius: 'lg',
			children: (
				<ClientForm
					mode='create'
					onSuccess={handleSuccess}
					onCancel={() => modals.closeAll()}
				/>
			),
			centered: true,
			withCloseButton: true,
			closeOnClickOutside: false,
		});
	}, [handleSuccess]);

	const openEditModal = useCallback(
		(clientId: number) => {
			modals.open({
				title: 'Edit Client',
				fullScreen: false,
				size: 'xl',
				radius: 'lg',
				children: (
					<ClientForm
						mode='edit'
						clientId={clientId}
						onSuccess={handleSuccess}
						onCancel={() => modals.closeAll()}
					/>
				),
				centered: true,
				withCloseButton: true,
				closeOnClickOutside: false,
			});
		},
		[handleSuccess]
	);

	const handleDelete = useCallback(
		(client: ClientModel) => {
			modals.openConfirmModal({
				title: 'Delete Client',
				centered: true,
				labels: { confirm: 'Delete client', cancel: 'Cancel' },
				confirmProps: { color: 'red' },
				children: (
					<Text size='sm'>
						This action cannot be undone. Are you sure you want to delete{' '}
						<strong>{client.name}</strong>?
					</Text>
				),
				onConfirm: async () => {
					try {
						await deleteMutation.mutateAsync(client.id);
						notifications.show({
							title: 'Client deleted',
							message: `${client.name} has been removed`,
							color: 'green',
						});
					} catch (error) {
						notifications.show({
							title: 'Unable to delete client',
							message:
								error instanceof Error
									? error.message
									: 'Unknown error occurred',
							color: 'red',
						});
					}
				},
			});
		},
		[deleteMutation]
	);

	return (
		<ContentContainer
			title='Clients'
			description='Manage clients and their configurations'
		>
			<div className={classes.root}>
				<Group className={classes.header} gap='sm'>
					<TextInput
						placeholder='Search clients'
						leftSection={<IconSearch size={18} />}
						value={search}
						onChange={handleSearchChange}
						className={classes.searchInput}
					/>
					<Button
						leftSection={<IconPlus size={18} />}
						onClick={openCreateModal}
						variant='light'
					>
						New Client
					</Button>
				</Group>
				<ClientsList
					search={search}
					onEdit={openEditModal}
					onDelete={handleDelete}
				/>
			</div>
		</ContentContainer>
	);
};

export default ClientsPage;
