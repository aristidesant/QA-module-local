import {
	memo,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {
	Button,
	Collapse,
	Divider,
	Group,
	LoadingOverlay,
	PasswordInput,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Switch,
	TagsInput,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm, type UseFormReturnType } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import { PhoneNumber } from '~/models/PhoneNumber';
import type {
	SipTrunkPhoneNumberParams,
	TwilioPhoneNumberParams,
} from '~/api/phoneNumberApi';
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

type PhoneProvider = 'twilio' | 'sip_trunk';

type PhoneNumberType = 'INBOUND' | 'OUTBOUND' | 'HYBRID';

type RegionId = 'us1' | 'ie1' | 'au1';

type EdgeLocation =
	| 'ashburn'
	| 'dublin'
	| 'frankfurt'
	| 'sao-paulo'
	| 'singapore'
	| 'sydney'
	| 'tokyo'
	| 'umatilla'
	| 'roaming';

type TransportOption = 'auto' | 'udp' | 'tcp' | 'tls';

type MediaEncryptionOption = 'disabled' | 'allowed' | 'required';

interface PhoneNumberFormValues {
	phoneNumber: string;
	label: string;
	supportsInbound: boolean;
	supportsOutbound: boolean;
	sid: string;
	token: string;
	type: PhoneNumberType;
	regionId: '' | RegionId;
	regionToken: string;
	edgeLocation: '' | EdgeLocation;
	inboundEnabled: boolean;
	outboundEnabled: boolean;
	inboundAllowedAddresses: string[];
	inboundAllowedNumbers: string[];
	inboundMediaEncryption: MediaEncryptionOption;
	inboundUsername: string;
	inboundPassword: string;
	outboundAddress: string;
	outboundTransport: TransportOption;
	outboundMediaEncryption: MediaEncryptionOption;
	outboundHeaders: string;
	outboundUsername: string;
	outboundPassword: string;
}

type FormType = UseFormReturnType<PhoneNumberFormValues>;

const DEFAULT_FORM_VALUES: PhoneNumberFormValues = {
	phoneNumber: '',
	label: '',
	supportsInbound: true,
	supportsOutbound: true,
	sid: '',
	token: '',
	type: 'OUTBOUND',
	regionId: '',
	regionToken: '',
	edgeLocation: '',
	inboundEnabled: false,
	outboundEnabled: true,
	inboundAllowedAddresses: [],
	inboundAllowedNumbers: [],
	inboundMediaEncryption: 'disabled',
	inboundUsername: '',
	inboundPassword: '',
	outboundAddress: '',
	outboundTransport: 'auto',
	outboundMediaEncryption: 'disabled',
	outboundHeaders: '',
	outboundUsername: '',
	outboundPassword: '',
};

const PHONE_TYPES: PhoneNumberType[] = ['INBOUND', 'OUTBOUND', 'HYBRID'];
const REGION_IDS: RegionId[] = ['us1', 'ie1', 'au1'];
const EDGE_LOCATIONS: EdgeLocation[] = [
	'ashburn',
	'dublin',
	'frankfurt',
	'sao-paulo',
	'singapore',
	'sydney',
	'tokyo',
	'umatilla',
	'roaming',
];
const TRANSPORT_OPTIONS: TransportOption[] = ['auto', 'udp', 'tcp', 'tls'];
const MEDIA_ENCRYPTION_OPTIONS: MediaEncryptionOption[] = [
	'disabled',
	'allowed',
	'required',
];

interface SectionHeaderProps {
	title: string;
	description: string;
	aside?: ReactNode;
}

const SectionHeader = memo(function SectionHeader({
	title,
	description,
	aside,
}: SectionHeaderProps) {
	return (
		<div className={styles.sectionHeader}>
			<div className={styles.sectionHeaderText}>
				<Text size='sm' fw={600}>
					{title}
				</Text>
				<Text size='xs' c='dimmed'>
					{description}
				</Text>
			</div>
			{aside && <div className={styles.sectionAside}>{aside}</div>}
		</div>
	);
});

interface TwilioSectionProps {
	form: FormType;
	t: TFunction<'phone-numbers'>;
	regionConfigOpen: boolean;
	onToggleRegionConfig: (checked: boolean) => void;
	sidValue: string;
	tokenValue: string;
	regionIdValue: '' | RegionId;
	regionTokenValue: string;
	edgeLocationValue: '' | EdgeLocation;
}

const TwilioSection = memo(function TwilioSection({
	form,
	t,
	regionConfigOpen,
	onToggleRegionConfig,
	sidValue,
	tokenValue,
	regionIdValue,
	regionTokenValue,
	edgeLocationValue,
}: TwilioSectionProps) {
	return (
		<Stack gap='xs'>
			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
				<TextInput
					label={t('form.fields.sid.label')}
					required
					size='sm'
					value={sidValue}
					error={form.errors.sid}
					onChange={(event) =>
						form.setFieldValue('sid', event.currentTarget.value)
					}
				/>
				<PasswordInput
					label={t('form.fields.token.label')}
					required
					size='sm'
					value={tokenValue}
					error={form.errors.token}
					onChange={(event) =>
						form.setFieldValue('token', event.currentTarget.value)
					}
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
					onChange={(event) =>
						onToggleRegionConfig(event.currentTarget.checked)
					}
				/>
			</Group>

			<Collapse in={regionConfigOpen}>
				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='xs'>
					<Select
						label={t('form.fields.regionConfig.regionId')}
						data={REGION_IDS}
						size='sm'
						value={regionIdValue || null}
						error={form.errors.regionId}
						onChange={(value) =>
							form.setFieldValue('regionId', (value ?? '') as '' | RegionId)
						}
					/>
					<TextInput
						label={t('form.fields.regionConfig.token')}
						size='sm'
						value={regionTokenValue}
						error={form.errors.regionToken}
						onChange={(event) =>
							form.setFieldValue('regionToken', event.currentTarget.value)
						}
					/>
					<Select
						label={t('form.fields.regionConfig.edgeLocation')}
						data={EDGE_LOCATIONS}
						size='sm'
						value={edgeLocationValue || null}
						error={form.errors.edgeLocation}
						onChange={(value) =>
							form.setFieldValue(
								'edgeLocation',
								(value ?? '') as '' | EdgeLocation
							)
						}
					/>
				</SimpleGrid>
			</Collapse>
		</Stack>
	);
});

interface SipInboundSectionProps {
	form: FormType;
	t: TFunction<'phone-numbers'>;
	inboundEnabled: boolean;
	onInboundEnabledChange: (checked: boolean) => void;
	inboundAllowedAddresses: string[];
	inboundAllowedNumbers: string[];
	inboundMediaEncryption: MediaEncryptionOption;
	inboundUsername: string;
	inboundPassword: string;
}

const SipInboundSection = memo(function SipInboundSection({
	form,
	t,
	inboundEnabled,
	onInboundEnabledChange,
	inboundAllowedAddresses,
	inboundAllowedNumbers,
	inboundMediaEncryption,
	inboundUsername,
	inboundPassword,
}: SipInboundSectionProps) {
	return (
		<>
			<SectionHeader
				title={t('form.sections.sipInbound.title')}
				description={t('form.sections.sipInbound.description')}
				aside={
					<Switch
						label={t('form.sections.sipInbound.toggle')}
						size='sm'
						checked={inboundEnabled}
						onChange={(event) =>
							onInboundEnabledChange(event.currentTarget.checked)
						}
					/>
				}
			/>
			<Collapse in={inboundEnabled}>
				<Stack gap='xs'>
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
						<TagsInput
							label={t('form.fields.inboundAllowedAddresses.label')}
							placeholder={t('form.fields.inboundAllowedAddresses.placeholder')}
							size='sm'
							value={inboundAllowedAddresses}
							onChange={(value) =>
								form.setFieldValue('inboundAllowedAddresses', value)
							}
						/>
						<TagsInput
							label={t('form.fields.inboundAllowedNumbers.label')}
							placeholder={t('form.fields.inboundAllowedNumbers.placeholder')}
							size='sm'
							value={inboundAllowedNumbers}
							onChange={(value) =>
								form.setFieldValue('inboundAllowedNumbers', value)
							}
						/>
					</SimpleGrid>
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
						<Select
							label={t('form.fields.inboundMediaEncryption')}
							data={MEDIA_ENCRYPTION_OPTIONS}
							size='sm'
							value={inboundMediaEncryption}
							onChange={(value) => {
								if (value) {
									form.setFieldValue(
										'inboundMediaEncryption',
										value as MediaEncryptionOption
									);
								}
							}}
						/>
						<TextInput
							label={t('form.fields.inboundUsername')}
							size='sm'
							value={inboundUsername}
							onChange={(event) =>
								form.setFieldValue('inboundUsername', event.currentTarget.value)
							}
						/>
						<PasswordInput
							label={t('form.fields.inboundPassword')}
							size='sm'
							value={inboundPassword}
							onChange={(event) =>
								form.setFieldValue('inboundPassword', event.currentTarget.value)
							}
						/>
					</SimpleGrid>
				</Stack>
			</Collapse>
		</>
	);
});

interface SipOutboundSectionProps {
	form: FormType;
	t: TFunction<'phone-numbers'>;
	outboundEnabled: boolean;
	onOutboundEnabledChange: (checked: boolean) => void;
	outboundAddress: string;
	outboundTransport: TransportOption;
	outboundMediaEncryption: MediaEncryptionOption;
	outboundHeaders: string;
	outboundUsername: string;
	outboundPassword: string;
}

const SipOutboundSection = memo(function SipOutboundSection({
	form,
	t,
	outboundEnabled,
	onOutboundEnabledChange,
	outboundAddress,
	outboundTransport,
	outboundMediaEncryption,
	outboundHeaders,
	outboundUsername,
	outboundPassword,
}: SipOutboundSectionProps) {
	return (
		<>
			<SectionHeader
				title={t('form.sections.sipOutbound.title')}
				description={t('form.sections.sipOutbound.description')}
				aside={
					<Switch
						label={t('form.sections.sipOutbound.toggle')}
						size='sm'
						checked={outboundEnabled}
						onChange={(event) =>
							onOutboundEnabledChange(event.currentTarget.checked)
						}
					/>
				}
			/>
			<Collapse in={outboundEnabled}>
				<Stack gap='xs'>
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
						<TextInput
							label={t('form.fields.outboundAddress')}
							size='sm'
							value={outboundAddress}
							onChange={(event) =>
								form.setFieldValue('outboundAddress', event.currentTarget.value)
							}
						/>
						<Select
							label={t('form.fields.outboundTransport')}
							data={TRANSPORT_OPTIONS}
							size='sm'
							value={outboundTransport}
							onChange={(value) => {
								if (value) {
									form.setFieldValue(
										'outboundTransport',
										value as TransportOption
									);
								}
							}}
						/>
						<Select
							label={t('form.fields.outboundMediaEncryption')}
							data={MEDIA_ENCRYPTION_OPTIONS}
							size='sm'
							value={outboundMediaEncryption}
							onChange={(value) => {
								if (value) {
									form.setFieldValue(
										'outboundMediaEncryption',
										value as MediaEncryptionOption
									);
								}
							}}
						/>
					</SimpleGrid>
					<Textarea
						label={t('form.fields.outboundHeaders.label')}
						placeholder={t('form.fields.outboundHeaders.placeholder')}
						size='sm'
						autosize
						minRows={2}
						value={outboundHeaders}
						error={form.errors.outboundHeaders}
						onChange={(event) =>
							form.setFieldValue('outboundHeaders', event.currentTarget.value)
						}
					/>
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs'>
						<TextInput
							label={t('form.fields.outboundUsername')}
							size='sm'
							value={outboundUsername}
							onChange={(event) =>
								form.setFieldValue(
									'outboundUsername',
									event.currentTarget.value
								)
							}
						/>
						<PasswordInput
							label={t('form.fields.outboundPassword')}
							size='sm'
							value={outboundPassword}
							onChange={(event) =>
								form.setFieldValue(
									'outboundPassword',
									event.currentTarget.value
								)
							}
						/>
					</SimpleGrid>
				</Stack>
			</Collapse>
		</>
	);
});

export function PhoneNumberForm({
	initialData,
	onClose,
	onSuccess,
}: PhoneNumberFormProps) {
	const { t } = useTranslation('phone-numbers');
	const { currentClientId } = useImpersonationState();
	const [provider, setProvider] = useState<PhoneProvider>('sip_trunk');
	const [regionConfigOpen, setRegionConfigOpen] = useState(false);
	const isEdit = Boolean(initialData);

	const createTwilio = useCreateTwilioPhoneNumber();
	const createSip = useCreateSipTrunkPhoneNumber();
	const updateTwilio = useUpdateTwilioPhoneNumber();
	const updateSip = useUpdateSipTrunkPhoneNumber();

	const isLoading =
		createTwilio.isPending ||
		createSip.isPending ||
		updateTwilio.isPending ||
		updateSip.isPending;

	const form = useForm<PhoneNumberFormValues>({
		initialValues: DEFAULT_FORM_VALUES,
		validate: {
			phoneNumber: (value: string) => {
				if (!value) return t('form.fields.phoneNumber.required');
				const phoneRegex = /^\+1(809|829|849)\d{7}$/;
				if (!phoneRegex.test(value)) {
					return t('form.fields.phoneNumber.invalid');
				}

				return null;
			},
			label: (value: string) =>
				value ? null : t('form.fields.label.required'),
			sid: (value: string) =>
				provider === 'twilio' && !value ? t('form.fields.sid.required') : null,
			token: (value: string) =>
				provider === 'twilio' && !value
					? t('form.fields.token.required')
					: null,
			regionId: (value: string, values) => {
				const hasAny =
					Boolean(values.regionToken) ||
					Boolean(values.edgeLocation) ||
					Boolean(values.regionId);
				if (!hasAny) {
					return null;
				}
				return value ? null : t('form.fields.regionConfig.required');
			},
			regionToken: (value: string, values) => {
				const hasAny =
					Boolean(values.regionToken) ||
					Boolean(values.edgeLocation) ||
					Boolean(values.regionId);
				if (!hasAny) {
					return null;
				}
				return value ? null : t('form.fields.regionConfig.required');
			},
			edgeLocation: (value: string, values) => {
				const hasAny =
					Boolean(values.regionToken) ||
					Boolean(values.edgeLocation) ||
					Boolean(values.regionId);
				if (!hasAny) {
					return null;
				}
				return value ? null : t('form.fields.regionConfig.required');
			},
			outboundHeaders: (value: string) => {
				if (!value) {
					return null;
				}

				try {
					const parsed = JSON.parse(value) as unknown;
					const isObject =
						Boolean(parsed) &&
						typeof parsed === 'object' &&
						!Array.isArray(parsed);

					return isObject ? null : t('form.fields.outboundHeaders.invalid');
				} catch {
					return t('form.fields.outboundHeaders.invalid');
				}
			},
		},
	});

	useEffect(() => {
		if (!initialData) {
			setProvider('sip_trunk');
			setRegionConfigOpen(false);
			form.setValues(DEFAULT_FORM_VALUES);
			form.clearErrors();
			return;
		}

		setProvider(initialData.provider);
		setRegionConfigOpen(Boolean(initialData.regionConfig));
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
			inboundEnabled: Boolean(initialData.inboundTrunkConfig),
			outboundEnabled: Boolean(initialData.outboundTrunkConfig),
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
		form.clearErrors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialData]);

	useEffect(() => {
		form.clearErrors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider]);

	const handleProviderChange = useCallback(
		(value: string) => {
			setProvider(value as PhoneProvider);
			form.clearErrors();
		},
		[form]
	);

	const handleRegionConfigToggle = useCallback(
		(checked: boolean) => {
			setRegionConfigOpen(checked);
			if (!checked) {
				form.setValues({
					regionId: '',
					regionToken: '',
					edgeLocation: '',
				});
			}
		},
		[form]
	);

	const handleInboundConfigToggle = useCallback(
		(checked: boolean) => {
			form.setFieldValue('inboundEnabled', checked);
		},
		[form]
	);

	const handleOutboundConfigToggle = useCallback(
		(checked: boolean) => {
			form.setFieldValue('outboundEnabled', checked);
		},
		[form]
	);

	const handleSuccess = useCallback(() => {
		notifications.show({
			title: 'Success',
			message: isEdit
				? t('form.notifications.updateSuccess')
				: t('form.notifications.createSuccess'),
			color: 'green',
		});
		onSuccess();
	}, [isEdit, onSuccess, t]);

	const handleSubmit = useCallback(
		(values: PhoneNumberFormValues) => {
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
				agentId: undefined,
			};

			if (provider === 'twilio') {
				const hasRegionConfig =
					Boolean(values.regionId) &&
					Boolean(values.regionToken) &&
					Boolean(values.edgeLocation);

				const params: TwilioPhoneNumberParams = {
					...commonParams,
					sid: values.sid,
					token: values.token,
					supportsInbound: values.supportsInbound,
					supportsOutbound: values.supportsOutbound,
					regionConfig: hasRegionConfig
						? {
								regionId: values.regionId as RegionId,
								token: values.regionToken,
								edgeLocation: values.edgeLocation as EdgeLocation,
							}
						: undefined,
					type: values.type,
					provider: 'twilio',
				};

				if (isEdit && initialData) {
					updateTwilio.mutate(
						{ id: initialData.id, params },
						{ onSuccess: handleSuccess }
					);
					return;
				}

				createTwilio.mutate(params, { onSuccess: handleSuccess });
				return;
			}

			let outboundHeaders: Record<string, string> | null = null;
			if (values.outboundHeaders) {
				try {
					outboundHeaders = JSON.parse(values.outboundHeaders) as Record<
						string,
						string
					>;
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
						mediaEncryption: values.inboundMediaEncryption,
						credentials: inboundCredentials,
					}
				: null;

			const outboundTrunkConfig = values.outboundEnabled
				? {
						address: values.outboundAddress || undefined,
						transport: values.outboundTransport,
						mediaEncryption: values.outboundMediaEncryption,
						headers: outboundHeaders,
						credentials: outboundCredentials,
					}
				: null;

			const params: SipTrunkPhoneNumberParams = {
				...commonParams,
				terminationUri: undefined,
				supportsInbound: values.supportsInbound,
				supportsOutbound: values.supportsOutbound,
				type: values.type,
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
				return;
			}

			createSip.mutate(params, { onSuccess: handleSuccess });
		},
		[
			createSip,
			createTwilio,
			currentClientId,
			form,
			handleSuccess,
			initialData,
			isEdit,
			provider,
			t,
			updateSip,
			updateTwilio,
		]
	);

	const providerOptions = useMemo(
		() => [
			{ label: t('form.provider.twilio'), value: 'twilio' },
			{ label: t('form.provider.sipTrunk'), value: 'sip_trunk' },
		],
		[t]
	);

	return (
		<Stack pos='relative' className={styles.formRoot} gap='sm'>
			<LoadingOverlay visible={isLoading} />

			<form
				onSubmit={form.onSubmit(handleSubmit)}
				className={styles.formElement}
			>
				<div className={styles.formShell}>
					<section className={styles.section}>
						<SectionHeader
							title={t('form.sections.core.title')}
							description={t('form.sections.core.description')}
						/>
						<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing='xs'>
							<TextInput
								label={t('form.fields.phoneNumber.label')}
								placeholder={t('form.fields.phoneNumber.placeholder')}
								required
								size='sm'
								radius='md'
								key={form.key('phoneNumber')}
								{...form.getInputProps('phoneNumber')}
							/>
							<TextInput
								label={t('form.fields.label.label')}
								placeholder={t('form.fields.label.placeholder')}
								required
								size='sm'
								radius='md'
								key={form.key('label')}
								{...form.getInputProps('label')}
							/>
							<Select
								label={t('form.fields.type')}
								data={PHONE_TYPES}
								required
								size='sm'
								radius='md'
								value={form.values.type}
								onChange={(value) => {
									if (value) {
										form.setFieldValue('type', value as PhoneNumberType);
									}
								}}
							/>
						</SimpleGrid>
						<Text size='xs' c='dimmed' className={styles.supportText}>
							{t('form.fields.phoneNumber.hint')}
						</Text>
					</section>

					<Divider />

					<section className={styles.section}>
						<SectionHeader
							title={t('form.sections.provider.title')}
							description={t('form.sections.provider.description')}
							aside={
								<SegmentedControl
									data={providerOptions}
									value={provider}
									onChange={handleProviderChange}
									size='sm'
									className={styles.providerControl}
								/>
							}
						/>
						<Group className={styles.capabilityRow} gap='lg'>
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
						</Group>

						{provider === 'twilio' ? (
							<TwilioSection
								form={form}
								t={t}
								regionConfigOpen={regionConfigOpen}
								onToggleRegionConfig={handleRegionConfigToggle}
								sidValue={form.values.sid}
								tokenValue={form.values.token}
								regionIdValue={form.values.regionId}
								regionTokenValue={form.values.regionToken}
								edgeLocationValue={form.values.edgeLocation}
							/>
						) : null}
					</section>

					{provider === 'sip_trunk' && (
						<>
							<Divider />
							<section className={styles.section}>
								<div className={styles.subsectionStack}>
									<div className={styles.subsection}>
										<SipInboundSection
											form={form}
											t={t}
											inboundEnabled={form.values.inboundEnabled}
											onInboundEnabledChange={handleInboundConfigToggle}
											inboundAllowedAddresses={
												form.values.inboundAllowedAddresses
											}
											inboundAllowedNumbers={form.values.inboundAllowedNumbers}
											inboundMediaEncryption={
												form.values.inboundMediaEncryption
											}
											inboundUsername={form.values.inboundUsername}
											inboundPassword={form.values.inboundPassword}
										/>
									</div>
									<div className={styles.subsectionDivider} />
									<div className={styles.subsection}>
										<SipOutboundSection
											form={form}
											t={t}
											outboundEnabled={form.values.outboundEnabled}
											onOutboundEnabledChange={handleOutboundConfigToggle}
											outboundAddress={form.values.outboundAddress}
											outboundTransport={form.values.outboundTransport}
											outboundMediaEncryption={
												form.values.outboundMediaEncryption
											}
											outboundHeaders={form.values.outboundHeaders}
											outboundUsername={form.values.outboundUsername}
											outboundPassword={form.values.outboundPassword}
										/>
									</div>
								</div>
							</section>
						</>
					)}

					<Divider />

					<Group justify='flex-end' className={styles.actions}>
						<Button variant='default' size='sm' type='button' onClick={onClose}>
							{t('form.buttons.cancel')}
						</Button>
						<Button type='submit' size='sm' loading={isLoading}>
							{isEdit ? t('form.buttons.update') : t('form.buttons.create')}
						</Button>
					</Group>
				</div>
			</form>
		</Stack>
	);
}
