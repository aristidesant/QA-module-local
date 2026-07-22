import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Group,
	Pagination,
	Select,
	Skeleton,
	Stack,
	Switch,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
	IconAlertTriangle,
	IconEdit,
	IconPlus,
	IconTags,
	IconTrash,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { getActiveStatusColor } from '~/modules/qa/constants/badgeColors';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { useListPageState } from '~/modules/qa/hooks/useListPageState';
import type {
	CreateFormQuestionErrorTypePayload,
	FormQuestionErrorType,
} from '~/models/qa';
import {
	useCreateQuestionErrorTypeMutation,
	useDeleteQuestionErrorTypeMutation,
	useQuestionErrorTypesQuery,
	useUpdateQuestionErrorTypeMutation,
} from '~/queries/qa/questionErrorTypesQueries';
import { getErrorMessage } from '~/utils/httpClient';
import { notifyError, notifySuccess } from '~/modules/qa/utils/notifications';
import { isDuplicateCodeError } from './ErrorTypesPage.helpers';
import type { ErrorTypeFormValues, StatusFilter } from './ErrorTypesPage.types';
import classes from './ErrorTypesPage.module.css';
import ErrorTypeFormModal from './components/ErrorTypeFormModal';

export default function ErrorTypesPage() {
	const { t } = useTranslation('qa.forms');
	const navigate = useNavigate();
	const errorTypesQuery = useQuestionErrorTypesQuery({ pagination: false });
	const createMutation = useCreateQuestionErrorTypeMutation();
	const [editingErrorType, setEditingErrorType] =
		useState<FormQuestionErrorType | null>(null);
	const updateMutation = useUpdateQuestionErrorTypeMutation(
		editingErrorType?.id ?? NaN
	);
	const deleteMutation = useDeleteQuestionErrorTypeMutation();
	const [createOpen, setCreateOpen] = useState(false);
	const [codeFilter, setCodeFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
	const {
		page,
		setPage,
		pageSize,
		setPageSize,
		limit,
		resetPage,
		getTotalPages,
	} = useListPageState();
	const [showAll, setShowAll] = useState(false);
	const form = useForm<ErrorTypeFormValues>({
		initialValues: {
			code: '',
			label: '',
			description: '',
			isActive: true,
		},
		validate: {
			code: (value) => {
				const normalized = value.trim();

				if (!normalized) return t('errorTypes.validation.codeRequired');
				if (normalized.length > 50)
					return t('errorTypes.validation.maxLength', { count: 50 });

				return /^[A-Z0-9_]+$/.test(normalized)
					? null
					: t('errorTypes.validation.codeFormat');
			},
			label: (value) => {
				const normalized = value.trim();

				if (!normalized) return t('errorTypes.validation.labelRequired');

				return normalized.length <= 150
					? null
					: t('errorTypes.validation.maxLength', { count: 150 });
			},
			description: (value) =>
				value.trim().length <= 500
					? null
					: t('errorTypes.validation.maxLength', { count: 500 }),
		},
	});
	const dateFormatter = useDateFormatter('date');
	const filteredErrorTypes = useMemo(() => {
		const normalizedCode = codeFilter.trim().toUpperCase();

		return [...(errorTypesQuery.data?.data ?? [])]
			.filter(
				(errorType) => !normalizedCode || errorType.code === normalizedCode
			)
			.filter((errorType) => {
				if (statusFilter === 'ACTIVE') return errorType.isActive;
				if (statusFilter === 'INACTIVE') return !errorType.isActive;

				return true;
			})
			.sort((first, second) => first.code.localeCompare(second.code));
	}, [codeFilter, errorTypesQuery.data, statusFilter]);
	const totalPages = getTotalPages(filteredErrorTypes.length);
	const visibleErrorTypes = showAll
		? filteredErrorTypes
		: filteredErrorTypes.slice((page - 1) * limit, page * limit);

	useEffect(() => {
		if (page > totalPages) setPage(totalPages);
	}, [page, totalPages, setPage]);

	const resetForm = () => {
		form.setValues({
			code: '',
			label: '',
			description: '',
			isActive: true,
		});
		form.clearErrors();
	};

	const openCreate = () => {
		resetForm();
		setCreateOpen(true);
	};

	const openEdit = (errorType: FormQuestionErrorType) => {
		form.setValues({
			code: errorType.code,
			label: errorType.label,
			description: errorType.description ?? '',
			isActive: errorType.isActive,
		});
		form.clearErrors();
		setEditingErrorType(errorType);
	};

	const submitErrorType = form.onSubmit(async (values) => {
		const payload: CreateFormQuestionErrorTypePayload = {
			code: values.code.trim().toUpperCase(),
			label: values.label.trim(),
			description: values.description.trim() || undefined,
			isActive: values.isActive,
		};

		try {
			if (editingErrorType) {
				await updateMutation.mutateAsync({
					...payload,
					description: values.description.trim(),
				});
				setEditingErrorType(null);
				notifySuccess(t('errorTypes.notifications.updated'));
			} else {
				await createMutation.mutateAsync(payload);
				setCreateOpen(false);
				notifySuccess(t('errorTypes.notifications.created'));
			}
		} catch (error) {
			if (isDuplicateCodeError(error)) {
				form.setFieldError('code', t('errorTypes.validation.duplicate'));
				return;
			}

			notifyError(error);
		}
	});

	const confirmDeleteErrorType = (errorType: FormQuestionErrorType) => {
		modals.openConfirmModal({
			title: t('errorTypes.delete.title'),
			centered: true,
			labels: { confirm: t('actions.delete'), cancel: t('actions.cancel') },
			confirmProps: { color: 'red' },
			children: (
				<Stack gap='xs'>
					<Text size='sm'>
						{t('errorTypes.delete.description', { code: errorType.code })}
					</Text>
					<Text c='dimmed' size='xs'>
						{t('errorTypes.delete.hint')}
					</Text>
				</Stack>
			),
			onConfirm: async () => {
				try {
					await deleteMutation.mutateAsync(errorType.id);
					notifySuccess(t('errorTypes.notifications.deleted'));
				} catch (error) {
					notifyError(error);
				}
			},
		});
	};

	const columns: BaseTableColumnDef<FormQuestionErrorType>[] = [
		{
			id: 'code',
			enableSorting: false,
			header: t('errorTypes.table.code'),
			cell: ({ row: { original: errorType } }) => (
				<Text fw={700} size='sm'>
					{errorType.code}
				</Text>
			),
		},
		{
			id: 'label',
			enableSorting: false,
			header: t('errorTypes.table.label'),
			cell: ({ row: { original: errorType } }) => (
				<Text size='sm'>{errorType.label}</Text>
			),
		},
		{
			id: 'description',
			enableSorting: false,
			header: t('errorTypes.table.description'),
			cell: ({ row: { original: errorType } }) => (
				<Text
					c={errorType.description ? undefined : 'dimmed'}
					className={classes.description}
					lineClamp={2}
					size='sm'
				>
					{errorType.description || t('errorTypes.table.noDescription')}
				</Text>
			),
		},
		{
			id: 'status',
			enableSorting: false,
			header: t('errorTypes.table.status'),
			cell: ({ row: { original: errorType } }) => (
				<Badge color={getActiveStatusColor(errorType.isActive)} variant='light'>
					{errorType.isActive
						? t('errorTypes.status.active')
						: t('errorTypes.status.inactive')}
				</Badge>
			),
		},
		{
			id: 'createdAt',
			enableSorting: false,
			header: t('errorTypes.table.createdAt'),
			cell: ({ row: { original: errorType } }) => (
				<Text c='dimmed' size='sm'>
					{errorType.createdAt
						? dateFormatter.format(new Date(errorType.createdAt))
						: t('errorTypes.table.notAvailable')}
				</Text>
			),
		},
		{
			id: 'actions',
			enableSorting: false,
			header: t('errorTypes.table.actions'),
			cell: ({ row: { original: errorType } }) => (
				<Group
					className={classes.actions}
					gap='xs'
					justify='flex-end'
					wrap='nowrap'
				>
					<Tooltip label={t('actions.edit')}>
						<ActionIcon
							aria-label={t('actions.edit')}
							onClick={() => openEdit(errorType)}
							radius='md'
							variant='light'
						>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('actions.delete')}>
						<ActionIcon
							aria-label={t('actions.delete')}
							color='red'
							onClick={() => confirmDeleteErrorType(errorType)}
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
			<ErrorTypeFormModal
				form={form}
				onClose={() => setCreateOpen(false)}
				onSubmit={submitErrorType}
				opened={createOpen}
				saving={createMutation.isPending}
				title={t('errorTypes.createTitle')}
			/>

			<ErrorTypeFormModal
				form={form}
				onClose={() => setEditingErrorType(null)}
				onSubmit={submitErrorType}
				opened={Boolean(editingErrorType)}
				saving={updateMutation.isPending}
				title={t('errorTypes.editTitle')}
			/>

			<ContentContainer
				contentWidth='full'
				description={t('errorTypes.description')}
				onBackClick={() => navigate('/qa/forms')}
				showBackButton
				title={t('errorTypes.title')}
				titleRight={
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={openCreate}
						size='sm'
					>
						{t('errorTypes.actions.new')}
					</Button>
				}
			>
				<Stack gap='md'>
					<SectionCard>
						<Stack gap='md'>
							<Group className={classes.filters} gap='sm'>
								<TextInput
									className={classes.codeFilter}
									label={t('errorTypes.filters.code')}
									onChange={(event) => {
										setCodeFilter(event.currentTarget.value.toUpperCase());
										resetPage();
									}}
									placeholder={t('errorTypes.filters.codePlaceholder')}
									size='sm'
									value={codeFilter}
								/>
								<Select
									allowDeselect={false}
									className={classes.statusFilter}
									data={[
										{ label: t('errorTypes.filters.all'), value: 'ALL' },
										{ label: t('errorTypes.filters.active'), value: 'ACTIVE' },
										{
											label: t('errorTypes.filters.inactive'),
											value: 'INACTIVE',
										},
									]}
									label={t('errorTypes.filters.status')}
									onChange={(value) => {
										setStatusFilter((value as StatusFilter) ?? 'ALL');
										resetPage();
									}}
									size='sm'
									value={statusFilter}
								/>
								<Switch
									checked={showAll}
									label={t('errorTypes.filters.showAll')}
									onChange={(event) => {
										setShowAll(event.currentTarget.checked);
										resetPage();
									}}
									size='sm'
								/>
							</Group>

							<Group justify='space-between'>
								<Text c='dimmed' size='sm'>
									{t('errorTypes.filters.count', {
										count: filteredErrorTypes.length,
									})}
								</Text>
								{!showAll ? (
									<Select
										aria-label={t('pagination.pageSize')}
										data={['10', '25', '50']}
										onChange={(value) => {
											setPageSize(value ?? '10');
										}}
										size='xs'
										value={pageSize}
										w={84}
									/>
								) : null}
							</Group>

							{errorTypesQuery.isLoading ? (
								<Stack gap='xs'>
									<Skeleton height={44} />
									<Skeleton height={44} />
									<Skeleton height={44} />
								</Stack>
							) : null}

							{errorTypesQuery.isError ? (
								<Alert
									color='red'
									icon={<IconAlertTriangle size={16} />}
									title={t('errorTypes.states.errorTitle')}
									variant='light'
								>
									{getErrorMessage(errorTypesQuery.error)}
								</Alert>
							) : null}

							{!errorTypesQuery.isLoading &&
							!errorTypesQuery.isError &&
							visibleErrorTypes.length === 0 ? (
								<EmptyState
									icon={<IconTags size={32} />}
									message={t('errorTypes.states.empty')}
								/>
							) : null}

							{visibleErrorTypes.length > 0 ? (
								<BaseTable
									columns={columns}
									data={visibleErrorTypes}
									getRowId={(errorType) => String(errorType.id)}
								/>
							) : null}

							{!showAll && totalPages > 1 ? (
								<Pagination
									onChange={setPage}
									size='sm'
									total={totalPages}
									value={page}
								/>
							) : null}
						</Stack>
					</SectionCard>
				</Stack>
			</ContentContainer>
		</>
	);
}
