import type {
	BoolExpr,
	ComparisonOperatorExpr,
	ValueExpr,
} from '~/models/AgentWorkflowModel';

export type ExpressionGroupType = 'or_operator' | 'and_operator';
export type ExpressionComparisonType =
	| 'eq_operator'
	| 'neq_operator'
	| 'gt_operator'
	| 'gte_operator'
	| 'lt_operator'
	| 'lte_operator';
export type ExpressionValueType =
	| 'dynamic_variable'
	| 'string_literal'
	| 'number_literal'
	| 'boolean_literal'
	| 'llm';
export type ExpressionBranchKind = 'comparison' | 'group' | 'llm';

export type ExpressionValidationCode =
	| 'emptyDynamicVariable'
	| 'emptyStringLiteral'
	| 'invalidNumberLiteral'
	| 'emptyLlmPrompt'
	| 'missingComparisonValue'
	| 'emptyGroup'
	| 'unsupportedExpression';

export interface ExpressionValidationError {
	path: string;
	code: ExpressionValidationCode;
}

export const pathKey = (path: number[]) =>
	path.length > 0 ? path.join('.') : 'root';

export const createDefaultValueExpr = (
	type: ExpressionValueType = 'string_literal'
): ValueExpr => {
	switch (type) {
		case 'dynamic_variable':
			return { type: 'dynamic_variable', name: '' };
		case 'number_literal':
			return { type: 'number_literal', value: Number.NaN };
		case 'boolean_literal':
			return { type: 'boolean_literal', value: true };
		case 'llm':
			return { type: 'llm', prompt: '' };
		case 'string_literal':
		default:
			return { type: 'string_literal', value: '' };
	}
};

export const createDefaultComparisonExpr = (): ComparisonOperatorExpr => ({
	type: 'eq_operator',
	left: createDefaultValueExpr('dynamic_variable'),
	right: createDefaultValueExpr('string_literal'),
});

export const createDefaultExpression = (): BoolExpr =>
	createDefaultComparisonExpr();

export const isGroupExpr = (
	expr: BoolExpr
): expr is Extract<BoolExpr, { type: ExpressionGroupType }> =>
	expr.type === 'or_operator' || expr.type === 'and_operator';

export const isComparisonExpr = (
	expr: BoolExpr
): expr is ComparisonOperatorExpr =>
	[
		'eq_operator',
		'neq_operator',
		'gt_operator',
		'gte_operator',
		'lt_operator',
		'lte_operator',
	].includes(expr.type);

export const getBranchKind = (expr: BoolExpr): ExpressionBranchKind => {
	if (isGroupExpr(expr)) return 'group';
	if (expr.type === 'llm') return 'llm';
	return 'comparison';
};

export const createBranchByKind = (kind: ExpressionBranchKind): BoolExpr => {
	switch (kind) {
		case 'group':
			return createDefaultExpression();
		case 'llm':
			return { type: 'llm', prompt: '' };
		case 'comparison':
		default:
			return createDefaultComparisonExpr();
	}
};

export const updateExpressionAtPath = (
	root: BoolExpr,
	path: number[],
	updater: (expr: BoolExpr) => BoolExpr
): BoolExpr => {
	if (path.length === 0) {
		return updater(root);
	}

	if (!isGroupExpr(root)) {
		return root;
	}

	const [childIndex, ...rest] = path;
	if (childIndex === undefined || !root.children[childIndex]) {
		return root;
	}

	const nextChildren = root.children.map((child, index) =>
		index === childIndex ? updateExpressionAtPath(child, rest, updater) : child
	);

	return {
		...root,
		children: nextChildren,
	};
};

export const addChildToGroupAtPath = (
	root: BoolExpr,
	groupPath: number[]
): BoolExpr =>
	updateExpressionAtPath(root, groupPath, (expr) => {
		if (!isGroupExpr(expr)) return expr;
		return {
			...expr,
			children: [...expr.children, createDefaultComparisonExpr()],
		};
	});

export const removeChildFromGroupAtPath = (
	root: BoolExpr,
	groupPath: number[],
	childIndex: number
): BoolExpr =>
	updateExpressionAtPath(root, groupPath, (expr) => {
		if (!isGroupExpr(expr)) return expr;
		return {
			...expr,
			children: expr.children.filter((_, index) => index !== childIndex),
		};
	});

export const wrapExpressionAtPath = (
	root: BoolExpr,
	path: number[],
	groupType: ExpressionGroupType
): BoolExpr =>
	updateExpressionAtPath(root, path, (expr) => ({
		type: groupType,
		children: [expr],
	}));

export const normalizeExpressionForSave = (expr: BoolExpr): BoolExpr => {
	if (!isGroupExpr(expr)) {
		return expr;
	}

	const children = expr.children.map(normalizeExpressionForSave);

	if (children.length === 1 && children[0]) {
		return children[0];
	}

	return {
		...expr,
		children,
	};
};

export const changeComparisonOperator = (
	expr: ComparisonOperatorExpr,
	type: ExpressionComparisonType
): ComparisonOperatorExpr => ({
	type,
	left: expr.left,
	right: expr.right,
});

const validateValueExpression = (
	value: ValueExpr | undefined,
	path: string
): ExpressionValidationError[] => {
	if (!value) {
		return [{ path, code: 'missingComparisonValue' }];
	}

	switch (value.type) {
		case 'dynamic_variable':
			return value.name.trim() ? [] : [{ path, code: 'emptyDynamicVariable' }];
		case 'string_literal':
			return value.value.trim() ? [] : [{ path, code: 'emptyStringLiteral' }];
		case 'number_literal':
			return Number.isFinite(value.value)
				? []
				: [{ path, code: 'invalidNumberLiteral' }];
		case 'boolean_literal':
			return [];
		case 'llm':
			return value.prompt.trim() ? [] : [{ path, code: 'emptyLlmPrompt' }];
		default:
			return [{ path, code: 'unsupportedExpression' }];
	}
};

export const validateExpression = (
	expr: BoolExpr,
	path: number[] = []
): ExpressionValidationError[] => {
	const currentPath = pathKey(path);

	if (isGroupExpr(expr)) {
		if (expr.children.length === 0) {
			return [{ path: currentPath, code: 'emptyGroup' }];
		}

		return expr.children.flatMap((child, index) =>
			validateExpression(child, [...path, index])
		);
	}

	if (isComparisonExpr(expr)) {
		return [
			...validateValueExpression(expr.left, `${currentPath}:left`),
			...validateValueExpression(expr.right, `${currentPath}:right`),
		];
	}

	if (expr.type === 'llm') {
		return expr.prompt.trim()
			? []
			: [{ path: currentPath, code: 'emptyLlmPrompt' }];
	}

	return [{ path: currentPath, code: 'unsupportedExpression' }];
};
