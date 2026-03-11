import { useState, useCallback, useEffect } from 'react';
import { TextInput, Group, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { Trans, useTranslation } from 'react-i18next';
import classes from './RolesPage.module.css';
import RolesList from '../RolesList';
import RoleForm from '../RoleForm';
import RoleDetails from '../RoleDetails';
import AppDrawer from '~/components/AppDrawer';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { useDeleteRole } from '~/queries/roleQueries';
import type { RoleModel } from '~/models/RoleModel';

const ROLES_MODAL_WIDTH = 'min(90vw, 1560px)';

const RolesPage: React.FC = () => {
	const { t } = useTranslation('roles');
	const { t: tCommon } = useTranslation('common');
	const [search, setSearch] = useState('');
	const [refreshKey, setRefreshKey] = useState(0);
	const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
	const [drawerOpened, setDrawerOpened] = useState(false);
	const deleteMutation = useDeleteRole();

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
		setDrawerOpened(false);
		setSelectedRoleId(null);

		return () => {
			setDrawerOpened(false);
			setSelectedRoleId(null);
		};
	}, []);

	const handleView = useCallback((roleId: number) => {
		setSelectedRoleId(roleId);
		setDrawerOpened(true);
	}, []);

	const handleCloseDrawer = useCallback(() => {
		setDrawerOpened(false);
		setSelectedRoleId(null);
	}, []);

	const handleModalSuccess = useCallback(() => {
		handleSuccess();
	}, [handleSuccess]);

	const openCreateModal = useCallback(() => {
		modals.open({
			title: t('newRole'),
			children: <RoleForm mode='create' onSuccess={handleModalSuccess} />,
			centered: true,
			size: ROLES_MODAL_WIDTH,
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
				size: ROLES_MODAL_WIDTH,
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
						if (selectedRoleId === role.id) {
							handleCloseDrawer();
						}
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
		[deleteMutation, handleCloseDrawer, selectedRoleId, t, tCommon]
	);

	return (
		<ContentContainer title={t('title')} description={t('description')}>
			<div className={classes.root}>
				<SectionCard title={t('list.title')} onAdd={openCreateModal}>
					<Group className={classes.header} gap='sm'>
						<TextInput
							placeholder={t('searchPlaceholder')}
							leftSection={<IconSearch size={18} />}
							value={search}
							onChange={handleSearchChange}
							className={classes.searchInput}
							size='sm'
						/>
					</Group>
					<RolesList
						key={refreshKey}
						search={search}
						onView={handleView}
						onEdit={openEditModal}
						onDelete={handleDelete}
					/>
				</SectionCard>
				<AppDrawer
					opened={drawerOpened && selectedRoleId !== null}
					onClose={handleCloseDrawer}
					title={t('details.title')}
					size='lg'
				>
					{selectedRoleId !== null ? (
						<RoleDetails roleId={selectedRoleId} />
					) : null}
				</AppDrawer>
			</div>
		</ContentContainer>
	);
};

export default RolesPage;
