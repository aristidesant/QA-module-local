import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';
import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Loader,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	IconArrowLeft,
	IconEdit,
	IconFileExport,
	IconTemplate,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import SectionCard from '~/components/SectionCard';
import {
	useGetReportTemplate,
	useUpdateReportTemplate,
	useExportReportTemplate,
} from '~/queries/reportTemplatesQueries';
import { useGetCampaignContactSchemas } from '~/queries/campaignContactSchemasQueries';
import type { UpdateReportTemplateDto } from '~/models/ReportValue';
import { downloadReportTemplateExport } from '../reportTemplateExport';
import ReportTemplateColumns from '../ReportTemplateColumns';
import CampaignPickerModal, {
	type ExportData,
} from '../components/CampaignPickerModal';
import styles from './ReportTemplateDetailPage.module.css';

const ReportTemplateDetailPage = () => {
	const { t } = useTranslation('report-templates');
	const { reportTemplateId } = useParams<{ reportTemplateId: string }>();
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const [exportModalOpened, setExportModalOpened] = useState(false);

	const templateId = reportTemplateId ? Number(reportTemplateId) : 0;
	const {
		data: template,
		isLoading,
		refetch,
	} = useGetReportTemplate(templateId);
	const updateMutation = useUpdateReportTemplate(templateId);
	const exportMutation = useExportReportTemplate();

	const { data: schemasResponse } = useGetCampaignContactSchemas({
		limit: 1000,
	});
	const schemas = schemasResponse?.data ?? [];
	const schemaOptions = schemas.map((s) => ({
		value: String(s.id),
		label: s.name,
	}));

	const editForm = useForm<UpdateReportTemplateDto>({
		initialValues: {
			name: '',
			description: '',
			schemaId: undefined,
		},
		validate: {
			name: (value) =>
				!value?.trim() ? t('form.validation.nameRequired') : null,
		},
	});

	const handleStartEdit = () => {
		if (!template) return;
		editForm.setValues({
			name: template.name,
			description: template.description ?? '',
			schemaId: template.schemaId ?? undefined,
		});
		editForm.resetDirty();
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		editForm.reset();
	};

	const handleSaveEdit = async (data: UpdateReportTemplateDto) => {
		await updateMutation.mutateAsync(data);
		notifications.show({
			message: t('detail.notifications.updated'),
			color: 'green',
		});
		await refetch();
		setIsEditing(false);
	};

	const handleExport = async (data: ExportData) => {
		const response = await exportMutation.mutateAsync({
			templateId,
			dto: data,
		});
		downloadReportTemplateExport(response.data, template?.name, data.format);
		notifications.show({
			message: t('list.notifications.exportStarted'),
			color: 'green',
		});
	};

	if (isLoading) {
		return (
			<Stack align='center' justify='center' className={styles.centerState}>
				<Loader size='lg' />
			</Stack>
		);
	}

	if (!template) {
		return (
			<Stack align='center' justify='center' className={styles.centerState}>
				<Text c='dimmed'>{t('detail.notFound')}</Text>
				<Button variant='default' onClick={() => navigate('/report-templates')}>
					{t('detail.backToList')}
				</Button>
			</Stack>
		);
	}

	return (
		<>
			<Stack gap='md'>
				<Group justify='space-between'>
					<Button
						variant='subtle'
						leftSection={<IconArrowLeft size={16} />}
						onClick={() => navigate('/report-templates')}
					>
						{t('detail.backToList')}
					</Button>
					<Button
						variant='default'
						leftSection={<IconFileExport size={16} />}
						onClick={() => setExportModalOpened(true)}
					>
						{t('detail.export')}
					</Button>
				</Group>

				{isEditing ? (
					<SectionCard icon={IconTemplate} title={t('detail.editingTitle')}>
						<form onSubmit={editForm.onSubmit(handleSaveEdit)}>
							<Stack gap='md'>
								<TextInput
									label={t('form.name')}
									placeholder={t('form.namePlaceholder')}
									{...editForm.getInputProps('name')}
									required
								/>
								<Textarea
									label={t('form.description')}
									placeholder={t('form.descriptionPlaceholder')}
									{...editForm.getInputProps('description')}
									autosize
									minRows={2}
								/>
								<Select
									label={t('form.schemaId')}
									placeholder={t('form.schemaIdPlaceholder')}
									description={t('form.schemaIdDescription')}
									data={schemaOptions}
									value={
										editForm.values.schemaId
											? String(editForm.values.schemaId)
											: null
									}
									onChange={(value) =>
										editForm.setFieldValue(
											'schemaId',
											value ? Number(value) : undefined
										)
									}
									error={editForm.errors.schemaId}
									clearable
									searchable
								/>
								<Group justify='flex-end' gap='xs'>
									<Button
										variant='default'
										size='sm'
										onClick={handleCancelEdit}
										disabled={updateMutation.isPending}
									>
										{t('detail.cancelEdit')}
									</Button>
									<Button
										type='submit'
										size='sm'
										loading={updateMutation.isPending}
									>
										{t('detail.saveMetadata')}
									</Button>
								</Group>
							</Stack>
						</form>
					</SectionCard>
				) : (
					<SectionCard
						icon={IconTemplate}
						title={template.name}
						description={template.description || t('description')}
						headerActions={
							<ActionIcon
								variant='subtle'
								color='gray'
								size='sm'
								onClick={handleStartEdit}
								aria-label={t('detail.editMetadataAriaLabel')}
							>
								<IconEdit size={14} />
							</ActionIcon>
						}
					>
						<Stack gap='xs'>
							{template.schemaId && (
								<Group gap='xs'>
									<Text size='sm' fw={600}>
										{t('detail.schemaLabel')}:
									</Text>
									<Badge variant='light' size='sm'>
										#{template.schemaId}
									</Badge>
								</Group>
							)}
						</Stack>
					</SectionCard>
				)}

				<ReportTemplateColumns templateId={templateId} />
			</Stack>

			<CampaignPickerModal
				opened={exportModalOpened}
				onClose={() => setExportModalOpened(false)}
				templateId={templateId}
				templateSchemaId={template.schemaId}
				onSubmit={handleExport}
				isSubmitting={exportMutation.isPending}
			/>
		</>
	);
};

export default ReportTemplateDetailPage;
