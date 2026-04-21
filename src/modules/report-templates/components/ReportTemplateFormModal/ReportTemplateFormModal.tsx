import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Stack, TextInput, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import type {
	ReportTemplate,
	CreateReportTemplateDto,
} from '~/models/ReportValue';
import { getErrorMessage } from '~/utils/httpClient';
import { useGetCampaignContactSchemas } from '~/queries/campaignContactSchemasQueries';

interface ReportTemplateFormModalProps {
	opened: boolean;
	onClose: () => void;
	template?: ReportTemplate;
	onSubmit: (data: CreateReportTemplateDto) => Promise<void>;
	isSubmitting?: boolean;
}

const ReportTemplateFormModal = ({
	opened,
	onClose,
	template,
	onSubmit,
	isSubmitting = false,
}: ReportTemplateFormModalProps) => {
	const { t } = useTranslation('report-templates');

	const { data: schemasResponse } = useGetCampaignContactSchemas({
		limit: 1000,
	});
	const schemas = schemasResponse?.data || [];

	const schemaOptions = schemas.map((schema) => ({
		value: String(schema.id),
		label: schema.name,
	}));

	const form = useForm<CreateReportTemplateDto>({
		initialValues: {
			name: '',
			description: '',
			schemaId: undefined,
		},
		validate: {
			name: (value) =>
				!value.trim() ? t('form.validation.nameRequired') : null,
		},
	});

	useEffect(() => {
		if (opened) {
			if (template) {
				form.setValues({
					name: template.name,
					description: template.description || '',
					schemaId: template.schemaId || undefined,
				});
			} else {
				form.setValues({
					name: '',
					description: '',
					schemaId: undefined,
				});
			}
			form.resetDirty();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened, template]);

	const handleSubmit = async (values: CreateReportTemplateDto) => {
		try {
			await onSubmit(values);
			onClose();
			form.reset();
		} catch (error) {
			notifications.show({
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				template ? t('form.editTemplateTitle') : t('form.createTemplateTitle')
			}
			size='md'
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='md'>
					<TextInput
						label={t('form.name')}
						placeholder={t('form.namePlaceholder')}
						value={form.values.name}
						onChange={(event) =>
							form.setFieldValue('name', event.currentTarget.value)
						}
						error={form.errors.name}
						required
					/>

					<TextInput
						label={t('form.description')}
						placeholder={t('form.descriptionPlaceholder')}
						value={form.values.description}
						onChange={(event) =>
							form.setFieldValue('description', event.currentTarget.value)
						}
						error={form.errors.description}
					/>

					<Select
						label={t('form.schemaId')}
						placeholder={t('form.schemaIdPlaceholder')}
						data={schemaOptions}
						value={form.values.schemaId ? String(form.values.schemaId) : null}
						onChange={(value) =>
							form.setFieldValue('schemaId', value ? Number(value) : undefined)
						}
						error={form.errors.schemaId}
						description={t('form.schemaIdDescription')}
						clearable
						searchable
					/>

					<Button type='submit' fullWidth mt='xl' loading={isSubmitting}>
						{t(template ? 'actions.save' : 'actions.create')}
					</Button>
				</Stack>
			</form>
		</Modal>
	);
};

export default ReportTemplateFormModal;
