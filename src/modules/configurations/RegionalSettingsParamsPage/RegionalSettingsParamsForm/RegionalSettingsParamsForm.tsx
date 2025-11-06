import { useEffect } from 'react';
import {
	TextInput,
	Button,
	Group,
	Stack,
	Text as MantineText,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconGlobe } from '@tabler/icons-react';
import { useUpdateClientConfig } from '~/queries/useClientConfigs';
import type { RegionalSettings } from '~/models/RegionalSettingsParam';
import type { ClientConfig } from '~/models/ClientConfig';
import RightSectionCard from '~/components/RightSectionCard/RightSectionCard';
import styles from './RegionalSettingsParamsForm.module.css';

interface RegionalSettingsParamsFormProps {
	regionalSettings: RegionalSettings;
	config: ClientConfig | undefined;
	onCancel?: () => void;
}

const RegionalSettingsParamsForm: React.FC<RegionalSettingsParamsFormProps> = ({
	regionalSettings,
	config,
	onCancel,
}) => {
	const updateMutation = useUpdateClientConfig();

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

			await updateMutation.mutateAsync({
				name: config.name,
				data: {
					description: config.description,
					value: JSON.stringify(newSettings),
					type: config.type,
				},
			});

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
			<RightSectionCard
				title='Edit Regional Settings'
				icon={IconGlobe}
				iconColor='var(--mantine-color-blue-6)'
			>
				<Stack gap='lg'>
					<div className={styles.sectionHeading}>
						<MantineText className={styles.sectionTitle}>
							Regional Configuration
						</MantineText>
						<MantineText className={styles.sectionDescription}>
							Configure timezone and locale for the application.
						</MantineText>
					</div>

					<TextInput
						label='Timezone'
						placeholder='e.g., America/Santo_Domingo'
						required
						{...form.getInputProps('timezone')}
						description='IANA timezone identifier'
					/>

					<TextInput
						label='Locale'
						placeholder='e.g., es-DO'
						required
						{...form.getInputProps('locale')}
						description='BCP 47 language tag'
					/>
				</Stack>
			</RightSectionCard>

			<Group justify='space-between' mt='md' className={styles.actions}>
				<Group justify='flex-end' className={styles.actionsRight}>
					<Button variant='light' onClick={onCancel}>
						Cancel
					</Button>
					<Button type='submit' loading={updateMutation.isPending}>
						Update Settings
					</Button>
				</Group>
			</Group>
		</form>
	);
};

export default RegionalSettingsParamsForm;
