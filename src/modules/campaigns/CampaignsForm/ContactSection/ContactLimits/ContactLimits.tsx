import { useState, useEffect } from 'react';
import { Stack, Box, LoadingOverlay, Group, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type {
	ContactFileSummary,
	MappedResult,
} from '~/models/ContactFileSummary';
import { useProcessContactGroupFile } from '~/queries/contactGroupFilesQueries';
import { ContactListInfo } from './ContactListInfo';
import type SchedulerContactGroupModel from '~/models/SchedulerContactGroupModel';
import type { ContactLimitsFormData } from './types';
import { openScheduleModal } from './ScheduleModal';
import {
	useCampaignActiveScheduler,
	useCampaignSchedules,
	useActivateSchedule,
} from '~/queries/schedulerQueries';
import { useUpdateSchedulerContactGroup } from '~/queries/schedulerContactGroupQueries';
import SchedulerPreview from './SchedulerPreview';
import ColumnMappingCard from './ColumnMappingCard/ColumnMappingCard';
import CallLimitCard from './CallLimitCard';
import { transformFieldMapping } from '~/utils/fieldMappingTransformer';

type ContactLimitsProps = {
	fileSummary?: ContactFileSummary;
	schedulerContactGroup: Partial<SchedulerContactGroupModel>;
	campaignId: string | number;
	onComplete?: () => void;
};

export const ContactLimits = ({
	fileSummary,
	schedulerContactGroup,
	campaignId,
	onComplete,
}: ContactLimitsProps) => {
	const processFileMutation = useProcessContactGroupFile();
	const updateSchedulerContactGroupMutation = useUpdateSchedulerContactGroup();
	const [data, setData] = useState<Partial<ContactLimitsFormData>>({
		maxCallsPerContact: schedulerContactGroup.maxCallsPerContact || 1,
		maxCallsPerList: schedulerContactGroup.maxCallsPerList || 1,
		expirationDate: schedulerContactGroup.expirationDate || null,
		scheduleId: schedulerContactGroup.scheduleId,
		schedule: '',
		name: schedulerContactGroup.contactGroup?.name || '',
		description: schedulerContactGroup.contactGroup?.description || '',
		columnMappings: {} as MappedResult,
		status: schedulerContactGroup.status as
			| 'active'
			| 'inactive'
			| 'paused'
			| undefined,
	});

	// Track the selected schema ID for dynamic columns
	const [selectedSchemaId, setSelectedSchemaId] = useState<number>(0);

	// Fetch active scheduler and all schedules for the campaign
	const { data: activeScheduler } = useCampaignActiveScheduler({
		campaignId,
		enabled: !!campaignId,
	});

	const { data: schedules = [] } = useCampaignSchedules(campaignId);

	const activateScheduleMutation = useActivateSchedule();

	// Handle form field changes
	const handleChange = <K extends keyof ContactLimitsFormData>(
		field: K,
		value: ContactLimitsFormData[K]
	) => {
		setData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Handle schedule selection from modal
	const handleScheduleSelect = (scheduleId: string) => {
		// Find the selected schedule to get its name
		const selectedSchedule = schedules.find((s) => s.id === Number(scheduleId));

		handleChange('scheduleId', Number(scheduleId));
		if (selectedSchedule) {
			handleChange('schedule', selectedSchedule.name || '');
		}
	};

	// Handle opening schedule modal or editing current schedule
	const handleScheduleAction = () => {
		openScheduleModal({
			schedules,
			selectedScheduleId: activeScheduler?.id?.toString(),
			onScheduleSelect: handleScheduleSelect,
			onAddSchedule: () => {
				// TODO: Implement add schedule functionality
				console.log('Add schedule clicked');
			},
		});
	};
	// Update schedule name when activeScheduler changes
	useEffect(() => {
		if (activeScheduler && !data.schedule) {
			handleChange('schedule', activeScheduler.name || '');
		}
	}, [activeScheduler]);

	// Validate form data
	const validateForm = (): boolean => {
		// Validate max calls
		if ((data.maxCallsPerContact || 0) <= 0) {
			notifications.show({
				title: 'Invalid Input',
				message: 'Max calls per contact must be greater than 0.',
				color: 'red',
			});
			return false;
		}

		if ((data.maxCallsPerList || 0) <= 0) {
			notifications.show({
				title: 'Invalid Input',
				message: 'Max daily calls per contact must be greater than 0.',
				color: 'red',
			});
			return false;
		}

		return true;
	};
	const handleSubmit = async () => {
		// Validate form before submission
		if (!validateForm()) {
			return;
		}

		try {
			if (!schedulerContactGroup.id && fileSummary?.contactGroupFileId) {
				// Get the current date and add 30 days for default expiration
				const defaultExpirationDate = new Date();
				defaultExpirationDate.setDate(defaultExpirationDate.getDate() + 30);

				// Transform field mapping to separate dynamic columns
				const { fieldMapping } = transformFieldMapping(
					data.columnMappings || {}
				);

				await processFileMutation.mutateAsync({
					contactGroupFileId: fileSummary.contactGroupFileId,
					fieldMapping,
					groupName:
						data.name || `Contact List ${new Date().toLocaleDateString()}`,
					groupDescription: data.description || '',
					groupExpiration:
						data.expirationDate || defaultExpirationDate.toISOString(),
					groupMaxCallPerContact: data.maxCallsPerContact || 1,
					groupMaxCallPerGroup: data.maxCallsPerList || 1,
					schedulerId: data.scheduleId || activeScheduler?.id || 0,
					schemaId: selectedSchemaId,
				});

				notifications.show({
					title: 'Success',
					message: 'Contact list saved successfully.',
					color: 'green',
				});
			} else if (schedulerContactGroup.id) {
				// Update existing scheduler contact group
				await updateSchedulerContactGroupMutation.mutateAsync({
					id: schedulerContactGroup.id,
					payload: {
						status: data.status,
						// Ensure expirationDate is always a string
						expirationDate: data.expirationDate ?? undefined,
						maxCallsPerContact: data.maxCallsPerContact ?? undefined,
						maxCallsPerList: data.maxCallsPerList ?? undefined,
						name: data.name ?? undefined,
						description: data.description ?? undefined,
					},
				});

				notifications.show({
					title: 'Success',
					message: 'Contact list updated successfully.',
					color: 'green',
				});
			}
			onComplete?.();
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				'Failed to save contact list. Please try again.';
			notifications.show({
				title: 'Error',
				message: errorMessage,
				color: 'red',
			});
		}
	};

	return (
		<Box pos='relative'>
			<LoadingOverlay
				visible={
					processFileMutation?.isPending ||
					activateScheduleMutation.isPending ||
					updateSchedulerContactGroupMutation.isPending
				}
				zIndex={1000}
				overlayProps={{ radius: 'sm', blur: 2 }}
				loaderProps={{ type: 'bars' }}
			/>
			<Stack gap='md'>
				{/* Contact list information */}
				<ContactListInfo
					listName={data?.name}
					placeholder='Enter contact list name'
					expirationDate={data?.expirationDate || null}
					onExpirationChange={(expirationDate) => {
						handleChange('expirationDate', expirationDate);
					}}
					onNameChange={(name) => {
						handleChange('name', name);
					}}
				/>
				<Group grow gap={'xs'}>
					<CallLimitCard
						title='Max calls'
						subtitle='Per contact'
						value={data?.maxCallsPerContact || 0}
						onChange={(value) => handleChange('maxCallsPerContact', value)}
					/>
					<CallLimitCard
						title='Max daily calls'
						subtitle='Per contact'
						value={data?.maxCallsPerList || 0}
						onChange={(value) => handleChange('maxCallsPerList', value)}
					/>
				</Group>
				<SchedulerPreview
					scheduler={activeScheduler || undefined}
					onClick={handleScheduleAction}
				/>
				{/*Column Mapper*/}
				{fileSummary && !schedulerContactGroup?.id && (
					<ColumnMappingCard
						headers={fileSummary.headers || []}
						onMappingChange={(columnMappings) => {
							handleChange('columnMappings', columnMappings);
						}}
						columnMappings={data?.columnMappings || {}}
						error={processFileMutation.error?.message}
						onSchemaSelected={setSelectedSchemaId}
					/>
				)}
				<Group justify='flex-end' mt='md'>
					<Button
						variant='outline'
						onClick={() => onComplete?.()}
						disabled={
							processFileMutation.isPending ||
							updateSchedulerContactGroupMutation.isPending
						}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						loading={
							processFileMutation.isPending ||
							updateSchedulerContactGroupMutation.isPending
						}
						disabled={
							processFileMutation.isPending ||
							updateSchedulerContactGroupMutation.isPending ||
							(!schedulerContactGroup.id && !activeScheduler)
						}
					>
						{schedulerContactGroup.id
							? 'Update contact list'
							: 'Save contact list'}
					</Button>
				</Group>
			</Stack>
		</Box>
	);
};

export default ContactLimits;
