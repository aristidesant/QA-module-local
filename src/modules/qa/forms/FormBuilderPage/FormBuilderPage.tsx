import {
	Alert,
	Badge,
	Button,
	Group,
	Loader,
	Stack,
	Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
	IconAlertTriangle,
	IconListCheck,
	IconPlus,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';

import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { getActiveStatusColor } from '~/modules/qa/constants/badgeColors';
import type {
	CreateFormGroupPayload,
	CreateFormQuestionPayload,
	FormGroup,
	FormQuestion,
	UpdateFormPayload,
	UpdateFormQuestionPayload,
} from '~/models/qa';
import {
	formGroupsQueryKey,
	formQueryKey,
	formQuestionsQueryKey,
	formsQueryKey,
	useCreateFormGroupMutation,
	useCreateFormQuestionMutation,
	useDeleteFormGroupMutation,
	useDeleteFormQuestionMutation,
	useFormGroupsQuery,
	useFormQuery,
	useFormQuestionsQuery,
	useUpdateFormGroupMutation,
	useUpdateFormMutation,
	useUpdateFormQuestionMutation,
} from '~/queries/qa/formsQueries';
import { queryClient } from '~/queries/queryClient';
import { useQuestionErrorTypesQuery } from '~/queries/qa/questionErrorTypesQueries';
import { getErrorMessage } from '~/utils/httpClient';
import { notifyError, notifySuccess } from '~/modules/qa/utils/notifications';
import { DEFAULT_QUESTION_OPTIONS } from './FormBuilderPage.constants';
import type { QuestionFormValues } from './FormBuilderPage.types';
import FormMetadataCard from './components/FormMetadataCard';
import GroupFormModal from './components/GroupFormModal';
import GroupPanel from './components/GroupPanel';
import QuestionFormModal from './components/QuestionFormModal';

export default function FormBuilderPage() {
	const { t } = useTranslation('qa.forms');
	const navigate = useNavigate();
	const params = useParams();
	const formId = Number(params.formId);
	const unpaginated = useMemo(() => ({ pagination: false }), []);
	const formQuery = useFormQuery(formId);
	const groupsQuery = useFormGroupsQuery(formId, unpaginated);
	const questionsQuery = useFormQuestionsQuery(formId, unpaginated);
	const errorTypesQuery = useQuestionErrorTypesQuery({ pagination: false });
	const updateFormMutation = useUpdateFormMutation(formId);
	const createGroupMutation = useCreateFormGroupMutation(formId);
	const updateGroupMutation = useUpdateFormGroupMutation(formId);
	const deleteGroupMutation = useDeleteFormGroupMutation(formId);
	const createQuestionMutation = useCreateFormQuestionMutation(formId);
	const updateQuestionMutation = useUpdateFormQuestionMutation(formId);
	const deleteQuestionMutation = useDeleteFormQuestionMutation(formId);
	const [groupDrawerOpen, setGroupDrawerOpen] = useState(false);
	const [editingGroup, setEditingGroup] = useState<FormGroup | null>(null);
	const [questionDrawerOpen, setQuestionDrawerOpen] = useState(false);
	const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(
		null
	);
	const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<number>>(
		() => new Set()
	);

	const metadataForm = useForm<UpdateFormPayload>({
		initialValues: {
			name: '',
			description: '',
			category: '',
			isActive: true,
		},
		validate: {
			name: (value) =>
				value?.trim().length ? null : t('validation.nameRequired'),
		},
	});
	const groupForm = useForm<CreateFormGroupPayload>({
		initialValues: {
			name: '',
			description: '',
			sortOrder: 10,
		},
		validate: {
			name: (value) =>
				value.trim().length === 0 ? t('validation.groupRequired') : null,
		},
	});
	const questionForm = useForm<QuestionFormValues>({
		initialValues: {
			groupId: '',
			text: '',
			description: '',
			answerType: 'CHOICE',
			options: DEFAULT_QUESTION_OPTIONS,
			errorTypeId: null,
			sortOrder: 10,
		},
		validate: {
			groupId: (value) =>
				value ? null : t('validation.groupSelectionRequired'),
			text: (value) =>
				value.trim().length === 0 ? t('validation.questionRequired') : null,
			options: (value, values) => {
				if (values.answerType === 'TEXT') {
					return null;
				}

				return value.length === 0 ? t('validation.optionsRequired') : null;
			},
		},
	});

	const groups = useMemo(
		() =>
			[...(groupsQuery.data?.data ?? [])].sort(
				(a, b) => a.sortOrder - b.sortOrder
			),
		[groupsQuery.data]
	);
	const questions = useMemo(
		() =>
			[...(questionsQuery.data?.data ?? [])].sort(
				(a, b) => a.groupId - b.groupId || a.sortOrder - b.sortOrder
			),
		[questionsQuery.data]
	);
	const errorTypes = useMemo(
		() => errorTypesQuery.data?.data ?? [],
		[errorTypesQuery.data]
	);
	const isLoading =
		formQuery.isLoading || groupsQuery.isLoading || questionsQuery.isLoading;
	const isError =
		formQuery.isError || groupsQuery.isError || questionsQuery.isError;

	if (formQuery.data && metadataForm.values.name === '') {
		metadataForm.setValues({
			name: formQuery.data.name,
			description: formQuery.data.description ?? '',
			category: formQuery.data.category ?? '',
			isActive: formQuery.data.isActive,
		});
	}

	const invalidateFormDetail = async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: formsQueryKey }),
			queryClient.invalidateQueries({ queryKey: formQueryKey(formId) }),
			queryClient.invalidateQueries({
				queryKey: formGroupsQueryKey(formId, unpaginated),
			}),
			queryClient.invalidateQueries({
				queryKey: formQuestionsQueryKey(formId, unpaginated),
			}),
		]);
	};

	const submitMetadata = metadataForm.onSubmit(async (values) => {
		try {
			await updateFormMutation.mutateAsync({
				name: values.name?.trim(),
				description: values.description?.trim() || undefined,
				category: values.category?.trim() || undefined,
				isActive: values.isActive,
			});
			await invalidateFormDetail();
			notifySuccess(t('notifications.formUpdated'));
		} catch (error) {
			notifyError(error);
		}
	});

	const openCreateGroup = () => {
		setEditingGroup(null);
		groupForm.setValues({
			name: '',
			description: '',
			sortOrder: (groups.at(-1)?.sortOrder ?? 0) + 10,
		});
		setGroupDrawerOpen(true);
	};

	const openEditGroup = (group: FormGroup) => {
		setEditingGroup(group);
		groupForm.setValues({
			name: group.name,
			description: group.description ?? '',
			sortOrder: group.sortOrder,
		});
		setGroupDrawerOpen(true);
	};

	const submitGroup = groupForm.onSubmit(async (values) => {
		try {
			const payload = {
				name: values.name.trim(),
				description: values.description?.trim() || undefined,
				sortOrder: values.sortOrder,
			};

			if (editingGroup) {
				await updateGroupMutation.mutateAsync({
					groupId: editingGroup.id,
					payload,
				});
			} else {
				await createGroupMutation.mutateAsync(payload);
			}

			await invalidateFormDetail();
			notifySuccess(
				editingGroup
					? t('notifications.groupUpdated')
					: t('notifications.groupCreated')
			);
			setGroupDrawerOpen(false);
		} catch (error) {
			notifyError(error);
		}
	});

	const confirmDeleteGroup = (group: FormGroup) => {
		modals.openConfirmModal({
			title: t('groups.deleteTitle'),
			centered: true,
			labels: { confirm: t('actions.delete'), cancel: t('actions.cancel') },
			confirmProps: { color: 'red' },
			children: (
				<Text size='sm'>{t('groups.deleteConfirm', { name: group.name })}</Text>
			),
			onConfirm: async () => {
				try {
					await deleteGroupMutation.mutateAsync(group.id);
					await invalidateFormDetail();
					notifySuccess(t('notifications.groupDeleted'));
				} catch (error) {
					notifyError(error);
				}
			},
		});
	};

	const openCreateQuestion = (groupId?: number) => {
		setEditingQuestion(null);
		questionForm.setValues({
			groupId: groupId ? String(groupId) : '',
			text: '',
			description: '',
			answerType: 'CHOICE',
			options: DEFAULT_QUESTION_OPTIONS,
			errorTypeId: null,
			sortOrder: 10,
		});
		setQuestionDrawerOpen(true);
	};

	const openEditQuestion = (question: FormQuestion) => {
		setEditingQuestion(question);
		questionForm.setValues({
			groupId: String(question.groupId),
			text: question.text,
			description: question.description ?? '',
			answerType: question.answerType,
			options: question.options?.length
				? question.options
				: DEFAULT_QUESTION_OPTIONS,
			errorTypeId:
				question.errorTypeId == null ? null : String(question.errorTypeId),
			sortOrder: question.sortOrder,
		});
		setQuestionDrawerOpen(true);
	};

	const submitQuestion = questionForm.onSubmit(async (values) => {
		try {
			const selectedErrorTypeId = values.errorTypeId
				? Number(values.errorTypeId)
				: null;
			const payload: CreateFormQuestionPayload = {
				groupId: Number(values.groupId),
				text: values.text.trim(),
				description: values.description.trim() || undefined,
				answerType: values.answerType,
				options: values.answerType === 'CHOICE' ? values.options : undefined,
				errorTypeId: selectedErrorTypeId ?? undefined,
				sortOrder: values.sortOrder,
			};

			if (editingQuestion) {
				const updatePayload: UpdateFormQuestionPayload = {
					text: payload.text,
					description: payload.description,
					answerType: payload.answerType,
					options: payload.options,
					sortOrder: payload.sortOrder,
				};

				if (selectedErrorTypeId !== (editingQuestion.errorTypeId ?? null)) {
					updatePayload.errorTypeId = selectedErrorTypeId;
				}

				await updateQuestionMutation.mutateAsync({
					questionId: editingQuestion.id,
					payload: updatePayload,
				});
			} else {
				await createQuestionMutation.mutateAsync(payload);
			}

			await invalidateFormDetail();
			notifySuccess(
				editingQuestion
					? t('notifications.questionUpdated')
					: t('notifications.questionCreated')
			);
			setQuestionDrawerOpen(false);
		} catch (error) {
			notifyError(error);
		}
	});

	const confirmDeleteQuestion = (question: FormQuestion) => {
		modals.openConfirmModal({
			title: t('questions.deleteTitle'),
			centered: true,
			labels: { confirm: t('actions.delete'), cancel: t('actions.cancel') },
			confirmProps: { color: 'red' },
			children: (
				<Text size='sm'>
					{t('questions.deleteConfirm', { text: question.text })}
				</Text>
			),
			onConfirm: async () => {
				try {
					await deleteQuestionMutation.mutateAsync(question.id);
					await invalidateFormDetail();
					notifySuccess(t('notifications.questionDeleted'));
				} catch (error) {
					notifyError(error);
				}
			},
		});
	};

	const addOption = () => {
		questionForm.insertListItem('options', { label: '', score: 0 });
	};

	const toggleGroupCollapsed = (groupId: number) => {
		setCollapsedGroupIds((currentGroupIds) => {
			const nextGroupIds = new Set(currentGroupIds);

			if (nextGroupIds.has(groupId)) {
				nextGroupIds.delete(groupId);
			} else {
				nextGroupIds.add(groupId);
			}

			return nextGroupIds;
		});
	};

	return (
		<>
			<GroupFormModal
				form={groupForm}
				onClose={() => setGroupDrawerOpen(false)}
				onSubmit={submitGroup}
				opened={groupDrawerOpen}
				saving={createGroupMutation.isPending || updateGroupMutation.isPending}
				title={editingGroup ? t('groups.editTitle') : t('groups.createTitle')}
			/>

			<QuestionFormModal
				editing={Boolean(editingQuestion)}
				form={questionForm}
				groups={groups}
				onAddOption={addOption}
				onClose={() => setQuestionDrawerOpen(false)}
				onSubmit={submitQuestion}
				opened={questionDrawerOpen}
				saving={
					createQuestionMutation.isPending || updateQuestionMutation.isPending
				}
			/>

			<ContentContainer
				contentWidth='full'
				description={t('builder.description')}
				onBackClick={() => navigate('/qa/forms')}
				showBackButton
				title={formQuery.data?.name ?? t('builder.title')}
				titleRight={
					formQuery.data ? (
						<Badge
							color={getActiveStatusColor(formQuery.data.isActive)}
							variant='light'
						>
							{formQuery.data.isActive
								? t('status.active')
								: t('status.inactive')}
						</Badge>
					) : undefined
				}
			>
				<Stack gap='md'>
					{isLoading ? (
						<Group justify='center' py='xl'>
							<Loader size='sm' />
						</Group>
					) : null}

					{isError ? (
						<Alert
							color='red'
							icon={<IconAlertTriangle size={16} />}
							title={t('states.errorTitle')}
							variant='light'
						>
							{getErrorMessage(
								formQuery.error ?? groupsQuery.error ?? questionsQuery.error
							)}
						</Alert>
					) : null}

					{!isLoading && !isError ? (
						<>
							<FormMetadataCard
								form={metadataForm}
								onSubmit={submitMetadata}
								saving={updateFormMutation.isPending}
							/>

							<SectionCard
								description={t('groups.description')}
								headerActions={
									<>
										<Button
											leftSection={<IconPlus size={16} />}
											onClick={openCreateGroup}
											size='sm'
											variant='light'
										>
											{t('groups.add')}
										</Button>
										<Button
											disabled={groups.length === 0}
											leftSection={<IconPlus size={16} />}
											onClick={() => openCreateQuestion()}
											size='sm'
										>
											{t('questions.add')}
										</Button>
									</>
								}
								icon={IconListCheck}
								title={t('groups.title')}
							>
								<Stack gap='md'>
									{groups.length === 0 ? (
										<EmptyState
											action={
												<Button
													leftSection={<IconPlus size={16} />}
													onClick={openCreateGroup}
													size='sm'
													variant='light'
												>
													{t('groups.add')}
												</Button>
											}
											icon={<IconListCheck size={32} />}
											message={t('groups.empty')}
										/>
									) : null}

									{groups.map((group) => (
										<GroupPanel
											collapsed={collapsedGroupIds.has(group.id)}
											errorTypes={errorTypes}
											group={group}
											key={group.id}
											onAddQuestion={() => openCreateQuestion(group.id)}
											onDeleteGroup={() => confirmDeleteGroup(group)}
											onDeleteQuestion={(question) =>
												confirmDeleteQuestion(question)
											}
											onEditGroup={() => openEditGroup(group)}
											onEditQuestion={(question) => openEditQuestion(question)}
											onToggle={() => toggleGroupCollapsed(group.id)}
											questions={questions.filter(
												(question) => question.groupId === group.id
											)}
										/>
									))}
								</Stack>
							</SectionCard>
						</>
					) : null}
				</Stack>
			</ContentContainer>
		</>
	);
}
