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
import { useTranslation } from 'react-i18next';

interface DoNotCallFormProps {
	entry?: DoNotCallModel;
	onSubmit: (data: DoNotCallCreateRequest | DoNotCallUpdateRequest) => void;
	onCancel: () => void;
}

export default function DoNotCallForm({
	entry,
	onSubmit,
	onCancel,
}: DoNotCallFormProps) {
	const { t } = useTranslation('do-not-call');

	const reasonOptions = [
		{ value: 'CUSTOMER_REQUEST', label: t('reasons.customerRequest') },
		{ value: 'DISPOSITION_OUTCOME', label: t('reasons.dispositionOutcome') },
		{
			value: 'REGULATORY_COMPLIANCE',
			label: t('reasons.regulatoryCompliance'),
		},
		{ value: 'MANUAL_ADMIN_BLOCK', label: t('reasons.manualAdminBlock') },
	];

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
					? t('form.validation.phoneRequired')
					: null,
			reason: (value) => (!value ? t('form.validation.reasonRequired') : null),
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
						label={t('form.labels.phoneNumber')}
						placeholder={t('form.placeholders.phoneNumber')}
						required
						{...form.getInputProps('phoneNumber')}
					/>
				)}
				<Select
					label={t('form.labels.reason')}
					placeholder={t('form.placeholders.reason')}
					data={reasonOptions}
					required
					{...form.getInputProps('reason')}
				/>
				<Textarea
					label={t('form.labels.notes')}
					placeholder={t('form.placeholders.notes')}
					rows={3}
					{...form.getInputProps('notes')}
				/>
				<DateTimePicker
					label={t('form.labels.expiresAt')}
					placeholder={t('form.placeholders.expiresAt')}
					clearable
					{...form.getInputProps('expiresAt')}
				/>
				<Group justify='flex-end' mt='md'>
					<Button variant='subtle' onClick={onCancel} type='button'>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button type='submit'>
						{entry
							? t('form.actions.update')
							: t('actions.create', { ns: 'common' })}
					</Button>
				</Group>
			</Stack>
		</form>
	);
}
