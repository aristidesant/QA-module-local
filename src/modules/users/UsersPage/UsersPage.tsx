import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button, TextInput, Group, Text } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { Trans, useTranslation } from 'react-i18next';
import classes from './UsersPage.module.css';
import UsersList from '../UsersList';
import UserForm from '../UserForm';
import UserDetails from '../UserDetails';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useDeleteUser } from '~/queries/userQueries';
import type { UserModel } from '~/models/UserModels';
import useUsersPageStore from '../store/useUsersPageStore';

const UsersPage: React.FC = () => {
	const { t } = useTranslation('users');
	const { t: tCommon } = useTranslation('common');
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
			title: t('newUser'),
			fullScreen: true,
			children: <UserForm mode='create' onSuccess={handleModalSuccess} />,
			centered: true,
			withCloseButton: true,
			closeOnClickOutside: false,
		});
	}, [handleModalSuccess, t]);

	const openEditModal = useCallback(
		(userId: number) => {
			modals.open({
				title: t('editUser'),
				fullScreen: true,
				styles: {
					body: {
						height: '90%',
					},
				},
				children: (
					<UserForm
						mode='edit'
						userId={userId}
						onSuccess={handleModalSuccess}
					/>
				),
				centered: true,
				withCloseButton: true,
				closeOnClickOutside: false,
			});
		},
		[handleModalSuccess, t]
	);

	const handleDelete = useCallback(
		(user: UserModel) => {
			modals.openConfirmModal({
				title: t('deleteUser'),
				centered: true,
				labels: {
					confirm: t('deleteModal.confirmLabel'),
					cancel: tCommon('actions.cancel'),
				},
				confirmProps: { color: 'red' },
				children: (
					<Text size='sm'>
						<Trans
							ns='users'
							i18nKey='deleteModal.body'
							values={{ email: user.email }}
							components={{ strong: <strong /> }}
						/>
					</Text>
				),
				onConfirm: async () => {
					try {
						await deleteMutation.mutateAsync(user.id);
						notifications.show({
							title: t('notifications.deletedTitle'),
							message: t('notifications.deletedMessage', { email: user.email }),
							color: 'green',
						});
						setRefreshKey((prev) => prev + 1);
						clearRightComponent();
					} catch (error) {
						notifications.show({
							title: t('notifications.deleteErrorTitle'),
							message:
								error instanceof Error ? error.message : t('list.unknownError'),
							color: 'red',
						});
					}
				},
			});
		},
		[clearRightComponent, deleteMutation, t, tCommon]
	);

	return (
		<ContentContainer
			title={t('title')}
			description={t('description')}
			rightSection={rightSectionContent}
		>
			<div className={classes.root}>
				<Group className={classes.header} gap='sm'>
					<TextInput
						placeholder={t('searchPlaceholder')}
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
						{t('newUser')}
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
