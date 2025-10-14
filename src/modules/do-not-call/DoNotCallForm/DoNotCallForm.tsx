import {
	Button,
	Group,
	Stack,
	TextInput,
	Select,
	Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateTimePicker } from '@mantine/dates';
import type {
	DoNotCallModel,
	DoNotCallCreateRequest,
	DoNotCallUpdateRequest,
} from '~/models/DoNotCallModel';

interface DoNotCallFormProps {
	entry?: DoNotCallModel;
	onSubmit: (data: DoNotCallCreateRequest | DoNotCallUpdateRequest) => void;
	onCancel: () => void;
}

const reasonOptions = [
	{ value: 'CUSTOMER_REQUEST', label: 'Customer Request' },
	{ value: 'DISPOSITION_OUTCOME', label: 'Outcome' },
	{ value: 'REGULATORY_COMPLIANCE', label: 'Regulatory Compliance' },
	{ value: 'MANUAL_ADMIN_BLOCK', label: 'Manual Admin Block' },
];

export default function DoNotCallForm({
	entry,
	onSubmit,
	onCancel,
}: DoNotCallFormProps) {
	const form = useForm({
		initialValues: {
			phoneNumber: entry?.phoneNumber || '',
			reason: entry?.reason || 'CUSTOMER_REQUEST',
			notes: entry?.notes || '',
			expiresAt: entry?.expiresAt ? new Date(entry.expiresAt) : null,
		},
		validate: {
			phoneNumber: (value) =>
				!entry && (!value || value.trim() === '')
					? 'Phone number is required'
					: null,
			reason: (value) => (!value ? 'Reason is required' : null),
		},
	});

	const handleSubmit = form.onSubmit((values) => {
		const data: DoNotCallCreateRequest | DoNotCallUpdateRequest = {
			...(entry ? {} : { phoneNumber: values.phoneNumber }),
			reason: values.reason as any,
			notes: values.notes || undefined,
			expiresAt: values.expiresAt
				? values.expiresAt instanceof Date
					? values.expiresAt.toISOString()
					: new Date(values.expiresAt).toISOString()
				: undefined,
		};
		onSubmit(data);
	});

	return (
		<form onSubmit={handleSubmit}>
			<Stack gap='md'>
				{!entry && (
					<TextInput
						label='Phone Number'
						placeholder='+1234567890'
						required
						{...form.getInputProps('phoneNumber')}
					/>
				)}
				<Select
					label='Reason'
					placeholder='Select reason'
					data={reasonOptions}
					required
					{...form.getInputProps('reason')}
				/>{' '}
				<Textarea
					label='Notes'
					placeholder='Additional information...'
					rows={3}
					{...form.getInputProps('notes')}
				/>
				<DateTimePicker
					label='Expires At'
					placeholder='Select expiration date (optional)'
					clearable
					{...form.getInputProps('expiresAt')}
				/>
				<Group justify='flex-end' mt='md'>
					<Button variant='subtle' onClick={onCancel} type='button'>
						Cancel
					</Button>
					<Button type='submit'>{entry ? 'Update' : 'Create'}</Button>
				</Group>
			</Stack>
		</form>
	);
}
