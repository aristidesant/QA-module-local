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
	| 'string'
	| 'number'
	| 'boolean_true'
	| 'boolean_false'
	| 'null'
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
			'variableName',
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
			expression.variableName ?? expression.variable_name
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

			const variableName = getTrimmedString(
				update.variableName ?? update.variable_name
			);
			if (variableName) {
				names.add(variableName);
			}

			getUpdateStateExpressionVariableNames(update.expression, names);
		});
	});

	Object.values(workflow.edges).forEach((edge) => {
		if (edge.forwardCondition?.type === 'expression') {
			collectBoolExprVariableNames(edge.forwardCondition.expression, names);
		}

		if (edge.backwardCondition?.type === 'expression') {
			collectBoolExprVariableNames(edge.backwardCondition.expression, names);
		}
	});

	return [...names];
};

export const createDefaultUpdateStateExpression = (
	type: UpdateStateExpressionKind = 'llm'
): UpdateStateExpression => {
	switch (type) {
		case 'string':
			return { type: 'string', value: '' };
		case 'number':
			return { type: 'number', value: Number.NaN };
		case 'boolean_true':
			return { type: 'boolean', value: true };
		case 'boolean_false':
			return { type: 'boolean', value: false };
		case 'null':
			return { type: 'null' };
		case 'dynamic_variable':
			return { type: 'dynamic_variable', variableName: '' };
		case 'llm':
		default:
			return {
				type: 'llm',
				valueSchema: {
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
		case 'string':
			return expression.value;
		case 'number':
			return Number.isFinite(expression.value) ? String(expression.value) : '';
		case 'boolean':
			return expression.value ? 'true' : 'false';
		case 'dynamic_variable':
			return expression.variableName;
		case 'llm':
		case 'null':
		default:
			return '';
	}
};

export const getUpdateStateExpressionKind = (
	expression?: UpdateStateExpression | null
): UpdateStateExpressionKind => {
	if (!expression) return 'llm';
	if (expression.type === 'boolean') {
		return expression.value ? 'boolean_true' : 'boolean_false';
	}
	return expression.type;
};

export const buildUpdateStateExpression = (
	type: UpdateStateExpressionKind,
	currentExpression?: UpdateStateExpression
): UpdateStateExpression => {
	switch (type) {
		case 'string':
			return {
				type: 'string',
				value: getStringFromExpression(currentExpression),
			} satisfies UpdateStateStringExpression;
		case 'number': {
			const currentValue =
				currentExpression?.type === 'number' ? currentExpression.value : NaN;
			return {
				type: 'number',
				value: currentValue,
			} satisfies UpdateStateNumberExpression;
		}
		case 'boolean_false':
			return {
				type: 'boolean',
				value: false,
			} satisfies UpdateStateBooleanExpression;
		case 'boolean_true':
			return {
				type: 'boolean',
				value: true,
			} satisfies UpdateStateBooleanExpression;
		case 'null':
			return { type: 'null' };
		case 'dynamic_variable':
			return {
				type: 'dynamic_variable',
				variableName: getStringFromExpression(currentExpression),
			} satisfies UpdateStateDynamicVariableExpression;
		case 'llm':
		default: {
			const prompt =
				currentExpression?.type === 'llm'
					? currentExpression.prompt
					: getStringFromExpression(currentExpression);
			return {
				type: 'llm',
				valueSchema: {
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
	variableName = '',
	expressionType: UpdateStateExpressionKind = 'llm'
): UpdateStateUpdate => ({
	type: 'dynamic_variable',
	variableName,
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
			const valueSchema = isRecord(expression.valueSchema)
				? expression.valueSchema
				: isRecord(expression.value_schema)
					? expression.value_schema
					: {};
			const schemaType = valueSchema.type;
			const normalizedSchemaType =
				schemaType === 'boolean' ||
				schemaType === 'integer' ||
				schemaType === 'number' ||
				schemaType === 'string'
					? schemaType
					: 'string';

			return {
				type: 'llm',
				valueSchema: {
					type: normalizedSchemaType,
					description:
						typeof valueSchema.description === 'string'
							? valueSchema.description
							: '',
					enum: Array.isArray(valueSchema.enum)
						? valueSchema.enum.filter(
								(item): item is string => typeof item === 'string'
							)
						: null,
				},
				prompt: typeof expression.prompt === 'string' ? expression.prompt : '',
			};
		}
		case 'string':
			return {
				type: 'string',
				value: typeof expression.value === 'string' ? expression.value : '',
			};
		case 'number':
			return {
				type: 'number',
				value:
					typeof expression.value === 'number' ? expression.value : Number.NaN,
			};
		case 'boolean':
			return {
				type: 'boolean',
				value: expression.value === true,
			};
		case 'null':
			return { type: 'null' };
		case 'dynamic_variable':
			return {
				type: 'dynamic_variable',
				variableName: getTrimmedString(
					expression.variableName ?? expression.variable_name
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
		variableName: getTrimmedString(update.variableName ?? update.variable_name),
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
		case 'string':
			return `= "${normalizedExpression.value}"`;
		case 'number':
			return `= ${
				Number.isFinite(normalizedExpression.value)
					? normalizedExpression.value
					: 'NaN'
			}`;
		case 'boolean':
			return `= ${normalizedExpression.value ? 'true' : 'false'}`;
		case 'null':
			return '= null';
		case 'dynamic_variable':
			return `= ${normalizedExpression.variableName || 'variable'}`;
		default:
			return '= ...';
	}
};

export const formatUpdateStateSummary = (updates: UpdateStateNode['updates']) =>
	normalizeUpdateStateUpdates(updates)
		.map((update) => getTrimmedString(update.variableName))
		.filter(Boolean)
		.join(', ');
