import type {
	FormValues,
	Section,
	SectionId,
	SectionMetaMap,
} from './toolForm.types';
import type { ToolConfigRequest, ToolConfigType } from '~/models/ToolModel';

export const HTTP_METHODS = [
	{ value: 'GET', label: 'GET' },
	{ value: 'POST', label: 'POST' },
	{ value: 'PUT', label: 'PUT' },
	{ value: 'PATCH', label: 'PATCH' },
	{ value: 'DELETE', label: 'DELETE' },
];

export const CONFIG_TYPE_OPTIONS: {
	value: ToolConfigType;
	label: string;
}[] = [
	{ value: 'webhook', label: 'Webhook' },
	{ value: 'client', label: 'Client' },
	{ value: 'system', label: 'System' },
	{ value: 'mcp', label: 'MCP' },
];

export const getMethodSupportsBody = (method: string) =>
	['POST', 'PUT', 'PATCH'].includes(method);

const WEBHOOK_SECTIONS: SectionId[] = [
	'basic',
	'api',
	'auth',
	'headers',
	'parameters',
	'body',
];

export const isWebhookType = (configType: ToolConfigType) =>
	configType === 'webhook';

export const getVisibleSections = (
	sections: Section[],
	method: string,
	configType: ToolConfigType = 'webhook'
) =>
	sections.filter((section) => {
		if (!isWebhookType(configType) && !WEBHOOK_SECTIONS.includes(section.id)) {
			return false;
		}
		if (!isWebhookType(configType)) {
			return section.id === 'basic';
		}
		return section.id !== 'body' || getMethodSupportsBody(method);
	});

export const getSectionProgress = (
	sections: Section[],
	sectionMeta: SectionMetaMap
) =>
	sections.reduce(
		(acc, section) => {
			if (!sectionMeta[section.id]?.applicable) {
				return acc;
			}
			acc.total += 1;
			if (sectionMeta[section.id]?.state === 'complete') {
				acc.completed += 1;
			}
			return acc;
		},
		{ total: 0, completed: 0 }
	);

export const getToolPayload = (values: FormValues) => {
	const requestHeaders = values.headers.reduce(
		(acc, header) => {
			if (header.key && header.value) {
				acc[header.key] = header.value;
			}
			return acc;
		},
		{} as Record<string, string>
	);

	const pathParamsSchema = values.pathParameters.reduce(
		(acc, param) => {
			if (param.key && param.value) {
				acc[param.key] = param.value;
			}
			return acc;
		},
		{} as Record<string, unknown>
	);

	const requestBodyProperties = values.requestBodyProperties.reduce(
		(acc, prop) => {
			if (prop.key) {
				acc[prop.key] = {
					type: prop.type,
					description: prop.description,
					constantValue: prop.constantValue || '',
					dynamicVariable: prop.dynamicVariable || '',
				};
			}
			return acc;
		},
		{} as Record<
			string,
			{
				type: string;
				description: string;
				constantValue: string;
				dynamicVariable: string;
			}
		>
	);

	const requiredFields = values.requestBodyProperties
		.filter((prop) => prop.required && prop.key)
		.map((prop) => prop.key);

	const supportsRequestBody = getMethodSupportsBody(values.method);

	return {
		requestHeaders,
		pathParamsSchema,
		requestBodyProperties,
		requiredFields,
		supportsRequestBody,
	};
};

export const buildToolConfig = (values: FormValues): ToolConfigRequest => {
	const identifier =
		values.identifier || values.name.toLowerCase().replace(/\s+/g, '_');

	switch (values.configType) {
		case 'webhook': {
			const payload = getToolPayload(values);
			return {
				type: 'webhook',
				name: identifier,
				description: values.description,
				responseTimeoutSecs: values.responseTimeoutSecs,
				apiSchema: {
					url: values.url,
					method: values.method,
					requestHeaders: payload.requestHeaders,
					pathParamsSchema: payload.pathParamsSchema,
					...(payload.supportsRequestBody && {
						requestBodySchema: {
							type: 'object',
							required: payload.requiredFields,
							properties: payload.requestBodyProperties,
						},
					}),
				},
			};
		}
		case 'client':
			return {
				type: 'client',
				name: identifier,
				description: values.description,
			};
		case 'system':
			return {
				type: 'system',
				name: identifier,
				params: {
					systemToolType: identifier,
				},
			};
		case 'mcp':
			return {
				type: 'mcp',
				name: identifier,
				description: values.description,
			};
	}
};

export const getNextSection = (
	visibleSections: Section[],
	activeSection: SectionId,
	sectionMeta: SectionMetaMap
) => {
	const ordered = visibleSections.map((section) => section.id);
	const currentIndex = ordered.indexOf(activeSection);
	for (let index = currentIndex + 1; index < ordered.length; index += 1) {
		const candidate = visibleSections[index];
		if (!candidate || !sectionMeta[candidate.id]?.applicable) {
			continue;
		}
		if (sectionMeta[candidate.id]?.state !== 'complete') {
			return candidate;
		}
	}
	return visibleSections[currentIndex + 1] ?? null;
};

export const getFirstPendingSection = (
	visibleSections: Section[],
	sectionMeta: SectionMetaMap
) =>
	visibleSections.find((section) => {
		const meta = sectionMeta[section.id];
		return meta?.applicable && meta.state !== 'complete';
	}) ?? null;
