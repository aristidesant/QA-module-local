import { useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Button,
	Group,
	Paper,
	Select,
	Stack,
	Text,
	TextInput,
	Textarea,
	Grid,
	Divider,
	Skeleton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './ClientForm.module.css';
import SectionCard from '~/components/SectionCard';
import {
	useCreateClient,
	useUpdateClient,
	useGetClient,
} from '~/queries/clientQueries';
import { createClientAliasSuggestion } from '~/utils/clientDisplay';
import type {
	CreateClientRequest,
	UpdateClientRequest,
} from '~/models/ClientModel';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import { useGetSimpleUsers } from '~/queries/userQueries';
import { useGetClientFiles } from '~/queries/fileQueries';

interface ClientFormProps {
	mode: 'create' | 'edit';
	clientId?: number;
	onSuccess: () => void;
	onCancel?: () => void;
}

interface ClientFormValues {
	name: string;
	alias: string;
	description?: string;
	email?: string;
	phone?: string;
	address?: string;
	rnc?: string;
	userId?: number | null;
	countryId?: number | null;
	website?: string;
	pocUserId?: number | null;
	invoiceTemplateFileId?: number | null;
}

const ClientForm: React.FC<ClientFormProps> = ({
	mode,
	clientId,
	onSuccess,
	onCancel,
}) => {
	const { t } = useTranslation('clients');
	const isEditMode = mode === 'edit';
	const [isAliasManuallyEdited, setIsAliasManuallyEdited] = useState(false);
	const isMasterClient = useIsMasterClient();
	const { data: simpleUsers = [] } = useGetSimpleUsers(
		isEditMode && isMasterClient ? clientId : undefined
	);
	const { data: clientFiles = [] } = useGetClientFiles(
		isEditMode ? clientId : undefined
	);

	const form = useForm<ClientFormValues>({
		initialValues: {
			name: '',
			alias: '',
			description: '',
			email: '',
			phone: '',
			address: '',
			rnc: '',
			userId: null,
			countryId: null,
			website: '',
			pocUserId: null,
			invoiceTemplateFileId: null,
		},
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
					return null; // Email is optional
				}
				if (!/^\S+@\S+$/.test(value)) {
					return t('form.validation.emailInvalid');
				}
				return null;
			},
		},
	});

	const userOptions = simpleUsers.map((u) => ({
		value: String(u.id),
		label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Unknown',
	}));

	const docxFileOptions = clientFiles
		.filter((f) => f.extension === 'docx')
		.map((f) => ({ value: String(f.id), label: f.name }));

	const createMutation = useCreateClient();
	const updateMutation = useUpdateClient();

	const {
		data: client,
		isLoading: isClientLoading,
		isError: isClientError,
		error: clientError,
	} = useGetClient(clientId || 0);

	useEffect(() => {
		if (isEditMode && client) {
			form.setValues({
				name: client.name,
				alias: client.alias || '',
				description: client.description || '',
				email: client.email || '',
				phone: client.phone || '',
				address: client.address || '',
				rnc: client.rnc || '',
				userId: client.userId,
				countryId: client.countryId,
				website: client.website ?? '',
				pocUserId: client.pocUserId ?? null,
				invoiceTemplateFileId: client.invoiceTemplateFileId ?? null,
			});
			setIsAliasManuallyEdited(Boolean(client.alias));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditMode, client]);

	useEffect(() => {
		if (isEditMode || isAliasManuallyEdited) {
			return;
		}

		form.setFieldValue('alias', createClientAliasSuggestion(form.values.name));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values.name, isEditMode, isAliasManuallyEdited]);

	const isSubmitting = useMemo(
		() => createMutation.isPending || updateMutation.isPending,
		[createMutation.isPending, updateMutation.isPending]
	);

	const handleSubmit = form.onSubmit(async (values) => {
		try {
			if (isEditMode) {
				if (!clientId) throw new Error(t('form.errors.missingClientId'));
				const updatePayload: UpdateClientRequest = {
					name: values.name,
					alias: values.alias.trim(),
					description: values.description,
					email: values.email,
					phone: values.phone,
					address: values.address,
					rnc: values.rnc,
					userId: values.userId,
					countryId: values.countryId,
					website: values.website || undefined,
					pocUserId: values.pocUserId ?? null,
					invoiceTemplateFileId: values.invoiceTemplateFileId ?? null,
				};
				await updateMutation.mutateAsync({ id: clientId, data: updatePayload });
				notifications.show({
					title: t('notifications.updated.title'),
					message: t('notifications.updated.message'),
					color: 'green',
				});
			} else {
				const createPayload: CreateClientRequest = {
					name: values.name,
					alias: values.alias.trim(),
					description: values.description,
					email: values.email,
					phone: values.phone,
					address: values.address,
					rnc: values.rnc,
					userId: values.userId,
					countryId: values.countryId,
				};
				await createMutation.mutateAsync(createPayload);
				notifications.show({
					title: t('notifications.created.title'),
					message: t('notifications.created.message'),
					color: 'green',
				});
				form.reset();
			}
			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('notifications.requestFailed.title'),
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	});

	if (isEditMode && isClientLoading) {
		return (
			<Paper withBorder radius='md' className={classes.form}>
				<Stack gap='xs'>
					<Skeleton height={10} width='30%' radius='xl' />
					<Skeleton height={24} radius='sm' />
					<Skeleton height={10} radius='xl' />
				</Stack>
				<Divider />
				<Grid gap='xs'>
					{Array.from({ length: 3 }).map((_, index) => (
						<Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={index}>
							<Stack gap='xs'>
								<Skeleton height={12} radius='xl' />
								<Skeleton height={80} radius='sm' />
							</Stack>
						</Grid.Col>
					))}
				</Grid>
			</Paper>
		);
	}

	if (isEditMode && isClientError) {
		return (
			<Alert
				icon={<IconInfoCircle size={18} />}
				title={t('form.loadError.title')}
				color='red'
			>
				{clientError instanceof Error
					? clientError.message
					: t('errors.unknownError')}
			</Alert>
		);
	}

	return (
		<Paper
			component='form'
			withBorder
			radius='md'
			className={classes.form}
			onSubmit={handleSubmit}
		>
			<div className={classes.header}>
				<Stack gap={4} className={classes.headerCopy}>
					<Text size='sm' c='dimmed'>
						{t('form.intro')}
					</Text>
				</Stack>
			</div>

			<Divider />

			<div className={classes.body}>
				<Stack gap='xs'>
					<Grid gap='sm'>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<SectionCard
								title={t('form.sections.profile.title')}
								description={t('form.sections.profile.description')}
								contentSpacing='sm'
								padding='md'
							>
								<TextInput
									required
									label={t('form.fields.name.label')}
									placeholder={t('form.fields.name.placeholder')}
									size='sm'
									{...form.getInputProps('name')}
								/>
								<TextInput
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
									label={t('form.fields.description.label')}
									placeholder={t('form.fields.description.placeholder')}
									size='sm'
									minRows={3}
									{...form.getInputProps('description')}
								/>
							</SectionCard>
						</Grid.Col>

						<Grid.Col span={{ base: 12, md: 6 }}>
							<SectionCard
								title={t('form.sections.contact.title')}
								description={t('form.sections.contact.description')}
								contentSpacing='sm'
								padding='md'
							>
								<div className={classes.row}>
									<TextInput
										label={t('form.fields.email.label')}
										placeholder={t('form.fields.email.placeholder')}
										size='sm'
										{...form.getInputProps('email')}
									/>
									<TextInput
										label={t('form.fields.phone.label')}
										placeholder={t('form.fields.phone.placeholder')}
										size='sm'
										{...form.getInputProps('phone')}
									/>
								</div>
							</SectionCard>
						</Grid.Col>
					</Grid>

					<SectionCard
						title={t('form.sections.locationTax.title')}
						description={t('form.sections.locationTax.description')}
						contentSpacing='sm'
						padding='md'
					>
						<div className={classes.row}>
							<TextInput
								label={t('form.fields.address.label')}
								placeholder={t('form.fields.address.placeholder')}
								size='sm'
								{...form.getInputProps('address')}
							/>
							<TextInput
								label={t('form.fields.rnc.label')}
								placeholder={t('form.fields.rnc.placeholder')}
								size='sm'
								{...form.getInputProps('rnc')}
							/>
						</div>
					</SectionCard>

					{isMasterClient && isEditMode && (
						<SectionCard
							title={t('form.sections.invoiceSettings.title')}
							description={t('form.sections.invoiceSettings.description')}
							contentSpacing='sm'
							padding='md'
						>
							<TextInput
								label={t('form.fields.website.label')}
								placeholder={t('form.fields.website.placeholder')}
								size='sm'
								{...form.getInputProps('website')}
							/>
							<Select
								label={t('form.fields.pocUserId.label')}
								placeholder={t('form.fields.pocUserId.placeholder')}
								data={userOptions}
								value={
									form.values.pocUserId != null
										? String(form.values.pocUserId)
										: null
								}
								onChange={(v) =>
									form.setFieldValue('pocUserId', v ? Number(v) : null)
								}
								clearable
								searchable
								size='sm'
							/>
							<Select
								label={t('form.fields.invoiceTemplateFileId.label')}
								placeholder={t('form.fields.invoiceTemplateFileId.placeholder')}
								data={docxFileOptions}
								value={
									form.values.invoiceTemplateFileId != null
										? String(form.values.invoiceTemplateFileId)
										: null
								}
								onChange={(v) =>
									form.setFieldValue(
										'invoiceTemplateFileId',
										v ? Number(v) : null
									)
								}
								clearable
								searchable
								size='sm'
							/>
						</SectionCard>
					)}
				</Stack>
			</div>

			<Group justify='space-between' className={classes.actions}>
				<Text size='xs' c='dimmed'>
					{t('form.footerNote')}
				</Text>
				<Group gap='xs'>
					{onCancel && (
						<Button
							variant='default'
							onClick={onCancel}
							disabled={isSubmitting}
						>
							{t('actions.cancel', { ns: 'common' })}
						</Button>
					)}
					<Button type='submit' loading={isSubmitting}>
						{isEditMode
							? t('form.actions.saveChanges')
							: t('form.actions.createClient')}
					</Button>
				</Group>
			</Group>
		</Paper>
	);
};

export default ClientForm;
