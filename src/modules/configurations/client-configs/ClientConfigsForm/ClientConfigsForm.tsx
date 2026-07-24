import { useEffect } from 'react';
import { TextInput, Textarea, Button, Group, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	useCreateClientConfig,
	useUpdateClientConfig,
} from '~/queries/useClientConfigs';
import type { ClientConfig } from '~/models/ClientConfig';
import { useTranslation } from 'react-i18next';

import styles from './ClientConfigsForm.module.css';

interface ClientConfigsFormProps {
	config?: ClientConfig;
	onSuccess: () => void;
	onCancel: () => void;
}

const SLA_CONFIG_NAME = 'backoffice_case_sla_target_minutes';
const SLA_CONFIG_DESCRIPTION =
	'Default SLA target for backoffice case resolution';
const SLA_TARGET_OPTIONS = ['30', '60', '90', '120'];

export function ClientConfigsForm({
	config,
	onSuccess,
	onCancel,
}: ClientConfigsFormProps) {
	const { t } = useTranslation('client-configs');
	const isEditMode = !!config;
	const isSlaConfig = (name: string) => name === SLA_CONFIG_NAME;

	const createMutation = useCreateClientConfig();
	const updateMutation = useUpdateClientConfig();

	const form = useForm({
		initialValues: {
			name: config?.name || '',
			description: config?.description || '',
			value: config?.value || '',
			type: config?.type || 'string',
		},
		validate: {
			name: (value) => {
				if (!value) return t('form.fields.name.required');
				if (isEditMode) return null; // Name can't be changed in edit mode
				if (!/^[a-z0-9_]+$/.test(value)) {
					return t('form.fields.name.invalid');
				}
				return null;
			},
			description: (value) =>
				!value ? t('form.fields.description.required') : null,
			value: (value, values) => {
				if (!value) return t('form.fields.value.required');
				if (isSlaConfig(values.name) && !SLA_TARGET_OPTIONS.includes(value)) {
					return t('form.fields.value.invalidSla');
				}

				// Validate JSON/array types
				if (values.type === 'json' || values.type === 'array') {
					try {
						JSON.parse(value);
					} catch (error) {
						return t('form.fields.value.invalidJson');
					}
				}

				return null;
			},
			type: (value, values) => {
				if (!value) return t('form.fields.type.required');
				if (isSlaConfig(values.name) && value !== 'number') {
					return t('form.fields.type.invalidSla');
				}
				return null;
			},
		},
	});

	useEffect(() => {
		if (config) {
			form.setValues({
				name: config.name,
				description: config.description,
				value: config.value,
				type: config.type,
			});
		}
	}, [config]);

	const handleValueBlur = () => {
		const currentType = form.values.type;
		const currentValue = form.values.value;

		// Only format JSON and array types
		if ((currentType === 'json' || currentType === 'array') && currentValue) {
			try {
				const parsed = JSON.parse(currentValue);
				const formatted = JSON.stringify(parsed, null, 2);
				form.setFieldValue('value', formatted);
			} catch (error) {
				// If it's not valid JSON, leave it as is
				// The user can fix it
			}
		}
	};

	const handleSubmit = async (values: typeof form.values) => {
		try {
			if (isEditMode && config) {
				await updateMutation.mutateAsync({
					name: config.name,
					data: {
						description: values.description,
						value: values.value,
						type: values.type,
					},
				});
				notifications.show({
					title: t('form.notifications.updateSuccessTitle'),
					message: t('form.notifications.updateSuccessMessage'),
					color: 'green',
				});
			} else {
				await createMutation.mutateAsync({
					name: values.name,
					description: values.description,
					value: values.value,
					type: values.type,
				});
				notifications.show({
					title: t('form.notifications.createSuccessTitle'),
					message: t('form.notifications.createSuccessMessage'),
					color: 'green',
				});
			}
			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('form.notifications.errorTitle'),
				message: t('form.notifications.errorMessage', {
					action: isEditMode ? 'update' : 'create',
				}),
				color: 'red',
			});
		}
	};

	const configTypes = [
		{
			value: 'string',
			label: t('form.fields.type.options.string'),
		},
		{
			value: 'number',
			label: t('form.fields.type.options.number'),
		},
		{
			value: 'boolean',
			label: t('form.fields.type.options.boolean'),
		},
		{
			value: 'json',
			label: t('form.fields.type.options.json'),
		},
		{
			value: 'array',
			label: t('form.fields.type.options.array'),
		},
	];

	return (
		<div className={styles.formWrapper}>
			<div className={styles.container}>
				{/* Left Side - Common Inputs */}
				<div className={styles.well}>
					<div className={styles.sectionHeader}>
						<h3 className={styles.sectionTitle}>{t('form.details.title')}</h3>
						<p className={styles.sectionDescription}>
							{t('form.details.description')}
						</p>
					</div>

					<TextInput
						label={t('form.fields.name.label')}
						placeholder={t('form.fields.name.placeholder')}
						required
						disabled={isEditMode}
						description={
							isEditMode
								? t('form.fields.name.descriptionEdit')
								: t('form.fields.name.descriptionCreate')
						}
						{...form.getInputProps('name')}
						onChange={(event) => {
							const name = event.currentTarget.value;
							form.setFieldValue('name', name);
							if (isSlaConfig(name)) {
								form.setFieldValue('type', 'number');
								if (!form.values.description) {
									form.setFieldValue('description', SLA_CONFIG_DESCRIPTION);
								}
							}
						}}
						className={styles.input}
						radius='sm'
						size='sm'
					/>

					<Textarea
						label={t('form.fields.description.label')}
						placeholder={t('form.fields.description.placeholder')}
						required
						autosize={false}
						minRows={9}
						rows={9}
						{...form.getInputProps('description')}
						className={styles.descriptionTextarea}
						radius='sm'
						size='sm'
					/>

					<Select
						label={t('form.fields.type.label')}
						placeholder={t('form.fields.type.placeholder')}
						required
						data={configTypes}
						{...form.getInputProps('type')}
						disabled={isSlaConfig(form.values.name)}
						className={styles.input}
						radius='sm'
						size='sm'
					/>
				</div>

				{/* Right Side - Textarea */}
				<div className={styles.well}>
					<div className={styles.sectionHeader}>
						<h3 className={styles.sectionTitle}>{t('form.value.title')}</h3>
						<p className={styles.sectionDescription}>
							{form.values.type === 'json' || form.values.type === 'array'
								? t('form.value.descriptionJson')
								: t('form.value.descriptionDefault')}
						</p>
					</div>

					{isSlaConfig(form.values.name) ? (
						<Select
							label={t('form.fields.value.label')}
							placeholder={t('form.fields.value.placeholderSla')}
							data={SLA_TARGET_OPTIONS.map((value) => ({
								value,
								label: t('form.fields.value.minutesOption', { value }),
							}))}
							{...form.getInputProps('value')}
							allowDeselect={false}
							size='sm'
						/>
					) : (
						<Textarea
							label={t('form.fields.value.label')}
							placeholder={
								form.values.type === 'json' || form.values.type === 'array'
									? t('form.fields.value.placeholderJson')
									: t('form.fields.value.placeholderDefault')
							}
							required
							autosize
							minRows={8}
							maxRows={20}
							{...form.getInputProps('value')}
							onBlur={(e) => {
								form.getInputProps('value').onBlur?.(e);
								handleValueBlur();
							}}
							className={styles.valueTextarea}
							radius='sm'
							size='sm'
						/>
					)}
				</div>
			</div>

			<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
				<Group justify='flex-end' gap='xs' className={styles.actions}>
					<Button variant='light' onClick={onCancel} size='sm' radius='sm'>
						{t('form.actions.cancel')}
					</Button>
					<Button
						type='submit'
						loading={createMutation.isPending || updateMutation.isPending}
						size='sm'
						radius='sm'
					>
						{isEditMode ? t('form.actions.update') : t('form.actions.create')}
					</Button>
				</Group>
			</form>
		</div>
	);
}
