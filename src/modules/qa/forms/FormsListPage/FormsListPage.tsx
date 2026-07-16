import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Group,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
	IconAlertTriangle,
	IconDownload,
	IconEdit,
	IconFileDescription,
	IconFileImport,
	IconPlus,
	IconSearch,
	IconTags,
	IconTrash,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import PaginationControls from '~/components/PaginationControls';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { getActiveStatusColor } from '~/modules/qa/constants/badgeColors';
import { useListPageState } from '~/modules/qa/hooks/useListPageState';
import type { CreateFormPayload, QaForm } from '~/models/qa';
import {
	formsQueryKey,
	useCreateFormMutation,
	useDeleteFormMutation,
	useFormTemplateQuery,
	useFormsQuery,
	useImportFormTemplateMutation,
} from '~/queries/qa/formsQueries';
import { queryClient } from '~/queries/queryClient';
import { useQuestionErrorTypesQuery } from '~/queries/qa/questionErrorTypesQueries';
import { getErrorMessage } from '~/utils/httpClient';
import { notifyError, notifySuccess } from '~/modules/qa/utils/notifications';
import {
	getInvalidErrorTypeAssignment,
	isFormTemplate,
	isRecord,
} from './FormsListPage.helpers';
import type { ImportTemplateFormValues } from './FormsListPage.types';
import classes from './FormsListPage.module.css';
import CreateFormModal from './components/CreateFormModal';
import ImportTemplateModal from './components/ImportTemplateModal';

export default function FormsListPage() {
	const { t } = useTranslation('qa.forms');
	const navigate = useNavigate();
	const { page, setPage, setPageSize, limit, offset, getTotalPages } =
		useListPageState();
	const formsQuery = useFormsQuery({
		pagination: true,
		limit,
		offset,
	});
	const createFormMutation = useCreateFormMutation();
	const deleteFormMutation = useDeleteFormMutation();
	const formTemplateQuery = useFormTemplateQuery();
	const importFormTemplateMutation = useImportFormTemplateMutation();
	const errorTypesQuery = useQuestionErrorTypesQuery({ pagination: false });
	const [createOpen, setCreateOpen] = useState(false);
	const [importOpen, setImportOpen] = useState(false);
	const [search, setSearch] = useState('');
	const activeErrorTypeIds = useMemo(
		() =>
			new Set(
				(errorTypesQuery.data?.data ?? [])
					.filter((errorType) => errorType.isActive)
					.map((errorType) => errorType.id)
			),
		[errorTypesQuery.data]
	);
	const createFormForm = useForm<CreateFormPayload>({
		initialValues: {
			name: '',
			description: '',
			category: '',
			isActive: true,
		},
		validate: {
			name: (value) =>
				value.trim().length === 0 ? t('validation.nameRequired') : null,
		},
	});
	const importTemplateForm = useForm<ImportTemplateFormValues>({
		initialValues: {
			templateFile: null,
			templateJson: '',
		},
		validate: {
			templateJson: (value) => {
				const trimmedValue = value.trim();

				if (!trimmedValue) {
					return t('validation.templateRequired');
				}

				try {
					const parsed: unknown = JSON.parse(trimmedValue);

					if (!isRecord(parsed)) {
						return t('validation.templateObject');
					}

					if (!isFormTemplate(parsed)) return t('validation.templateShape');
					if (errorTypesQuery.isLoading) return null;

					const invalidAssignment = getInvalidErrorTypeAssignment(
						parsed,
						activeErrorTypeIds
					);

					return invalidAssignment
						? t('validation.templateErrorType', invalidAssignment)
						: null;
				} catch {
					return t('validation.templateJson');
				}
			},
		},
	});

	const filteredForms = useMemo(() => {
		const forms = formsQuery.data?.data ?? [];
		const query = search.trim().toLowerCase();

		if (!query) {
			return forms;
		}

		return forms.filter((form) =>
			[form.name, form.description, form.category]
				.filter(Boolean)
				.some((value) => String(value).toLowerCase().includes(query))
		);
	}, [formsQuery.data?.data, search]);
	const total = formsQuery.data?.total ?? 0;
	const totalPages = getTotalPages(total);

	const closeCreateModal = () => {
		createFormForm.reset();
		setCreateOpen(false);
	};

	const closeImportModal = () => {
		importTemplateForm.reset();
		setImportOpen(false);
	};

	const readTemplateFile = async (file: File | null) => {
		importTemplateForm.setFieldValue('templateFile', file);

		if (!file) {
			return;
		}

		try {
			const fileContent = await file.text();
			importTemplateForm.setFieldValue('templateJson', fileContent);
			importTemplateForm.clearFieldError('templateJson');
		} catch (error) {
			notifyError(error);
		}
	};

	const downloadTemplate = async () => {
		try {
			const templateResult = await formTemplateQuery.refetch();

			if (!templateResult.data) {
				throw new Error(t('template.downloadEmpty'));
			}

			const blob = new Blob([JSON.stringify(templateResult.data, null, 2)], {
				type: 'application/json',
			});
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement('a');

			anchor.href = url;
			anchor.download = 'qa-form-template.json';
			anchor.click();
			URL.revokeObjectURL(url);
			notifySuccess(t('notifications.templateDownloaded'));
		} catch (error) {
			notifyError(error);
		}
	};

	const submitCreateForm = createFormForm.onSubmit(async (values) => {
		try {
			await createFormMutation.mutateAsync({
				name: values.name.trim(),
				description: values.description?.trim() || undefined,
				category: values.category?.trim() || undefined,
				isActive: values.isActive,
			});
			await queryClient.invalidateQueries({ queryKey: formsQueryKey });
			notifySuccess(t('notifications.formCreated'));
			closeCreateModal();
		} catch (error) {
			notifyError(error);
		}
	});

	const submitImportTemplate = importTemplateForm.onSubmit(async (values) => {
		let parsedTemplate: unknown;

		try {
			parsedTemplate = JSON.parse(values.templateJson.trim());
		} catch {
			importTemplateForm.setFieldError(
				'templateJson',
				t('validation.templateJson')
			);
			return;
		}

		if (!isRecord(parsedTemplate)) {
			importTemplateForm.setFieldError(
				'templateJson',
				t('validation.templateObject')
			);
			return;
		}

		if (!isFormTemplate(parsedTemplate)) {
			importTemplateForm.setFieldError(
				'templateJson',
				t('validation.templateShape')
			);
			return;
		}

		const invalidAssignment = getInvalidErrorTypeAssignment(
			parsedTemplate,
			activeErrorTypeIds
		);

		if (invalidAssignment) {
			importTemplateForm.setFieldError(
				'templateJson',
				t('validation.templateErrorType', invalidAssignment)
			);
			return;
		}

		try {
			const response =
				await importFormTemplateMutation.mutateAsync(parsedTemplate);
			await queryClient.invalidateQueries({ queryKey: formsQueryKey });
			notifySuccess(t('notifications.templateImported'));
			closeImportModal();
			navigate(`/qa/forms/${response.form.id}`);
		} catch (error) {
			notifyError(error);
		}
	});

	const confirmDeleteForm = (form: QaForm) => {
		modals.openConfirmModal({
			title: t('actions.delete'),
			centered: true,
			labels: { confirm: t('actions.delete'), cancel: t('actions.cancel') },
			confirmProps: { color: 'red' },
			children: (
				<Text size='sm'>{t('states.deleteConfirm', { name: form.name })}</Text>
			),
			onConfirm: async () => {
				try {
					await deleteFormMutation.mutateAsync(form.id);
					await queryClient.invalidateQueries({ queryKey: formsQueryKey });
					notifySuccess(t('notifications.formDeleted'));
				} catch (error) {
					notifyError(error);
				}
			},
		});
	};

	const columns: BaseTableColumnDef<QaForm>[] = [
		{
			id: 'name',
			header: t('table.name'),
			enableSorting: false,
			cell: ({ row: { original: form } }) => (
				<Stack gap={2}>
					<Text fw={700} size='sm'>
						{form.name}
					</Text>
					<Text c='dimmed' size='xs'>
						{form.description || t('table.noDescription')}
					</Text>
				</Stack>
			),
		},
		{
			id: 'category',
			header: t('table.category'),
			enableSorting: false,
			cell: ({ row: { original: form } }) => (
				<Badge color='blue' variant='light'>
					{form.category || t('table.noCategory')}
				</Badge>
			),
		},
		{
			id: 'status',
			header: t('table.status'),
			enableSorting: false,
			cell: ({ row: { original: form } }) => (
				<Badge color={getActiveStatusColor(form.isActive)} variant='light'>
					{form.isActive ? t('status.active') : t('status.inactive')}
				</Badge>
			),
		},
		{
			id: 'actions',
			header: t('table.actions'),
			enableSorting: false,
			cell: ({ row: { original: form } }) => (
				<Group
					className={classes.actions}
					gap='xs'
					justify='flex-end'
					wrap='nowrap'
				>
					<Tooltip label={t('actions.edit')}>
						<ActionIcon
							aria-label={t('actions.edit')}
							component={RouterLink}
							radius='md'
							to={`/qa/forms/${form.id}`}
							variant='light'
						>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('actions.delete')}>
						<ActionIcon
							aria-label={t('actions.delete')}
							color='red'
							onClick={() => confirmDeleteForm(form)}
							radius='md'
							variant='subtle'
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			),
		},
	];

	return (
		<>
			<CreateFormModal
				form={createFormForm}
				onClose={closeCreateModal}
				onSubmit={submitCreateForm}
				opened={createOpen}
				saving={createFormMutation.isPending}
			/>

			<ImportTemplateModal
				errorTypesError={errorTypesQuery.isError}
				errorTypesLoading={errorTypesQuery.isLoading}
				form={importTemplateForm}
				importing={importFormTemplateMutation.isPending}
				onClose={closeImportModal}
				onFileChange={(file) => {
					void readTemplateFile(file);
				}}
				onSubmit={submitImportTemplate}
				opened={importOpen}
			/>

			<ContentContainer
				contentWidth='full'
				description={t('description')}
				title={t('title')}
				titleRight={
					<>
						<Button
							component={RouterLink}
							leftSection={<IconTags size={16} />}
							size='sm'
							to='/qa/forms/error-types'
							variant='light'
						>
							{t('errorTypes.actions.manage')}
						</Button>
						<Button
							leftSection={<IconDownload size={16} />}
							loading={formTemplateQuery.isFetching}
							onClick={() => {
								void downloadTemplate();
							}}
							size='sm'
							variant='light'
						>
							{t('template.download')}
						</Button>
						<Button
							leftSection={<IconFileImport size={16} />}
							onClick={() => setImportOpen(true)}
							size='sm'
							variant='light'
						>
							{t('template.import')}
						</Button>
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={() => setCreateOpen(true)}
							size='sm'
						>
							{t('actions.create')}
						</Button>
					</>
				}
			>
				<Stack gap='md'>
					<SectionCard>
						<Stack gap='sm'>
							<Group className={classes.toolbar} justify='space-between'>
								<TextInput
									leftSection={<IconSearch size={16} />}
									onChange={(event) => setSearch(event.currentTarget.value)}
									placeholder={t('search.placeholder')}
									size='sm'
									value={search}
								/>
								<Text c='dimmed' size='sm'>
									{t('search.count', { count: total })}
								</Text>
							</Group>

							{formsQuery.isError ? (
								<Alert
									color='red'
									icon={<IconAlertTriangle size={16} />}
									title={t('states.errorTitle')}
									variant='light'
								>
									{getErrorMessage(formsQuery.error)}
								</Alert>
							) : (
								<>
									{!formsQuery.isLoading && filteredForms.length === 0 ? (
										<EmptyState
											action={
												<Button
													leftSection={<IconPlus size={16} />}
													onClick={() => setCreateOpen(true)}
													size='sm'
													variant='light'
												>
													{t('actions.create')}
												</Button>
											}
											description={t('states.emptyDescription')}
											icon={<IconFileDescription size={32} />}
											message={t('states.emptyTitle')}
										/>
									) : (
										<>
											<BaseTable<QaForm>
												columns={columns}
												data={filteredForms}
												getRowId={(form) => String(form.id)}
												isLoading={formsQuery.isLoading}
												skeletonRowsCount={Math.min(limit, 10)}
											/>
											{!formsQuery.isLoading && total > 0 ? (
												<PaginationControls
													currentPage={page}
													itemsPerPage={limit}
													onItemsPerPageChange={(value) => {
														if (value) {
															setPageSize(value);
														}
													}}
													onPageChange={setPage}
													totalItems={total}
													totalPages={totalPages}
												/>
											) : null}
										</>
									)}
								</>
							)}
						</Stack>
					</SectionCard>
				</Stack>
			</ContentContainer>
		</>
	);
}
