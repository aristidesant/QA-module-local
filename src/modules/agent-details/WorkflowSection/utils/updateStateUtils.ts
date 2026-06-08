import type {
	AgentWorkflow,
	BoolExpr,
	UpdateStateBooleanExpression,
	UpdateStateDynamicVariableExpression,
	UpdateStateExpression,
	UpdateStateLlmExpression,
	UpdateStateNode,
	UpdateStateNumberExpression,
	UpdateStateStringExpression,
	UpdateStateUpdate,
} from '~/models/AgentWorkflowModel';

export type UpdateStateExpressionKind =
	| 'llm'
	| 'string_literal'
	| 'number_literal'
	| 'boolean_true'
	| 'boolean_false'
	| 'null_literal'
	| 'dynamic_variable';

export const DEFAULT_UPDATE_STATE_VARIABLE_NAMES = [
	'greeting',
	'saludo',
	'TE',
	'firstName',
	'lastName',
	'producto',
	'telefono',
	'intento_captura',
	'identify_confirmed',
	'disponibilidad_cliente',
	'modality',
	'tipo_unidad',
	'tipo_residencial',
	'estado_confirmacion_telefono',
	'core_localization',
] as const;

const getRecordString = (
	record: Record<string, unknown>,
	keys: string[]
): string | undefined => {
	for (const key of keys) {
		const value = record[key];
		if (typeof value === 'string') {
			return value;
		}
	}
	return undefined;
};

const getTrimmedString = (value: unknown): string => {
	return typeof value === 'string' ? value.trim() : '';
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const collectBoolExprVariableNames = (
	expression: BoolExpr,
	names: Set<string>
) => {
	switch (expression.type) {
		case 'or_operator':
		case 'and_operator':
			expression.children.forEach((child) =>
				collectBoolExprVariableNames(child, names)
			);
			return;
		case 'eq_operator':
		case 'neq_operator':
		case 'gt_operator':
		case 'gte_operator':
		case 'lt_operator':
		case 'lte_operator':
			collectValueExprVariableNames(expression.left, names);
			collectValueExprVariableNames(expression.right, names);
			return;
		case 'llm':
			return;
		default:
			return;
	}
};

const collectValueExprVariableNames = (value: unknown, names: Set<string>) => {
	if (!value || typeof value !== 'object') return;

	const record = value as Record<string, unknown>;
	if (record.type === 'dynamic_variable') {
		const name = getRecordString(record, [
			'name',
			'variable_name',
			'variable_name',
		]);
		if (name?.trim()) {
			names.add(name.trim());
		}
	}
};

const getUpdateStateExpressionVariableNames = (
	expression: unknown,
	names: Set<string>
) => {
	if (!isRecord(expression)) return;

	if (expression.type === 'dynamic_variable') {
		const name = getTrimmedString(
			expression.variable_name ?? expression.variable_name
		);
		if (name) {
			names.add(name);
		}
	}
};

export const extractWorkflowVariableNames = (
	workflow?: AgentWorkflow
): string[] => {
	const names = new Set<string>(DEFAULT_UPDATE_STATE_VARIABLE_NAMES);

	if (!workflow) {
		return [...names];
	}

	Object.values(workflow.nodes).forEach((node) => {
		if (node.type !== 'update_state') return;

		(node.updates ?? []).forEach((update) => {
			if (!isRecord(update)) return;

			const variable_name = getTrimmedString(
				update.variable_name ?? update.variable_name
			);
			if (variable_name) {
				names.add(variable_name);
			}

			getUpdateStateExpressionVariableNames(update.expression, names);
		});
	});

	Object.values(workflow.edges).forEach((edge) => {
		if (edge.forward_condition?.type === 'expression') {
			collectBoolExprVariableNames(edge.forward_condition.expression, names);
		}

		if (edge.backward_condition?.type === 'expression') {
			collectBoolExprVariableNames(edge.backward_condition.expression, names);
		}
	});

	return [...names];
};

export const createDefaultUpdateStateExpression = (
	type: UpdateStateExpressionKind = 'llm'
): UpdateStateExpression => {
	switch (type) {
		case 'string_literal':
			return { type: 'string_literal', value: '' };
		case 'number_literal':
			return { type: 'number_literal', value: Number.NaN };
		case 'boolean_true':
			return { type: 'boolean_literal', value: true };
		case 'boolean_false':
			return { type: 'boolean_literal', value: false };
		case 'null_literal':
			return { type: 'null_literal' };
		case 'dynamic_variable':
			return { type: 'dynamic_variable', variable_name: '' };
		case 'llm':
		default:
			return {
				type: 'llm',
				value_schema: {
					type: 'string',
					description: '',
					enum: null,
				},
				prompt: '',
			};
	}
};

const getStringFromExpression = (
	expression?: UpdateStateExpression
): string => {
	if (!expression) return '';

	switch (expression.type) {
		case 'string_literal':
			return expression.value;
		case 'number_literal':
			return Number.isFinite(expression.value) ? String(expression.value) : '';
		case 'boolean_literal':
			return expression.value ? 'true' : 'false';
		case 'dynamic_variable':
			return expression.variable_name;
		case 'llm':
		case 'null_literal':
		default:
			return '';
	}
};

export const getUpdateStateExpressionKind = (
	expression?: UpdateStateExpression | null
): UpdateStateExpressionKind => {
	if (!expression) return 'llm';
	if (expression.type === 'boolean_literal') {
		return expression.value ? 'boolean_true' : 'boolean_false';
	}
	return expression.type;
};

export const buildUpdateStateExpression = (
	type: UpdateStateExpressionKind,
	currentExpression?: UpdateStateExpression
): UpdateStateExpression => {
	switch (type) {
		case 'string_literal':
			return {
				type: 'string_literal',
				value: getStringFromExpression(currentExpression),
			} satisfies UpdateStateStringExpression;
		case 'number_literal': {
			const currentValue =
				currentExpression?.type === 'number_literal'
					? currentExpression.value
					: NaN;
			return {
				type: 'number_literal',
				value: currentValue,
			} satisfies UpdateStateNumberExpression;
		}
		case 'boolean_false':
			return {
				type: 'boolean_literal',
				value: false,
			} satisfies UpdateStateBooleanExpression;
		case 'boolean_true':
			return {
				type: 'boolean_literal',
				value: true,
			} satisfies UpdateStateBooleanExpression;
		case 'null_literal':
			return { type: 'null_literal' };
		case 'dynamic_variable':
			return {
				type: 'dynamic_variable',
				variable_name: getStringFromExpression(currentExpression),
			} satisfies UpdateStateDynamicVariableExpression;
		case 'llm':
		default: {
			const prompt =
				currentExpression?.type === 'llm'
					? currentExpression.prompt
					: getStringFromExpression(currentExpression);
			return {
				type: 'llm',
				value_schema: {
					type: 'string',
					description: prompt,
					enum: null,
				},
				prompt,
			} satisfies UpdateStateLlmExpression;
		}
	}
};

export const createDefaultUpdateStateUpdate = (
	variable_name = '',
	expressionType: UpdateStateExpressionKind = 'llm'
): UpdateStateUpdate => ({
	type: 'dynamic_variable',
	variable_name,
	expression: createDefaultUpdateStateExpression(expressionType),
});

export const normalizeUpdateStateExpression = (
	expression: unknown
): UpdateStateExpression => {
	if (!isRecord(expression)) {
		return createDefaultUpdateStateExpression('llm');
	}

	switch (expression.type) {
		case 'llm': {
			const value_schema = isRecord(expression.value_schema)
				? expression.value_schema
				: isRecord(expression.value_schema)
					? expression.value_schema
					: {};
			const schemaType = value_schema.type;
			const normalizedSchemaType =
				schemaType === 'boolean' ||
				schemaType === 'integer' ||
				schemaType === 'number' ||
				schemaType === 'string'
					? schemaType
					: 'string';

			return {
				type: 'llm',
				value_schema: {
					type: normalizedSchemaType,
					description:
						typeof value_schema.description === 'string'
							? value_schema.description
							: '',
					enum: Array.isArray(value_schema.enum)
						? value_schema.enum.filter(
								(item): item is string => typeof item === 'string'
							)
						: null,
				},
				prompt: typeof expression.prompt === 'string' ? expression.prompt : '',
			};
		}
		case 'string_literal':
			return {
				type: 'string_literal',
				value: typeof expression.value === 'string' ? expression.value : '',
			};
		case 'number_literal':
			return {
				type: 'number_literal',
				value:
					typeof expression.value === 'number' ? expression.value : Number.NaN,
			};
		case 'boolean_literal':
			return {
				type: 'boolean_literal',
				value: expression.value === true,
			};
		case 'null_literal':
			return { type: 'null_literal' };
		case 'dynamic_variable':
			return {
				type: 'dynamic_variable',
				variable_name: getTrimmedString(
					expression.variable_name ?? expression.variable_name
				),
			};
		default:
			return createDefaultUpdateStateExpression('llm');
	}
};

export const normalizeUpdateStateUpdate = (
	update: unknown
): UpdateStateUpdate => {
	if (!isRecord(update)) {
		return createDefaultUpdateStateUpdate('', 'llm');
	}

	return {
		type: 'dynamic_variable',
		variable_name: getTrimmedString(
			update.variable_name ?? update.variable_name
		),
		expression: normalizeUpdateStateExpression(update.expression),
	};
};

export const normalizeUpdateStateUpdates = (
	updates: unknown
): UpdateStateUpdate[] =>
	Array.isArray(updates) ? updates.map(normalizeUpdateStateUpdate) : [];

export const formatUpdateStateExpressionPreview = (
	expression: unknown
): string => {
	const normalizedExpression = normalizeUpdateStateExpression(expression);

	switch (normalizedExpression.type) {
		case 'llm': {
			const prompt = normalizedExpression.prompt.trim();
			return prompt ? `= llm("${prompt}")` : '= llm("")';
		}
		case 'string_literal':
			return `= "${normalizedExpression.value}"`;
		case 'number_literal':
			return `= ${
				Number.isFinite(normalizedExpression.value)
					? normalizedExpression.value
					: 'NaN'
			}`;
		case 'boolean_literal':
			return `= ${normalizedExpression.value ? 'true' : 'false'}`;
		case 'null_literal':
			return '= null';
		case 'dynamic_variable':
			return `= ${normalizedExpression.variable_name || 'variable'}`;
		default:
			return '= ...';
	}
};

export const formatUpdateStateSummary = (updates: UpdateStateNode['updates']) =>
	normalizeUpdateStateUpdates(updates)
		.map((update) => getTrimmedString(update.variable_name))
		.filter(Boolean)
		.join(', ');
