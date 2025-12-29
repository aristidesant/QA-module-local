import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button, TextInput, Group, Text } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { Trans, useTranslation } from 'react-i18next';
import classes from './RolesPage.module.css';
import RolesList from '../RolesList';
import RoleForm from '../RoleForm';
import RoleDetails from '../RoleDetails';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { useDeleteRole } from '~/queries/roleQueries';
import type { RoleModel } from '~/models/RoleModel';
import useRolesPageStore from '../store/useRolesPageStore';

const RolesPage: React.FC = () => {
	const { t } = useTranslation('roles');
	const { t: tCommon } = useTranslation('common');
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
			title: t('newRole'),
			children: <RoleForm mode='create' onSuccess={handleModalSuccess} />,
			centered: true,
			size: '90%',
			withCloseButton: true,
			closeOnClickOutside: false,
		});
	}, [handleModalSuccess, t]);

	const openEditModal = useCallback(
		(roleId: number) => {
			modals.open({
				title: t('editRole'),
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
		[handleModalSuccess, t]
	);

	const handleDelete = useCallback(
		(role: RoleModel) => {
			if (role.isSystem) {
				notifications.show({
					title: t('notifications.cannotDeleteSystemTitle'),
					message: t('notifications.cannotDeleteSystemMessage'),
					color: 'orange',
				});
				return;
			}

			modals.openConfirmModal({
				title: t('deleteRole'),
				centered: true,
				labels: {
					confirm: t('deleteModal.confirmLabel'),
					cancel: tCommon('actions.cancel'),
				},
				confirmProps: { color: 'red' },
				children: (
					<Text size='sm'>
						<Trans
							ns='roles'
							i18nKey='deleteModal.body'
							values={{ name: role.name }}
							components={{ strong: <strong /> }}
						/>
					</Text>
				),
				onConfirm: async () => {
					try {
						await deleteMutation.mutateAsync(role.id);
						notifications.show({
							title: t('notifications.deletedTitle'),
							message: t('notifications.deletedMessage', { name: role.name }),
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
						size='sm'
					/>
					<Button
						leftSection={<IconPlus size={18} />}
						onClick={openCreateModal}
						variant='light'
						size='sm'
					>
						{t('newRole')}
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
