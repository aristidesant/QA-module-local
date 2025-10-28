import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button, TextInput, Group, Text } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import classes from './UsersPage.module.css';
import UsersList from '../UsersList';
import UserForm from '../UserForm';
import UserDetails from '../UserDetails';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useDeleteUser } from '~/queries/userQueries';
import type { UserModel } from '~/models/UserModels';
import useUsersPageStore from '../store/useUsersPageStore';

const UsersPage: React.FC = () => {
	const [search, setSearch] = useState('');
	const [refreshKey, setRefreshKey] = useState(0);
	const deleteMutation = useDeleteUser();
	const rightComponent = useUsersPageStore((state) => state.rightComponent);
	const setRightComponent = useUsersPageStore(
		(state) => state.setRightComponent
	);
	const clearRightComponent = useUsersPageStore(
		(state) => state.clearRightComponent
	);

	const handleSearchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setSearch(event.currentTarget.value);
		},
		[]
	);

	const handleSuccess = useCallback(() => {
		modals.closeAll();
		setRefreshKey((prev) => prev + 1);
	}, []);

	useEffect(() => {
		clearRightComponent();

		return () => {
			clearRightComponent();
		};
	}, [clearRightComponent]);

	const handleView = useCallback(
		(userId: number) => {
			setRightComponent(<UserDetails key={userId} userId={userId} />);
		},
		[setRightComponent]
	);

	const rightSectionContent = useMemo(
		() => rightComponent ?? <></>,
		[rightComponent]
	);

	const handleModalSuccess = useCallback(() => {
		handleSuccess();
	}, [handleSuccess]);

	const openCreateModal = useCallback(() => {
		modals.open({
			title: 'New User',
			children: <UserForm mode='create' onSuccess={handleModalSuccess} />,
			centered: true,
			size: 'lg',
			withCloseButton: true,
			closeOnClickOutside: false,
		});
	}, [handleModalSuccess]);

	const openEditModal = useCallback(
		(userId: number) => {
			modals.open({
				title: 'Edit User',
				children: (
					<UserForm
						mode='edit'
						userId={userId}
						onSuccess={handleModalSuccess}
					/>
				),
				centered: true,
				size: 'xl',
				withCloseButton: true,
				closeOnClickOutside: false,
			});
		},
		[handleModalSuccess]
	);

	const handleDelete = useCallback(
		(user: UserModel) => {
			modals.openConfirmModal({
				title: 'Delete User',
				centered: true,
				labels: { confirm: 'Delete user', cancel: 'Cancel' },
				confirmProps: { color: 'red' },
				children: (
					<Text size='sm'>
						This action cannot be undone. Are you sure you want to delete{' '}
						<strong>{user.email}</strong>?
					</Text>
				),
				onConfirm: async () => {
					try {
						await deleteMutation.mutateAsync(user.id);
						notifications.show({
							title: 'User deleted',
							message: `${user.email} has been removed`,
							color: 'green',
						});
						setRefreshKey((prev) => prev + 1);
						clearRightComponent();
					} catch (error) {
						notifications.show({
							title: 'Unable to delete user',
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
		[clearRightComponent, deleteMutation]
	);

	return (
		<ContentContainer
			title='Users'
			description='Manage user access and profiles'
			rightSection={rightSectionContent}
		>
			<div className={classes.root}>
				<Group className={classes.header} gap='sm'>
					<TextInput
						placeholder='Search users'
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
						New User
					</Button>
				</Group>
				<UsersList
					key={refreshKey}
					search={search}
					onView={handleView}
					onEdit={openEditModal}
					onDelete={handleDelete}
				/>
			</div>
		</ContentContainer>
	);
};

export default UsersPage;
