import { useMemo, useState } from 'react';
import {
	Button,
	Modal,
	Stack,
	Text,
	Group,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import {
	IconCalendarTime,
	IconLock,
	IconPlus,
	IconSettings,
	IconTrash,
	IconAlertTriangle,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import InlineNotice from '~/components/InlineNotice';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import {
	useCreateClientConfig,
	useDeleteClientConfig,
} from '~/queries/useClientConfigs';
import ContentContainer from '~/components/ContentContainer';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { usePermissions } from '~/hooks/usePermissions';
import type { PredefinedScheduleConfig } from '~/models/PredefinedScheduleConfig';
import {
	useClientConfigByName,
	useUpdateClientConfig,
} from '~/queries/useClientConfigs';
import SchedulerPredefinedParamsForm from './SchedulerPredefinedParamsForm/SchedulerPredefinedParamsForm';
import SchedulerPredefinedParamsList from './SchedulerPredefinedParamsList/SchedulerPredefinedParamsList';

const SchedulerPredefinedParamsPage = () => {
	const { canPerformAction } = usePermissions();
	const navigate = useNavigate();
	const canManageSettings = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.MANAGE
	);
	const { data } = useClientConfigByName('scheduler_predefined_params');
	const updateMutation = useUpdateClientConfig();
	const createMutation = useCreateClientConfig();
	const deleteMutation = useDeleteClientConfig();
	const isMasterClient = useIsMasterClient();

	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [scheduleToDelete, setScheduleToDelete] =
		useState<PredefinedScheduleConfig | null>(null);
	const [editorOpen, setEditorOpen] = useState(false);
	const [selectedSchedule, setSelectedSchedule] =
		useState<PredefinedScheduleConfig | null>(null);
	const [deleteConfigModalOpen, setDeleteConfigModalOpen] = useState(false);

	const list = useMemo<PredefinedScheduleConfig[]>(() => {
		if (!data?.value) return [];
		try {
			return JSON.parse(data.value);
		} catch {
			return [];
		}
	}, [data]);

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

	const handleRowClick = (schedule: PredefinedScheduleConfig) => {
		if (!hasConfig || (!canEditConfig && !canCreateOverride)) return;
		setSelectedSchedule(schedule);
		setEditorOpen(true);
	};

	const handleAddNew = () => {
		if (!hasConfig) return;
		setSelectedSchedule(null);
		setEditorOpen(true);
	};

	const handleDeleteClick = (schedule: PredefinedScheduleConfig) => {
		setScheduleToDelete(schedule);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!scheduleToDelete || !data) return;

		try {
			const updatedList = list.filter(
				(item) => item.name !== scheduleToDelete.name
			);

			await updateMutation.mutateAsync({
				name: data.name,
				data: {
					description: data.description,
					value: JSON.stringify(updatedList),
					type: data.type,
				},
			});

			setDeleteModalOpen(false);
			setScheduleToDelete(null);
			setEditorOpen(false);
		} catch (error) {
			console.error('Failed to delete schedule:', error);
		}
	};

	const closeEditor = () => {
		setSelectedSchedule(null);
		setEditorOpen(false);
	};

	if (!canManageSettings) {
		return (
			<ContentContainer
				title='Scheduler presets'
				description='Manage predefined schedules for campaigns'
				titleIcon={<IconCalendarTime size={24} />}
			>
				<Stack gap='xs'>
					<Text size='sm' fw={600}>
						No permission to edit scheduler presets
					</Text>
					<Text size='xs' c='dimmed'>
						This area is limited to users with MANAGE access on the Settings
						module. Contact an administrator if you need to adjust scheduler
						templates.
					</Text>
					<Button
						variant='default'
						size='sm'
						leftSection={<IconLock size={14} />}
						onClick={() => navigate('/configurations/client-configs')}
					>
						Back to configurations
					</Button>
				</Stack>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer
			title='Scheduler presets'
			description='Curate reusable schedules with consistent days and hours'
			titleIcon={<IconCalendarTime size={24} />}
			titleRight={
				hasConfig ? (
					<Group gap={'xs'}>
						{canCreateOverride && (
							<Tooltip label='Create override' withArrow>
								<ActionIcon
									variant='light'
									color='grape'
									aria-label='Create override'
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
											console.error('Failed to create override:', e);
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
							<Tooltip label='Delete override' withArrow>
								<ActionIcon
									variant='light'
									color='red'
									aria-label='Delete override'
									onClick={() => setDeleteConfigModalOpen(true)}
									loading={deleteMutation.isPending}
									disabled={deleteMutation.isPending}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
						)}
						{(canEditConfig || (!isGlobalConfig && canCreateOverride)) && (
							<Tooltip label='Add schedule' withArrow>
								<ActionIcon
									variant='filled'
									color='blue'
									aria-label='Add schedule'
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
						icon={<IconAlertTriangle size={16} />}
						color='orange'
						description={
							isMasterClient
								? 'Changes here update the global defaults for every client. Proceed carefully.'
								: 'These values are read-only for your client. Create an override to customize them.'
						}
					/>
				)}
				<span>
					<SchedulerPredefinedParamsList
						data={list}
						onRowClick={handleRowClick}
						onDelete={canDeleteParams ? handleDeleteClick : undefined}
					/>
				</span>
			</Stack>
			<Modal
				opened={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				title='Delete schedule'
				centered
				size='sm'
			>
				<Text size='sm' mb='md'>
					Are you sure you want to delete &quot;{scheduleToDelete?.name}&quot;?
					This action cannot be undone.
				</Text>
				<div
					style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}
				>
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
				</div>
			</Modal>

			<Modal
				opened={editorOpen}
				onClose={closeEditor}
				title={
					selectedSchedule ? 'Edit scheduler preset' : 'New scheduler preset'
				}
				size='lg'
				centered
			>
				<SchedulerPredefinedParamsForm
					schedule={selectedSchedule ?? undefined}
					list={list}
					config={data}
					saveStrategy={saveStrategy}
					canSubmit={canSubmitEdits}
					onClose={closeEditor}
				/>
			</Modal>
			<Modal
				opened={deleteConfigModalOpen}
				onClose={() => setDeleteConfigModalOpen(false)}
				title='Delete configuration'
				centered
				size='sm'
			>
				<Text size='sm' mb='md'>
					Delete this client override to use the global scheduler presets?
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
						onClick={async () => {
							if (!data || !canDeleteConfig) return;
							try {
								await deleteMutation.mutateAsync(data.name);
								setDeleteConfigModalOpen(false);
								setEditorOpen(false);
								setSelectedSchedule(null);
							} catch (e) {
								console.error('Failed to delete configuration:', e);
							}
						}}
						loading={deleteMutation.isPending}
					>
						Delete override
					</Button>
				</Group>
			</Modal>
		</ContentContainer>
	);
};

export default SchedulerPredefinedParamsPage;
