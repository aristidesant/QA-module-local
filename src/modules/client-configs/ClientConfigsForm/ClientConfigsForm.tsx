import { useEffect } from 'react';
import { TextInput, Textarea, Button, Group, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	useCreateClientConfig,
	useUpdateClientConfig,
} from '~/queries/useClientConfigs';
import type { ClientConfig } from '~/models/ClientConfig';

import styles from './ClientConfigsForm.module.css';

interface ClientConfigsFormProps {
	config?: ClientConfig;
	onSuccess: () => void;
	onCancel: () => void;
}

const CONFIG_TYPES = [
	{ value: 'string', label: 'String' },
	{ value: 'number', label: 'Number' },
	{ value: 'boolean', label: 'Boolean' },
	{ value: 'json', label: 'JSON' },
	{ value: 'array', label: 'Array' },
];

export function ClientConfigsForm({
	config,
	onSuccess,
	onCancel,
}: ClientConfigsFormProps) {
	const isEditMode = !!config;

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
				if (!value) return 'Name is required';
				if (isEditMode) return null; // Name can't be changed in edit mode
				if (!/^[a-z0-9_]+$/.test(value)) {
					return 'Name must contain only lowercase letters, numbers, and underscores';
				}
				return null;
			},
			description: (value) => (!value ? 'Description is required' : null),
			value: (value, values) => {
				if (!value) return 'Value is required';

				// Validate JSON/array types
				if (values.type === 'json' || values.type === 'array') {
					try {
						JSON.parse(value);
					} catch (error) {
						return 'Invalid JSON format';
					}
				}

				return null;
			},
			type: (value) => (!value ? 'Type is required' : null),
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
					title: 'Success',
					message: 'Configuration updated successfully',
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
					title: 'Success',
					message: 'Configuration created successfully',
					color: 'green',
				});
			}
			onSuccess();
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: `Failed to ${isEditMode ? 'update' : 'create'} configuration`,
				color: 'red',
			});
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<TextInput
				label='Name'
				placeholder='contact_columns'
				required
				disabled={isEditMode}
				description={
					isEditMode
						? 'Name cannot be changed'
						: 'Use lowercase letters, numbers, and underscores only'
				}
				{...form.getInputProps('name')}
				className={styles.input}
			/>

			<TextInput
				label='Description'
				placeholder='Contact columns mapping for CSV imports'
				required
				{...form.getInputProps('description')}
				className={styles.input}
			/>

			<Select
				label='Type'
				placeholder='Select type'
				required
				data={CONFIG_TYPES}
				{...form.getInputProps('type')}
				className={styles.input}
			/>

			<Textarea
				label='Value'
				placeholder={
					form.values.type === 'json' || form.values.type === 'array'
						? '{"key": "value"}'
						: 'Enter configuration value'
				}
				description={
					form.values.type === 'json' || form.values.type === 'array'
						? 'Enter valid JSON. It will be auto-formatted on blur.'
						: 'Enter the configuration value'
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
			/>

			<Group justify='flex-end' mt='md' className={styles.actions}>
				<Button variant='subtle' onClick={onCancel}>
					Cancel
				</Button>
				<Button
					type='submit'
					loading={createMutation.isPending || updateMutation.isPending}
					className={styles.submitButton}
				>
					{isEditMode ? 'Update' : 'Create'}
				</Button>
			</Group>
		</form>
	);
}
