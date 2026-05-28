import { useState, useCallback } from 'react';
import { TextInput, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { Trans, useTranslation } from 'react-i18next';
import classes from './UsersPage.module.css';
import UsersList from '../UsersList';
import UserForm from '../UserForm';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { useDeleteUser } from '~/queries/userQueries';
import type { UserModel } from '~/models/UserModels';

const UsersPage: React.FC = () => {
	const { t } = useTranslation('users');
	const { t: tCommon } = useTranslation('common');
	const [search, setSearch] = useState('');
	const [refreshKey, setRefreshKey] = useState(0);
	const deleteMutation = useDeleteUser();

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
		[deleteMutation, t, tCommon]
	);

	return (
		<ContentContainer>
			<div className={classes.root}>
				<SectionCard
					title={t('list.title')}
					description={t('list.description')}
					onAdd={openCreateModal}
				>
					<TextInput
						placeholder={t('searchPlaceholder')}
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={handleSearchChange}
						className={classes.searchInput}
						size='sm'
					/>
					<UsersList
						key={refreshKey}
						search={search}
						onEdit={openEditModal}
						onDelete={handleDelete}
					/>
				</SectionCard>
			</div>
		</ContentContainer>
	);
};

export default UsersPage;
