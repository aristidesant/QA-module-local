import { useState, useCallback } from 'react';
import { Button, TextInput, Text } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import classes from './ClientsPage.module.css';
import ClientsList from '../ClientsList/ClientsList';
import ClientForm from '../ClientForm/ClientForm';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { useDeleteClient } from '~/queries/clientQueries';
import type { ClientModel } from '~/models/ClientModel';
import { getClientDisplayLabel } from '~/utils/clientDisplay';

const ClientsPage: React.FC = () => {
	const { t } = useTranslation('clients');
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
			title: t('page.modals.create.title'),
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
	}, [handleSuccess, t]);

	const openEditModal = useCallback(
		(clientId: number) => {
			modals.open({
				title: t('page.modals.edit.title'),
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
		[handleSuccess, t]
	);

	const handleDelete = useCallback(
		(client: ClientModel) => {
			modals.openConfirmModal({
				title: t('page.modals.delete.title'),
				centered: true,
				labels: {
					confirm: t('page.modals.delete.confirm'),
					cancel: t('actions.cancel', { ns: 'common' }),
				},
				confirmProps: { color: 'red' },
				children: (
					<Text size='sm'>
						{t('page.modals.delete.descriptionPrefix')}{' '}
						<strong>{getClientDisplayLabel(client)}</strong>
						{t('page.modals.delete.descriptionSuffix')}
					</Text>
				),
				onConfirm: async () => {
					try {
						await deleteMutation.mutateAsync(client.id);
						notifications.show({
							title: t('notifications.deleted.title'),
							message: t('notifications.deleted.message', {
								name: getClientDisplayLabel(client),
							}),
							color: 'green',
						});
					} catch (error) {
						notifications.show({
							title: t('notifications.deleteFailed.title'),
							message:
								error instanceof Error
									? error.message
									: t('errors.unknownError'),
							color: 'red',
						});
					}
				},
			});
		},
		[deleteMutation, t]
	);

	return (
		<ContentContainer
			title={t('page.title')}
			description={t('page.description')}
			titleRight={
				<Button onClick={openCreateModal} leftSection={<IconPlus size={16} />}>
					{t('page.actions.newClient')}
				</Button>
			}
		>
			<SectionCard contentSpacing='sm'>
				<TextInput
					placeholder={t('page.search.placeholder')}
					leftSection={<IconSearch size={18} />}
					value={search}
					onChange={handleSearchChange}
					className={classes.searchInput}
					size='sm'
				/>
				<ClientsList
					search={search}
					onEdit={openEditModal}
					onDelete={handleDelete}
				/>
			</SectionCard>
		</ContentContainer>
	);
};

export default ClientsPage;
