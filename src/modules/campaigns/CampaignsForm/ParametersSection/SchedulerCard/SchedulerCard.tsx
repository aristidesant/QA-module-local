import React, { useEffect } from 'react';
import { Group, Stack, Button, LoadingOverlay, Box } from '@mantine/core';
import { IconEdit, IconDeviceFloppy } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import type { Scheduler } from '~/models/SchedulerModel';
import {
	useUpdateSchedule,
	useActivateSchedule,
	useDeactivateSchedule,
	useDeleteSchedule,
} from '~/queries/schedulerQueries';
import styles from './SchedulerCard.module.css';
import ScheduleHeader from './ScheduleHeader';
import { ActiveContactListView } from '../../ContactSection/ActiveContactList/ActiveContactListView';
import CapacityCall from '../CapacityCall/CapacityCall';
import {
	SchedulerFormProvider,
	useSchedulerForm,
} from './schedulerFormProvider';
import { modals } from '@mantine/modals';
import { useCampaignsStore } from '~/stores/campaignsStore';

export interface SchedulerCardProps {
	scheduler: Scheduler;
	campaignId: string | number;
	handleReload?: () => void;
}

export const SchedulerCard: React.FC<SchedulerCardProps> = ({
	scheduler,
	campaignId,
	handleReload,
}) => {
	const { setRightComponent } = useCampaignsStore((state) => state);
	const [opened, { open, close }] = useDisclosure(false);

	// Initialize API mutations
	const activateScheduleMutation = useActivateSchedule();
	const deactivateScheduleMutation = useDeactivateSchedule();
	const updateScheduleMutation = useUpdateSchedule();
	const deleteScheduleMutation = useDeleteSchedule();

	useEffect(() => {
		return () => {
			setRightComponent?.(null); // Clear right component on unmount
			close(); // Close the form if it's open
		};
	}, []);

	// Initialize form
	const form = useSchedulerForm({
		initialValues: {
			...scheduler,
			humanEquivalent: Number(scheduler.humanEquivalent || 1),
		},
	});

	// Handle toggle status
	const handleToggleStatus = async () => {
		try {
			if (scheduler.status === 'active') {
				await deactivateScheduleMutation.mutateAsync({
					campaignId,
					scheduleId: scheduler.id,
				});
				handleReload?.();
			} else {
				await activateScheduleMutation.mutateAsync({
					campaignId,
					scheduleId: scheduler.id,
				});
				handleReload?.();
			}
		} catch (error) {
			console.error('Failed to toggle scheduler status:', error);
		}
	};

	// Handle form submission
	const handleSubmit = async (values: Partial<Scheduler>) => {
		try {
			// Validate form data if needed
			const validation = form.validate();
			if (validation.hasErrors) {
				return; // Stop submission if validation fails
			}

			const cleanedDayConfigs =
				values.dayConfigs?.map((dayConfig) => ({
					...dayConfig,
					dayCapacity: undefined,
				})) || [];
			// Execute the mutation with transformed dayConfigs
			await updateScheduleMutation.mutateAsync({
				campaignId,
				scheduleId: scheduler.id,
				scheduleData: {
					...values,
					dayConfigs: cleanedDayConfigs,
				},
			});

			// Call onUpdate callback with updated scheduler
			handleReload?.();

			setRightComponent?.(null); // Clear right component after update

			// Close the form
			close();
		} catch (error) {
			console.error('Failed to update scheduler:', error);
		}
	};

	const handleDelete = () => {
		modals.openConfirmModal({
			title: 'Delete Schedule',
			children: 'Are you sure you want to delete this schedule?',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			onConfirm: async () => {
				try {
					await deleteScheduleMutation.mutateAsync({
						campaignId,
						scheduleId: scheduler.id,
					});
					handleReload?.();
				} catch (error) {
					console.error('Failed to delete scheduler:', error);
				}
			},
		});
	};

	const handleOnEditMode = () => {
		if (opened) {
			close();
		} else {
			// Only set initial values when first opening the form
			if (!form.values.humanEquivalent) {
				form.setFieldValue(
					'humanEquivalent',
					Number(scheduler.humanEquivalent || 1)
				);
			}
			// Only set dayConfigs if it's empty or undefined
			if (!form.values.dayConfigs || form.values.dayConfigs.length === 0) {
				form.setFieldValue('dayConfigs', scheduler.dayConfigs || []);
			}
			open();
		}
	};

	return (
		<Box>
			<LoadingOverlay
				visible={
					updateScheduleMutation.isPending ||
					deleteScheduleMutation.isPending ||
					activateScheduleMutation.isPending ||
					deactivateScheduleMutation.isPending
				}
			/>
			<Stack gap='lg'>
				{/* Schedule Header */}
				<ScheduleHeader
					isOpened={opened}
					schedule={scheduler}
					onChange={handleToggleStatus}
					onEdit={handleOnEditMode}
					onDelete={() => handleDelete()}
				/>
				{opened && (
					<SchedulerFormProvider form={form}>
						<form onSubmit={form.onSubmit(handleSubmit)}>
							<Stack gap='lg'>
								{/* Capacity Call Section */}
								<CapacityCall />

								{/* Active Contact List */}
								<ActiveContactListView
									scheduleContactGroups={scheduler.scheduleContactGroups || []}
									onUpdateComplete={() => {}}
									campaignId={campaignId}
								/>

								{/* Update Schedule Button */}
								<Group justify='flex-end'>
									<Button
										variant='outline'
										leftSection={<IconEdit size={16} />}
										onClick={() => {
											close();
											setRightComponent?.(null);
										}}
									>
										Cancel
									</Button>
									<Button
										type='submit'
										leftSection={<IconDeviceFloppy size={16} />}
										loading={updateScheduleMutation.isPending}
										className={styles.updateButton}
									>
										Update Schedule
									</Button>
								</Group>
							</Stack>
						</form>
					</SchedulerFormProvider>
				)}
			</Stack>
		</Box>
	);
};
