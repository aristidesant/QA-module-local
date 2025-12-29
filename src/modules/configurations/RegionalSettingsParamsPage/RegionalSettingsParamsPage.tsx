import { useMemo, useState } from 'react';
import {
	useClientConfigByName,
	useCreateClientConfig,
	useDeleteClientConfig,
} from '~/queries/useClientConfigs';
import { RegionalSettings } from '~/models/RegionalSettingsParam';
import ContentContainer from '~/components/ContentContainer';
import {
	Text,
	Stack,
	Modal,
	ActionIcon,
	Group,
	Tooltip,
	Button,
} from '@mantine/core';
import {
	IconSettings,
	IconTrash,
	IconAlertTriangle,
	IconEdit,
} from '@tabler/icons-react';
import useRegionalSettingsParamsStore from './store/useRegionalSettingsParamsStore';
import RegionalSettingsParamsDetail from './RegionalSettingsParamsDetail';
import RegionalSettingsParamsForm from './RegionalSettingsParamsForm';
import InlineNotice from '~/components/InlineNotice';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import { useTranslation } from 'react-i18next';

const RegionalSettingsParamsPage = () => {
	const { t } = useTranslation('regional-settings-params');
	const { data } = useClientConfigByName('regional_settings');
	const { setMode } = useRegionalSettingsParamsStore();
	const createMutation = useCreateClientConfig();
	const deleteMutation = useDeleteClientConfig();
	const isMasterClient = useIsMasterClient();
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteConfigModalOpen, setDeleteConfigModalOpen] = useState(false);

	const regionalSettings = useMemo<RegionalSettings>(() => {
		if (!data?.value)
			return { timezone: 'America/Santo_Domingo', locale: 'es-DO' };
		try {
			return JSON.parse(data.value);
		} catch {
			return { timezone: 'America/Santo_Domingo', locale: 'es-DO' };
		}
	}, [data]);

	const handleEdit = () => {
		setMode('edit');
		setEditModalOpen(true);
	};

	const handleCancel = () => {
		setMode('view');
		setEditModalOpen(false);
	};

	const hasConfig = !!data;
	const isGlobalConfig = data?.clientId == null;
	const canEditConfig = isMasterClient || !isGlobalConfig;
	const canCreateOverride = !isMasterClient && isGlobalConfig;
	const canDeleteConfig = !isGlobalConfig;
	const saveStrategy: 'create' | 'update' = canCreateOverride
		? 'create'
		: 'update';
	const canSubmitEdits = !(isGlobalConfig && !isMasterClient);

	return (
		<ContentContainer
			title={t('page.title')}
			description={t('page.description')}
			titleRight={
				hasConfig ? (
					<Group gap={'xs'}>
						{canCreateOverride && (
							<Tooltip label={t('actions.createOverride')} withArrow>
								<ActionIcon
									variant='light'
									color='grape'
									aria-label={t('actions.createOverride')}
									onClick={async () => {
										if (!data || !canCreateOverride) return;
										try {
											await createMutation.mutateAsync({
												name: data.name,
												description: data.description,
												value: data.value,
												type: data.type,
											});
										} catch (e) {
											console.error('Failed to create override', e);
										}
									}}
									loading={createMutation.isPending}
									disabled={createMutation.isPending}
								>
									<IconSettings size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{canDeleteConfig && (
							<Tooltip label={t('actions.deleteOverride')} withArrow>
								<ActionIcon
									variant='light'
									color='red'
									aria-label={t('actions.deleteOverride')}
									onClick={() => setDeleteConfigModalOpen(true)}
									loading={deleteMutation.isPending}
									disabled={deleteMutation.isPending}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{canEditConfig && (
							<Tooltip label={t('actions.editSettings')} withArrow>
								<ActionIcon
									variant='filled'
									color='blue'
									aria-label={t('actions.editSettings')}
									onClick={handleEdit}
								>
									<IconEdit size={16} />
								</ActionIcon>
							</Tooltip>
						)}
					</Group>
				) : undefined
			}
		>
			<Stack gap={'xs'}>
				{isGlobalConfig && (
					<InlineNotice
						title={t('globalNotice.title')}
						icon={<IconAlertTriangle size={16} />}
						color='orange'
						description={
							isMasterClient
								? t('globalNotice.description.master')
								: t('globalNotice.description.client')
						}
					/>
				)}
				<RegionalSettingsParamsDetail regionalSettings={regionalSettings} />
			</Stack>
			<Modal
				opened={editModalOpen}
				onClose={handleCancel}
				title={t('editModal.title')}
				centered
				size='md'
				overlayProps={{ opacity: 0.3, blur: 2 }}
				styles={{
					header: {
						padding: 'var(--mantine-spacing-sm) var(--mantine-spacing-md)',
						borderBottom: '1px solid var(--mantine-color-gray-2)',
					},
					title: {
						fontSize: 'var(--mantine-font-size-md)',
						fontWeight: 700,
					},
					body: {
						padding: 'var(--mantine-spacing-md)',
						background: 'var(--mantine-color-gray-0)',
					},
				}}
			>
				<RegionalSettingsParamsForm
					regionalSettings={regionalSettings}
					config={data}
					onCancel={handleCancel}
					saveStrategy={saveStrategy}
					canSubmit={canSubmitEdits}
				/>
			</Modal>
			<Modal
				opened={deleteConfigModalOpen}
				onClose={() => setDeleteConfigModalOpen(false)}
				title={t('deleteOverride.title')}
				centered
				size='sm'
			>
				<Text size='sm' mb='md'>
					{t('deleteOverride.description')}
				</Text>
				<Group gap='xs' justify='flex-end'>
					<Button
						variant='default'
						size='xs'
						onClick={() => setDeleteConfigModalOpen(false)}
					>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button
						color='red'
						size='xs'
						onClick={async () => {
							if (!data || !canDeleteConfig) return;
							try {
								await deleteMutation.mutateAsync(data.name);
								setDeleteConfigModalOpen(false);
								setEditModalOpen(false);
								setMode('view');
							} catch (e) {
								console.error('Failed to delete configuration:', e);
							}
						}}
						loading={deleteMutation.isPending}
					>
						{t('actions.deleteOverride')}
					</Button>
				</Group>
			</Modal>
		</ContentContainer>
	);
};

export default RegionalSettingsParamsPage;
