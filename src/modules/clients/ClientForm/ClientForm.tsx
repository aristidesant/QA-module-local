import { useEffect, useMemo, useRef, useState } from 'react';
import {
	Alert,
	Badge,
	Button,
	Code,
	Group,
	Select,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useReducedMotion } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
	IconAddressBook,
	IconAlertTriangle,
	IconBuilding,
	IconInfoCircle,
	IconMapPin,
	IconPalette,
	IconReceipt,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useBeforeUnload, useBlocker, useNavigate } from 'react-router';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import {
	useCreateClient,
	useGetClient,
	useGetClientTheme,
	useUpdateClient,
	useUpdateClientTheme,
} from '~/queries/clientQueries';
import { useGetClientFiles } from '~/queries/fileQueries';
import { useGetSimpleUsers } from '~/queries/userQueries';
import {
	createClientAliasSuggestion,
	getClientDisplayLabel,
} from '~/utils/clientDisplay';
import { MAX_BRAND_NAME_LENGTH, isValidHexColor } from '~/utils/clientTheme';
import { getErrorMessage } from '~/utils/httpClient';
import ClientFormActions from '../ClientFormActions';
import ClientSectionNav from '../ClientSectionNav';
import classes from './ClientForm.module.css';
import {
	CLIENT_FORM_FIELD_IDS,
	CLIENT_FORM_FIELD_ORDER,
	CLIENT_FORM_ID,
	CLIENT_FORM_INITIAL_VALUES,
	CLIENT_SECTION_FIELDS,
} from './ClientForm.constants';
import {
	buildCoreSavedBaseline,
	buildClientThemePatch,
	buildCreateClientPayload,
	buildUpdateClientPayload,
	hydrateClientFormValues,
} from './ClientForm.helpers';
import type {
	ClientFormMode,
	ClientFormSectionId,
	ClientFormSectionItem,
	ClientFormValues,
} from './ClientForm.types';
import ClientThemeSection, {
	type ClientThemeFormValue,
} from './ClientThemeSection';

interface ClientFormProps {
	mode: ClientFormMode;
	clientId?: number;
}

const SECTION_HEADING_IDS: Record<ClientFormSectionId, string> = {
	identity: 'identity-heading',
	contact: 'contact-heading',
	'location-tax': 'location-tax-heading',
	billing: 'billing-heading',
	branding: 'branding-heading',
};

const ClientForm: React.FC<ClientFormProps> = ({ mode, clientId }) => {
	const { t, i18n } = useTranslation('clients');
	const navigate = useNavigate();
	const isEditMode = mode === 'edit';
	const isMasterClient = useIsMasterClient();
	const reducedMotion = useReducedMotion();
	const shouldLoadTheme = isEditMode && isMasterClient;
	const hydratedClientIdRef = useRef<number | null>(null);
	const isLogoUploadingRef = useRef(false);
	const allowNavigationRef = useRef(false);
	const formIdentityRef = useRef(`${mode}:${clientId ?? 'new'}`);
	const leaveModalIdRef = useRef<string | null>(null);
	const navigationPendingRef = useRef(false);
	const blockedWhilePendingRef = useRef(false);
	const validationFocusFrameRef = useRef<number | null>(null);
	const [isAliasManuallyEdited, setIsAliasManuallyEdited] = useState(false);
	const [isLogoUploading, setIsLogoUploading] = useState(false);
	const [isRetrying, setIsRetrying] = useState(false);
	const [validationSummary, setValidationSummary] = useState('');
	const [saveAnnouncement, setSaveAnnouncement] = useState('');
	const [failedSection, setFailedSection] =
		useState<ClientFormSectionId | null>(null);
	const formIdentity = `${mode}:${clientId ?? 'new'}`;
	if (formIdentityRef.current !== formIdentity) {
		formIdentityRef.current = formIdentity;
		allowNavigationRef.current = false;
	}

	const form = useForm<ClientFormValues>({
		initialValues: { ...CLIENT_FORM_INITIAL_VALUES },
		validate: {
			name: (value) =>
				!value || value.trim().length === 0
					? t('form.validation.nameRequired')
					: null,
			alias: (value) => {
				if (!value || value.trim().length === 0) {
					return t('form.validation.aliasRequired');
				}

				return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
					? null
					: t('form.validation.aliasInvalid');
			},
			email: (value) => {
				if (!value || value.trim().length === 0) {
					return null;
				}

				return /^\S+@\S+$/.test(value)
					? null
					: t('form.validation.emailInvalid');
			},
			primaryColor: (value) =>
				!value || isValidHexColor(value)
					? null
					: t('form.validation.colorInvalid'),
			secondaryColor: (value) =>
				!value || isValidHexColor(value)
					? null
					: t('form.validation.colorInvalid'),
			brandName: (value) =>
				value && value.length > MAX_BRAND_NAME_LENGTH
					? t('form.validation.brandNameTooLong')
					: null,
		},
	});
	const { data: simpleUsers = [] } = useGetSimpleUsers(
		shouldLoadTheme ? clientId : undefined
	);
	const { data: clientFiles = [] } = useGetClientFiles(
		shouldLoadTheme ? clientId : undefined
	);
	const createMutation = useCreateClient();
	const updateMutation = useUpdateClient();
	const updateThemeMutation = useUpdateClientTheme();
	const {
		data: client,
		isLoading: isClientLoading,
		isFetching: isClientFetching,
		isError: isClientError,
		error: clientError,
		refetch: refetchClient,
	} = useGetClient(clientId ?? 0, isEditMode);
	const {
		data: clientTheme,
		isLoading: isThemeLoading,
		isFetching: isThemeFetching,
		isError: isThemeError,
		error: themeError,
		refetch: refetchTheme,
	} = useGetClientTheme(clientId, shouldLoadTheme);

	useEffect(() => {
		if (!isEditMode) {
			hydratedClientIdRef.current = null;
		}
	}, [isEditMode]);

	useEffect(() => {
		if (!isEditMode || !client || client.id !== clientId) return;
		if (hydratedClientIdRef.current === client.id) return;
		if (isClientFetching || (shouldLoadTheme && isThemeFetching)) return;
		if (shouldLoadTheme && !clientTheme) return;

		const hydratedValues = hydrateClientFormValues(client, clientTheme);
		form.setInitialValues(hydratedValues);
		form.setValues(hydratedValues);
		form.resetDirty(hydratedValues);
		setIsAliasManuallyEdited(Boolean(client.alias));
		hydratedClientIdRef.current = client.id;
		// The client ID guard intentionally prevents query refreshes from replacing edits.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		client,
		clientId,
		clientTheme,
		isClientFetching,
		isEditMode,
		isThemeFetching,
		shouldLoadTheme,
	]);

	useEffect(() => {
		if (isEditMode || isAliasManuallyEdited) return;

		form.setFieldValue('alias', createClientAliasSuggestion(form.values.name));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values.name, isAliasManuallyEdited, isEditMode]);

	const userOptions = useMemo(
		() =>
			simpleUsers.map((user) => ({
				value: String(user.id),
				label:
					`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
					t('form.fields.pocUserId.unknownOption'),
			})),
		[simpleUsers, t]
	);
	const xlsxFileOptions = useMemo(
		() =>
			clientFiles
				.filter((file) => file.extension === 'xlsx')
				.map((file) => ({ value: String(file.id), label: file.name })),
		[clientFiles]
	);
	const isSubmitting =
		createMutation.isPending ||
		updateMutation.isPending ||
		updateThemeMutation.isPending ||
		isLogoUploading;
	const navigationPending = isSubmitting || isRetrying;
	navigationPendingRef.current = navigationPending;
	const blocker = useBlocker(() => {
		const hasPendingWork =
			navigationPendingRef.current || isLogoUploadingRef.current;
		const shouldBlock =
			!allowNavigationRef.current && (form.isDirty() || hasPendingWork);
		blockedWhilePendingRef.current = shouldBlock && hasPendingWork;
		return shouldBlock;
	});
	const blockerRef = useRef(blocker);

	useEffect(() => {
		blockerRef.current = blocker;
	}, [blocker]);

	useBeforeUnload((event) => {
		if (
			allowNavigationRef.current ||
			(!form.isDirty() &&
				!navigationPendingRef.current &&
				!isLogoUploadingRef.current)
		) {
			return;
		}

		event.preventDefault();
		event.returnValue = '';
	});

	useEffect(() => {
		if (blocker.state !== 'blocked') return;

		if (navigationPending || blockedWhilePendingRef.current) {
			blockedWhilePendingRef.current = false;
			if (leaveModalIdRef.current) {
				modals.close(leaveModalIdRef.current);
				leaveModalIdRef.current = null;
			}
			blocker.reset();
			return;
		}

		if (leaveModalIdRef.current) return;

		leaveModalIdRef.current = modals.openConfirmModal({
			title: t('form.leave.title'),
			children: <Text size='sm'>{t('form.leave.message')}</Text>,
			labels: {
				confirm: t('form.leave.confirm'),
				cancel: t('form.leave.stay'),
			},
			onConfirm: () => {
				leaveModalIdRef.current = null;
				if (blockerRef.current.state === 'blocked') {
					blockerRef.current.proceed();
				}
			},
			onCancel: () => {
				leaveModalIdRef.current = null;
				if (blockerRef.current.state === 'blocked') {
					blockerRef.current.reset();
				}
			},
			centered: true,
			closeOnClickOutside: false,
			closeOnEscape: false,
			withCloseButton: false,
		});
	}, [blocker, navigationPending, t]);

	useEffect(
		() => () => {
			if (validationFocusFrameRef.current != null) {
				window.cancelAnimationFrame(validationFocusFrameRef.current);
			}

			if (leaveModalIdRef.current) {
				modals.close(leaveModalIdRef.current);
				leaveModalIdRef.current = null;
			}

			blockedWhilePendingRef.current = false;
			if (blockerRef.current.state === 'blocked') {
				blockerRef.current.reset();
			}
		},
		[]
	);
	const hasHydratedClient =
		isEditMode && hydratedClientIdRef.current === clientId;
	const hasRequiredData =
		client?.id === clientId && (!shouldLoadTheme || clientTheme != null);
	const isRequiredQueryFetching =
		isClientLoading ||
		isClientFetching ||
		(shouldLoadTheme && (isThemeLoading || isThemeFetching));
	const hasRequiredQueryError =
		isClientError || (shouldLoadTheme && isThemeError);
	const isEditError =
		isEditMode &&
		!isRequiredQueryFetching &&
		hasRequiredQueryError &&
		(!hasHydratedClient || !hasRequiredData);
	const isEditLoading = isEditMode && !hasHydratedClient && !isEditError;
	const loadError = isClientError ? clientError : themeError;
	const pageTitle = isEditMode
		? t('form.editor.editTitle', {
				name: client ? getClientDisplayLabel(client) : '',
			})
		: t('form.editor.createTitle');
	const pageDescription = isEditMode
		? t('form.editor.editDescription')
		: t('form.editor.createDescription');

	// ClientModel does not expose isActive; derive active state from deletedAt.
	const isClientActive = !client?.deletedAt;
	const statusLabel = isClientActive
		? t('form.metadata.active')
		: t('form.metadata.inactive');
	const statusColor = isClientActive ? 'green' : 'gray';
	const parsedCreatedAt = client?.createdAt ? new Date(client.createdAt) : null;
	const createdAtLabel =
		parsedCreatedAt && !Number.isNaN(parsedCreatedAt.getTime())
			? parsedCreatedAt.toLocaleDateString(i18n.language)
			: undefined;

	const sectionHasError = (sectionId: ClientFormSectionId) =>
		failedSection === sectionId ||
		CLIENT_SECTION_FIELDS[sectionId].some((field) =>
			Boolean(form.errors[field])
		);
	const sections: ClientFormSectionItem[] = [
		{
			id: 'identity',
			label: t('form.sections.profile.title'),
			icon: IconBuilding,
			hasError: sectionHasError('identity'),
		},
		{
			id: 'contact',
			label: t('form.sections.contact.title'),
			icon: IconAddressBook,
			hasError: sectionHasError('contact'),
		},
		{
			id: 'location-tax',
			label: t('form.sections.locationTax.title'),
			icon: IconMapPin,
			hasError: sectionHasError('location-tax'),
		},
		...(shouldLoadTheme
			? [
					{
						id: 'billing' as const,
						label: t('form.sections.invoiceSettings.title'),
						icon: IconReceipt,
						hasError: sectionHasError('billing'),
					},
					{
						id: 'branding' as const,
						label: t('form.sections.branding.title'),
						icon: IconPalette,
						hasError: sectionHasError('branding'),
					},
				]
			: []),
	];

	const handleThemeChange = (next: ClientThemeFormValue) => {
		form.setValues({
			brandName: next.brandName,
			primaryColor: next.primaryColor,
			secondaryColor: next.secondaryColor,
			logoFileId: next.logoFileId,
			logoUrl: next.logoUrl,
		});
	};
	const handleLogoUploadingChange = (isUploading: boolean) => {
		isLogoUploadingRef.current = isUploading;
		setIsLogoUploading(isUploading);
	};

	const handleRetry = async () => {
		if (isRetrying) return;

		setIsRetrying(true);
		try {
			if (shouldLoadTheme) {
				await Promise.allSettled([refetchClient(), refetchTheme()]);
			} else {
				await refetchClient();
			}
		} finally {
			setIsRetrying(false);
		}
	};
	const handleBack = () => {
		navigate('/clients');
	};

	const handleDiscard = () => {
		form.reset();
		setFailedSection(null);
		setValidationSummary('');
		setSaveAnnouncement('');
	};

	const handleSubmit = form.onSubmit(
		async (values) => {
			if (isLogoUploadingRef.current) return;

			if (validationFocusFrameRef.current != null) {
				window.cancelAnimationFrame(validationFocusFrameRef.current);
				validationFocusFrameRef.current = null;
			}
			setValidationSummary('');
			setSaveAnnouncement('');

			try {
				if (isEditMode) {
					if (!clientId) throw new Error(t('form.errors.missingClientId'));

					await updateMutation.mutateAsync({
						id: clientId,
						data: buildUpdateClientPayload(values),
					});

					const themePatch = isMasterClient
						? buildClientThemePatch(values, clientTheme)
						: null;
					if (themePatch) {
						try {
							await updateThemeMutation.mutateAsync({
								id: clientId,
								data: themePatch,
							});
						} catch {
							const partialBaseline = buildCoreSavedBaseline(
								values,
								clientTheme
							);
							form.setInitialValues(partialBaseline);
							form.resetDirty(partialBaseline);
							setFailedSection('branding');
							setSaveAnnouncement(t('form.partialSave.message'));
							notifications.show({
								title: t('form.partialSave.title'),
								message: t('form.partialSave.message'),
								color: 'yellow',
							});
							return;
						}
					}

					form.setInitialValues(values);
					form.resetDirty(values);
					setFailedSection(null);
					setValidationSummary('');
					setSaveAnnouncement(t('form.status.saved'));
					notifications.show({
						title: t('notifications.updated.title'),
						message: t('notifications.updated.message'),
						color: 'green',
					});
					return;
				}

				const createdClient = await createMutation.mutateAsync(
					buildCreateClientPayload(values)
				);
				form.resetDirty(values);
				allowNavigationRef.current = true;
				notifications.show({
					title: t('notifications.created.title'),
					message: t('notifications.created.message'),
					color: 'green',
				});
				navigate(`/clients/${createdClient.id}/edit`, { replace: true });
			} catch (error) {
				notifications.show({
					title: t('notifications.requestFailed.title'),
					message: getErrorMessage(error),
					color: 'red',
				});
			}
		},
		(errors) => {
			setSaveAnnouncement('');
			setValidationSummary(t('form.status.validationSummary'));

			const firstInvalidField = CLIENT_FORM_FIELD_ORDER.find((field) =>
				Boolean(errors[field])
			);
			if (!firstInvalidField) return;

			if (validationFocusFrameRef.current != null) {
				window.cancelAnimationFrame(validationFocusFrameRef.current);
			}
			validationFocusFrameRef.current = window.requestAnimationFrame(() => {
				validationFocusFrameRef.current = null;
				const field = document.getElementById(
					CLIENT_FORM_FIELD_IDS[firstInvalidField]
				);

				field?.scrollIntoView({
					behavior: reducedMotion ? 'auto' : 'smooth',
					block: 'center',
				});
				field?.focus({ preventScroll: true });
			});
		}
	);

	if (isEditLoading) {
		return (
			<ContentContainer
				title={pageTitle}
				description={pageDescription}
				showBackButton
				backButtonDisabled={isSubmitting || isRetrying}
				onBackClick={handleBack}
			>
				<div className={classes.pageLayout} aria-hidden='true'>
					<aside className={classes.navigationRail}>
						<div className={classes.loadingRail} />
					</aside>
					<div className={classes.sections}>
						{Array.from({ length: 3 }).map((_, index) => (
							<div key={index} className={classes.loadingCard} />
						))}
					</div>
				</div>
			</ContentContainer>
		);
	}

	if (isEditError) {
		return (
			<ContentContainer
				title={pageTitle}
				description={pageDescription}
				showBackButton
				backButtonDisabled={isSubmitting || isRetrying}
				onBackClick={handleBack}
			>
				<div className={classes.errorState}>
					<Alert
						icon={<IconInfoCircle size={18} />}
						title={t('form.loadError.title')}
						color='red'
					>
						{loadError ? getErrorMessage(loadError) : t('errors.unknownError')}
					</Alert>
					<Group gap='xs' className={classes.errorActions}>
						<Button
							variant='default'
							onClick={handleRetry}
							loading={isRetrying}
							disabled={isRetrying}
						>
							{t('form.loadError.retry')}
						</Button>
						<Button onClick={handleBack} disabled={isRetrying}>
							{t('form.loadError.back')}
						</Button>
					</Group>
				</div>
			</ContentContainer>
		);
	}

	return (
		<form id={CLIENT_FORM_ID} className={classes.form} onSubmit={handleSubmit}>
			<Text className={classes.srStatus} aria-live='assertive'>
				{validationSummary || saveAnnouncement}
			</Text>
			<ContentContainer
				title={pageTitle}
				description={pageDescription}
				showBackButton
				backButtonDisabled={isSubmitting || isRetrying}
				onBackClick={handleBack}
				titleBottom={
					isEditMode && client ? (
						<dl className={classes.headerMetadata}>
							{client.alias && (
								<div className={classes.metadataItem}>
									<dt className={classes.metadataLabel}>
										{t('form.metadata.aliasLabel')}
									</dt>
									<dd className={classes.metadataValue}>
										<Code>{client.alias}</Code>
									</dd>
								</div>
							)}
							<div className={classes.metadataItem}>
								<dt className={classes.metadataLabel}>
									{t('form.metadata.statusLabel')}
								</dt>
								<dd className={classes.metadataValue}>
									<Badge
										color={statusColor}
										variant='light'
										size='sm'
										radius='sm'
									>
										{statusLabel}
									</Badge>
								</dd>
							</div>
							{createdAtLabel && (
								<div className={classes.metadataItem}>
									<dt className={classes.metadataLabel}>
										{t('form.metadata.createdLabel')}
									</dt>
									<dd className={classes.metadataValue}>
										<Text>{createdAtLabel}</Text>
									</dd>
								</div>
							)}
							{client.id != null && (
								<div className={classes.metadataItem}>
									<dt className={classes.metadataLabel}>
										{t('form.metadata.idLabel')}
									</dt>
									<dd className={classes.metadataValue}>
										<Text>#{client.id}</Text>
									</dd>
								</div>
							)}
						</dl>
					) : null
				}
			>
				{failedSection === 'branding' && (
					<Alert
						className={classes.partialSaveAlert}
						icon={<IconAlertTriangle size={18} />}
						title={t('form.partialSave.title')}
						color='yellow'
					>
						{t('form.partialSave.message')}
					</Alert>
				)}
				<div className={classes.pageLayout}>
					<aside className={classes.navigationRail}>
						<ClientSectionNav
							sections={sections}
							ariaLabel={t('form.navigation.ariaLabel')}
							jumpLabel={t('form.navigation.jumpLabel')}
							errorLabel={t('form.navigation.sectionError')}
						/>
					</aside>

					<fieldset
						className={classes.sections}
						disabled={isSubmitting}
						aria-busy={isSubmitting}
					>
						<section
							id='identity'
							tabIndex={-1}
							className={classes.sectionAnchor}
							aria-labelledby={SECTION_HEADING_IDS.identity}
						>
							<SectionCard
								icon={IconBuilding}
								title={
									<span id={SECTION_HEADING_IDS.identity}>
										{t('form.sections.profile.title')}
									</span>
								}
								description={t('form.sections.profile.description')}
								contentSpacing='sm'
								padding='md'
								className={classes.sectionCard}
							>
								<div className={classes.twoColumnGrid}>
									<TextInput
										id={CLIENT_FORM_FIELD_IDS.name}
										required
										label={t('form.fields.name.label')}
										placeholder={t('form.fields.name.placeholder')}
										size='sm'
										{...form.getInputProps('name')}
									/>
									<TextInput
										id={CLIENT_FORM_FIELD_IDS.alias}
										required
										label={t('form.fields.alias.label')}
										placeholder={t('form.fields.alias.placeholder')}
										description={t('form.fields.alias.description')}
										size='sm'
										value={form.values.alias}
										onChange={(event) => {
											setIsAliasManuallyEdited(true);
											form.setFieldValue('alias', event.currentTarget.value);
										}}
										error={form.errors.alias}
									/>
									<Textarea
										id={CLIENT_FORM_FIELD_IDS.description}
										className={classes.fullWidthField}
										label={t('form.fields.description.label')}
										placeholder={t('form.fields.description.placeholder')}
										size='sm'
										minRows={3}
										{...form.getInputProps('description')}
									/>
								</div>
							</SectionCard>
						</section>

						<section
							id='contact'
							tabIndex={-1}
							className={classes.sectionAnchor}
							aria-labelledby={SECTION_HEADING_IDS.contact}
						>
							<SectionCard
								icon={IconAddressBook}
								title={
									<span id={SECTION_HEADING_IDS.contact}>
										{t('form.sections.contact.title')}
									</span>
								}
								description={t('form.sections.contact.description')}
								contentSpacing='sm'
								padding='md'
								className={classes.sectionCard}
							>
								<div className={classes.twoColumnGrid}>
									<TextInput
										id={CLIENT_FORM_FIELD_IDS.email}
										label={t('form.fields.email.label')}
										placeholder={t('form.fields.email.placeholder')}
										size='sm'
										{...form.getInputProps('email')}
									/>
									<TextInput
										id={CLIENT_FORM_FIELD_IDS.phone}
										label={t('form.fields.phone.label')}
										placeholder={t('form.fields.phone.placeholder')}
										size='sm'
										{...form.getInputProps('phone')}
									/>
								</div>
							</SectionCard>
						</section>

						<section
							id='location-tax'
							tabIndex={-1}
							className={classes.sectionAnchor}
							aria-labelledby={SECTION_HEADING_IDS['location-tax']}
						>
							<SectionCard
								icon={IconMapPin}
								title={
									<span id={SECTION_HEADING_IDS['location-tax']}>
										{t('form.sections.locationTax.title')}
									</span>
								}
								description={t('form.sections.locationTax.description')}
								contentSpacing='sm'
								padding='md'
								className={classes.sectionCard}
							>
								<div className={classes.twoColumnGrid}>
									<TextInput
										id={CLIENT_FORM_FIELD_IDS.address}
										label={t('form.fields.address.label')}
										placeholder={t('form.fields.address.placeholder')}
										size='sm'
										{...form.getInputProps('address')}
									/>
									<TextInput
										id={CLIENT_FORM_FIELD_IDS.rnc}
										label={t('form.fields.rnc.label')}
										placeholder={t('form.fields.rnc.placeholder')}
										size='sm'
										{...form.getInputProps('rnc')}
									/>
								</div>
							</SectionCard>
						</section>

						{shouldLoadTheme && (
							<section
								id='billing'
								tabIndex={-1}
								className={classes.sectionAnchor}
								aria-labelledby={SECTION_HEADING_IDS.billing}
							>
								<SectionCard
									icon={IconReceipt}
									title={
										<span id={SECTION_HEADING_IDS.billing}>
											{t('form.sections.invoiceSettings.title')}
										</span>
									}
									description={t('form.sections.invoiceSettings.description')}
									contentSpacing='sm'
									padding='md'
									className={classes.sectionCard}
								>
									<div className={classes.billingGrid}>
										<TextInput
											id={CLIENT_FORM_FIELD_IDS.website}
											className={classes.fullWidthField}
											label={t('form.fields.website.label')}
											placeholder={t('form.fields.website.placeholder')}
											size='sm'
											{...form.getInputProps('website')}
										/>
										<Select
											id={CLIENT_FORM_FIELD_IDS.pocUserId}
											label={t('form.fields.pocUserId.label')}
											placeholder={t('form.fields.pocUserId.placeholder')}
											data={userOptions}
											value={
												form.values.pocUserId != null
													? String(form.values.pocUserId)
													: null
											}
											onChange={(value) =>
												form.setFieldValue(
													'pocUserId',
													value ? Number(value) : null
												)
											}
											clearable
											searchable
											size='sm'
										/>
										<Select
											id={CLIENT_FORM_FIELD_IDS.invoiceTemplateFileId}
											label={t('form.fields.invoiceTemplateFileId.label')}
											placeholder={t(
												'form.fields.invoiceTemplateFileId.placeholder'
											)}
											data={xlsxFileOptions}
											value={
												form.values.invoiceTemplateFileId != null
													? String(form.values.invoiceTemplateFileId)
													: null
											}
											onChange={(value) =>
												form.setFieldValue(
													'invoiceTemplateFileId',
													value ? Number(value) : null
												)
											}
											clearable
											searchable
											size='sm'
										/>
									</div>
								</SectionCard>
							</section>
						)}

						{shouldLoadTheme && clientId != null && (
							<section
								id='branding'
								tabIndex={-1}
								className={classes.sectionAnchor}
								aria-labelledby={SECTION_HEADING_IDS.branding}
							>
								<ClientThemeSection
									clientId={clientId}
									value={{
										brandName: form.values.brandName,
										primaryColor: form.values.primaryColor,
										secondaryColor: form.values.secondaryColor,
										logoFileId: form.values.logoFileId,
										logoUrl: form.values.logoUrl,
									}}
									onChange={handleThemeChange}
									onUploadingChange={handleLogoUploadingChange}
									errors={{
										brandName: form.errors.brandName,
										primaryColor: form.errors.primaryColor,
										secondaryColor: form.errors.secondaryColor,
									}}
									disabled={isSubmitting}
									icon={IconPalette}
									className={classes.sectionCard}
								/>
							</section>
						)}
					</fieldset>
				</div>
				{isEditMode && (
					<ClientFormActions
						visible={form.isDirty() || isSubmitting}
						isSubmitting={isSubmitting}
						unsavedLabel={t('form.status.unsaved')}
						saveLabel={t('form.actions.saveChanges')}
						savingLabel={t('form.status.saving')}
						discardLabel={t('form.actions.discard')}
						onDiscard={handleDiscard}
					/>
				)}
			</ContentContainer>
		</form>
	);
};

export default ClientForm;
