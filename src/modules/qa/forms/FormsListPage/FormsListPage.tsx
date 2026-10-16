import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconCheck,
	IconCopy,
	IconEdit,
	IconFileDescription,
	IconPlus,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import {
	FORM_MODALITIES,
	MODALITY_COLORS,
	formBuilderPath,
} from '~/modules/qa/forms/constants';
import {
	countQuestions,
	createEmptyForm,
	getFormCategories,
} from '~/modules/qa/forms/helpers';
import type {
	BuilderForm,
	CreateFormValues,
	FormModality,
} from '~/modules/qa/forms/types';
import { getActiveStatusColor } from '~/modules/qa/constants/badgeColors';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import {
	selectForms,
	selectPrimaryFormIds,
	useFormsStore,
} from '~/stores/qa/formsStore';
import { MOCK_FORM_CATEGORIES } from '~/modules/qa/forms/mockData';
import classes from './FormsListPage.module.css';
import CreateFormModal from './components/CreateFormModal';
import PrimaryFormsCard from './components/PrimaryFormsCard';

export default function FormsListPage() {
	const { t, i18n } = useTranslation('qa.forms');
	const navigate = useNavigate();
	const forms = useFormsStore(selectForms);
	const primaryFormIds = useFormsStore(selectPrimaryFormIds);
	const [search, setSearch] = useState('');
	const [createOpen, setCreateOpen] = useState(false);
	const [createModality, setCreateModality] =
		useState<FormModality>('STANDARD');

	const categories = useMemo(
		() => getFormCategories(forms, MOCK_FORM_CATEGORIES),
		[forms]
	);

	const filteredForms = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return forms;
		return forms.filter((form) =>
			[form.name, form.description, form.category]
				.filter(Boolean)
				.some((value) => value.toLowerCase().includes(query))
		);
	}, [forms, search]);

	const openCreate = (modality: FormModality) => {
		setCreateModality(modality);
		setCreateOpen(true);
	};

	const submitCreate = (values: CreateFormValues) => {
		const form = createEmptyForm(values);
		useFormsStore.getState().addForm(form);
		notifySuccess(t('notifications.formCreated'));
		setCreateOpen(false);
		navigate(formBuilderPath(form.id));
	};

	const changePrimary = (modality: FormModality, formId: string | null) => {
		useFormsStore.getState().setPrimaryForm(modality, formId);
		notifySuccess(t('notifications.primaryUpdated'));
	};

	const duplicate = (form: BuilderForm) => {
		useFormsStore.getState().duplicateForm(form.id, t('duplicateSuffix'));
		notifySuccess(t('notifications.formDuplicated'));
	};

	const confirmDelete = (form: BuilderForm) => {
		modals.openConfirmModal({
			title: t('actions.delete'),
			centered: true,
			labels: { confirm: t('actions.delete'), cancel: t('actions.cancel') },
			confirmProps: { color: 'red' },
			children: (
				<Text size='sm'>{t('states.deleteConfirm', { name: form.name })}</Text>
			),
			onConfirm: () => {
				useFormsStore.getState().deleteForm(form.id);
				notifySuccess(t('notifications.formDeleted'));
			},
		});
	};

	const columns: BaseTableColumnDef<BuilderForm>[] = [
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
			id: 'modality',
			header: t('table.modality'),
			enableSorting: false,
			cell: ({ row: { original: form } }) => (
				<Group gap={6} wrap='nowrap'>
					<Badge color={MODALITY_COLORS[form.modality]} variant='light'>
						{t(`modality.${form.modality.toLowerCase()}`)}
					</Badge>
					{/* A form can be the primary one of either category, whatever its own modality. */}
					{FORM_MODALITIES.filter(
						(slot) => primaryFormIds[slot] === form.id
					).map((slot) => (
						<Badge
							color={MODALITY_COLORS[slot]}
							key={slot}
							leftSection={<IconCheck size={10} />}
							variant='outline'
						>
							{slot === form.modality
								? t('table.primary')
								: t('table.primaryFor', {
										modality: t(`modality.${slot.toLowerCase()}`),
									})}
						</Badge>
					))}
				</Group>
			),
		},
		{
			id: 'category',
			header: t('table.category'),
			enableSorting: false,
			cell: ({ row: { original: form } }) => (
				<Badge color='blue' variant='outline'>
					{form.category || t('table.noCategory')}
				</Badge>
			),
		},
		{
			id: 'sections',
			header: t('table.sections'),
			enableSorting: false,
			cell: ({ row: { original: form } }) => (
				<Text size='sm'>{form.sections.length}</Text>
			),
		},
		{
			id: 'questions',
			header: t('table.questions'),
			enableSorting: false,
			cell: ({ row: { original: form } }) => (
				<Text size='sm'>{countQuestions(form)}</Text>
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
			id: 'updatedAt',
			header: t('table.updatedAt'),
			enableSorting: false,
			cell: ({ row: { original: form } }) => (
				<Text c='dimmed' size='sm'>
					{new Date(form.updatedAt).toLocaleDateString(i18n.language, {
						day: 'numeric',
						month: 'short',
						year: 'numeric',
					})}
				</Text>
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
							to={formBuilderPath(form.id)}
							variant='light'
						>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('actions.duplicate')}>
						<ActionIcon
							aria-label={t('actions.duplicate')}
							onClick={() => duplicate(form)}
							radius='md'
							variant='subtle'
						>
							<IconCopy size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('actions.delete')}>
						<ActionIcon
							aria-label={t('actions.delete')}
							color='red'
							onClick={() => confirmDelete(form)}
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
				categories={categories}
				initialModality={createModality}
				onClose={() => setCreateOpen(false)}
				onSubmit={submitCreate}
				opened={createOpen}
			/>

			<ContentContainer
				contentWidth='full'
				description={t('description')}
				title={t('title')}
				titleRight={
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => openCreate('STANDARD')}
						size='sm'
					>
						{t('actions.create')}
					</Button>
				}
			>
				<Stack gap='md'>
					<PrimaryFormsCard
						forms={forms}
						onChange={changePrimary}
						primaryFormIds={primaryFormIds}
					/>

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
									{t('search.count', { count: filteredForms.length })}
								</Text>
							</Group>

							{filteredForms.length === 0 ? (
								<EmptyState
									action={
										<Button
											leftSection={<IconPlus size={16} />}
											onClick={() => openCreate('STANDARD')}
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
								<BaseTable<BuilderForm>
									columns={columns}
									data={filteredForms}
									getRowId={(form) => form.id}
								/>
							)}
						</Stack>
					</SectionCard>
				</Stack>
			</ContentContainer>
		</>
	);
}
