import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button, TextInput, Group, Text } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import classes from './RolesPage.module.css';
import RolesList from '../RolesList';
import RoleForm from '../RoleForm';
import RoleDetails from '../RoleDetails';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useDeleteRole } from '~/queries/roleQueries';
import type { RoleModel } from '~/models/RoleModel';
import useRolesPageStore from '../store/useRolesPageStore';

const RolesPage: React.FC = () => {
	const [search, setSearch] = useState('');
	const [refreshKey, setRefreshKey] = useState(0);
	const deleteMutation = useDeleteRole();
	const rightComponent = useRolesPageStore((state) => state.rightComponent);
	const setRightComponent = useRolesPageStore(
		(state) => state.setRightComponent
	);
	const clearRightComponent = useRolesPageStore(
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
		(roleId: number) => {
			setRightComponent(<RoleDetails key={roleId} roleId={roleId} />);
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
			title: 'New Role',
			children: <RoleForm mode='create' onSuccess={handleModalSuccess} />,
			centered: true,
			size: '90%',
			withCloseButton: true,
			closeOnClickOutside: false,
		});
	}, [handleModalSuccess]);

	const openEditModal = useCallback(
		(roleId: number) => {
			modals.open({
				title: 'Edit Role',
				children: (
					<RoleForm
						mode='edit'
						roleId={roleId}
						onSuccess={handleModalSuccess}
					/>
				),
				centered: true,
				size: '90%',
				withCloseButton: true,
				closeOnClickOutside: false,
			});
		},
		[handleModalSuccess]
	);

	const handleDelete = useCallback(
		(role: RoleModel) => {
			if (role.isSystem) {
				notifications.show({
					title: 'Cannot delete system role',
					message: 'System roles are protected and cannot be deleted.',
					color: 'orange',
				});
				return;
			}

			modals.openConfirmModal({
				title: 'Delete Role',
				centered: true,
				labels: { confirm: 'Delete role', cancel: 'Cancel' },
				confirmProps: { color: 'red' },
				children: (
					<Text size='sm'>
						This action cannot be undone. Are you sure you want to delete{' '}
						<strong>{role.name}</strong>?
					</Text>
				),
				onConfirm: async () => {
					try {
						await deleteMutation.mutateAsync(role.id);
						notifications.show({
							title: 'Role deleted',
							message: `${role.name} has been removed`,
							color: 'green',
						});
						setRefreshKey((prev) => prev + 1);
						clearRightComponent();
					} catch (error) {
						notifications.show({
							title: 'Unable to delete role',
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
			title='Roles'
			description='Manage user roles and permissions'
			rightSection={rightSectionContent}
		>
			<div className={classes.root}>
				<Group className={classes.header} gap='sm'>
					<TextInput
						placeholder='Search roles'
						leftSection={<IconSearch size={18} />}
						value={search}
						onChange={handleSearchChange}
						className={classes.searchInput}
						size='sm'
					/>
					<Button
						leftSection={<IconPlus size={18} />}
						onClick={openCreateModal}
						variant='light'
						size='sm'
					>
						New Role
					</Button>
				</Group>
				<RolesList
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

export default RolesPage;
