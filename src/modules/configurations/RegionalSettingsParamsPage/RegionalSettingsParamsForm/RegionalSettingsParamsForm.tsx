import { useEffect } from 'react';
import {
	TextInput,
	Button,
	Group,
	Stack,
	Text as MantineText,
} from '@mantine/core';
import { IconClock, IconLanguage, IconSettings2 } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	useUpdateClientConfig,
	useCreateClientConfig,
} from '~/queries/useClientConfigs';
import type { RegionalSettings } from '~/models/RegionalSettingsParam';
import type { ClientConfig } from '~/models/ClientConfig';
import styles from './RegionalSettingsParamsForm.module.css';

interface RegionalSettingsParamsFormProps {
	regionalSettings: RegionalSettings;
	config: ClientConfig | undefined;
	onCancel?: () => void;
	saveStrategy?: 'create' | 'update';
	canSubmit?: boolean;
}

const RegionalSettingsParamsForm: React.FC<RegionalSettingsParamsFormProps> = ({
	regionalSettings,
	config,
	onCancel,
	saveStrategy = 'update',
	canSubmit = true,
}) => {
	const updateMutation = useUpdateClientConfig();
	const createMutation = useCreateClientConfig();

	const form = useForm({
		initialValues: {
			timezone: regionalSettings.timezone,
			locale: regionalSettings.locale,
		},
		validate: {
			timezone: (value: string) => (!value ? 'Timezone is required' : null),
			locale: (value: string) => (!value ? 'Locale is required' : null),
		},
	});

	useEffect(() => {
		form.setValues({
			timezone: regionalSettings.timezone,
			locale: regionalSettings.locale,
		});
	}, [regionalSettings]);

	const handleSubmit = async (values: typeof form.values) => {
		if (!config) {
			notifications.show({
				title: 'Error',
				message: 'Configuration not found',
				color: 'red',
			});
			return;
		}

		try {
			const newSettings: RegionalSettings = {
				timezone: values.timezone,
				locale: values.locale,
			};

			if (saveStrategy === 'create') {
				await createMutation.mutateAsync({
					name: config.name,
					description: config.description,
					value: JSON.stringify(newSettings),
					type: config.type,
				});
			} else {
				await updateMutation.mutateAsync({
					name: config.name,
					data: {
						description: config.description,
						value: JSON.stringify(newSettings),
						type: config.type,
					},
				});
			}

			notifications.show({
				title: 'Success',
				message: 'Regional settings updated successfully',
				color: 'green',
			});

			onCancel?.();
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'Failed to update regional settings',
				color: 'red',
			});
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<Stack gap='md'>
				<div className={styles.sectionHeading}>
					<div className={styles.sectionIcon}>
						<IconSettings2 size={16} />
					</div>
					<div className={styles.sectionText}>
						<MantineText className={styles.sectionTitle}>
							Regional Configuration
						</MantineText>
						<MantineText className={styles.sectionDescription}>
							Timezone and locale used to format dates, currencies, and
							schedules.
						</MantineText>
					</div>
				</div>

				<TextInput
					label='Timezone'
					placeholder='e.g., America/Santo_Domingo'
					required
					size='sm'
					leftSection={<IconClock size={15} />}
					{...form.getInputProps('timezone')}
					description='IANA timezone identifier'
				/>

				<TextInput
					label='Locale'
					placeholder='e.g., es-DO'
					required
					size='sm'
					leftSection={<IconLanguage size={15} />}
					{...form.getInputProps('locale')}
					description='BCP 47 language tag'
				/>
			</Stack>

			<Group justify='flex-end' mt='lg' className={styles.actions}>
				<Button variant='default' size='sm' onClick={onCancel}>
					Cancel
				</Button>
				{canSubmit && (
					<Button
						type='submit'
						size='sm'
						loading={updateMutation.isPending || createMutation.isPending}
					>
						{saveStrategy === 'create' ? 'Create Settings' : 'Update Settings'}
					</Button>
				)}
			</Group>
		</form>
	);
};

export default RegionalSettingsParamsForm;
