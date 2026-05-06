import { useMemo } from 'react';
import {
	ActionIcon,
	Button,
	Group,
	SegmentedControl,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { IconBraces, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { usePromptVariables } from '~/hooks/usePromptVariables';
import type {
	BoolExpr,
	ComparisonOperatorExpr,
	ValueExpr,
} from '~/models/AgentWorkflowModel';
import { useCampaignId } from '~/modules/campaigns/campaignFormFunctions';
import { WORKFLOW_DRAWER_COMBOBOX_PROPS } from '../../workflowDrawerComboboxProps';
import {
	addChildToGroupAtPath,
	changeComparisonOperator,
	createBranchByKind,
	createDefaultExpression,
	createDefaultValueExpr,
	getBranchKind,
	isComparisonExpr,
	isGroupExpr,
	pathKey,
	removeChildFromGroupAtPath,
	updateExpressionAtPath,
	validateExpression,
	wrapExpressionAtPath,
	type ExpressionBranchKind,
	type ExpressionComparisonType,
	type ExpressionGroupType,
	type ExpressionValueType,
} from './ExpressionBuilder.helpers';
import styles from './ExpressionBuilder.module.css';

interface ExpressionBuilderProps {
	value?: BoolExpr;
	onChange: (nextExpression: BoolExpr) => void;
}

interface ExpressionNodeProps {
	expression: BoolExpr;
	path: number[];
	rootExpression: BoolExpr;
	onChange: (nextExpression: BoolExpr) => void;
	errorTextForPath: (path: string) => string | undefined;
	parentPath?: number[];
	childIndex?: number;
	siblingCount?: number;
}

interface ComparisonRowProps {
	expression: ComparisonOperatorExpr;
	path: number[];
	onChange: (nextExpression: ComparisonOperatorExpr) => void;
	errorTextForPath: (path: string) => string | undefined;
}

interface ValueEditorProps {
	value: ValueExpr | undefined;
	onChange: (nextValue: ValueExpr) => void;
	error?: string;
	ariaLabel: string;
}

const ExpressionBuilder = ({ value, onChange }: ExpressionBuilderProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const expression = value ?? createDefaultExpression();
	const validationErrors = useMemo(
		() => validateExpression(expression),
		[expression]
	);

	const errorTextForPath = (errorPath: string) => {
		const matchingError = validationErrors.find(
			(error) => error.path === errorPath
		);
		if (!matchingError) return undefined;

		return t(`form.workflow.edge.expression.errors.${matchingError.code}`, {
			defaultValue: matchingError.code,
		});
	};

	return (
		<Stack gap='xs'>
			<Group justify='space-between' align='center' gap='xs' wrap='wrap'>
				<div>
					<Text size='sm' fw={600}>
						{t('form.workflow.edge.expression.title', {
							defaultValue: 'Expression',
						})}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('form.workflow.edge.expression.description', {
							defaultValue:
								'Build the rule that controls when this edge is used.',
						})}
					</Text>
				</div>
				<Button
					size='xs'
					variant='light'
					leftSection={<IconBraces size={14} />}
					onClick={() => onChange(createDefaultExpression())}
				>
					{t('form.workflow.edge.expression.reset', {
						defaultValue: 'Reset',
					})}
				</Button>
			</Group>

			{validationErrors.length > 0 ? (
				<Text size='xs' c='red'>
					{t('form.workflow.edge.expression.validationSummary', {
						defaultValue: 'Complete the highlighted expression fields to save.',
					})}
				</Text>
			) : null}

			<ExpressionNode
				expression={expression}
				path={[]}
				rootExpression={expression}
				onChange={onChange}
				errorTextForPath={errorTextForPath}
			/>
		</Stack>
	);
};

const ExpressionNode = ({
	expression,
	path,
	rootExpression,
	onChange,
	errorTextForPath,
	parentPath,
	childIndex,
	siblingCount = 1,
}: ExpressionNodeProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const branchKind = getBranchKind(expression);
	const currentPath = pathKey(path);
	const canRemove = parentPath !== undefined && siblingCount > 1;

	const updateCurrentExpression = (nextExpression: BoolExpr) => {
		onChange(
			updateExpressionAtPath(rootExpression, path, () => nextExpression)
		);
	};

	const changeBranchKind = (kind: ExpressionBranchKind) => {
		updateCurrentExpression(createBranchByKind(kind));
	};

	const wrapInGroup = (groupType: ExpressionGroupType) => {
		onChange(wrapExpressionAtPath(rootExpression, path, groupType));
	};

	const removeBranch = () => {
		if (parentPath === undefined || childIndex === undefined) return;
		onChange(
			removeChildFromGroupAtPath(rootExpression, parentPath, childIndex)
		);
	};

	return (
		<div className={styles.branchShell} data-depth={path.length}>
			<div className={styles.branchToolbar}>
				<Select
					aria-label={t('form.workflow.edge.expression.branchType', {
						defaultValue: 'Branch type',
					})}
					size='xs'
					className={styles.branchKindSelect}
					data={[
						{
							value: 'comparison',
							label: t('form.workflow.edge.expression.branchTypes.comparison', {
								defaultValue: 'Comparison',
							}),
						},
						{
							value: 'group',
							label: t('form.workflow.edge.expression.branchTypes.group', {
								defaultValue: 'Group',
							}),
						},
						{
							value: 'llm',
							label: t('form.workflow.edge.expression.branchTypes.llm', {
								defaultValue: 'LLM prompt',
							}),
						},
					]}
					value={branchKind}
					onChange={(nextValue) =>
						changeBranchKind(
							(nextValue as ExpressionBranchKind) ?? 'comparison'
						)
					}
					comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
					clearable={false}
				/>

				<Group gap={4} wrap='nowrap'>
					<Button
						size='compact-xs'
						variant='subtle'
						onClick={() => wrapInGroup('and_operator')}
					>
						{t('form.workflow.edge.expression.wrapAnd', {
							defaultValue: 'Wrap AND',
						})}
					</Button>
					<Button
						size='compact-xs'
						variant='subtle'
						onClick={() => wrapInGroup('or_operator')}
					>
						{t('form.workflow.edge.expression.wrapOr', {
							defaultValue: 'Wrap OR',
						})}
					</Button>
					{canRemove ? (
						<Tooltip
							label={t('form.workflow.edge.expression.removeBranch', {
								defaultValue: 'Remove branch',
							})}
							withArrow
						>
							<ActionIcon
								size='sm'
								color='red'
								variant='subtle'
								aria-label={t('form.workflow.edge.expression.removeBranch', {
									defaultValue: 'Remove branch',
								})}
								onClick={removeBranch}
							>
								<IconTrash size={14} />
							</ActionIcon>
						</Tooltip>
					) : null}
				</Group>
			</div>

			{isGroupExpr(expression) ? (
				<ExpressionGroup
					expression={expression}
					path={path}
					rootExpression={rootExpression}
					onChange={onChange}
					errorTextForPath={errorTextForPath}
				/>
			) : isComparisonExpr(expression) ? (
				<ComparisonRow
					expression={expression}
					path={path}
					onChange={(nextExpression) => updateCurrentExpression(nextExpression)}
					errorTextForPath={errorTextForPath}
				/>
			) : expression.type === 'llm' ? (
				<Textarea
					aria-label={t('form.workflow.edge.expression.llmPrompt', {
						defaultValue: 'LLM prompt',
					})}
					placeholder={t('form.workflow.edge.expression.llmPromptPlaceholder', {
						defaultValue: 'Ask the model to evaluate this branch...',
					})}
					value={expression.prompt}
					onChange={(event) =>
						updateCurrentExpression({
							type: 'llm',
							prompt: event.currentTarget.value,
						})
					}
					error={errorTextForPath(currentPath)}
					size='sm'
					minRows={3}
				/>
			) : (
				<Text size='xs' c='red'>
					{errorTextForPath(currentPath) ??
						t('form.workflow.edge.expression.errors.unsupportedExpression', {
							defaultValue: 'This expression branch is not supported.',
						})}
				</Text>
			)}
		</div>
	);
};

const ExpressionGroup = ({
	expression,
	path,
	rootExpression,
	onChange,
	errorTextForPath,
}: ExpressionNodeProps & {
	expression: Extract<BoolExpr, { type: ExpressionGroupType }>;
}) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const currentPath = pathKey(path);

	const updateGroupType = (type: ExpressionGroupType) => {
		onChange(
			updateExpressionAtPath(rootExpression, path, (currentExpression) =>
				isGroupExpr(currentExpression)
					? { ...currentExpression, type }
					: currentExpression
			)
		);
	};

	return (
		<div className={styles.groupShell}>
			<Group justify='space-between' align='center' gap='xs' wrap='wrap'>
				<SegmentedControl
					size='xs'
					value={expression.type}
					onChange={(nextValue) =>
						updateGroupType(nextValue as ExpressionGroupType)
					}
					data={[
						{
							value: 'or_operator',
							label: t('form.workflow.edge.expression.operators.or', {
								defaultValue: 'OR',
							}),
						},
						{
							value: 'and_operator',
							label: t('form.workflow.edge.expression.operators.and', {
								defaultValue: 'AND',
							}),
						},
					]}
				/>
				<Button
					size='compact-xs'
					variant='light'
					leftSection={<IconPlus size={13} />}
					onClick={() => onChange(addChildToGroupAtPath(rootExpression, path))}
				>
					{t('form.workflow.edge.expression.addBranch', {
						defaultValue: 'Add branch',
					})}
				</Button>
			</Group>

			{errorTextForPath(currentPath) ? (
				<Text size='xs' c='red'>
					{errorTextForPath(currentPath)}
				</Text>
			) : null}

			<Stack gap='xs' className={styles.groupChildren}>
				{expression.children.map((childExpression, index) => (
					<ExpressionNode
						key={`${currentPath}-${index}-${childExpression.type}`}
						expression={childExpression}
						path={[...path, index]}
						parentPath={path}
						childIndex={index}
						siblingCount={expression.children.length}
						rootExpression={rootExpression}
						onChange={onChange}
						errorTextForPath={errorTextForPath}
					/>
				))}
			</Stack>
		</div>
	);
};

const ComparisonRow = ({
	expression,
	path,
	onChange,
	errorTextForPath,
}: ComparisonRowProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const currentPath = pathKey(path);

	const updateValue = (side: 'left' | 'right', nextValue: ValueExpr) => {
		onChange({
			...expression,
			[side]: nextValue,
		});
	};

	return (
		<div className={styles.comparisonGrid}>
			<ValueEditor
				value={expression.left}
				onChange={(nextValue) => updateValue('left', nextValue)}
				error={errorTextForPath(`${currentPath}:left`)}
				ariaLabel={t('form.workflow.edge.expression.leftValue', {
					defaultValue: 'Left value',
				})}
			/>
			<Select
				aria-label={t('form.workflow.edge.expression.comparisonOperator', {
					defaultValue: 'Comparison operator',
				})}
				size='sm'
				data={[
					{
						value: 'eq_operator',
						label: t('form.workflow.edge.expression.comparisons.eq', {
							defaultValue: 'Equals',
						}),
					},
					{
						value: 'neq_operator',
						label: t('form.workflow.edge.expression.comparisons.neq', {
							defaultValue: 'Does not equal',
						}),
					},
					{
						value: 'gt_operator',
						label: t('form.workflow.edge.expression.comparisons.gt', {
							defaultValue: 'Greater than',
						}),
					},
					{
						value: 'gte_operator',
						label: t('form.workflow.edge.expression.comparisons.gte', {
							defaultValue: 'Greater or equal',
						}),
					},
					{
						value: 'lt_operator',
						label: t('form.workflow.edge.expression.comparisons.lt', {
							defaultValue: 'Less than',
						}),
					},
					{
						value: 'lte_operator',
						label: t('form.workflow.edge.expression.comparisons.lte', {
							defaultValue: 'Less or equal',
						}),
					},
				]}
				value={expression.type}
				onChange={(nextValue) =>
					onChange(
						changeComparisonOperator(
							expression,
							(nextValue as ExpressionComparisonType) ?? 'eq_operator'
						)
					)
				}
				comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
				clearable={false}
			/>
			<ValueEditor
				value={expression.right}
				onChange={(nextValue) => updateValue('right', nextValue)}
				error={errorTextForPath(`${currentPath}:right`)}
				ariaLabel={t('form.workflow.edge.expression.rightValue', {
					defaultValue: 'Right value',
				})}
			/>
		</div>
	);
};

const ValueEditor = ({
	value,
	onChange,
	error,
	ariaLabel,
}: ValueEditorProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const campaignId = useCampaignId();
	const variables = usePromptVariables(campaignId || 0);
	const valueType = value?.type ?? 'string_literal';

	const variableData = useMemo(() => {
		const seenVariableNames = new Set<string>();
		const uniqueVariables = variables.filter((variable) => {
			const normalizedName = variable.name.trim();
			if (!normalizedName || seenVariableNames.has(normalizedName)) {
				return false;
			}
			seenVariableNames.add(normalizedName);
			return true;
		});

		const systemVariables = uniqueVariables
			.filter((variable) => variable.source === 'system')
			.map((variable) => ({
				value: variable.name,
				label: variable.name,
			}));
		const customVariables = uniqueVariables
			.filter((variable) => variable.source === 'schema')
			.map((variable) => ({
				value: variable.name,
				label: variable.name,
			}));
		const campaignVariables = uniqueVariables
			.filter((variable) => variable.source === 'campaign')
			.map((variable) => ({
				value: variable.name,
				label: variable.name,
			}));

		return [
			{
				group: t('form.workflow.edge.expression.variables.system', {
					defaultValue: 'System Variables',
				}),
				items: systemVariables,
			},
			{
				group: t('form.workflow.edge.expression.variables.custom', {
					defaultValue: 'Custom Variables',
				}),
				items: customVariables,
			},
			{
				group: t('form.workflow.edge.expression.variables.campaign', {
					defaultValue: 'Campaign Variables',
				}),
				items: campaignVariables,
			},
		].filter((group) => group.items.length > 0);
	}, [t, variables]);

	const updateValueType = (type: ExpressionValueType) => {
		onChange(createDefaultValueExpr(type));
	};

	const renderValueInput = () => {
		if (!value) {
			return null;
		}

		switch (value.type) {
			case 'dynamic_variable':
				return (
					<Select
						aria-label={ariaLabel}
						placeholder={t(
							'form.workflow.edge.expression.dynamicVariablePlaceholder',
							{ defaultValue: 'Select variable' }
						)}
						searchable
						data={variableData}
						value={value.name || null}
						onChange={(nextValue) =>
							onChange({
								type: 'dynamic_variable',
								name: nextValue ?? '',
							})
						}
						nothingFoundMessage={t(
							'form.workflow.edge.expression.noVariables',
							{ defaultValue: 'No variables found' }
						)}
						comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
						error={error}
						size='sm'
					/>
				);
			case 'number_literal':
				return (
					<TextInput
						aria-label={ariaLabel}
						type='number'
						placeholder={t('form.workflow.edge.expression.numberPlaceholder', {
							defaultValue: 'Enter number',
						})}
						value={Number.isFinite(value.value) ? String(value.value) : ''}
						onChange={(event) => {
							const nextValue = event.currentTarget.value;
							onChange({
								type: 'number_literal',
								value: nextValue.trim() ? Number(nextValue) : Number.NaN,
							});
						}}
						error={error}
						size='sm'
					/>
				);
			case 'boolean_literal':
				return (
					<Select
						aria-label={ariaLabel}
						data={[
							{
								value: 'true',
								label: t('form.workflow.edge.expression.boolean.true', {
									defaultValue: 'True',
								}),
							},
							{
								value: 'false',
								label: t('form.workflow.edge.expression.boolean.false', {
									defaultValue: 'False',
								}),
							},
						]}
						value={String(value.value)}
						onChange={(nextValue) =>
							onChange({
								type: 'boolean_literal',
								value: nextValue !== 'false',
							})
						}
						comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
						error={error}
						size='sm'
						clearable={false}
					/>
				);
			case 'llm':
				return (
					<Textarea
						aria-label={ariaLabel}
						placeholder={t(
							'form.workflow.edge.expression.llmValuePlaceholder',
							{
								defaultValue: 'Prompt the model...',
							}
						)}
						value={value.prompt}
						onChange={(event) =>
							onChange({
								type: 'llm',
								prompt: event.currentTarget.value,
							})
						}
						error={error}
						size='sm'
						minRows={2}
					/>
				);
			case 'string_literal':
			default:
				return (
					<TextInput
						aria-label={ariaLabel}
						placeholder={t('form.workflow.edge.expression.stringPlaceholder', {
							defaultValue: 'Enter text',
						})}
						value={value.type === 'string_literal' ? value.value : ''}
						onChange={(event) =>
							onChange({
								type: 'string_literal',
								value: event.currentTarget.value,
							})
						}
						error={error}
						size='sm'
					/>
				);
		}
	};

	return (
		<div className={styles.valueEditor}>
			<Select
				aria-label={t('form.workflow.edge.expression.valueType', {
					defaultValue: 'Value type',
				})}
				size='xs'
				data={[
					{
						value: 'dynamic_variable',
						label: t('form.workflow.edge.expression.valueTypes.variable', {
							defaultValue: 'Variable',
						}),
					},
					{
						value: 'string_literal',
						label: t('form.workflow.edge.expression.valueTypes.text', {
							defaultValue: 'Text',
						}),
					},
					{
						value: 'number_literal',
						label: t('form.workflow.edge.expression.valueTypes.number', {
							defaultValue: 'Number',
						}),
					},
					{
						value: 'boolean_literal',
						label: t('form.workflow.edge.expression.valueTypes.boolean', {
							defaultValue: 'Boolean',
						}),
					},
					{
						value: 'llm',
						label: t('form.workflow.edge.expression.valueTypes.llm', {
							defaultValue: 'LLM',
						}),
					},
				]}
				value={valueType}
				onChange={(nextValue) =>
					updateValueType(
						(nextValue as ExpressionValueType) ?? 'string_literal'
					)
				}
				comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
				clearable={false}
			/>
			{renderValueInput()}
		</div>
	);
};

export default ExpressionBuilder;
