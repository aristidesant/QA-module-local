import {
	Button,
	Group,
	Stack,
	TextInput,
	Textarea,
	Slider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import React from 'react';
import { useCreatePredefinedSchedule } from '~/queries/schedulerQueries';

interface AddShedulerFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
	campaignId?: string | number | null;
}

interface PredefinedScheduleFormValues {
	name: string;
	description: string;
	humanEquivalent: number | '';
}

const AddShedulerForm: React.FC<AddShedulerFormProps> = ({
	onSuccess,
	onCancel,
	campaignId,
}) => {
	const createPredefinedScheduleMutation = useCreatePredefinedSchedule();

	const form = useForm<PredefinedScheduleFormValues>({
		initialValues: {
			name: '',
			description: '',
			humanEquivalent: 0,
		},
		validate: {
			name: (value) => (value.trim() ? null : 'Name is required'),
			humanEquivalent: (value) => {
				if (value === undefined || value === null) {
					return 'Human Equivalent is required';
				}
				if (typeof value !== 'number' || isNaN(value)) {
					return 'Human Equivalent must be a number';
				}
				if (value < 10) {
					return 'Human Equivalent must not be less than 10';
				}
				if (value > 500) {
					return 'Human Equivalent must not be greater than 500';
				}
				if (value % 10 !== 0) {
					return 'Human Equivalent must be in increments of 10';
				}
				return null;
			},
		},
	});

	const handleSubmit = async (values: PredefinedScheduleFormValues) => {
		if (!campaignId) {
			notifications.show({
				title: 'Error',
				message: 'Campaign ID is required',
				color: 'red',
			});
			return;
		}

		try {
			await createPredefinedScheduleMutation.mutateAsync({
				campaignId,
				predefinedScheduleData: {
					...values,
					humanEquivalent: Number(values.humanEquivalent),
					campaignId: Number(campaignId),
				},
			});

			notifications.show({
				title: 'Success',
				message: 'Predefined schedule created successfully',
				color: 'green',
				icon: <IconCheck size={16} />,
			});

			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			console.error('Error creating predefined schedule:', error);
			notifications.show({
				title: 'Error',
				message: 'Failed to create predefined schedule',
				color: 'red',
			});
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<Stack gap='md'>
				<TextInput
					label='Schedule Name'
					placeholder='e.g. Standard Business Hours'
					required
					{...form.getInputProps('name')}
				/>
				<Textarea
					label='Description'
					placeholder='e.g. Monday-Friday 8:00 AM to 5:00 PM'
					minRows={6}
					rows={6}
					maxLength={250}
					{...form.getInputProps('description')}
				/>
				<Stack gap={4}>
					<label htmlFor='humanEquivalent'>Human Equivalent</label>
					<Slider
						id='humanEquivalent'
						min={0}
						max={500}
						step={1}
						value={form.values.humanEquivalent as number}
						onChange={(value) => form.setFieldValue('humanEquivalent', value)}
						marks={Array.from({ length: 11 }, (_, i) => ({
							value: i * 50,
							label: String(i * 50),
						}))}
					/>
					{form.errors.humanEquivalent && (
						<div style={{ color: 'red', fontSize: 12 }}>
							{form.errors.humanEquivalent}
						</div>
					)}
				</Stack>
				<Group justify='flex-end' mt='md'>
					{onCancel && (
						<Button variant='outline' onClick={onCancel}>
							Cancel
						</Button>
					)}
					<Button
						type='submit'
						loading={createPredefinedScheduleMutation.isPending}
					>
						Create Schedule
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default AddShedulerForm;
