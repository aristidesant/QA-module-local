import { useEffect, useMemo, useState } from 'react';
import {
	ActionIcon,
	Autocomplete,
	Button,
	Collapse,
	Group,
	NumberInput,
	Select,
	Stack,
	Tabs,
	Text,
	TextInput,
	Textarea,
	Tooltip,
} from '@mantine/core';
import {
	DragDropContext,
	Draggable,
	Droppable,
	type DropResult,
} from '@hello-pangea/dnd';
import {
	IconBraces,
	IconChevronDown,
	IconGripVertical,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type {
	AgentWorkflow,
	UpdateStateLlmExpression,
	UpdateStateNode,
	UpdateStateUpdate,
} from '~/models/AgentWorkflowModel';
import type { AgentConfigModel } from '~/models/AgentListObject';
import WorkflowNodeForm from '../WorkflowNodeForm';
import { updateWorkflowNode } from '../nodeFormUtils';
import NodeEdgesTab from '../NodeEdgesTab';
import {
	buildUpdateStateExpression,
	createDefaultUpdateStateUpdate,
	createDefaultUpdateStateExpression,
	extractWorkflowVariableNames,
	formatUpdateStateExpressionPreview,
	getUpdateStateExpressionKind,
	normalizeUpdateStateUpdates,
	type UpdateStateExpressionKind,
} from '../../utils/updateStateUtils';
import styles from './UpdateStateForm.module.css';

const getTrimmedString = (value: unknown): string =>
	typeof value === 'string' ? value.trim() : '';

interface UpdateStateFormProps {
	nodeId: string;
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
	campaignAgentConfig?: Partial<AgentConfigModel>;
}

const UpdateStateForm = ({
	nodeId,
	workflow,
	onWorkflowChange,
}: UpdateStateFormProps) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const node = workflow?.nodes[nodeId] as UpdateStateNode | undefined;
	const [expandedUpdateIndex, setExpandedUpdateIndex] = useState<number | null>(
		node?.updates?.length ? 0 : null
	);

	const variableOptions = useMemo(
		() => extractWorkflowVariableNames(workflow),
		[workflow]
	);
	const updates = useMemo(
		() => normalizeUpdateStateUpdates(node?.updates),
		[node?.updates]
	);

	const duplicateCounts = useMemo(() => {
		const counts = new Map<string, number>();
		updates.forEach((update) => {
			const name = getTrimmedString(update.variableName);
			if (!name) return;
			counts.set(name, (counts.get(name) ?? 0) + 1);
		});
		return counts;
	}, [updates]);

	useEffect(() => {
		if (!updates.length) {
			setExpandedUpdateIndex(null);
			return;
		}

		setExpandedUpdateIndex((current) => {
			if (current === null) return 0;
			return Math.min(current, updates.length - 1);
		});
	}, [updates.length]);

	if (!node) {
		return (
			<WorkflowNodeForm
				title={t('form.workflow.forms.updateState.title', {
					defaultValue: 'Update state',
				})}
				description={t('form.workflow.forms.updateState.missingNode', {
					defaultValue: 'Update state node not found',
				})}
			>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.forms.updateState.missingNodeHint', {
						defaultValue:
							'Select an update state node to edit its configuration.',
					})}
				</Text>
			</WorkflowNodeForm>
		);
	}

	const handleUpdate = (updates: Partial<UpdateStateNode>) => {
		const nextWorkflow = updateWorkflowNode(workflow, nodeId, updates);
		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	const handleLabelChange = (value: string) => {
		handleUpdate({ label: value });
	};

	const handleAddUpdate = () => {
		const nextUpdates = [...updates, createDefaultUpdateStateUpdate('', 'llm')];
		handleUpdate({ updates: nextUpdates });
		setExpandedUpdateIndex(nextUpdates.length - 1);
	};

	const handleRemoveUpdate = (index: number) => {
		const nextUpdates = updates.filter((_, itemIndex) => itemIndex !== index);
		handleUpdate({ updates: nextUpdates });
		setExpandedUpdateIndex((current) => {
			if (current === null) return null;
			if (current === index) return null;
			if (current > index) return current - 1;
			return current;
		});
	};

	const handleReorderUpdates = (result: DropResult) => {
		if (!result.destination) return;

		const sourceIndex = result.source.index;
		const destinationIndex = result.destination.index;

		if (sourceIndex === destinationIndex) return;

		const nextUpdates = Array.from(updates);
		const [moved] = nextUpdates.splice(sourceIndex, 1);
		nextUpdates.splice(destinationIndex, 0, moved);
		handleUpdate({ updates: nextUpdates });

		setExpandedUpdateIndex((current) => {
			if (current === null) return null;
			if (current === sourceIndex) return destinationIndex;
			if (sourceIndex < current && current <= destinationIndex) {
				return current - 1;
			}
			if (destinationIndex <= current && current < sourceIndex) {
				return current + 1;
			}
			return current;
		});
	};

	const handleUpdateChange = (
		index: number,
		updater: (current: UpdateStateUpdate) => UpdateStateUpdate
	) => {
		const nextUpdates = updates.map((update, itemIndex) =>
			itemIndex === index ? updater(update) : update
		);
		handleUpdate({ updates: nextUpdates });
	};

	const handleExpressionKindChange = (
		index: number,
		nextKind: UpdateStateExpressionKind
	) => {
		const currentUpdate = updates[index];
		if (!currentUpdate) return;
		const currentExpression =
			currentUpdate.expression ?? createDefaultUpdateStateExpression('llm');

		const nextExpression = buildUpdateStateExpression(
			nextKind,
			currentExpression
		);
		handleUpdateChange(index, (currentUpdate) => ({
			...currentUpdate,
			expression: nextExpression,
		}));
	};

	const handleExpressionPromptChange = (index: number, value: string) => {
		const currentUpdate = updates[index];
		const currentExpression =
			currentUpdate?.expression ?? createDefaultUpdateStateExpression('llm');
		if (!currentUpdate || currentExpression.type !== 'llm') return;
		const llmExpression = currentExpression as UpdateStateLlmExpression;

		const nextUpdates = updates.map((update, itemIndex) =>
			itemIndex === index
				? {
						...update,
						expression: {
							...llmExpression,
							prompt: value,
							valueSchema: {
								...llmExpression.valueSchema,
								description: value,
							},
						},
					}
				: update
		);
		handleUpdate({ updates: nextUpdates });
	};

	const handleSchemaTypeChange = (
		index: number,
		value: 'string' | 'boolean' | 'integer' | 'number'
	) => {
		const currentUpdate = updates[index];
		const currentExpression =
			currentUpdate?.expression ?? createDefaultUpdateStateExpression('llm');
		if (!currentUpdate || currentExpression.type !== 'llm') return;
		const llmExpression = currentExpression as UpdateStateLlmExpression;

		const nextUpdates = updates.map((update, itemIndex) =>
			itemIndex === index
				? {
						...update,
						expression: {
							...llmExpression,
							valueSchema: {
								...llmExpression.valueSchema,
								type: value,
							},
						},
					}
				: update
		);
		handleUpdate({ updates: nextUpdates });
	};

	const renderUpdateEditor = (update: UpdateStateUpdate, index: number) => {
		const expression =
			update.expression ?? createDefaultUpdateStateExpression('llm');
		const expressionKind = getUpdateStateExpressionKind(expression);
		const variableName = update.variableName ?? '';
		const trimmedVariableName = getTrimmedString(variableName);
		const isDuplicate =
			trimmedVariableName.length > 0 &&
			(duplicateCounts.get(trimmedVariableName) ?? 0) > 1;
		const variableError = trimmedVariableName
			? undefined
			: t('form.workflow.forms.updateState.validation.variableRequired', {
					defaultValue: 'Variable name is required',
				});
		const promptWarning =
			expression.type === 'llm' && !expression.prompt.trim()
				? t('form.workflow.forms.updateState.validation.promptRequired', {
						defaultValue: 'LLM prompt is required',
					})
				: undefined;

		return (
			<div className={styles.editor}>
				<Stack gap='xs'>
					<Autocomplete
						label={t('form.workflow.forms.updateState.variableName.label', {
							defaultValue: 'Variable to update',
						})}
						placeholder={t(
							'form.workflow.forms.updateState.variableName.placeholder',
							{
								defaultValue: 'Dynamic variable that should be updated',
							}
						)}
						data={variableOptions}
						value={variableName}
						onChange={(value) =>
							handleUpdateChange(index, (current) => ({
								...current,
								variableName: value,
							}))
						}
						size='sm'
						error={variableError}
						classNames={{
							label: styles.label,
							input: styles.input,
						}}
					/>
					{isDuplicate ? (
						<Text size='xs' c='orange.7' className={styles.warningText}>
							{t(
								'form.workflow.forms.updateState.validation.duplicateVariable',
								{
									defaultValue: 'This variable is already being updated',
								}
							)}
						</Text>
					) : null}

					<div className={styles.valueGrid}>
						<Select
							label={t('form.workflow.forms.updateState.expressionType.label', {
								defaultValue: 'New value',
							})}
							data={[
								{
									value: 'string',
									label: t(
										'form.workflow.forms.updateState.expressionType.options.string',
										{
											defaultValue: 'String',
										}
									),
								},
								{
									value: 'number',
									label: t(
										'form.workflow.forms.updateState.expressionType.options.number',
										{
											defaultValue: 'Number',
										}
									),
								},
								{
									value: 'boolean_true',
									label: t(
										'form.workflow.forms.updateState.expressionType.options.true',
										{
											defaultValue: 'True',
										}
									),
								},
								{
									value: 'boolean_false',
									label: t(
										'form.workflow.forms.updateState.expressionType.options.false',
										{
											defaultValue: 'False',
										}
									),
								},
								{
									value: 'null',
									label: t(
										'form.workflow.forms.updateState.expressionType.options.null',
										{
											defaultValue: 'Null',
										}
									),
								},
								{
									value: 'dynamic_variable',
									label: t(
										'form.workflow.forms.updateState.expressionType.options.dynamicVariable',
										{
											defaultValue: 'Dynamic Variable',
										}
									),
								},
								{
									value: 'llm',
									label: t(
										'form.workflow.forms.updateState.expressionType.options.llm',
										{
											defaultValue: 'LLM Evaluation',
										}
									),
								},
							]}
							value={expressionKind}
							onChange={(value) =>
								handleExpressionKindChange(
									index,
									(value as UpdateStateExpressionKind) ?? 'llm'
								)
							}
							comboboxProps={{ withinPortal: true, zIndex: 360 }}
							clearable={false}
							size='sm'
							classNames={{
								label: styles.label,
								input: styles.input,
							}}
						/>

						{expression.type === 'llm' && (
							<Select
								label={t(
									'form.workflow.forms.updateState.expressionSchema.label',
									{
										defaultValue: 'Result type',
									}
								)}
								data={[
									{
										value: 'string',
										label: t(
											'form.workflow.forms.updateState.expressionSchema.options.string',
											{ defaultValue: 'String' }
										),
									},
									{
										value: 'boolean',
										label: t(
											'form.workflow.forms.updateState.expressionSchema.options.boolean',
											{ defaultValue: 'Boolean' }
										),
									},
									{
										value: 'integer',
										label: t(
											'form.workflow.forms.updateState.expressionSchema.options.integer',
											{ defaultValue: 'Integer' }
										),
									},
									{
										value: 'number',
										label: t(
											'form.workflow.forms.updateState.expressionSchema.options.number',
											{ defaultValue: 'Number' }
										),
									},
								]}
								value={expression.valueSchema.type}
								onChange={(value) =>
									handleSchemaTypeChange(
										index,
										(value as 'string' | 'boolean' | 'integer' | 'number') ??
											'string'
									)
								}
								comboboxProps={{ withinPortal: true, zIndex: 360 }}
								clearable={false}
								size='sm'
								classNames={{
									label: styles.label,
									input: styles.input,
								}}
							/>
						)}
					</div>

					{expression.type === 'llm' ? (
						<Textarea
							label={t('form.workflow.forms.updateState.prompt.label', {
								defaultValue: 'Prompt',
							})}
							placeholder={t(
								'form.workflow.forms.updateState.prompt.placeholder',
								{
									defaultValue: 'Describe this value to the LLM',
								}
							)}
							value={expression.prompt}
							onChange={(event) =>
								handleExpressionPromptChange(index, event.currentTarget.value)
							}
							minRows={7}
							autosize
							maxRows={14}
							size='sm'
							error={promptWarning}
							classNames={{
								label: styles.label,
								input: styles.promptTextarea,
							}}
						/>
					) : expression.type === 'string' ? (
						<TextInput
							label={t('form.workflow.forms.updateState.value.label', {
								defaultValue: 'Value',
							})}
							placeholder={t(
								'form.workflow.forms.updateState.value.placeholder',
								{ defaultValue: 'Enter text' }
							)}
							value={expression.value}
							onChange={(event) => {
								const nextUpdates = updates.map((current, itemIndex) => {
									if (itemIndex !== index) return current;
									const nextUpdate: UpdateStateUpdate = {
										...current,
										expression: {
											type: 'string',
											value: event.currentTarget.value,
										},
									};
									return nextUpdate;
								});
								handleUpdate({ updates: nextUpdates });
							}}
							size='sm'
							classNames={{
								label: styles.label,
								input: styles.input,
							}}
						/>
					) : expression.type === 'number' ? (
						<NumberInput
							label={t('form.workflow.forms.updateState.value.label', {
								defaultValue: 'Value',
							})}
							placeholder={t(
								'form.workflow.forms.updateState.value.placeholder',
								{ defaultValue: 'Enter number' }
							)}
							value={Number.isFinite(expression.value) ? expression.value : ''}
							onChange={(value) => {
								const nextUpdates = updates.map((current, itemIndex) => {
									if (itemIndex !== index) return current;
									const nextUpdate: UpdateStateUpdate = {
										...current,
										expression: {
											type: 'number',
											value:
												typeof value === 'number' && Number.isFinite(value)
													? value
													: Number.NaN,
										},
									};
									return nextUpdate;
								});
								handleUpdate({ updates: nextUpdates });
							}}
							min={0}
							allowNegative={true}
							size='sm'
							classNames={{
								label: styles.label,
								input: styles.input,
							}}
						/>
					) : expression.type === 'dynamic_variable' ? (
						<Autocomplete
							label={t('form.workflow.forms.updateState.value.label', {
								defaultValue: 'Value',
							})}
							placeholder={t(
								'form.workflow.forms.updateState.value.dynamicPlaceholder',
								{
									defaultValue: 'Select variable',
								}
							)}
							data={variableOptions}
							value={expression.variableName}
							onChange={(value) => {
								const nextUpdates = updates.map((current, itemIndex) => {
									if (itemIndex !== index) return current;
									const nextUpdate: UpdateStateUpdate = {
										...current,
										expression: {
											type: 'dynamic_variable',
											variableName: value,
										},
									};
									return nextUpdate;
								});
								handleUpdate({ updates: nextUpdates });
							}}
							size='sm'
							classNames={{
								label: styles.label,
								input: styles.input,
							}}
						/>
					) : (
						<Text size='xs' c='dimmed' className={styles.helperText}>
							{t('form.workflow.forms.updateState.value.fixedValue', {
								defaultValue: 'Fixed value selected.',
							})}
						</Text>
					)}

					{expression.type === 'llm' && (
						<Group gap='xs' align='center' wrap='nowrap'>
							<Button size='xs' variant='light' disabled>
								{t('form.workflow.forms.updateState.wrapIn', {
									defaultValue: 'Wrap in',
								})}
							</Button>
							{promptWarning ? (
								<Text size='xs' c='orange.7' className={styles.warningText}>
									{promptWarning}
								</Text>
							) : null}
						</Group>
					)}
				</Stack>
			</div>
		);
	};

	return (
		<WorkflowNodeForm
			title={t('form.workflow.forms.updateState.title', {
				defaultValue: 'Update state',
			})}
			description={t('form.workflow.forms.updateState.description', {
				defaultValue: 'Configure dynamic variables updated by this node.',
			})}
		>
			<Stack gap='xs'>
				<TextInput
					label={t('form.workflow.forms.updateState.label.label', {
						defaultValue: 'Node name',
					})}
					placeholder={t('form.workflow.forms.updateState.label.placeholder', {
						defaultValue: 'Enter node name',
					})}
					value={node.label ?? ''}
					onChange={(event) => handleLabelChange(event.currentTarget.value)}
					size='sm'
					classNames={{
						label: styles.label,
						input: styles.input,
					}}
				/>

				<Tabs
					defaultValue='general'
					classNames={{
						root: styles.tabs,
						list: styles.tabList,
						tab: styles.tab,
						panel: styles.tabPanel,
					}}
				>
					<Tabs.List>
						<Tabs.Tab value='general'>
							{t('form.workflow.forms.updateState.tabs.general', {
								defaultValue: 'General',
							})}
						</Tabs.Tab>
						<Tabs.Tab value='edges'>
							{t('form.workflow.forms.updateState.tabs.edges', {
								defaultValue: 'Edges',
							})}
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='general'>
						<Stack gap='sm'>
							<Group justify='space-between' align='center'>
								<div>
									<Text size='sm' fw={600}>
										{t('form.workflow.forms.updateState.updates.title', {
											defaultValue: 'Updates',
										})}
									</Text>
									<Text size='xs' c='dimmed'>
										{t('form.workflow.forms.updateState.updates.description', {
											defaultValue:
												'Add one or more dynamic variable assignments for this node.',
										})}
									</Text>
								</div>
								<Button
									size='xs'
									variant='light'
									leftSection={<IconPlus size={14} />}
									onClick={handleAddUpdate}
								>
									{t('form.workflow.forms.updateState.addUpdate', {
										defaultValue: 'Add update',
									})}
								</Button>
							</Group>

							{updates.length === 0 ? (
								<div className={styles.emptyState}>
									<Text size='xs' c='dimmed'>
										{t('form.workflow.forms.updateState.empty', {
											defaultValue: 'No updates configured',
										})}
									</Text>
								</div>
							) : (
								<DragDropContext onDragEnd={handleReorderUpdates}>
									<Droppable droppableId={`update-state-updates-${nodeId}`}>
										{(provided) => (
											<div
												{...provided.droppableProps}
												ref={provided.innerRef}
												className={styles.updateList}
											>
												{updates.map((update, index) => {
													const isExpanded = expandedUpdateIndex === index;
													const safeExpression =
														update.expression ??
														createDefaultUpdateStateExpression('llm');
													const preview =
														formatUpdateStateExpressionPreview(safeExpression);
													const variableName = getTrimmedString(
														update.variableName
													);

													return (
														<Draggable
															key={`update-${index}`}
															draggableId={`update-${index}`}
															index={index}
														>
															{(providedDraggable, snapshot) => (
																<div
																	ref={providedDraggable.innerRef}
																	{...providedDraggable.draggableProps}
																	className={`${styles.updateCard} ${
																		snapshot.isDragging
																			? styles.updateCardDragging
																			: ''
																	}`}
																>
																	<div className={styles.updateHeader}>
																		<div
																			{...providedDraggable.dragHandleProps}
																			className={styles.dragHandle}
																		>
																			<IconGripVertical size={16} />
																		</div>
																		<button
																			type='button'
																			className={styles.updateSummary}
																			onClick={() =>
																				setExpandedUpdateIndex((current) =>
																					current === index ? null : index
																				)
																			}
																		>
																			<span className={styles.updateIcon}>
																				<IconBraces size={14} />
																			</span>
																			<span className={styles.updateCopy}>
																				<Text size='sm' fw={600} lineClamp={1}>
																					{variableName ||
																						t(
																							'form.workflow.forms.updateState.variableName.placeholder',
																							{
																								defaultValue:
																									'Dynamic variable that should be updated',
																							}
																						)}
																				</Text>
																				<Text
																					size='xs'
																					c='dimmed'
																					lineClamp={1}
																					className={styles.preview}
																				>
																					{preview}
																				</Text>
																			</span>
																		</button>
																		<Group
																			gap={4}
																			wrap='nowrap'
																			className={styles.updateActions}
																		>
																			<Tooltip
																				label={t(
																					'form.workflow.forms.updateState.collapse',
																					{
																						defaultValue: isExpanded
																							? 'Collapse update'
																							: 'Expand update',
																					}
																				)}
																				withArrow
																			>
																				<ActionIcon
																					size='sm'
																					variant='subtle'
																					color='gray'
																					onClick={() =>
																						setExpandedUpdateIndex((current) =>
																							current === index ? null : index
																						)
																					}
																					aria-label={t(
																						'form.workflow.forms.updateState.collapse',
																						{
																							defaultValue: isExpanded
																								? 'Collapse update'
																								: 'Expand update',
																						}
																					)}
																				>
																					<IconChevronDown
																						size={14}
																						className={
																							isExpanded
																								? styles.chevronOpen
																								: styles.chevron
																						}
																					/>
																				</ActionIcon>
																			</Tooltip>
																			<Tooltip
																				label={t(
																					'form.workflow.forms.updateState.remove',
																					{ defaultValue: 'Remove update' }
																				)}
																				withArrow
																			>
																				<ActionIcon
																					size='sm'
																					variant='subtle'
																					color='red'
																					onClick={() =>
																						handleRemoveUpdate(index)
																					}
																					aria-label={t(
																						'form.workflow.forms.updateState.remove',
																						{ defaultValue: 'Remove update' }
																					)}
																				>
																					<IconTrash size={14} />
																				</ActionIcon>
																			</Tooltip>
																		</Group>
																	</div>

																	<Collapse expanded={isExpanded}>
																		<div className={styles.updateEditor}>
																			{renderUpdateEditor(update, index)}
																		</div>
																	</Collapse>
																</div>
															)}
														</Draggable>
													);
												})}
												{provided.placeholder}
											</div>
										)}
									</Droppable>
								</DragDropContext>
							)}
						</Stack>
					</Tabs.Panel>

					<Tabs.Panel value='edges'>
						<NodeEdgesTab
							nodeId={nodeId}
							workflow={workflow}
							onWorkflowChange={onWorkflowChange}
							title={t('form.workflow.forms.updateState.tabs.edges', {
								defaultValue: 'Edges',
							})}
							description={t('form.workflow.forms.agent.edgesTab.description')}
							emptyMessage={t('form.workflow.forms.agent.edgesTab.empty')}
						/>
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</WorkflowNodeForm>
	);
};

export default UpdateStateForm;
