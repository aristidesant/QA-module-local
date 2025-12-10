import { useMemo, useState } from 'react';
import {
	useClientConfigByName,
	useUpdateClientConfig,
	useDeleteClientConfig,
	useCreateClientConfig,
} from '~/queries/useClientConfigs';
import CampaignPredefinedParamsList from './CampaignPredefinedParamsList';
import { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';
import ContentContainer from '~/components/ContentContainer';
import {
	ActionIcon,
	Button,
	Group,
	Modal,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconAlertTriangle,
	IconPlus,
	IconSettings,
	IconTrash,
} from '@tabler/icons-react';
import CampaignPredefinedParamsForm from './CampaignPredefinedParamsForm';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import InlineNotice from '~/components/InlineNotice';

const CampaignPredefinedParamsPage = () => {
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
	const canDeleteParams = !isGlobalConfig;
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

	return (
		<ContentContainer
			title='Campaign Predefined Params'
			description='Modify the default params'
			titleRight={
				hasConfig ? (
					<Group gap={'xs'}>
						{canCreateOverride && (
							<Tooltip label='Create override' withArrow>
								<ActionIcon
									variant='light'
									color='grape'
									aria-label='Create override'
									onClick={handleCreateOverride}
									loading={isCreatingOverride}
									disabled={isCreatingOverride}
								>
									<IconSettings size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{canDeleteConfig && (
							<Tooltip label='Delete override' withArrow>
								<ActionIcon
									variant='light'
									color='red'
									aria-label='Delete override'
									onClick={() => setDeleteConfigModalOpen(true)}
									loading={isDeletingOverride}
									disabled={isDeletingOverride}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{(canEditConfig || (!isGlobalConfig && canCreateOverride)) && (
							<Tooltip label='Add parameter' withArrow>
								<ActionIcon
									variant='filled'
									color='blue'
									aria-label='Add parameter'
									onClick={handleAddNew}
									disabled={
										!hasConfig || (!canEditConfig && !canCreateOverride)
									}
								>
									<IconPlus size={16} />
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
						title='Global configuration'
						color='orange'
						icon={<IconAlertTriangle size={16} />}
						description={
							isMasterClient
								? 'Changes here update the global defaults for every client. Proceed carefully.'
								: 'These values are read-only for your client. Create an override to customize them.'
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
				title='Delete Parameter'
				centered
				size='sm'
			>
				<Text size='sm' mb='md'>
					Are you sure you want to delete &quot;{paramToDelete?.name}&quot;?
					This action cannot be undone.
				</Text>
				<Group gap='xs' justify='flex-end'>
					<Button
						variant='default'
						size='xs'
						onClick={() => setDeleteModalOpen(false)}
					>
						Cancel
					</Button>
					<Button
						color='red'
						size='xs'
						onClick={handleConfirmDelete}
						loading={updateMutation.isPending}
					>
						Delete
					</Button>
				</Group>
			</Modal>

			<Modal
				opened={deleteConfigModalOpen}
				onClose={() => setDeleteConfigModalOpen(false)}
				title='Delete configuration'
				centered
				size='sm'
			>
				<Text size='sm' mb='md'>
					Delete this client override to use the global campaign parameters?
				</Text>
				<Group gap='xs' justify='flex-end'>
					<Button
						variant='default'
						size='xs'
						onClick={() => setDeleteConfigModalOpen(false)}
					>
						Cancel
					</Button>
					<Button
						color='red'
						size='xs'
						onClick={handleConfirmDeleteConfig}
						loading={deleteMutation.isPending}
					>
						Delete override
					</Button>
				</Group>
			</Modal>
			<Modal
				opened={formModalOpen}
				onClose={handleCloseForm}
				title={
					mode === 'edit'
						? 'Edit Campaign Parameter'
						: 'Create Campaign Parameter'
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
		</ContentContainer>
	);
};

export default CampaignPredefinedParamsPage;
