import { useEffect, useState } from 'react';
import {
	Button,
	Group,
	TextInput,
	Stack,
	Select,
	PasswordInput,
	LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import { PhoneNumber } from '~/models/PhoneNumber';
import {
	useCreateSipTrunkPhoneNumber,
	useCreateTwilioPhoneNumber,
	useUpdateSipTrunkPhoneNumber,
	useUpdateTwilioPhoneNumber,
} from '~/queries/phoneNumberQueries';

interface PhoneNumberFormProps {
	initialData?: PhoneNumber | null;
	onClose: () => void;
	onSuccess: () => void;
}

export function PhoneNumberForm({
	initialData,
	onClose,
	onSuccess,
}: PhoneNumberFormProps) {
	const { t } = useTranslation('phone-numbers');
	const { currentClientId } = useImpersonationState();
	const [provider, setProvider] = useState<'twilio' | 'sip_trunk'>('sip_trunk');
	const isEdit = !!initialData;

	const createTwilio = useCreateTwilioPhoneNumber();
	const createSip = useCreateSipTrunkPhoneNumber();
	const updateTwilio = useUpdateTwilioPhoneNumber();
	const updateSip = useUpdateSipTrunkPhoneNumber();

	const isLoading =
		createTwilio.isPending ||
		createSip.isPending ||
		updateTwilio.isPending ||
		updateSip.isPending;

	const form = useForm({
		initialValues: {
			phoneNumber: '',
			label: '',
			// Twilio
			sid: '',
			token: '',
			type: 'OUTBOUND',
			// SIP
			terminationUri: '',
			address: '',
			transport: 'auto',
			mediaEncryption: 'disabled',
			inboundMediaEncryption: 'disabled',
			username: '',
			password: '',
		},
		validate: {
			phoneNumber: (value: string) => {
				if (!value) return t('form.fields.phoneNumber.required');
				// Dominican Republic numbers: country code +1 and area codes 809, 829, 849 followed by 7 digits
				const phoneRegex = /^\+1(809|829|849)\d{7}$/;
				if (!phoneRegex.test(value))
					return t('form.fields.phoneNumber.invalid');
				return null;
			},
			label: (value: string) =>
				value ? null : t('form.fields.label.required'),
			// Conditional validation based on provider
			sid: (value: string) =>
				provider === 'twilio' && !value ? t('form.fields.sid.required') : null,
			token: (value: string) =>
				provider === 'twilio' && !value
					? t('form.fields.token.required')
					: null,
			terminationUri: (value: string) =>
				provider === 'sip_trunk' && !value
					? t('form.fields.terminationUri.required')
					: null,
			// SIP fields are now optional except phoneNumber, label and terminationUri
		},
	});

	useEffect(() => {
		if (initialData) {
			setProvider(initialData.provider as 'twilio' | 'sip_trunk');
			form.setValues({
				phoneNumber: initialData.phoneNumber,
				label: initialData.label,
				sid: initialData.sid || '',
				token: initialData.token || '',
				type: initialData.type || 'OUTBOUND',
				terminationUri: initialData.terminationUri || '',
				address: initialData.address || '',
				transport: initialData.transport || 'auto',
				mediaEncryption: initialData.mediaEncryption || 'disabled',
				inboundMediaEncryption:
					initialData.inboundMediaEncryption || 'disabled',
				username: initialData.credentials?.username || '',
				password: initialData.credentials?.password || '',
			});
		}
	}, [initialData]);

	const handleSubmit = (values: typeof form.values) => {
		if (!currentClientId) {
			notifications.show({
				title: 'Error',
				message: t('form.notifications.clientIdMissing'),
				color: 'red',
			});
			return;
		}

		const commonParams = {
			phoneNumber: values.phoneNumber,
			label: values.label,
			clientId: currentClientId,
			agentId: undefined, // Optional
		};

		if (provider === 'twilio') {
			const params = {
				...commonParams,
				sid: values.sid,
				token: values.token,
				type: values.type as 'INBOUND' | 'OUTBOUND' | 'HYBRID',
				provider: 'twilio' as const,
			};

			if (isEdit && initialData) {
				updateTwilio.mutate(
					{ id: initialData.id, params },
					{ onSuccess: handleSuccess }
				);
			} else {
				createTwilio.mutate(params, { onSuccess: handleSuccess });
			}
		} else {
			// Credentials object
			let credentials = null;
			if (values.username || values.password) {
				credentials = {
					username: values.username || undefined,
					password: values.password || undefined,
				};
			}

			const params = {
				...commonParams,
				terminationUri: values.terminationUri,
				type: values.type as 'INBOUND' | 'OUTBOUND' | 'HYBRID',
				address: values.address || undefined,
				transport: values.transport as any,
				mediaEncryption: values.mediaEncryption as any,
				inboundMediaEncryption: values.inboundMediaEncryption as any,
				headers: null, // As requested
				credentials,
			};

			if (isEdit && initialData) {
				updateSip.mutate(
					{ id: initialData.id, params },
					{ onSuccess: handleSuccess }
				);
			} else {
				createSip.mutate(params, { onSuccess: handleSuccess });
			}
		}
	};

	const handleSuccess = () => {
		notifications.show({
			title: 'Success',
			message: isEdit
				? t('form.notifications.updateSuccess')
				: t('form.notifications.createSuccess'),
			color: 'green',
		});
		onSuccess();
	};

	return (
		<Stack pos='relative'>
			<LoadingOverlay visible={isLoading} />

			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='md'>
					<TextInput
						label={t('form.fields.phoneNumber.label')}
						placeholder={t('form.fields.phoneNumber.placeholder')}
						required
						key={form.key('phoneNumber')}
						{...form.getInputProps('phoneNumber')}
					/>
					<TextInput
						label={t('form.fields.label.label')}
						placeholder={t('form.fields.label.placeholder')}
						required
						key={form.key('label')}
						{...form.getInputProps('label')}
					/>

					{provider === 'twilio' && (
						<>
							<TextInput
								label={t('form.fields.sid.label')}
								required
								key={form.key('sid')}
								{...form.getInputProps('sid')}
							/>
							<PasswordInput
								label={t('form.fields.token.label')}
								required
								key={form.key('token')}
								{...form.getInputProps('token')}
							/>
							<Select
								label={t('form.fields.type')}
								data={['INBOUND', 'OUTBOUND', 'HYBRID']}
								key={form.key('type')}
								{...form.getInputProps('type')}
							/>
						</>
					)}

					{provider === 'sip_trunk' && (
						<>
							<TextInput
								label={t('form.fields.terminationUri.label')}
								required
								key={form.key('terminationUri')}
								{...form.getInputProps('terminationUri')}
							/>
							<TextInput
								label={t('form.fields.address.label')}
								key={form.key('address')}
								{...form.getInputProps('address')}
							/>
							<Select
								label={t('form.fields.type')}
								data={['INBOUND', 'OUTBOUND', 'HYBRID']}
								required
								key={form.key('type')}
								{...form.getInputProps('type')}
							/>
							<Select
								label={t('form.fields.transport')}
								data={['auto', 'udp', 'tcp', 'tls']}
								key={form.key('transport')}
								{...form.getInputProps('transport')}
							/>
							{/* <Select
								label={t('form.fields.mediaEncryption')}
								data={['disabled', 'allowed', 'required']}
								key={form.key('mediaEncryption')}
								{...form.getInputProps('mediaEncryption')}
							/>
							<Select
								label={t('form.fields.inboundMediaEncryption')}
								data={['disabled', 'allowed', 'required']}
								key={form.key('inboundMediaEncryption')}
								{...form.getInputProps('inboundMediaEncryption')}
							/> */}
						</>
					)}
					<Group justify='flex-end' mt='md'>
						<Button variant='default' onClick={onClose}>
							{t('form.buttons.cancel')}
						</Button>
						<Button type='submit' loading={isLoading}>
							{isEdit ? t('form.buttons.update') : t('form.buttons.create')}
						</Button>
					</Group>
				</Stack>
			</form>
		</Stack>
	);
}
