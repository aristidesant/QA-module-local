import { useEffect, useState } from 'react';
import {
	Button,
	Group,
	TextInput,
	Stack,
	Select,
	PasswordInput,
	LoadingOverlay,
	SegmentedControl,
	SimpleGrid,
	Text,
	Switch,
	Collapse,
	TagsInput,
	Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import { PhoneNumber } from '~/models/PhoneNumber';
import SectionCard from '~/components/SectionCard';
import {
	useCreateSipTrunkPhoneNumber,
	useCreateTwilioPhoneNumber,
	useUpdateSipTrunkPhoneNumber,
	useUpdateTwilioPhoneNumber,
} from '~/queries/phoneNumberQueries';
import styles from './PhoneNumberForm.module.css';

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
	const [regionConfigOpen, setRegionConfigOpen] = useState(false);
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
			supportsInbound: true,
			supportsOutbound: true,
			// Twilio
			sid: '',
			token: '',
			type: 'OUTBOUND',
			regionId: '',
			regionToken: '',
			edgeLocation: '',
			// SIP
			inboundEnabled: false,
			outboundEnabled: true,
			inboundAllowedAddresses: [] as string[],
			inboundAllowedNumbers: [] as string[],
			inboundMediaEncryption: 'disabled',
			inboundUsername: '',
			inboundPassword: '',
			outboundAddress: '',
			outboundTransport: 'auto',
			outboundMediaEncryption: 'disabled',
			outboundHeaders: '',
			outboundUsername: '',
			outboundPassword: '',
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
			regionId: (value: string, values) => {
				const hasAny =
					values.regionToken || values.edgeLocation || values.regionId;
				if (!hasAny) return null;
				return value ? null : t('form.fields.regionConfig.required');
			},
			regionToken: (value: string, values) => {
				const hasAny =
					values.regionToken || values.edgeLocation || values.regionId;
				if (!hasAny) return null;
				return value ? null : t('form.fields.regionConfig.required');
			},
			edgeLocation: (value: string, values) => {
				const hasAny =
					values.regionToken || values.edgeLocation || values.regionId;
				if (!hasAny) return null;
				return value ? null : t('form.fields.regionConfig.required');
			},
			outboundHeaders: (value: string) => {
				if (!value) return null;
				try {
					const parsed = JSON.parse(value);
					const isObject =
						parsed && typeof parsed === 'object' && !Array.isArray(parsed);
					return isObject ? null : t('form.fields.outboundHeaders.invalid');
				} catch {
					return t('form.fields.outboundHeaders.invalid');
				}
			},
			// SIP fields are now optional except phoneNumber and label
		},
	});

	useEffect(() => {
		if (initialData) {
			setProvider(initialData.provider as 'twilio' | 'sip_trunk');
			setRegionConfigOpen(!!initialData.regionConfig);
			form.setValues({
				phoneNumber: initialData.phoneNumber,
				label: initialData.label,
				supportsInbound: initialData.supportsInbound ?? true,
				supportsOutbound: initialData.supportsOutbound ?? true,
				sid: initialData.sid || '',
				token: initialData.token || '',
				type: initialData.type || 'OUTBOUND',
				regionId: initialData.regionConfig?.regionId || '',
				regionToken: initialData.regionConfig?.token || '',
				edgeLocation: initialData.regionConfig?.edgeLocation || '',
				inboundEnabled: !!initialData.inboundTrunkConfig,
				outboundEnabled: !!initialData.outboundTrunkConfig,
				inboundAllowedAddresses:
					initialData.inboundTrunkConfig?.allowedAddresses || [],
				inboundAllowedNumbers:
					initialData.inboundTrunkConfig?.allowedNumbers || [],
				inboundMediaEncryption:
					initialData.inboundTrunkConfig?.mediaEncryption || 'disabled',
				inboundUsername:
					initialData.inboundTrunkConfig?.credentials?.username || '',
				inboundPassword:
					initialData.inboundTrunkConfig?.credentials?.password || '',
				outboundAddress: initialData.outboundTrunkConfig?.address || '',
				outboundTransport: initialData.outboundTrunkConfig?.transport || 'auto',
				outboundMediaEncryption:
					initialData.outboundTrunkConfig?.mediaEncryption || 'disabled',
				outboundHeaders: initialData.outboundTrunkConfig?.headers
					? JSON.stringify(initialData.outboundTrunkConfig.headers)
					: '',
				outboundUsername:
					initialData.outboundTrunkConfig?.credentials?.username || '',
				outboundPassword:
					initialData.outboundTrunkConfig?.credentials?.password || '',
			});
		}
	}, [initialData]);

	useEffect(() => {
		form.clearErrors();
	}, [provider]);

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
			const hasRegionConfig =
				values.regionId && values.regionToken && values.edgeLocation;
			const params = {
				...commonParams,
				sid: values.sid,
				token: values.token,
				supportsInbound: values.supportsInbound,
				supportsOutbound: values.supportsOutbound,
				regionConfig: hasRegionConfig
					? {
							regionId: values.regionId as 'us1' | 'ie1' | 'au1',
							token: values.regionToken,
							edgeLocation: values.edgeLocation as
								| 'ashburn'
								| 'dublin'
								| 'frankfurt'
								| 'sao-paulo'
								| 'singapore'
								| 'sydney'
								| 'tokyo'
								| 'umatilla'
								| 'roaming',
						}
					: undefined,
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
			let outboundHeaders: Record<string, string> | null = null;
			if (values.outboundHeaders) {
				try {
					outboundHeaders = JSON.parse(values.outboundHeaders);
				} catch {
					form.setFieldError(
						'outboundHeaders',
						t('form.fields.outboundHeaders.invalid')
					);
					return;
				}
			}

			const inboundCredentials =
				values.inboundUsername || values.inboundPassword
					? {
							username: values.inboundUsername || undefined,
							password: values.inboundPassword || undefined,
						}
					: null;
			const outboundCredentials =
				values.outboundUsername || values.outboundPassword
					? {
							username: values.outboundUsername || undefined,
							password: values.outboundPassword || undefined,
						}
					: null;

			const inboundTrunkConfig = values.inboundEnabled
				? {
						allowedAddresses: values.inboundAllowedAddresses.length
							? values.inboundAllowedAddresses
							: undefined,
						allowedNumbers: values.inboundAllowedNumbers.length
							? values.inboundAllowedNumbers
							: undefined,
						mediaEncryption: values.inboundMediaEncryption as any,
						credentials: inboundCredentials,
					}
				: null;

			const outboundTrunkConfig = values.outboundEnabled
				? {
						address: values.outboundAddress || undefined,
						transport: values.outboundTransport as any,
						mediaEncryption: values.outboundMediaEncryption as any,
						headers: outboundHeaders,
						credentials: outboundCredentials,
					}
				: null;

			const params = {
				...commonParams,
				terminationUri: undefined,
				supportsInbound: values.supportsInbound,
				supportsOutbound: values.supportsOutbound,
				type: values.type as 'INBOUND' | 'OUTBOUND' | 'HYBRID',
				address: undefined,
				transport: undefined,
				mediaEncryption: undefined,
				headers: null,
				credentials: null,
				inboundTrunkConfig,
				outboundTrunkConfig,
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
		<Stack pos='relative' className={styles.formRoot}>
			<LoadingOverlay visible={isLoading} />

			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='sm'>
					<SectionCard
						title={t('form.sections.core.title')}
						description={t('form.sections.core.description')}
						padding='md'
						contentSpacing='xs'
					>
						<Stack gap='xs'>
							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
								<TextInput
									label={t('form.fields.phoneNumber.label')}
									placeholder={t('form.fields.phoneNumber.placeholder')}
									required
									size='sm'
									key={form.key('phoneNumber')}
									{...form.getInputProps('phoneNumber')}
								/>
								<TextInput
									label={t('form.fields.label.label')}
									placeholder={t('form.fields.label.placeholder')}
									required
									size='sm'
									key={form.key('label')}
									{...form.getInputProps('label')}
								/>
							</SimpleGrid>
							<Text size='xs' c='dimmed'>
								{t('form.fields.phoneNumber.hint')}
							</Text>
						</Stack>
					</SectionCard>

					<SectionCard
						title={t('form.sections.provider.title')}
						description={t('form.sections.provider.description')}
						padding='md'
						contentSpacing='xs'
						headerActions={
							<SegmentedControl
								data={[
									{ label: t('form.provider.twilio'), value: 'twilio' },
									{ label: t('form.provider.sipTrunk'), value: 'sip_trunk' },
								]}
								value={provider}
								onChange={(value) =>
									setProvider(value as 'twilio' | 'sip_trunk')
								}
								size='sm'
								className={styles.providerControl}
							/>
						}
					>
						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
							<Switch
								label={t('form.fields.supportsInbound')}
								size='sm'
								checked={form.values.supportsInbound}
								onChange={(event) =>
									form.setFieldValue(
										'supportsInbound',
										event.currentTarget.checked
									)
								}
							/>
							<Switch
								label={t('form.fields.supportsOutbound')}
								size='sm'
								checked={form.values.supportsOutbound}
								onChange={(event) =>
									form.setFieldValue(
										'supportsOutbound',
										event.currentTarget.checked
									)
								}
							/>
						</SimpleGrid>

						{provider === 'twilio' && (
							<Stack gap='xs'>
								<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
									<TextInput
										label={t('form.fields.sid.label')}
										required
										size='sm'
										key={form.key('sid')}
										{...form.getInputProps('sid')}
									/>
									<PasswordInput
										label={t('form.fields.token.label')}
										required
										size='sm'
										key={form.key('token')}
										{...form.getInputProps('token')}
									/>
									<Select
										label={t('form.fields.type')}
										data={['INBOUND', 'OUTBOUND', 'HYBRID']}
										size='sm'
										key={form.key('type')}
										{...form.getInputProps('type')}
									/>
								</SimpleGrid>
								<Group justify='space-between' className={styles.toggleRow}>
									<Text size='xs' c='dimmed'>
										{t('form.sections.region.description')}
									</Text>
									<Switch
										label={t('form.sections.region.toggle')}
										size='sm'
										checked={regionConfigOpen}
										onChange={(event) => {
											const next = event.currentTarget.checked;
											setRegionConfigOpen(next);
											if (!next) {
												form.setValues({
													regionId: '',
													regionToken: '',
													edgeLocation: '',
												});
											}
										}}
									/>
								</Group>
								<Collapse in={regionConfigOpen}>
									<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='xs'>
										<Select
											label={t('form.fields.regionConfig.regionId')}
											data={['us1', 'ie1', 'au1']}
											size='sm'
											key={form.key('regionId')}
											{...form.getInputProps('regionId')}
										/>
										<TextInput
											label={t('form.fields.regionConfig.token')}
											size='sm'
											key={form.key('regionToken')}
											{...form.getInputProps('regionToken')}
										/>
										<Select
											label={t('form.fields.regionConfig.edgeLocation')}
											data={[
												'ashburn',
												'dublin',
												'frankfurt',
												'sao-paulo',
												'singapore',
												'sydney',
												'tokyo',
												'umatilla',
												'roaming',
											]}
											size='sm'
											key={form.key('edgeLocation')}
											{...form.getInputProps('edgeLocation')}
										/>
									</SimpleGrid>
								</Collapse>
							</Stack>
						)}

						{provider === 'sip_trunk' && (
							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
								<Select
									label={t('form.fields.type')}
									data={['INBOUND', 'OUTBOUND', 'HYBRID']}
									required
									size='sm'
									key={form.key('type')}
									{...form.getInputProps('type')}
								/>
							</SimpleGrid>
						)}
					</SectionCard>

					{provider === 'sip_trunk' && (
						<SectionCard
							title={t('form.sections.sipInbound.title')}
							description={t('form.sections.sipInbound.description')}
							padding='md'
							contentSpacing='xs'
							headerActions={
								<Switch
									label={t('form.sections.sipInbound.toggle')}
									size='sm'
									checked={form.values.inboundEnabled}
									onChange={(event) =>
										form.setFieldValue(
											'inboundEnabled',
											event.currentTarget.checked
										)
									}
								/>
							}
						>
							<Collapse in={form.values.inboundEnabled}>
								<Stack gap='xs'>
									<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
										<TagsInput
											label={t('form.fields.inboundAllowedAddresses.label')}
											placeholder={t(
												'form.fields.inboundAllowedAddresses.placeholder'
											)}
											size='sm'
											key={form.key('inboundAllowedAddresses')}
											{...form.getInputProps('inboundAllowedAddresses')}
										/>
										<TagsInput
											label={t('form.fields.inboundAllowedNumbers.label')}
											placeholder={t(
												'form.fields.inboundAllowedNumbers.placeholder'
											)}
											size='sm'
											key={form.key('inboundAllowedNumbers')}
											{...form.getInputProps('inboundAllowedNumbers')}
										/>
									</SimpleGrid>
									<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
										<Select
											label={t('form.fields.inboundMediaEncryption')}
											data={['disabled', 'allowed', 'required']}
											size='sm'
											key={form.key('inboundMediaEncryption')}
											{...form.getInputProps('inboundMediaEncryption')}
										/>
										<TextInput
											label={t('form.fields.inboundUsername')}
											size='sm'
											key={form.key('inboundUsername')}
											{...form.getInputProps('inboundUsername')}
										/>
										<PasswordInput
											label={t('form.fields.inboundPassword')}
											size='sm'
											key={form.key('inboundPassword')}
											{...form.getInputProps('inboundPassword')}
										/>
									</SimpleGrid>
								</Stack>
							</Collapse>
						</SectionCard>
					)}

					{provider === 'sip_trunk' && (
						<SectionCard
							title={t('form.sections.sipOutbound.title')}
							description={t('form.sections.sipOutbound.description')}
							padding='md'
							contentSpacing='xs'
							headerActions={
								<Switch
									label={t('form.sections.sipOutbound.toggle')}
									size='sm'
									checked={form.values.outboundEnabled}
									onChange={(event) =>
										form.setFieldValue(
											'outboundEnabled',
											event.currentTarget.checked
										)
									}
								/>
							}
						>
							<Collapse in={form.values.outboundEnabled}>
								<Stack gap='xs'>
									<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
										<TextInput
											label={t('form.fields.outboundAddress')}
											size='sm'
											key={form.key('outboundAddress')}
											{...form.getInputProps('outboundAddress')}
										/>
										<Select
											label={t('form.fields.outboundTransport')}
											data={['auto', 'udp', 'tcp', 'tls']}
											size='sm'
											key={form.key('outboundTransport')}
											{...form.getInputProps('outboundTransport')}
										/>
										<Select
											label={t('form.fields.outboundMediaEncryption')}
											data={['disabled', 'allowed', 'required']}
											size='sm'
											key={form.key('outboundMediaEncryption')}
											{...form.getInputProps('outboundMediaEncryption')}
										/>
									</SimpleGrid>
									<Textarea
										label={t('form.fields.outboundHeaders.label')}
										placeholder={t('form.fields.outboundHeaders.placeholder')}
										size='sm'
										autosize
										minRows={2}
										key={form.key('outboundHeaders')}
										{...form.getInputProps('outboundHeaders')}
									/>
									<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
										<TextInput
											label={t('form.fields.outboundUsername')}
											size='sm'
											key={form.key('outboundUsername')}
											{...form.getInputProps('outboundUsername')}
										/>
										<PasswordInput
											label={t('form.fields.outboundPassword')}
											size='sm'
											key={form.key('outboundPassword')}
											{...form.getInputProps('outboundPassword')}
										/>
									</SimpleGrid>
								</Stack>
							</Collapse>
						</SectionCard>
					)}
					<Group justify='flex-end' className={styles.actions}>
						<Button variant='default' size='sm' onClick={onClose}>
							{t('form.buttons.cancel')}
						</Button>
						<Button type='submit' size='sm' loading={isLoading}>
							{isEdit ? t('form.buttons.update') : t('form.buttons.create')}
						</Button>
					</Group>
				</Stack>
			</form>
		</Stack>
	);
}
