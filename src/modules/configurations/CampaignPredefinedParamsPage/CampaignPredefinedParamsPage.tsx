import { useMemo, useState } from 'react';
import {
	useClientConfigByName,
	useUpdateClientConfig,
	useDeleteClientConfig,
	useCreateClientConfig,
} from '~/queries/useClientConfigs';
import CampaignPredefinedParamsList from './CampaignPredefinedParamsList';
import { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconPlus, IconSettings } from '@tabler/icons-react';
import CampaignPredefinedParamsForm from './CampaignPredefinedParamsForm';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import InlineNotice from '~/components/InlineNotice';
import SectionCard, { type CardActionsConfig } from '~/components/SectionCard';
import { useTranslation } from 'react-i18next';

const CampaignPredefinedParamsPage = () => {
	const { t } = useTranslation('campaign-predefined-params');
	const isMasterClient = useIsMasterClient();
	const { data } = useClientConfigByName('campaign_predefined_params');
	const updateMutation = useUpdateClientConfig();
	const deleteMutation = useDeleteClientConfig();
	const createMutation = useCreateClientConfig();
	const [selectedParam, setSelectedParam] =
		useState<CampaignPredefinedParam | null>(null);
	const [mode, setMode] = useState<'create' | 'edit'>('create');
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [paramToDelete, setParamToDelete] =
		useState<CampaignPredefinedParam | null>(null);
	const [deleteConfigModalOpen, setDeleteConfigModalOpen] = useState(false);
	const [formModalOpen, setFormModalOpen] = useState(false);

	const hasConfig = !!data;
	const isGlobalConfig = data?.clientId == null;
	const canEditConfig = isMasterClient || !isGlobalConfig;
	const canCreateOverride = !isMasterClient && isGlobalConfig;
	const canDeleteParams = !isGlobalConfig || isMasterClient;
	const canDeleteConfig = !isGlobalConfig;
	const saveStrategy: 'create' | 'update' = canCreateOverride
		? 'create'
		: 'update';
	const canSubmitEdits = !(isGlobalConfig && !isMasterClient);
	const isCreatingOverride = createMutation.isPending;
	const isDeletingOverride = deleteMutation.isPending;

	const list = useMemo<CampaignPredefinedParam[]>(() => {
		if (!data?.value) return [];
		try {
			return JSON.parse(data.value);
		} catch {
			return [];
		}
	}, [data]);

	const handleRowClick = (param: CampaignPredefinedParam) => {
		if (!hasConfig || (!canEditConfig && !canCreateOverride)) return;
		setSelectedParam(param);
		setMode('edit');
		setFormModalOpen(true);
	};

	const handleAddNew = () => {
		if (!hasConfig) return;
		setSelectedParam(null);
		setMode('create');
		setFormModalOpen(true);
	};

	const handleDeleteClick = (param: CampaignPredefinedParam) => {
		if (!canDeleteParams) return;
		setParamToDelete(param);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!paramToDelete || !data || !canDeleteParams) return;

		try {
			const updatedList = list.filter((p) => p.name !== paramToDelete.name);

			await updateMutation.mutateAsync({
				name: data.name,
				data: {
					description: data.description,
					value: JSON.stringify(updatedList),
					type: data.type,
				},
			});

			setDeleteModalOpen(false);
			setParamToDelete(null);
			setFormModalOpen(false);
			setSelectedParam(null);
		} catch (error) {
			console.error('Failed to delete parameter:', error);
		}
	};

	const handleCreateOverride = async () => {
		if (!data || !canCreateOverride) return;

		try {
			await createMutation.mutateAsync({
				name: data.name,
				description: data.description,
				value: data.value,
				type: data.type,
			});
		} catch (error) {
			console.error('Failed to create override:', error);
		}
	};

	const handleConfirmDeleteConfig = async () => {
		if (!data || !canDeleteConfig) return;

		try {
			await deleteMutation.mutateAsync(data.name);
			setDeleteConfigModalOpen(false);
			setFormModalOpen(false);
			setSelectedParam(null);
		} catch (error) {
			console.error('Failed to delete configuration:', error);
		}
	};

	const handleCloseForm = () => {
		setFormModalOpen(false);
		setSelectedParam(null);
	};

	const sectionActions = useMemo<CardActionsConfig | undefined>(() => {
		if (!hasConfig) {
			return undefined;
		}

		const secondary = [] as NonNullable<CardActionsConfig['secondary']>;

		if (canCreateOverride) {
			secondary.push({
				kind: 'configure',
				icon: IconSettings,
				label: t('actions.createOverride'),
				color: 'grape',
				onClick: handleCreateOverride,
				disabled: isCreatingOverride,
				loading: isCreatingOverride,
			});
		}

		if (canDeleteConfig) {
			secondary.push({
				kind: 'delete',
				label: t('actions.deleteOverride'),
				color: 'red',
				onClick: () => setDeleteConfigModalOpen(true),
				disabled: isDeletingOverride,
				loading: isDeletingOverride,
			});
		}

		const canAddParameter =
			canEditConfig || (!isGlobalConfig && canCreateOverride);

		return {
			primary: canAddParameter
				? {
						kind: 'add',
						icon: IconPlus,
						label: t('actions.addParameter'),
						onClick: handleAddNew,
						disabled: !hasConfig || (!canEditConfig && !canCreateOverride),
					}
				: undefined,
			secondary,
		};
	}, [
		canCreateOverride,
		canDeleteConfig,
		canEditConfig,
		hasConfig,
		handleCreateOverride,
		isCreatingOverride,
		isDeletingOverride,
		isGlobalConfig,
		t,
	]);

	return (
		<SectionCard
			title={t('page.title')}
			description={t('page.description')}
			actions={sectionActions}
		>
			<Stack gap={'xs'}>
				{isGlobalConfig && (
					<InlineNotice
						title={t('globalNotice.title')}
						color='orange'
						icon={<IconAlertTriangle size={16} />}
						description={
							isMasterClient
								? t('globalNotice.description.master')
								: t('globalNotice.description.client')
						}
					/>
				)}
				<span>
					<CampaignPredefinedParamsList
						data={list}
						onRowClick={handleRowClick}
						onDelete={canDeleteParams ? handleDeleteClick : undefined}
					/>
				</span>
			</Stack>
			<Modal
				opened={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				title={t('deleteParameter.title')}
				centered
				size='sm'
			>
				<Text size='sm' mb='md'>
					{t('deleteParameter.description', {
						name: paramToDelete?.name ?? '',
					})}
				</Text>
				<Group gap='xs' justify='flex-end'>
					<Button
						variant='default'
						size='xs'
						onClick={() => setDeleteModalOpen(false)}
					>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button
						color='red'
						size='xs'
						onClick={handleConfirmDelete}
						loading={updateMutation.isPending}
					>
						{t('actions.delete', { ns: 'common' })}
					</Button>
				</Group>
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
						onClick={handleConfirmDeleteConfig}
						loading={deleteMutation.isPending}
					>
						{t('actions.deleteOverride')}
					</Button>
				</Group>
			</Modal>
			<Modal
				opened={formModalOpen}
				onClose={handleCloseForm}
				title={
					mode === 'edit'
						? t('formModal.title.edit')
						: t('formModal.title.create')
				}
				size='xl'
				radius='md'
				centered
				overlayProps={{ opacity: 0.3, blur: 2 }}
				styles={{
					header: {
						padding: 'var(--mantine-spacing-sm) var(--mantine-spacing-md)',
						borderBottom: '1px solid var(--mantine-color-gray-2)',
						marginBottom: 0,
					},
					title: {
						fontSize: 'var(--mantine-font-size-md)',
						fontWeight: 700,
					},
					body: {
						padding: 'var(--mantine-spacing-md)',
						paddingTop: 'var(--mantine-spacing-sm)',
						paddingBottom: 'var(--mantine-spacing-sm)',
						background: 'var(--mantine-color-gray-0)',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
					},
					content: {
						height: '90vh',
						maxHeight: '90vh',
						display: 'flex',
						flexDirection: 'column',
					},
				}}
				keepMounted={false}
			>
				<CampaignPredefinedParamsForm
					param={selectedParam ?? undefined}
					list={list}
					config={data}
					saveStrategy={saveStrategy}
					mode={mode}
					onCancel={handleCloseForm}
					onSuccess={handleCloseForm}
					canSubmit={canSubmitEdits}
				/>
			</Modal>
		</SectionCard>
	);
};

export default CampaignPredefinedParamsPage;
