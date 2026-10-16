import {
	DragDropContext,
	Draggable,
	Droppable,
	type DropResult,
} from '@hello-pangea/dnd';
import { ActionIcon, Badge, Button, Group, Text, Tooltip } from '@mantine/core';
import {
	IconAlertTriangle,
	IconFileDescription,
	IconGripVertical,
	IconListTree,
	IconPlus,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import SectionCard from '~/components/SectionCard';
import type { MoveQuestionArgs } from '~/modules/qa/forms/helpers';
import type {
	BuilderForm,
	BuilderQuestion,
	BuilderSelection,
} from '~/modules/qa/forms/types';
import classes from './BuilderOutline.module.css';

export interface BuilderOutlineProps {
	draft: BuilderForm;
	selection: BuilderSelection;
	onSelect: (selection: BuilderSelection) => void;
	onAddSection: () => void;
	onAddQuestion: (sectionId: string) => void;
	onReorderSections: (from: number, to: number) => void;
	onMoveQuestion: (args: MoveQuestionArgs) => void;
}

const SECTION_DROPPABLE = 'sections';
const SECTION_TYPE = 'SECTION';
const QUESTION_TYPE = 'QUESTION';
/** Draggable and droppable ids carry a prefix so they never collide across types. */
const sectionDraggableId = (id: string) => `section:${id}`;
const questionDraggableId = (id: string) => `question:${id}`;
const stripPrefix = (id: string) => id.slice(id.indexOf(':') + 1);

const cx = (...names: Array<string | false | undefined>) =>
	names.filter(Boolean).join(' ');

function QuestionBadges({ question }: { question: BuilderQuestion }) {
	const { t } = useTranslation('qa.forms');

	return (
		<Group gap={4} wrap='nowrap'>
			{question.autoFail !== 'NONE' ? (
				<Tooltip label={t('question.badges.autoFail')}>
					<IconAlertTriangle
						aria-label={t('question.badges.autoFail')}
						color='var(--mantine-color-red-6)'
						size={14}
					/>
				</Tooltip>
			) : null}
			{question.notApplicable ? (
				<Badge color='gray' size='xs' variant='light'>
					{t('question.badges.na')}
				</Badge>
			) : null}
			{question.modality === 'COPC' && question.errorCode ? (
				<Badge color='violet' size='xs' variant='outline'>
					{question.errorCode}
				</Badge>
			) : null}
			{question.modality === 'STANDARD' && question.answerType === 'OPEN' ? (
				<Badge color='gray' size='xs' variant='outline'>
					{t('question.badges.open')}
				</Badge>
			) : null}
		</Group>
	);
}

export default function BuilderOutline({
	draft,
	selection,
	onSelect,
	onAddSection,
	onAddQuestion,
	onReorderSections,
	onMoveQuestion,
}: BuilderOutlineProps) {
	const { t } = useTranslation('qa.forms');

	const handleDragEnd = (result: DropResult) => {
		const { source, destination, type } = result;
		if (!destination) return;

		if (type === SECTION_TYPE) {
			if (source.index === destination.index) return;
			onReorderSections(source.index, destination.index);
			return;
		}

		const fromSectionId = stripPrefix(source.droppableId);
		const toSectionId = stripPrefix(destination.droppableId);
		if (fromSectionId === toSectionId && source.index === destination.index)
			return;
		onMoveQuestion({
			fromSectionId,
			toSectionId,
			fromIndex: source.index,
			toIndex: destination.index,
		});
	};

	return (
		<SectionCard
			description={t('builder.outlineHint')}
			headerActions={
				<Button
					leftSection={<IconPlus size={14} />}
					onClick={onAddSection}
					size='xs'
					variant='light'
				>
					{t('actions.addSection')}
				</Button>
			}
			icon={IconListTree}
			padding='sm'
			title={t('builder.outline')}
		>
			<div
				className={cx(
					classes.item,
					selection?.kind === 'form' && classes.selected
				)}
				onClick={() => onSelect({ kind: 'form' })}
			>
				<IconFileDescription size={16} />
				<div className={classes.grow}>
					<Text fw={600} size='sm'>
						{t('builder.formDetails')}
					</Text>
					<Text c='dimmed' lineClamp={1} size='xs'>
						{draft.name}
					</Text>
				</div>
			</div>

			<Text c='dimmed' fw={700} mt='sm' size='xs' tt='uppercase'>
				{t('builder.sections')}
			</Text>

			{draft.sections.length === 0 ? (
				<Text c='dimmed' size='sm'>
					{t('builder.noSections')}
				</Text>
			) : null}

			<DragDropContext onDragEnd={handleDragEnd}>
				<Droppable droppableId={SECTION_DROPPABLE} type={SECTION_TYPE}>
					{(sectionsDrop) => (
						<div ref={sectionsDrop.innerRef} {...sectionsDrop.droppableProps}>
							{draft.sections.map((section, sectionIndex) => (
								<Draggable
									draggableId={sectionDraggableId(section.id)}
									index={sectionIndex}
									key={section.id}
								>
									{(sectionDrag, sectionSnapshot) => (
										<div
											className={cx(
												classes.sectionBlock,
												sectionSnapshot.isDragging && classes.dragging
											)}
											ref={sectionDrag.innerRef}
											{...sectionDrag.draggableProps}
										>
											<div
												className={cx(
													classes.sectionRow,
													selection?.kind === 'section' &&
														selection.id === section.id &&
														classes.selected
												)}
												onClick={() =>
													onSelect({ kind: 'section', id: section.id })
												}
											>
												<span
													className={classes.grip}
													{...sectionDrag.dragHandleProps}
												>
													<IconGripVertical size={16} />
												</span>
												<Text
													c={section.name ? undefined : 'dimmed'}
													className={classes.grow}
													fs={section.name ? undefined : 'italic'}
													fw={600}
													lineClamp={1}
													size='sm'
												>
													{section.name || t('section.namePlaceholder')}
												</Text>
												<Badge color='gray' size='xs' variant='light'>
													{t('section.questionCount', {
														count: section.questions.length,
													})}
												</Badge>
												<Tooltip label={t('actions.addQuestion')}>
													<ActionIcon
														aria-label={t('actions.addQuestion')}
														onClick={(event) => {
															event.stopPropagation();
															onAddQuestion(section.id);
														}}
														size='sm'
														variant='subtle'
													>
														<IconPlus size={14} />
													</ActionIcon>
												</Tooltip>
											</div>

											<Droppable
												droppableId={sectionDraggableId(section.id)}
												type={QUESTION_TYPE}
											>
												{(questionsDrop, questionsSnapshot) => (
													<div
														className={cx(
															classes.questionList,
															questionsSnapshot.isDraggingOver &&
																classes.dropActive
														)}
														ref={questionsDrop.innerRef}
														{...questionsDrop.droppableProps}
													>
														{section.questions.length === 0 &&
														!questionsSnapshot.isDraggingOver ? (
															<Text
																c='dimmed'
																className={classes.dropHint}
																size='xs'
															>
																{t('builder.noQuestions')}
															</Text>
														) : null}

														{section.questions.map(
															(question, questionIndex) => (
																<Draggable
																	draggableId={questionDraggableId(question.id)}
																	index={questionIndex}
																	key={question.id}
																>
																	{(questionDrag, questionSnapshot) => (
																		<div
																			className={cx(
																				classes.questionRow,
																				!question.isActive && classes.inactive,
																				selection?.kind === 'question' &&
																					selection.id === question.id &&
																					classes.selected,
																				questionSnapshot.isDragging &&
																					classes.dragging
																			)}
																			onClick={() =>
																				onSelect({
																					kind: 'question',
																					id: question.id,
																				})
																			}
																			ref={questionDrag.innerRef}
																			{...questionDrag.draggableProps}
																		>
																			<span
																				className={classes.grip}
																				{...questionDrag.dragHandleProps}
																			>
																				<IconGripVertical size={16} />
																			</span>
																			<Text
																				c='dimmed'
																				className={classes.number}
																				size='xs'
																			>
																				{t('builder.questionNumber', {
																					section: sectionIndex + 1,
																					question: questionIndex + 1,
																				})}
																			</Text>
																			<Text
																				c={question.text ? undefined : 'dimmed'}
																				className={classes.grow}
																				fs={
																					question.text ? undefined : 'italic'
																				}
																				lineClamp={2}
																				size='sm'
																			>
																				{question.text ||
																					t('question.textPlaceholder')}
																			</Text>
																			<QuestionBadges question={question} />
																		</div>
																	)}
																</Draggable>
															)
														)}
														{questionsDrop.placeholder}
													</div>
												)}
											</Droppable>
										</div>
									)}
								</Draggable>
							))}
							{sectionsDrop.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		</SectionCard>
	);
}
