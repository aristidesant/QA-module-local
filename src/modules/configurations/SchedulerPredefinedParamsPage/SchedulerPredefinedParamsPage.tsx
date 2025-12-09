import { useMemo, useState } from 'react';
import { Button, Modal, Stack, Text } from '@mantine/core';
import { IconCalendarTime, IconLock, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
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

	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [scheduleToDelete, setScheduleToDelete] =
		useState<PredefinedScheduleConfig | null>(null);
	const [editorOpen, setEditorOpen] = useState(false);
	const [selectedSchedule, setSelectedSchedule] =
		useState<PredefinedScheduleConfig | null>(null);

	const list = useMemo<PredefinedScheduleConfig[]>(() => {
		if (!data?.value) return [];
		try {
			return JSON.parse(data.value);
		} catch {
			return [];
		}
	}, [data]);

	const handleRowClick = (schedule: PredefinedScheduleConfig) => {
		setSelectedSchedule(schedule);
		setEditorOpen(true);
	};

	const handleAddNew = () => {
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
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={handleAddNew}
					size='sm'
				>
					Add schedule
				</Button>
			}
		>
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
			<SchedulerPredefinedParamsList
				data={list}
				onRowClick={handleRowClick}
				onDelete={handleDeleteClick}
			/>
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
					onClose={closeEditor}
				/>
			</Modal>
		</ContentContainer>
	);
};

export default SchedulerPredefinedParamsPage;
