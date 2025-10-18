import React from 'react';
import {
	Button,
	Group,
	SegmentedControl,
	TextInput,
	Textarea,
	Box,
	Text,
	Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateCampaign } from '~/queries/campaignsQueries';
import styles from './AddNewCampaignForm.module.css';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { CampaignStatus } from '~/models/CampaignStatus';

type AddNewCampaignFormProps = {
	onComplete?: () => void;
	onCancel?: () => void;
};

export const AddNewCampaignForm: React.FC<AddNewCampaignFormProps> = ({
	onComplete,
	onCancel,
}) => {
	const createCampaign = useCreateCampaign();

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			name: '',
			description: '',
			type: 'OUTBOUND',
			budget: 500,
		},
		validate: {
			name: (value) => (value.trim().length < 2 ? 'Name is required' : null),
			description: (value) =>
				value.trim().length < 2 ? 'Description is required' : null,
			type: (value) =>
				value !== 'INBOUND' && value !== 'OUTBOUND'
					? 'Type must be one of the following values: INBOUND, OUTBOUND'
					: null,
		},
		validateInputOnChange: true,
	});

	const handleSubmit = (values: typeof form.values) => {
		// Cast type to correct union type and set status to ACTIVE
		createCampaign.mutate(
			{
				...values,
				type: values.type as 'INBOUND' | 'OUTBOUND',
				status: CampaignStatus.PENDING, // New campaigns start as pending
			},
			{
				onSuccess: () => {
					if (onComplete) {
						onComplete();
					}
					form.reset();
				},
				onError: (error) => {
					notifications.show({
						title: 'Error',
						message:
							error instanceof Error
								? error.message
								: 'Failed to create campaign',
						color: 'red',
					});
				},
			}
		);
	};

	return (
		<div>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap={'xs'}>
					<TextInput
						label='Campaign Name'
						description='Give your campaign a descriptive name'
						placeholder='Enter campaign name'
						withAsterisk
						className={styles.field}
						key={form.key('name')}
						{...form.getInputProps('name')}
					/>
					<Textarea
						label='Description'
						description='Briefly describe the purpose of this campaign'
						placeholder='Describe your campaign'
						withAsterisk
						className={styles.field}
						key={form.key('description')}
						{...form.getInputProps('description')}
						minRows={3}
						rows={3}
					/>
					<Box className={styles.field}>
						<Text size='sm' fw={500} mb='xs'>
							Campaign Type{' '}
							<span style={{ color: 'var(--mantine-color-red-6)' }}>*</span>
						</Text>
						<SegmentedControl
							data={[
								{ value: 'INBOUND', label: 'Inbound' },
								{ value: 'OUTBOUND', label: 'Outbound' },
							]}
							{...form.getInputProps('type')}
							fullWidth
						/>
					</Box>
					{createCampaign.isError && (
						<Text className={styles.error}>
							{createCampaign.error instanceof Error
								? createCampaign.error.message
								: 'Error creating campaign'}
						</Text>
					)}
					<Group justify='flex-end' mt='md'>
						<Button variant='default' onClick={() => onCancel?.()} size='sm'>
							Cancel
						</Button>
						<Button
							leftSection={<IconDeviceFloppy />}
							type='submit'
							loading={createCampaign.isPending}
							disabled={!form.isValid()}
							size='sm'
						>
							Create Campaign
						</Button>
					</Group>
				</Stack>
			</form>
		</div>
	);
};
