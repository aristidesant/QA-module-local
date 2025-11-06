import { useMemo, useState } from 'react';
import {
	Stack,
	Box,
	LoadingOverlay,
	Group,
	Button,
	Text,
	Slider,
	Alert,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type {
	ContactFileSummary,
	MappedResult,
} from '~/models/ContactFileSummary';
import { useProcessContactGroupFile } from '~/queries/contactGroupFilesQueries';
import { ContactListInfo } from './ContactListInfo';
import type ContactGroup from '~/models/ContactGroup';
import ColumnMappingCard from './ColumnMappingCard/ColumnMappingCard';
import { transformFieldMapping } from '~/utils/fieldMappingTransformer';
import { useUpdateContactGroup } from '~/queries/contactGroupQueries';
import { useCampaignActiveSchedule } from '~/queries/schedulerQueries';
import { useGetContactGroups } from '~/queries/contactGroupQueries';
import {
	calculateHumanEquivalentValues,
	type HumanEquivalentCalculations,
} from './humanEquivalentCalculations';

type ContactLimitsProps = {
	fileSummary?: ContactFileSummary;
	contactGroup: Partial<ContactGroup>;
	onComplete?: () => void;
	objectiveId?: number;
	campaignId?: string | number;
};

export const ContactLimits = ({
	fileSummary,
	contactGroup,
	onComplete,
	objectiveId,
	campaignId,
}: ContactLimitsProps) => {
	const processFileMutation = useProcessContactGroupFile();
	const updateContactGroupMutation = useUpdateContactGroup();

	const { data: activeSchedule } = useCampaignActiveSchedule(campaignId);
	const { data: contactGroups } = useGetContactGroups({
		isActive: true,
		campaignId,
	});
	const [data, setData] = useState<{
		name: string;
		description: string;
		columnMappings: MappedResult;
	}>({
		name: contactGroup.name || '',
		description: contactGroup.description || '',
		columnMappings: {} as MappedResult,
	});

	// Track the selected schema ID for dynamic columns
	const [selectedSchemaId, setSelectedSchemaId] = useState<number>(0);
	const [humanEquivalent, setHumanEquivalent] = useState<number>(
		contactGroup.humanEquivalent || 1
	);

	// Handle form field changes
	const handleChange = <K extends keyof typeof data>(
		field: K,
		value: (typeof data)[K]
	) => {
		setData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Validate form data
	const validateForm = (): boolean => {
		if (!data.name?.trim()) {
			notifications.show({
				title: 'Invalid Input',
				message: 'Contact list name is required.',
				color: 'red',
			});
			return false;
		}

		// Validate human equivalent doesn't exceed available capacity
		if (humanEquivalent > sliderMax) {
			notifications.show({
				title: 'Invalid Input',
				message: 'Human equivalent exceeds available capacity.',
				color: 'red',
			});
			return false;
		}

		// Prevent creating when scheduler is full
		if (isCreatingAndFull) {
			notifications.show({
				title: 'Scheduler Full',
				message:
					'Cannot create contact group. Please increase the scheduler capacity first.',
				color: 'red',
			});
			return false;
		}

		return true;
	};

	const humanEquivalentCalculations =
		useMemo((): HumanEquivalentCalculations => {
			return calculateHumanEquivalentValues(
				contactGroups?.data || [],
				activeSchedule,
				contactGroup.id
			);
		}, [contactGroups?.data, activeSchedule, contactGroup.id]);

	const { maxAvailableHumanEquivalent, isCreatingAndFull, sliderMax } =
		humanEquivalentCalculations;
	const handleSubmit = async () => {
		// Validate form before submission
		if (!validateForm()) {
			return;
		}

		try {
			if (!contactGroup.id && fileSummary?.contactGroupFileId) {
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
					groupExpiration: new Date(
						Date.now() + 30 * 24 * 60 * 60 * 1000
					).toISOString(), // 30 days from now
					groupMaxCallPerContact: 1,
					groupMaxCallPerGroup: 1,
					humanEquivalent: humanEquivalent,
					schedulerId: activeSchedule?.id || 0,
					schemaId: selectedSchemaId,
				});

				notifications.show({
					title: 'Success',
					message: 'Contact list saved successfully.',
					color: 'green',
				});
			} else if (contactGroup.id) {
				// Update existing contact group
				await updateContactGroupMutation.mutateAsync({
					id: contactGroup.id,
					updateData: {
						name: data.name,
						description: data.description,
						humanEquivalent,
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
					processFileMutation?.isPending || updateContactGroupMutation.isPending
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
					onNameChange={(name) => {
						handleChange('name', name);
					}}
				/>
				{/* Human Equivalent Slider */}
				{isCreatingAndFull && (
					<Alert
						icon={<IconInfoCircle size={16} />}
						title='Scheduler Capacity Full'
						color='yellow'
					>
						The active schedule has no available capacity. Please increase the
						Human Equivalent capacity in the scheduler configuration to add new
						contact groups.
					</Alert>
				)}
				<Box>
					<Group justify='space-between' mb='xs'>
						<Text size='sm' fw={500}>
							Human Equivalent: {humanEquivalent}
						</Text>
						<Text size='xs' c='dimmed'>
							Available: {maxAvailableHumanEquivalent}
						</Text>
					</Group>
					<Slider
						value={humanEquivalent}
						onChange={setHumanEquivalent}
						min={1}
						max={sliderMax}
						step={1}
						label={(value) => `${value}`}
						size='md'
						disabled={isCreatingAndFull}
					/>
				</Box>
				{/* Active Schedule Display */}
				{activeSchedule && (
					<Text size='sm' c='dimmed'>
						Active Schedule: {activeSchedule.name} (
						{maxAvailableHumanEquivalent}/{activeSchedule.humanEquivalent || 0}{' '}
						available)
					</Text>
				)}
				{/*Column Mapper*/}
				{fileSummary && !contactGroup?.id && (
					<ColumnMappingCard
						headers={fileSummary.headers || []}
						onMappingChange={(columnMappings) => {
							handleChange('columnMappings', columnMappings);
						}}
						columnMappings={data?.columnMappings || {}}
						error={processFileMutation.error?.message}
						onSchemaSelected={setSelectedSchemaId}
						objectiveId={objectiveId}
						selectedSchemaId={selectedSchemaId}
					/>
				)}
				<Group justify='flex-end' mt='md'>
					<Button
						variant='outline'
						onClick={() => onComplete?.()}
						disabled={
							processFileMutation.isPending ||
							updateContactGroupMutation.isPending
						}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						loading={
							processFileMutation.isPending ||
							updateContactGroupMutation.isPending
						}
						disabled={
							processFileMutation.isPending ||
							updateContactGroupMutation.isPending ||
							isCreatingAndFull
						}
					>
						{contactGroup.id ? 'Update contact list' : 'Save contact list'}
					</Button>
				</Group>
			</Stack>
		</Box>
	);
};

export default ContactLimits;
