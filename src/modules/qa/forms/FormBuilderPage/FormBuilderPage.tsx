import { Badge, Box, Button, Group, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconDeviceFloppy, IconEye, IconListCheck } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import EmptyState from '~/components/EmptyState';
import { getActiveStatusColor } from '~/modules/qa/constants/badgeColors';
import { FORMS_LIST_PATH, MODALITY_COLORS } from '~/modules/qa/forms/constants';
import {
	findQuestion,
	findSection,
	getFormMaxScore,
	validateDraft,
} from '~/modules/qa/forms/helpers';
import type { BuilderSection } from '~/modules/qa/forms/types';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import { useFormsStore } from '~/stores/qa/formsStore';
import styles from './FormBuilderPage.module.css';
import BuilderOutline from './components/BuilderOutline';
import FormDetailsEditor from './components/FormDetailsEditor';
import PreviewDrawer from './components/PreviewDrawer';
import QuestionEditor from './components/QuestionEditor';
import SectionEditor from './components/SectionEditor';
import { useFormDraft } from './useFormDraft';

/** Remounts the editor per form id so every form starts from a fresh draft. */
export default function FormBuilderPage() {
	const { formId } = useParams();
	return <FormBuilderContent formId={formId} key={formId} />;
}

function FormBuilderContent({ formId }: { formId: string | undefined }) {
	const { t } = useTranslation('qa.forms');
	const navigate = useNavigate();
	const {
		draft,
		selection,
		setSelection,
		draftError,
		setDraftError,
		isDirty,
		updateDetails,
		addSection,
		updateSection,
		deleteSection,
		addQuestion,
		updateQuestion,
		deleteQuestion,
		reorderSections,
		moveQuestion,
	} = useFormDraft(formId);
	const [previewOpen, setPreviewOpen] = useState(false);

	const selected = useMemo(() => {
		if (!draft || !selection) return null;
		if (selection.kind === 'form') return { kind: 'form' as const };
		if (selection.kind === 'section') {
			const section = findSection(draft, selection.id);
			return section
				? {
						kind: 'section' as const,
						section,
						index: draft.sections.indexOf(section),
					}
				: null;
		}
		const found = findQuestion(draft, selection.id);
		if (!found) return null;
		return {
			kind: 'question' as const,
			question: found.question,
			section: found.section,
			sectionIndex: draft.sections.indexOf(found.section),
			questionIndex: found.section.questions.indexOf(found.question),
		};
	}, [draft, selection]);

	const goToList = () => navigate(FORMS_LIST_PATH);

	if (!draft) {
		return (
			<ContentContainer
				contentWidth='full'
				onBackClick={goToList}
				showBackButton
				title={t('builder.title')}
			>
				<EmptyState
					action={
						<Button onClick={goToList} size='sm' variant='light'>
							{t('actions.backToForms')}
						</Button>
					}
					icon={<IconListCheck size={32} />}
					message={t('builder.notFound')}
				/>
			</ContentContainer>
		);
	}

	const handleLeave = () => {
		if (!isDirty) {
			goToList();
			return;
		}
		modals.openConfirmModal({
			title: t('builder.discard.title'),
			centered: true,
			children: <Text size='sm'>{t('builder.discard.message')}</Text>,
			labels: {
				confirm: t('builder.discard.confirm'),
				cancel: t('actions.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: goToList,
		});
	};

	const saveDraft = (successMessage: string) => {
		const error = validateDraft(draft);
		if (error) {
			setDraftError(error);
			setSelection(error.selection);
			notifyWarning(t('builder.validation.fixFields'));
			return;
		}
		useFormsStore.getState().updateForm(draft);
		notifySuccess(successMessage);
	};

	const handleSave = () => saveDraft(t('notifications.formUpdated'));

	const handleSaveQuestion = () => saveDraft(t('notifications.questionSaved'));

	const confirmDeleteSection = (section: BuilderSection) => {
		const count = section.questions.length;
		modals.openConfirmModal({
			title: t('groups.deleteTitle'),
			centered: true,
			children: (
				<Text size='sm'>
					{count > 0
						? t('section.deleteConfirm', { name: section.name, count })
						: t('section.deleteConfirmEmpty', { name: section.name })}
				</Text>
			),
			labels: { confirm: t('actions.delete'), cancel: t('actions.cancel') },
			confirmProps: { color: 'red' },
			onConfirm: () => deleteSection(section.id),
		});
	};

	const confirmDeleteQuestion = (id: string, text: string) => {
		modals.openConfirmModal({
			title: t('questions.deleteTitle'),
			centered: true,
			children: <Text size='sm'>{t('questions.deleteConfirm', { text })}</Text>,
			labels: { confirm: t('actions.delete'), cancel: t('actions.cancel') },
			confirmProps: { color: 'red' },
			onConfirm: () => deleteQuestion(id),
		});
	};

	const modalityKey = draft.modality.toLowerCase();

	return (
		<>
			<ContentContainer
				contentWidth='full'
				description={t('builder.description')}
				onBackClick={handleLeave}
				showBackButton
				title={draft.name || t('builder.title')}
				titleRight={
					<Group gap='xs'>
						<Badge color={MODALITY_COLORS[draft.modality]} variant='light'>
							{t(`modality.${modalityKey}`)}
						</Badge>
						<Badge color={getActiveStatusColor(draft.isActive)} variant='light'>
							{draft.isActive ? t('status.active') : t('status.inactive')}
						</Badge>
						{draft.modality === 'STANDARD' ? (
							<Badge color='gray' variant='outline'>
								{t('builder.maxScore', { score: getFormMaxScore(draft) })}
							</Badge>
						) : null}
						<Button
							leftSection={<IconEye size={16} />}
							onClick={() => setPreviewOpen(true)}
							size='sm'
							variant='light'
						>
							{t('actions.preview')}
						</Button>
					</Group>
				}
			>
				<div className={styles.layout}>
					<aside className={styles.outline}>
						<BuilderOutline
							draft={draft}
							onAddQuestion={addQuestion}
							onAddSection={addSection}
							onMoveQuestion={moveQuestion}
							onReorderSections={reorderSections}
							onSelect={setSelection}
							selection={selection}
						/>
					</aside>

					<section className={styles.editor}>
						{selected?.kind === 'form' ? (
							<FormDetailsEditor
								error={draftError}
								form={draft}
								onChange={updateDetails}
							/>
						) : null}

						{selected?.kind === 'section' ? (
							<SectionEditor
								error={draftError}
								index={selected.index}
								key={selected.section.id}
								onAddQuestion={() => addQuestion(selected.section.id)}
								onChange={(changes) =>
									updateSection(selected.section.id, changes)
								}
								onDelete={() => confirmDeleteSection(selected.section)}
								section={selected.section}
							/>
						) : null}

						{selected?.kind === 'question' ? (
							<QuestionEditor
								error={draftError}
								key={selected.question.id}
								number={t('builder.questionNumber', {
									section: selected.sectionIndex + 1,
									question: selected.questionIndex + 1,
								})}
								onChange={(changes) =>
									updateQuestion(selected.question.id, changes)
								}
								onDelete={() =>
									confirmDeleteQuestion(
										selected.question.id,
										selected.question.text
									)
								}
								onAddQuestion={() => addQuestion(selected.section.id)}
								onSave={handleSaveQuestion}
								question={selected.question}
								saveDisabled={!isDirty}
								sectionName={selected.section.name}
							/>
						) : null}

						{!selected ? (
							<EmptyState
								description={t('builder.selectPromptDescription')}
								icon={<IconListCheck size={32} />}
								message={t('builder.selectPrompt')}
							/>
						) : null}
					</section>
				</div>

				{/* Pinned to the viewport so the actions stay in reach on this long form. */}
				<Box className={styles.stickyActions}>
					<Group gap='xs' justify='flex-end'>
						<Button onClick={handleLeave} variant='subtle'>
							{t('actions.cancel')}
						</Button>
						<Button
							disabled={!isDirty}
							leftSection={<IconDeviceFloppy size={16} />}
							onClick={handleSave}
						>
							{t('actions.save')}
						</Button>
					</Group>
				</Box>
			</ContentContainer>

			<PreviewDrawer
				form={draft}
				onClose={() => setPreviewOpen(false)}
				opened={previewOpen}
			/>
		</>
	);
}
