import type {
	FormValues,
	Section,
	SectionId,
	SectionMetaMap,
} from './toolForm.types';

export const HTTP_METHODS = [
	{ value: 'GET', label: 'GET' },
	{ value: 'POST', label: 'POST' },
	{ value: 'PUT', label: 'PUT' },
	{ value: 'PATCH', label: 'PATCH' },
	{ value: 'DELETE', label: 'DELETE' },
];

export const getMethodSupportsBody = (method: string) =>
	['POST', 'PUT', 'PATCH'].includes(method);

export const getVisibleSections = (sections: Section[], method: string) =>
	sections.filter(
		(section) => section.id !== 'body' || getMethodSupportsBody(method)
	);

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
